import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DatabaseInfoService } from '../shared/services/database-info.service';
import { DatentimeService } from '../shared/services/datentime.service';
import { CheckConnectionService } from '../shared/services/check-connection.service';
import { Router } from '@angular/router';
import { ReportsService } from '../shared/services/reports.service';
import { Report } from '../shared/models/report.model';
import { ReportData } from '../shared/models/report-data.model';
import { ReportFormatting } from '../shared/models/report-formatting.model';

@Component({
  selector: 'app-design-view',
  templateUrl: './design-view.component.html',
  styleUrl: './design-view.component.css',
})
export class DesignViewComponent implements OnInit {
  databaseInfo: any = [];
  reports: Report[] = [];
  reportDetails!: Report;
  reportData: ReportData[] = [];
  reportTitle: string = '';
  selectedLogo: File | null = null;
  logoDataURL: string | null = null;
  showReportWizard: boolean = false;
  showReportContainer: boolean = false;
  numberOfTables: number = 0;
  tableSelectionRows: any[] = [];
  tableSelections: { database: string; table: string; tables: string[] }[] = [];
  selectedDatabase: string = ''; // Holds the selected database
  selectedTables: string[] = []; // Holds the selected table
  selectedDatabaseTables: any[] = []; // Holds tables of the selected database
  // Define properties for headers and table data
  tableHeaders: ReportData[] = [];
  tableData: ReportData[][] = [];
  localCellFormatting: { [key: string]: ReportFormatting } = {};

  constructor(
    private http: HttpClient,
    private dbService: DatabaseInfoService,
    private datentimeService: DatentimeService,
    private connectionService: CheckConnectionService,
    private router: Router,
    private reportsService: ReportsService
  ) {}

  // localCellFormatting: any;

  // Initialize component data and fetch data if not already stored locally
  ngOnInit(): void {
    const storedDatabaseInfo = localStorage.getItem('databaseInfo');
    const ReportId = localStorage.getItem('selectedReportId');
    if (ReportId) {
      this.selectedReportId = JSON.parse(ReportId);
      this.getReportTitle(this.selectedReportId);
      this.showReportWizard = false;
      this.showReportContainer = true;
      this.reportsService.getReportData(this.selectedReportId).subscribe(
        (data: ReportData[]) => {
          this.reportData = data;
          this.tableHeaders = this.reportData.filter(
            (item) => item.rowIndex === 0
          );
          console.log(this.tableHeaders);
          this.tableData = this.groupDataByRows(
            this.reportData.filter((item) => item.rowIndex !== 0)
          );
          console.log(this.reportData);
        },
        (error) => {
          console.error('Error fetching report data:', error);
        }
      );
      const repDet = localStorage.getItem('reportDetails');
      if(repDet){
        this.reportDetails = JSON.parse(repDet);
      }
      else{
        this.reportsService.getReport(this.selectedReportId).subscribe(
          (data: Report) => {
            this.reportDetails = data;
            localStorage.setItem('reportDetails', JSON.stringify(this.reportDetails));
          },
          (error) => {
            console.error('Error fetching report data:', error);
          }
        );
      }

      this.reportsService.getReportFormatting(this.selectedReportId).subscribe(
        (formatting: ReportFormatting[]) => {
          formatting.forEach((format: ReportFormatting) => {
            const key = `${format.reportID}|${format.dataID}`;
            this.localCellFormatting[key] = format;
          });
          // Once formatting data is fetched, store it in localStorage
          localStorage.setItem('cellFormatting', JSON.stringify(this.localCellFormatting));
          // localStorage.setItem(`reportFormatting_${this.selectedReportId}`, JSON.stringify(formatting));
        },
        error => {
          console.error('Error fetching report formatting:', error);
        }
      );
    }
    // Fetch all reports for the dropdown
    this.reportsService.getReports().subscribe(
      (data: Report[]) => {
        this.reports = data;
        this.getReportTitle(this.selectedReportId);
      },
      (error) => {
        console.error('Error fetching reports:', error);
      }
    );
  }

  getReportTitle(reportId:number):void{
    const report = this.reports.find(report => report.reportID === reportId);
    if(report){
      this.reportTitle = report.title;
    }
  }

  // Helper function to group data by rows
  private groupDataByRows(data: ReportData[]): ReportData[][] {
    const groupedData: ReportData[][] = [];
    data.forEach((item) => {
      if (!groupedData[item.rowIndex]) {
        groupedData[item.rowIndex] = [];
      }
      groupedData[item.rowIndex].push(item);
    });
    return groupedData.filter((row) => row.length > 0);
  }

  toggleReportWizard() {
    this.showReportWizard = !this.showReportWizard;
  }

  searchTerm: string = '';
  searchResults: Report[] = [];
  isSearching: boolean = false;

