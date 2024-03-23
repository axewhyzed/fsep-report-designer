import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { DatentimeService } from '../datentime.service';

@Component({
  selector: 'app-print-preview',
  templateUrl: './print-preview.component.html',
  styleUrl: './print-preview.component.css'
})
export class PrintPreviewComponent {
  databaseInfo: any = [];
  @ViewChild('exportedDiv') exportedDiv!: ElementRef;

  constructor(private datentimeService: DatentimeService, private renderer: Renderer2) { }

  ngOnInit(): void {
    const databaseInfoJson = localStorage.getItem('databaseInfo');
    if (databaseInfoJson) {
      this.databaseInfo = JSON.parse(databaseInfoJson);
    }
  }

  getColumnHeader(index: number): string {
    // Add 65 to convert the index to ASCII code for A, B, C, etc.
    return String.fromCharCode(65 + index);
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

  get currentDateTime(): string {
    return this.datentimeService.currentDateTime;
  }

  get currentDate(): string {
    return this.datentimeService.currentDate;
  }

  get currentTime(): string {
    return this.datentimeService.currentTime;
  }

  exportDivToHtml() {
    const divToExport = this.exportedDiv.nativeElement.innerHTML;
    const exportDoc = document.implementation.createHTMLDocument('Exported HTML');

    // Create a div element to hold the exported content
    const exportDiv = exportDoc.createElement('div');
    exportDiv.innerHTML = divToExport;

    // Append the export div to the body of the export document
    exportDoc.body.appendChild(exportDiv);

    // Inject CSS styles
    const styles = Array.from(document.styleSheets)
      .filter(styleSheet => !styleSheet.href || !styleSheet.href.endsWith('styles.css')) // Exclude styles.css
      .map(styleSheet => Array.from(styleSheet.cssRules)
        .map(rule => rule.cssText)
        .join('\n'))
      .join('\n');
    const styleElement = exportDoc.createElement('style');
    styleElement.textContent = styles;
    exportDoc.head.appendChild(styleElement);

    // Serialize the new document to HTML
    const exportedHtml = exportDoc.documentElement.outerHTML;

    // Download the HTML content
    const blob = new Blob([exportedHtml], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported_content.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
