import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-design-view',
  templateUrl: './design-view.component.html',
  styleUrl: './design-view.component.css',
})
export class DesignViewComponent implements OnInit {

  data: any[] = [];
  apiUrl = 'https://dummyjson.com/products';
  tableHeaders: string[] = [];

  constructor(private http: HttpClient) { }

  isBold = false;
  isItalic = false;
  isUnderline = false;
  isStrikethrough = false;
  currentFontSize = '14px';

  ngOnInit(): void {
    const storedData = localStorage.getItem('designViewData');
    if (storedData) {
      this.data = JSON.parse(storedData);
      if (this.data.length > 0) {
        this.tableHeaders = Object.keys(this.data[0]);
      }
    } else {
      this.fetchData();
    }
  }

  reloadData(): void {
    localStorage.removeItem('designViewData');
    this.fetchData();
  }

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
      }
    });
  }

  selectedCells: Set<string> = new Set<string>();

  getColumnHeader(index: number): string {
    // Add 65 to convert the index to ASCII code for A, B, C, etc.
    return String.fromCharCode(65 + index);
  }

  toggleCellSelection(rowIndex: number, columnName: string): void {
    const cellKey = `${rowIndex}-${columnName}`; // Unique identifier for the cell

    // Treat row headers differently
    if (columnName === 'row-header') {
      // Select entire row
      this.selectedCells.clear(); // Clear previous selections
      for (let header of this.tableHeaders) {
        this.selectedCells.add(`${rowIndex}-${header}`); // Add cell keys for the entire row
      }
      return;
    }

    // Check if it's a row header, column header, or table header
    if (rowIndex === -1) {
      // For column headers, table headers, and row headers
      this.selectedCells.clear(); // Clear previous selections
      this.selectedCells.add(columnName); // Select the clicked header
    } else {
      // For normal cells
      this.selectedCells.clear(); // Clear previous selections
      this.selectedCells.add(cellKey); // Select the clicked cell
    }
  }

  isSelected(rowIndex: number, columnName: string): boolean {
    const cellKey = `${rowIndex}-${columnName}`;
    return this.selectedCells.has(cellKey) || this.selectedCells.has(columnName);
  }

  @ViewChild('editableDiv') editableDiv!: ElementRef;

  toggleFormat(format: string): void {
    switch (format) {
      case 'bold':
        this.isBold = !this.isBold;
        break;
      case 'italic':
        this.isItalic = !this.isItalic;
        break;
      case 'underline':
        this.isUnderline = !this.isUnderline;
        break;
      case 'strikethrough':
        this.isStrikethrough = !this.isStrikethrough;
        break;
    }
    document.execCommand(format);
  }

  changeTextColor(color: string): void {
    document.execCommand('foreColor', false, color);
  }

  changeBackgroundColor(color: string): void {
    document.execCommand('hiliteColor', false, color);
  }

  changeFontSize(fontSize: string): void {
    this.currentFontSize = fontSize;
    document.execCommand('fontSize', false, fontSize);
  }

  changeFontFamily(fontFamily: string): void {
    document.execCommand('fontName', false, fontFamily);
  }
}


// private formatText(command: string): void {
//   const editableDiv = this.editableDiv.nativeElement;
//   const selection = window.getSelection();
//   if (selection && selection.rangeCount > 0) {
//     const range = selection.getRangeAt(0);
//     const selectedText = range.extractContents();
//     let span: HTMLElement | null = null;
//     if (range.commonAncestorContainer instanceof HTMLElement && range.commonAncestorContainer.tagName === 'SPAN') {
//       span = range.commonAncestorContainer as HTMLElement;
//     } else {
//       // Create a new span element
//       span = document.createElement('span');
//       range.surroundContents(span);
//     }
//     if (editableDiv.contains(range.commonAncestorContainer)) {
//       // const span = document.createElement('span');
//       if (command === 'bold') {
//         this.isBold = !this.isBold;
//         span.style.fontWeight = this.isBold ? 'bold' : 'normal';
//       } else if (command === 'italic') {
//         this.isItalic = !this.isItalic;
//         span.style.fontStyle = this.isItalic ? 'italic' : 'normal';
//       } else if (command === 'underline') {
//         this.isUnderline = !this.isUnderline;
//         span.style.textDecoration = this.isUnderline ? 'underline' : 'none';
//       } else if (command === 'strikethrough') {
//         this.isStrikethrough = !this.isStrikethrough;
//         span.style.textDecoration = this.isStrikethrough ? 'line-through' : 'none';
//       }
//       span.appendChild(range.extractContents());
//       // range.insertNode(span);
//     }
//   }
// }

// toggleFormat(format:string):void{
//   switch(format){
//     case 'bold':
//       this.formatText('bold');
//       break;
//     case 'italic':
//       this.formatText('italic');
//       break;
//     case 'underline':
//       this.formatText('underline');
//       break;
//     case 'strikethrough':
//       this.formatText('strikethrough');
//       break;
//   }
// }