  searchFunc(): void {
    if (this.searchTerm) {
      this.isSearching = true; // Set isSearching to true when performing a search
      this.reportsService.searchReports(this.searchTerm).subscribe(
        (reports: Report[]) => {
          this.searchResults = reports;
        },
        (error) => {
          console.error('Error searching reports:', error);
        }
      );
    } else {
      // Handle empty search term
      this.isSearching = false; // Set isSearching to false when the search term is empty
      this.searchResults = []; // Clear search results when search term is empty
    }
  }

  handleSearchChange(): void {
    this.isSearching = !!this.searchTerm.trim(); // Set isSearching based on whether the search term is empty
    if (this.isSearching) {
      this.searchFunc(); // Trigger search when there's text in the search box
    } else {
      this.searchResults = []; // Clear search results when the search box is empty
    }
  }

  selectedReportId!: number;

  openSelectedReport() {
    if (this.selectedReportId) {
      // Store the selected report ID in sessionStorage or localStorage
      localStorage.setItem(
        'selectedReportId',
        this.selectedReportId.toString()
      );
      // Perform further actions, e.g., navigate to a different page or load the selected report
    }
  }

  onLogoSelected(event: any) {
    this.selectedLogo = event.target.files?.[0];
    if (!this.selectedLogo) {
      alert('No Logo selected');
      return;
    }
    const maxSize = 5 * 1024 * 1024; // 5 MB max file size
    if (this.selectedLogo?.size > maxSize) {
      alert('Logo must be below 5 mb size');
      event.target.value = null;
      return;
    }
    this.loadLogoDataURL();
  }

  loadLogoDataURL() {
    if (this.selectedLogo) {
      const reader = new FileReader();
      reader.readAsDataURL(this.selectedLogo);
      reader.onload = () => {
        // Once the file is read, the result will be available as reader.result
        // We need to cast it to a string as FileReader.result is of type 'string | null'
        this.logoDataURL = reader.result as string;
        // Update logoImage field in reportDetails in local storage
      const storedReportDetails = localStorage.getItem('reportDetails');
      if (storedReportDetails) {
        const reportDetails = JSON.parse(storedReportDetails);
        reportDetails.logoImage = this.logoDataURL;
        localStorage.setItem('reportDetails', JSON.stringify(reportDetails));
      }
      };
    }
  }

  submitReport() {
    // Log the submitted report title
    console.log('Submitted report title:', this.reportTitle);
    // Close the report wizard after submission
    this.toggleReportWizard();
    // Show the report container after submission
    this.showReportContainer = true;
    const reportData = {
      reportTitle: this.reportTitle,
      selectedLogo: this.selectedLogo,
      logoDataURL: this.logoDataURL,
    };
    localStorage.setItem('reportData', JSON.stringify(reportData));
    localStorage.setItem(
      'tableSelections',
      JSON.stringify(this.tableSelections)
    );
  }

  cancelReport() {
    // Close the report wizard without submitting
    this.toggleReportWizard();
    // Hide the report container if canceled
    this.showReportContainer = false;
    localStorage.removeItem('reportData');
    localStorage.removeItem('tableSelections');
  }

  addTable() {
    this.numberOfTables++;
    this.tableSelectionRows.push({});
    this.tableSelections.push({ database: '', table: '', tables: [] });
  }

  removeTable(index: number) {
    this.numberOfTables--;
    this.tableSelectionRows.splice(index, 1);
    this.tableSelections.splice(index, 1);
  }

  generateTableSelectionRows() {
    this.tableSelectionRows = Array.from(
      { length: this.numberOfTables },
      (_, i) => i
    );
    this.tableSelections = Array.from({ length: this.numberOfTables }, () => ({
      database: '',
      table: '',
      tables: [],
    }));
  }

  fetchTablesDropdown(databaseName: string, index: number) {
    console.log('From fetch tables: ' + databaseName);
    console.log(this.databaseInfo.databases);
    const selectedDatabase = this.databaseInfo.databases.find(
      (db: any) => db.name === databaseName
    );
    if (selectedDatabase) {
      this.tableSelections[index].table = ''; // Reset selected table
      this.tableSelections[index].database = databaseName;
      this.tableSelections[index].tables = selectedDatabase.tables.map(
        (table: any) => table.name
      ); // Assign table names for the selected database
    }
  }

  getTableData(database: string, table: string): any[] {
    // Find the selected database in database info
    const selectedDatabase = this.databaseInfo.databases.find(
      (db: any) => db.name === database
    );
    if (selectedDatabase) {
      // Find the selected table within the selected database
      const selectedTable = selectedDatabase.tables.find(
        (t: any) => t.name === table
      );
      if (selectedTable) {
        const headers = this.getTableHeaders(database, table); // Get table headers
        return selectedTable.data.map((row: any) => {
          // Map data according to header order
          return headers.map((header) => row[header]);
        });
      }
      console.log(selectedTable.data);
      return selectedTable ? selectedTable.data : [];
    }

    return [];
  }

