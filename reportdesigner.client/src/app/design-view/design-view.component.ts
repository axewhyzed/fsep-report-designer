import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DatabaseInfoService } from '../database-info.service';
import { DatentimeService } from '../datentime.service';
import { CheckConnectionService } from '../check-connection.service';

@Component({
  selector: 'app-design-view',
  templateUrl: './design-view.component.html',
  styleUrl: './design-view.component.css',
})
export class DesignViewComponent implements OnInit {
  databaseInfo: any = [];
  reportTitle: string = '';
  showReportWizard: boolean = false;
  numberOfTables: number = 0;
  tableSelectionRows: any[] = [];
  tableSelections: { database: string, table: string, tables: string[] }[] = [];
  selectedDatabase: string = ''; // Holds the selected database
  selectedTables: string[] = []; // Holds the selected table
  selectedDatabaseTables: any[] = []; // Holds tables of the selected database

  constructor(
    private http: HttpClient,
    private dbService: DatabaseInfoService,
    private datentimeService: DatentimeService,
    private connectionService: CheckConnectionService
  ) {}

  localCellFormatting: any;

  // Initialize component data and fetch data if not already stored locally
  ngOnInit(): void {
    const storedDatabaseInfo = localStorage.getItem('databaseInfo');
    if (storedDatabaseInfo) {
      // this.data = JSON.parse(storedDatabaseInfo);
      this.databaseInfo = JSON.parse(storedDatabaseInfo);
      // Modify initialization of cellFormatting based on databaseInfo structure
      if (!localStorage.getItem('cellFormatting')) {
        this.initializeCellFormatting();
      }
      this.localCellFormatting = JSON.parse(
        localStorage.getItem('cellFormatting')!
      );
    } else {
      this.fetchDbData().then(() => {
        this.initializeCellFormatting(); // Call initializeCellFormatting() after fetching data
      });
    }
  }

  onDatabaseChange() {
    this.selectedTables = []; // Reset selected table when database changes
    const selectedDb = this.databaseInfo.databases.find((db:any) => db.name === this.selectedDatabase);
    this.selectedDatabaseTables = selectedDb ? selectedDb.tables : [];
  }

  toggleReportWizard() {
    this.showReportWizard = !this.showReportWizard;
  }

  submitReport() {
    console.log('Submitted report title:', this.reportTitle);
    this.toggleReportWizard(); // Close the wizard after submission
  }

  cancelReport() {
    this.toggleReportWizard(); // Close the wizard
  }

  generateTableSelectionRows() {
    this.tableSelectionRows = Array.from({ length: this.numberOfTables }, (_, i) => i);
    this.tableSelections = Array.from({ length: this.numberOfTables }, () => ({ database: '', table: '', tables: [] }));
  }

  fetchTablesDropdown(databaseName: string, index: number) {
    const selectedDatabase = this.databaseInfo.databases.find((db: any) => db.name === databaseName);
    if (selectedDatabase) {
      this.tableSelections[index].table = ''; // Reset selected table
      this.tableSelections[index].database = databaseName;
      this.tableSelections[index].tables = selectedDatabase.tables.map((table: any) => table.name); // Assign table names for the selected database
    }
  }

  private findSelectedTable(database: string, table: string): { data: any[] } | undefined {
    const selectedDatabase = this.databaseInfo.databases.find((db: any) => db.name === database);
    return selectedDatabase?.tables.find((tbl: any) => tbl.name === table);
  }

  getTableData(database: string, table: string): any[] {
    // Find the selected database in databaseInfo
    const selectedTable = this.findSelectedTable(database, table);
    return selectedTable ? selectedTable.data : [];
  }
  
  getTableHeaders(database: string, table: string): string[] {
    // Find the selected database in databaseInfo
    const selectedTable = this.findSelectedTable(database, table);
    return selectedTable && selectedTable.data.length > 0 ? Object.keys(selectedTable.data[0]) : [];
  }

