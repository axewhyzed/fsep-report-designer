import { HttpClient, JsonpInterceptor } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-design-view',
  templateUrl: './design-view.component.html',
  styleUrl: './design-view.component.css',
})
export class DesignViewComponent implements OnInit {
  data: any[] = [];
  apiUrl = 'https://dummyjson.com/products';
  tableHeaders: string[] = [];

  constructor(private http: HttpClient) {}

  localCellFormatting: any;

  // Initialize component data and fetch data if not already stored locally
  ngOnInit(): void {
    // Check if cellFormatting exists in local storage
    let cellFormatting = localStorage.getItem('cellFormatting');

    const storedData = localStorage.getItem('designViewData');
    if (storedData) {
      this.data = JSON.parse(storedData);
      if (this.data.length > 0) {
        this.tableHeaders = Object.keys(this.data[0]);
        const numRows = this.data.length; // Number of rows
        const numColumns = this.tableHeaders.length; // Number of columns
        if (!cellFormatting) {
          // If it doesn't exist, initialize it and store it in local storage
          cellFormatting = this.initializeCellFormatting(
            numRows,
            numColumns,
            this.tableHeaders
          );
          localStorage.setItem('cellFormatting', cellFormatting);
          this.localCellFormatting = JSON.parse(cellFormatting);
        }
        this.localCellFormatting = JSON.parse(cellFormatting);
        // this.applySavedFormatting(numRows, numColumns, this.tableHeaders);
      }
    } else {
      this.fetchData();
    }
  }

  // Initialize cell formatting for table headers and cells
  initializeCellFormatting(
    numRows: number,
    numColumns: number,
    tableHeaders: string[]
  ): string {
    let cellFormatting: { [key: string]: any } = {};

    // Add formatting for table headers with index -1
    for (let j = 0; j < tableHeaders.length; j++) {
      cellFormatting[`-1_${tableHeaders[j]}`] = {
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

    // Add formatting for cells
    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < numColumns; j++) {
        cellFormatting[`${i}_${tableHeaders[j]}`] = {
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
    return JSON.stringify(cellFormatting);
  }

  reloadData(): void {
    localStorage.removeItem('designViewData');
    this.fetchData();
  }

  // Fetch data from the API and store it locally
  fetchData(): void {
    this.http.get<any>(this.apiUrl).subscribe({
      next: (response) => {
        this.data = response.products.slice(0, 10);
        if (this.data.length > 0) {
          this.tableHeaders = Object.keys(this.data[0]);
        }
        localStorage.setItem('designViewData', JSON.stringify(this.data));

        console.log('Data:', this.data); // Add this line for debugging
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      },
    });
  }

  selectedCells: Set<string> = new Set<string>();

  getColumnHeader(index: number): string {
    // Add 65 to convert the index to ASCII code for A, B, C, etc.
    return String.fromCharCode(65 + index);
  }

  // Handle cell selection based on provided row index and column name
  toggleCellSelection(rowIndex: number, columnName: string): void {
    const cellKey = `${rowIndex}_${columnName}`; // Unique identifier for the cell

    // Treat row headers differently
    if (columnName === 'row-header') {
      // Select entire row
      this.selectedCells.clear(); // Clear previous selections
      for (let header of this.tableHeaders) {
        console.log(`${rowIndex}_${header}`);
        this.selectedCells.add(`${rowIndex}_${header}`); // Add cell keys for the entire row
      }
      return;
    }

    // Check if it's a row header, column header, or table header
    if (rowIndex === -2) {
      // For column headers, table headers, and row headers
      console.log(columnName);
      this.selectedCells.clear(); // Clear previous selections
      // Add all cells in the selected column
      for (let i = 0; i < this.data.length; i++) {
        this.selectedCells.add(`${i}_${columnName}`);
        console.log(`${i}_${columnName}`);
      }

      // this.selectedCells.add(columnName); // Select the clicked header
    } else {
      // For normal cells
      console.log(cellKey);
      this.selectedCells.clear(); // Clear previous selections
      this.selectedCells.add(cellKey); // Select the clicked cell
    }
  }

  // Check if the cell at the provided row index and column name is selected
  isSelected(rowIndex: number, columnName: string): boolean {
    const cellKey = `${rowIndex}_${columnName}`;
    return (
      this.selectedCells.has(cellKey) || this.selectedCells.has(columnName)
    );
  }

  @ViewChild('editableDiv') editableDiv!: ElementRef;

  // Toggle the specified text formatting
  toggleFormat(format: string): void {
    if (this.selectedCells.size === 0) return; // No cells selected
    // Update the formatting of the selected cell and the corresponding entry in the cellFormatting object
    this.selectedCells.forEach((cellKey) => {
      const [rowIndex, columnName] = cellKey.split('_');
      const rowIndexNumber = parseInt(rowIndex, 10);
      const cellFormattingKey = `${rowIndex}_${columnName}`;

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

    // Apply formatting to the selected text
    document.execCommand(format);
  }

  applyStyle(row: number, column: string) {
    // Retrieve cellFormatting from localStorage
    const cellFormatting = localStorage.getItem('cellFormatting');
    if (cellFormatting) {
      // const cellKey = row.toString() + '-' + column;
      const cellKey = `${row}_${column}`;
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
      const [rowIndex, columnName] = cellKey.split('_');
      const rowIndexNumber = parseInt(rowIndex, 10);
      const cellFormattingKey = `${rowIndex}_${columnName}`;

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
      const [rowIndex, columnName] = cellKey.split('_');
      const rowIndexNumber = parseInt(rowIndex, 10);
      const cellFormattingKey = `${rowIndex}_${columnName}`;

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
      const [rowIndex, columnName] = cellKey.split('_');
      const rowIndexNumber = parseInt(rowIndex, 10);
      const cellFormattingKey = `${rowIndex}_${columnName}`;

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
      const [rowIndex, columnName] = cellKey.split('_');
      const rowIndexNumber = parseInt(rowIndex, 10);
      const cellFormattingKey = `${rowIndex}_${columnName}`;

      this.localCellFormatting[cellFormattingKey].fontFamily = fontFamily;
      localStorage.setItem(
        'cellFormatting',
        JSON.stringify(this.localCellFormatting)
      );
    });
    // document.execCommand('fontName', false, fontFamily);
  }
}