  getTableHeaders(database: string, table: string): string[] {
    // Find the selected database in database info
    const selectedDatabase = this.databaseInfo.databases.find(
      (db: any) => db.name === database
    );
    if (selectedDatabase) {
      // Find the selected table within the selected database
      const selectedTable = selectedDatabase.tables.find(
        (t: any) => t.name === table
      );
      console.log(Object.keys(selectedTable.data[0]));
      return selectedTable && selectedTable.data.length > 0
        ? Object.keys(selectedTable.data[0])
        : [];
    }
    return [];
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
    // this.connectionService.checkConnectionStatus().subscribe(
    // (response) => {
    localStorage.removeItem('databaseInfo');
    localStorage.removeItem('cellFormatting');
    this.fetchDbData().then(() => {
      this.initializeCellFormatting(); // Call initializeCellFormatting() after fetching data
    });
    // },
    // (error) => {
    // console.error('Error checking connection status:', error);
    // alert('Not Connected to Backend');
    // Handle errors here, e.g., show an error message
    // }
    // );
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      window.location.reload();
    });
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
    // For column-header
    if (columnName === 'column-header') {
      this.selectedCells.clear();
      // Adding the table header
      const colHeader = this.tableHeaders[rowIndex as number];
      this.selectedCells.add(`${colHeader.reportID}|${colHeader.dataID}`)
      for (const rowData of this.tableData) {
        const cell = rowData[rowIndex as number];
        const newCellKey = `${cell.reportID}|${cell.dataID}`;
        this.selectedCells.add(`${newCellKey}`);
      }
    }

    //For row-header
    else if (columnName === 'row-header') {
      this.selectedCells.clear();
      const rowData = this.tableData[rowIndex as number];
      for (const cell of rowData) {
        const newCellKey = `${cell.reportID}|${cell.dataID}`;
        console.log(newCellKey);
        this.selectedCells.add(`${newCellKey}`);
      }
    }

    else {
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
      const [reportId, dataId] = cellKey.split('|');
      const reportIdNumber = parseInt(reportId, 10);
      const dataIdNumber = parseInt(dataId, 10);
      const cellFormattingKey = `${reportId}|${dataId}`;

      // Check if the cell exists in localCellFormatting, if not, initialize it with default values
    if (!this.localCellFormatting[cellFormattingKey]) {
      this.localCellFormatting[cellFormattingKey] = {
        dataID: dataIdNumber,
        reportID: reportIdNumber,
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        fontSize: 16,
        fontFamily: 'Times New Roman',
        fontColor: '#000000',
        backgroundColor: '#ffffff',
      };
    }

      // Update the formatting based on the button clicked
      switch (format) {
        case 'bold':
          this.localCellFormatting[cellFormattingKey].bold =
            !this.localCellFormatting[cellFormattingKey].bold;
          this.applyFormatting(
            reportIdNumber,
            dataIdNumber,
            'fontWeight',
            this.localCellFormatting[cellFormattingKey].bold ? 'bold' : 'normal'
          );
          break;
        case 'italic':
          this.localCellFormatting[cellFormattingKey].italic =
            !this.localCellFormatting[cellFormattingKey].italic;
          this.applyFormatting(
            reportIdNumber,
            dataIdNumber,
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
              reportIdNumber,
              dataIdNumber,
              'textDecoration',
              this.localCellFormatting[cellFormattingKey].underline
                ? 'line-through underline'
                : 'line-through'
            );
          } else {
            // Otherwise, apply underline alone
            this.applyFormatting(
              reportIdNumber,
              dataIdNumber,
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
              reportIdNumber,
              dataIdNumber,
              'textDecoration',
              this.localCellFormatting[cellFormattingKey].strikethrough
                ? 'line-through underline'
                : 'underline'
            );
          } else {
            // Otherwise, apply strikethrough alone
            this.applyFormatting(
              reportIdNumber,
              dataIdNumber,
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
      const [reportId, dataId] = cellKey.split('|');
      const reportIdNumber = parseInt(reportId, 10);
      const dataIdNumber = parseInt(dataId, 10);
      const cellFormattingKey = `${reportId}|${dataId}`;

      // Reset formatting to initial state
      this.localCellFormatting[cellFormattingKey] = {
        dataID: dataIdNumber,
        reportID: reportIdNumber,
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        fontSize: 16,
        fontColor: '#000000',
        fontFamily: 'Times New Roman',
        backgroundColor: '#ffffff',
      };

      // Apply the initial formatting to the cell
      this.applyFormatting(
        reportIdNumber,
        dataIdNumber,
        'fontWeight',
        'normal'
      );
      this.applyFormatting(
        reportIdNumber,
        dataIdNumber,
        'fontStyle',
        'normal'
      );
      this.applyFormatting(
        reportIdNumber,
        dataIdNumber,
        'textDecoration',
        'none'
      );
      this.applyFormatting(
        reportIdNumber,
        dataIdNumber,
        'fontSize',
        '16px'
      );
      this.applyFormatting(
        reportIdNumber,
        dataIdNumber,
        'color',
        '#000000'
      );
      this.applyFormatting(
        reportIdNumber,
        dataIdNumber,
        'fontFamily',
        'Times New Roman'
      );
      this.applyFormatting(
        reportIdNumber,
        dataIdNumber,
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

  // Apply formatting to the selected cell in HTML
  applyFormatting(
    rowIndex: number,
    columnName: number,
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
  changeTextColor(txtcolor: string): void {
    this.selectedCells.forEach((cellKey) => {
      const [reportId, dataId] = cellKey.split('|');
      const reportIdNumber = parseInt(reportId, 10);
      const dataIdNumber = parseInt(dataId, 10);
      const cellFormattingKey = `${reportId}|${dataId}`;

      if (!this.localCellFormatting[cellFormattingKey]) {
        this.localCellFormatting[cellFormattingKey] = {
          dataID: dataIdNumber,
          reportID: reportIdNumber,
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
          fontSize: 16,
          fontFamily: 'Times New Roman',
          fontColor: '#000000',
          backgroundColor: '#ffffff',
        };
      }

      // Update the fontColor property of the cellFormatting
      this.localCellFormatting[cellFormattingKey].fontColor = txtcolor;
      localStorage.setItem(
        'cellFormatting',
        JSON.stringify(this.localCellFormatting)
      );
      console.log(txtcolor);
    });
  }

  // Change the background color to the specified color
  changeBackgroundColor(bgfcolor: string): void {
    this.selectedCells.forEach((cellKey) => {
      const [reportId, dataId] = cellKey.split('|');
      const reportIdNumber = parseInt(reportId, 10);
      const dataIdNumber = parseInt(dataId, 10);
      const cellFormattingKey = `${reportId}|${dataId}`;

      if (!this.localCellFormatting[cellFormattingKey]) {
        this.localCellFormatting[cellFormattingKey] = {
          dataID: dataIdNumber,
          reportID: reportIdNumber,
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
          fontSize: 16,
          fontFamily: 'Times New Roman',
          fontColor: '#000000',
          backgroundColor: '#ffffff',
        };
      }

      this.localCellFormatting[cellFormattingKey].backgroundColor = bgfcolor;
      localStorage.setItem(
        'cellFormatting',
        JSON.stringify(this.localCellFormatting)
      );
      console.log(bgfcolor);
    });
  }

  // Change the font size to the specified size
  changeFontSize(fontSize: number): void {
    this.selectedCells.forEach((cellKey) => {
      const [reportId, dataId] = cellKey.split('|');
      const reportIdNumber = parseInt(reportId, 10);
      const dataIdNumber = parseInt(dataId, 10);
      const cellFormattingKey = `${reportId}|${dataId}`;

      if (!this.localCellFormatting[cellFormattingKey]) {
        this.localCellFormatting[cellFormattingKey] = {
          dataID: dataIdNumber,
          reportID: reportIdNumber,
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
          fontSize: 16,
          fontFamily: 'Times New Roman',
          fontColor: '#000000',
          backgroundColor: '#ffffff',
        };
      }

      this.localCellFormatting[cellFormattingKey].fontSize = fontSize;
      localStorage.setItem(
        'cellFormatting',
        JSON.stringify(this.localCellFormatting)
      );
      console.log(fontSize);
    });
    // document.execCommand('fontSize', false, fontSize);
  }

  // Change the font family to the specified font
  changeFontFamily(fontFamily: string): void {
    this.selectedCells.forEach((cellKey) => {
      const [reportId, dataId] = cellKey.split('|');
      const reportIdNumber = parseInt(reportId, 10);
      const dataIdNumber = parseInt(dataId, 10);
      const cellFormattingKey = `${reportId}|${dataId}`;

      if (!this.localCellFormatting[cellFormattingKey]) {
        this.localCellFormatting[cellFormattingKey] = {
          dataID: dataIdNumber,
          reportID: reportIdNumber,
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
          fontSize: 16,
          fontFamily: 'Times New Roman',
          fontColor: '#000000',
          backgroundColor: '#ffffff',
        };
      }

      this.localCellFormatting[cellFormattingKey].fontFamily = fontFamily;
      localStorage.setItem(
      'cellFormatting',
      JSON.stringify(this.localCellFormatting)
    );
      console.log(fontFamily);
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