  // Initialize cell formatting for table headers and cells
  initializeCellFormatting(): void {
    let cellFormatting: { [key: string]: any } = {};

    for (const db of this.databaseInfo.databases) {
      for (const table of db.tables) {
        // Initialize cell formatting for table headers
        const headerKeys: string[] = Object.keys(table.data[0]); // Assuming the first row contains the headers
        for (
          let columnIndex = 0;
          columnIndex < headerKeys.length;
          columnIndex++
        ) {
          const headerKey = `-1|${db.name}-${table.name}-${headerKeys[columnIndex]}`;
          cellFormatting[headerKey] = {
            bold: true,
            italic: false,
            underline: false,
            strikethrough: false,
            fontSize: '16px',
            fontColor: '#000000',
            fontFamily: 'Times New Roman',
            backgroundColor: '#ffffff',
          };
        }

        // Initialize cell formatting for data rows
        for (let rowIndex = 0; rowIndex < table.data.length; rowIndex++) {
          const rowData = table.data[rowIndex];
          for (
            let columnIndex = 0;
            columnIndex < headerKeys.length;
            columnIndex++
          ) {
            const columnName = headerKeys[columnIndex];
            const cellKey = `${rowIndex}|${db.name}-${table.name}-${columnIndex}`;
            cellFormatting[cellKey] = {
              bold: false,
              italic: false,
              underline: false,
              strikethrough: false,
              fontSize: '16px',
              fontColor: '#000000',
              fontFamily: 'Times New Roman',
              backgroundColor: '#ffffff',
            };
          }
        }
      }
    }

    localStorage.setItem('cellFormatting', JSON.stringify(cellFormatting));
  }

  reloadDbData(): void {
    this.connectionService.checkConnectionStatus().subscribe(
      (response) => {
        localStorage.removeItem('databaseInfo');
        localStorage.removeItem('cellFormatting');
        this.fetchDbData().then(() => {
          this.initializeCellFormatting(); // Call initializeCellFormatting() after fetching data
        });
      },
      (error) => {
        console.error('Error checking connection status:', error);
        alert('Not Connected to Backend');
        // Handle errors here, e.g., show an error message
      }
    );
  }

  // Fetch data from the API and store it locally
  fetchDbData(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.databaseInfo = { databases: [] }; // Clear existing data
      this.dbService.getDatabases().subscribe((databases) => {
        databases.forEach((database) => {
          const dbObject: any = {
            name: database,
            tables: [],
          };

          this.dbService.getTables(database).subscribe((tables) => {
            const tableDataPromises = tables.map((table) => {
              return this.dbService.getTableData(database, table).toPromise();
            });

            Promise.all(tableDataPromises).then((tableDataArray) => {
              tables.forEach((table, index) => {
                const tableObject: any = {
                  name: table,
                  data: tableDataArray[index],
                };
                dbObject.tables.push(tableObject);
              });

              this.databaseInfo.databases.push(dbObject);

              // Store databaseInfo in local storage after all tables are fetched for the database
              localStorage.setItem(
                'databaseInfo',
                JSON.stringify(this.databaseInfo)
              );
              console.log(this.databaseInfo);

              resolve(); // Resolve the Promise after data fetching is complete
            });
          });
        });
      });
    });
  }

  selectedCells: Set<string> = new Set<string>();

  getColumnHeader(index: number): string {
    // Add 65 to convert the index to ASCII code for A, B, C, etc.
    return String.fromCharCode(65 + index);
  }

  // Handle cell selection based on provided row index and column name
  toggleCellSelection(
    rowIndex: number | string,
    columnName: string | any
  ): void {
    const cellKey = `${rowIndex}|${columnName}`; // Unique identifier for the cell
    // Treat row headers differently
    if (typeof rowIndex == 'string') {
      const [rwClass, rwIndex] = rowIndex.split('|');
      if (rwClass === 'row-header') {
        this.selectedCells.clear(); // Clear previous selections
        const [dbName, tbName] = columnName.split('|');
        // Select entire row
        for (let database of this.databaseInfo.databases) {
          if (database.name == dbName) {
            for (let table of database.tables) {
              if (table.name === tbName) {
                const selCols = Object.keys(table.data[0]).length;
                for (let i = 0; i < selCols; i++) {
                  this.selectedCells.add(`${rwIndex}|${dbName}-${tbName}-${i}`);
                  console.log(`${rwIndex}|${dbName}-${tbName}-${i}`);
                }
              }
            }
          }
        }
        return;
      } else if (rwClass === 'column-header') {
        console.log(cellKey);
        this.selectedCells.clear();
        const [dbName, tbName, clName] = columnName.split('|');
        // Select entire column
        console.log(dbName + ' ' + tbName + ' ' + clName + ' unga');
        for (let database of this.databaseInfo.databases) {
          if (database.name == dbName) {
            for (let table of database.tables) {
              if (table.name === tbName) {
                this.selectedCells.add(`-1|${dbName}-${tbName}-${clName}`);
                console.log(table.data.length);
                for (let i = 0; i < table.data.length; i++) {
                  this.selectedCells.add(`${i}|${dbName}-${tbName}-${rwIndex}`);
                  console.log(`${i}|${dbName}-${tbName}-${rwIndex}`);
                }
              }
            }
          }
        }
        return;
      } else {
        console.log(cellKey);
        this.selectedCells.clear();
        this.selectedCells.add(cellKey);
      }
    } else {
      // For normal cells
      console.log(cellKey);
      this.selectedCells.clear(); // Clear previous selections
      this.selectedCells.add(cellKey); // Select the clicked cell
    }
  }

  // Check if the cell at the provided row index and column name is selected
  isSelected(rowIndex: number, columnName: string | any): boolean {
    const cellKey = `${rowIndex}|${columnName}`;
    return this.selectedCells.has(cellKey);
  }

  @ViewChild('editableDiv') editableDiv!: ElementRef;

  // Toggle the specified text formatting
  toggleFormat(format: string): void {
    if (this.selectedCells.size === 0) return; // No cells selected
    // Update the formatting of the selected cell and the corresponding entry in the cellFormatting object
    this.selectedCells.forEach((cellKey) => {
      const [rowIndex, columnName] = cellKey.split('|');
      const rowIndexNumber = parseInt(rowIndex, 10);
      const cellFormattingKey = `${rowIndex}|${columnName}`;

      // Update the formatting based on the button clicked
      switch (format) {
        case 'bold':
          this.localCellFormatting[cellFormattingKey].bold =
            !this.localCellFormatting[cellFormattingKey].bold;
          this.applyFormatting(
            rowIndexNumber,
            columnName,
            'fontWeight',
            this.localCellFormatting[cellFormattingKey].bold ? 'bold' : 'normal'
          );
          break;
        case 'italic':
          this.localCellFormatting[cellFormattingKey].italic =
            !this.localCellFormatting[cellFormattingKey].italic;
          this.applyFormatting(
            rowIndexNumber,
            columnName,
            'fontStyle',
            this.localCellFormatting[cellFormattingKey].italic
              ? 'italic'
              : 'normal'
          );
          break;
        case 'underline':
          this.localCellFormatting[cellFormattingKey].underline =
            !this.localCellFormatting[cellFormattingKey].underline;
          if (this.localCellFormatting[cellFormattingKey].strikethrough) {
            // If strikethrough is active, concatenate underline with it
            this.applyFormatting(
              rowIndexNumber,
              columnName,
              'textDecoration',
              this.localCellFormatting[cellFormattingKey].underline
                ? 'line-through underline'
                : 'line-through'
            );
          } else {
            // Otherwise, apply underline alone
            this.applyFormatting(
              rowIndexNumber,
              columnName,
              'textDecoration',
              this.localCellFormatting[cellFormattingKey].underline
                ? 'underline'
                : 'none'
            );
          }
          break;
        case 'strikethrough':
          this.localCellFormatting[cellFormattingKey].strikethrough =
            !this.localCellFormatting[cellFormattingKey].strikethrough;
          if (this.localCellFormatting[cellFormattingKey].underline) {
            // If underline is active, concatenate strikethrough with it
            this.applyFormatting(
              rowIndexNumber,
              columnName,
              'textDecoration',
              this.localCellFormatting[cellFormattingKey].strikethrough
                ? 'line-through underline'
                : 'underline'
            );
          } else {
            // Otherwise, apply strikethrough alone
            this.applyFormatting(
              rowIndexNumber,
              columnName,
              'textDecoration',
              this.localCellFormatting[cellFormattingKey].strikethrough
                ? 'line-through'
                : 'none'
            );
          }
          break;
      }
    });

    localStorage.setItem(
      'cellFormatting',
      JSON.stringify(this.localCellFormatting)
    );
  }

  removeFormatting(): void {
    if (this.selectedCells.size === 0) return; // No cells selected
    // Loop through selected cells and reset formatting to initial state
    this.selectedCells.forEach((cellKey) => {
      const [rowIndex, columnName] = cellKey.split('|');
      const cellFormattingKey = `${rowIndex}|${columnName}`;

      // Reset formatting to initial state
      this.localCellFormatting[cellFormattingKey] = {
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        fontSize: '16px',
        fontColor: '#000000',
        fontFamily: 'Times New Roman',
        backgroundColor: '#ffffff',
      };

      // Apply the initial formatting to the cell
      this.applyFormatting(
        parseInt(rowIndex, 10),
        columnName,
        'fontWeight',
        'normal'
      );
      this.applyFormatting(
        parseInt(rowIndex, 10),
        columnName,
        'fontStyle',
        'normal'
      );
      this.applyFormatting(
        parseInt(rowIndex, 10),
        columnName,
        'textDecoration',
        'none'
      );
      this.applyFormatting(
        parseInt(rowIndex, 10),
        columnName,
        'fontSize',
        '16px'
      );
      this.applyFormatting(
        parseInt(rowIndex, 10),
        columnName,
        'color',
        '#000000'
      );
      this.applyFormatting(
        parseInt(rowIndex, 10),
        columnName,
        'fontFamily',
        'Times New Roman'
      );
      this.applyFormatting(
        parseInt(rowIndex, 10),
        columnName,
        'backgroundColor',
        '#ffffff'
      );
    });

    // Save the updated cell formatting to local storage
    localStorage.setItem(
      'cellFormatting',
      JSON.stringify(this.localCellFormatting)
    );
  }

  applyStyle(row: number, column: string | any) {
    // Retrieve cellFormatting from localStorage
    const cellFormatting = localStorage.getItem('cellFormatting');
    if (cellFormatting) {
      const cellKey = `${row}|${column}`;
      const formatting = JSON.parse(cellFormatting)[cellKey];

      // Check if the style in cellFormatting differs from default style
      if (formatting && !this.isDefaultStyle(formatting)) {
        const style: any = {};

        if (formatting.bold) style['font-weight'] = 'bold';
        if (formatting.italic) style['font-style'] = 'italic';
        if (formatting.underline) style['text-decoration'] = 'underline';
        if (formatting.strikethrough)
          style['text-decoration-line'] = 'line-through';
        style['font-size'] = formatting.fontSize;
        style.color = formatting.fontColor;
        style['font-family'] = formatting.fontFamily;
        style['background-color'] = formatting.backgroundColor;

        return style;
      }
    }
    return {}; // Default empty style object
  }

  // Function to check if a style is default
  isDefaultStyle(style: any) {
    const defaultStyle = {
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      fontSize: '12px',
      fontColor: '#000000',
      fontFamily: 'Times New Roman',
      backgroundColor: '#ffffff',
    };

    return JSON.stringify(style) === JSON.stringify(defaultStyle);
  }

  // Apply formatting to the selected cell
  applyFormatting(
    rowIndex: number,
    columnName: string,
    property: keyof CSSStyleDeclaration,
    value: string
  ): void {
    const selectedCell = document.querySelector(
      '.selected-cell'
    ) as HTMLTableCellElement;
    if (selectedCell) {
      selectedCell.style[property as any] = value;
    }
  }

  // Change the text color to the specified color
  changeTextColor(color: string): void {
    this.selectedCells.forEach((cellKey) => {
      const [rowIndex, columnName] = cellKey.split('|');
      const rowIndexNumber = parseInt(rowIndex, 10);
      const cellFormattingKey = `${rowIndex}|${columnName}`;

      this.localCellFormatting[cellFormattingKey].fontColor = color;
      console.log(color);
      localStorage.setItem(
        'cellFormatting',
        JSON.stringify(this.localCellFormatting)
      );
    });
    // document.execCommand('foreColor', false, color);
  }

  // Change the background color to the specified color
  changeBackgroundColor(color: string): void {
    this.selectedCells.forEach((cellKey) => {
      const [rowIndex, columnName] = cellKey.split('|');
      const rowIndexNumber = parseInt(rowIndex, 10);
      const cellFormattingKey = `${rowIndex}|${columnName}`;

      this.localCellFormatting[cellFormattingKey].backgroundColor = color;
      console.log(color);
      localStorage.setItem(
        'cellFormatting',
        JSON.stringify(this.localCellFormatting)
      );
    });
    document.execCommand('hiliteColor', false, color);
  }

  // Change the font size to the specified size
  changeFontSize(fontSize: string): void {
    this.selectedCells.forEach((cellKey) => {
      const [rowIndex, columnName] = cellKey.split('|');
      const rowIndexNumber = parseInt(rowIndex, 10);
      const cellFormattingKey = `${rowIndex}|${columnName}`;

      this.localCellFormatting[cellFormattingKey].fontSize = fontSize;
      localStorage.setItem(
        'cellFormatting',
        JSON.stringify(this.localCellFormatting)
      );
    });
    // document.execCommand('fontSize', false, fontSize);
  }

  // Change the font family to the specified font
  changeFontFamily(fontFamily: string): void {
    this.selectedCells.forEach((cellKey) => {
      const [rowIndex, columnName] = cellKey.split('|');
      const rowIndexNumber = parseInt(rowIndex, 10);
      const cellFormattingKey = `${rowIndex}|${columnName}`;

      this.localCellFormatting[cellFormattingKey].fontFamily = fontFamily;
      localStorage.setItem(
        'cellFormatting',
        JSON.stringify(this.localCellFormatting)
      );
    });
    // document.execCommand('fontName', false, fontFamily);
  }

  get currentDateTime(): string {
    return this.datentimeService.currentDateTime;
  }

  get currentDate(): string {
    return this.datentimeService.currentDate;
  }

  get currentTime(): string {
    return this.datentimeService.currentTime;
  }

  // updateCellStyle(property: keyof CSSStyleDeclaration, value: string): void {
  //   if (this.selectedCells.size === 0) return; // No cells selected

  //   this.selectedCells.forEach((cellKey) => {
  //     const [rowIndex, columnName] = cellKey.split('_');
  //     const rowIndexNumber = parseInt(rowIndex, 10);
  //     const cellFormattingKey = `${rowIndex}_${columnName}`;

  //     // Update localCellFormatting
  //     this.localCellFormatting[cellFormattingKey][property] = value;
  //   });

  //   // Save the updated cell formatting to local storage
  //   localStorage.setItem('cellFormatting', JSON.stringify(this.localCellFormatting));

  //   // Apply formatting to the selected cells
  //   this.selectedCells.forEach((cellKey) => {
  //     const [rowIndex, columnName] = cellKey.split('_');
  //     this.applyFormatting(parseInt(rowIndex, 10), columnName, property, value);
  //   });
  // }

  // changeTextColor(color: string): void {
  //   this.updateCellStyle('fontColor', color);
  // }

  // changeBackgroundColor(color: string): void {
  //   this.updateCellStyle('backgroundColor', color);
  // }

  // changeFontSize(fontSize: string): void {
  //   this.updateCellStyle('fontSize', fontSize);
  // }

  // changeFontFamily(fontFamily: string): void {
  //   this.updateCellStyle('fontFamily', fontFamily);
  // }
}
