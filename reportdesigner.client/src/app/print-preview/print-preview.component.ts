import { Component, ElementRef, Input, Renderer2, ViewChild } from '@angular/core';
import { ReportsService } from '../shared/services/reports.service';
import { Report } from '../shared/models/report.model';
import { ReportData } from '../shared/models/report-data.model';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ReportCustomization } from '../shared/models/report-customization.model';
import { CustomizeService } from '../shared/services/customize.service';
import * as mammoth from 'mammoth';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-print-preview',
  templateUrl: './print-preview.component.html',
  styleUrl: './print-preview.component.css',
})
export class PrintPreviewComponent {
  databaseInfo: any = [];
  reportData: ReportData[] = [];
  reports: Report[] = [];
  reportTitle: string = '';
  titleData: ReportData | undefined;
  selectedLogo: File | null = null;
  logoDataURL: string | null = null;
  tableSelections: { database: string; table: string; tables: string[] }[] = [];
  @ViewChild('exportedDiv') exportedDiv!: ElementRef;
  currentDateTime: string = '';
  selectedReportId!: number;
  tableHeaders: ReportData[] = [];
  tableData: ReportData[][] = [];

  constructor(
    private renderer: Renderer2,
    private reportsService: ReportsService,
    private customizeService : CustomizeService
  ) {}

  ngOnInit(): void {

    this.customizeService.headerBG$.subscribe(value => {
      this.reportCustomization.headerBGColor = value;
    });

    this.customizeService.footerBG$.subscribe(value => {
      this.reportCustomization.footerBGColor = value;
    });

    this.customizeService.bodyBG$.subscribe(value => {
      this.reportCustomization.bodyBGColor = value;
    });

    this.customizeService.tableBorder$.subscribe(value => {
      this.reportCustomization.tableBorderVisible = value;
    });
    
    this.customizeService.cellPadding$.subscribe(value => {
      this.reportCustomization.cellContentPadding = value;
    });

    this.customizeService.tablePadding$.subscribe(value => {
      this.reportCustomization.tableTopPadding = value;
    });

    this.customizeService.tableAlign$.subscribe(value => {
      this.reportCustomization.tableDataAlign = value;
    });

    this.customizeService.footerContent$.subscribe(value => {
      this.reportCustomization.footerContent = value;
    });

    setInterval(() => {
      this.currentDateTime = new Date().toLocaleString();
    }, 1000);

    const selectedReportIdString: string | null =
      localStorage.getItem('selectedReportId');
    this.selectedReportId = selectedReportIdString
      ? parseInt(selectedReportIdString, 10)
      : 0;

    this.reportsService.getReports().subscribe(
      (data: Report[]) => {
        this.reports = data;
        if (this.selectedReportId) {
          this.getReportTitleData(this.selectedReportId);
        }
      },
      (error) => {
        console.error('Error fetching reports:', error);
      }
    );

    if(this.selectedReportId){
      this.fetchReportLogo();
      this.getReportCustomizationDetails(this.selectedReportId);
    }
  }

  reportCustomization!: ReportCustomization;
  footerText: string = 'Footer content here';

  getReportCustomizationDetails(reportID : number) {
    this.reportsService.getReportCustomization(reportID)
      .subscribe(
        (data: ReportCustomization) => {
          this.reportCustomization = data;
          console.log(data);
          // Apply the fetched customization to HTML elements
          this.applyCustomization();
        },
        error => {
          console.error('Error fetching report customization:', error);
        }
      );
  }

  applyCustomization() {
    // Apply fetched customization to HTML elements
    if (this.reportCustomization) {
      // Apply footer content
      this.footerText = this.reportCustomization.footerContent;
      console.log(this.footerText);
    }
  }

  getReportTitleData(reportId: number): void {
    const report = this.reports.find((report) => report.reportID === reportId);
    if (report) {
      this.reportTitle = report.title;
    }
    this.reportsService.getReportData(this.selectedReportId).subscribe(
      (data: ReportData[]) => {
        this.reportData = data;
        this.tableHeaders = this.reportData.filter(
          (item) => item.rowIndex === 0
        );
        console.log(this.tableHeaders);
        this.tableData = this.groupDataByRows(
          this.reportData.filter(
            (item) => item.rowIndex !== 0 && item.isTitle !== true
          )
        );
        this.titleData = this.reportData.find(
          (data) => data.cellValue === this.reportTitle && data.isTitle
        );
        console.log(this.titleData);
      },
      (error) => {
        console.error('Error fetching report data:', error);
      }
    );
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

  fetchReportLogo(): void {
    const reportId = this.selectedReportId;
    this.reportsService.getReportLogo(reportId).subscribe(
      (logoBlob: Blob) => {
        // Convert the logo blob to a data URL
        const reader = new FileReader();
        reader.readAsDataURL(logoBlob);
        reader.onloadend = () => {
          // Once the file is read, set the logoDataURL property
          this.logoDataURL = reader.result as string;
        };
      },
      (error) => {
        console.error('Error fetching report logo:', error);
      }
    );
  }

  getColumnHeader(index: number): string {
    // Add 65 to convert the index to ASCII code for A, B, C, etc.
    return String.fromCharCode(65 + index);
  }

  onLogoSelected(event: any) {
    this.selectedLogo = event.target.files[0];
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
      };
    }
  }

  applyStyle(cellReportId: number, cellDataId: number | any) {
    const defaultStyle = {
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      fontSize: '14px',
      fontColor: '#000000',
      fontFamily: 'Arial',
      backgroundColor: '#FFFFFF',
      border: this.reportCustomization.tableBorderVisible ? '1px solid black' : 'none',
      padding: this.reportCustomization.cellContentPadding ? this.reportCustomization.cellContentPadding + 'px' : '0',
    };

    // Retrieve cellFormatting from localStorage
    const cellFormatting = localStorage.getItem('cellFormatting');
    if (cellFormatting) {
      const cellKey = `${cellReportId}|${cellDataId}`;
      const formatting = JSON.parse(cellFormatting)[cellKey];

      // Check if the style in cellFormatting differs from default style
      if (formatting && !this.isDefaultStyle(formatting)) {
        const style: any = {
          'border': this.reportCustomization.tableBorderVisible ? '1px solid black' : 'none',
          'padding': this.reportCustomization.cellContentPadding ? this.reportCustomization.cellContentPadding + 'px' : '0',
        };

        if (formatting.bold) style['font-weight'] = 'bold';
        if (formatting.italic) style['font-style'] = 'italic';
        if (formatting.underline) style['text-decoration'] = 'underline';
        if (formatting.strikethrough)
          style['text-decoration-line'] = 'line-through';
        style['font-size'] = formatting.fontSize;
        style.color = formatting.fontColor;
        style['font-family'] = formatting.fontFamily;
        style['background-color'] = formatting.backgroundColor;
        if(this.titleData?.dataID === cellDataId){
          style['border'] = 'none';
          style['padding'] = '0';
          return style;
        }

        return style;
      }
    }
    return defaultStyle; // Default empty style object
  }

  // Function to check if a style is default
  isDefaultStyle(style: any) {
    const defaultStyle = {
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      fontSize: '14px',
      fontColor: '#000000',
      fontFamily: 'Arial',
      backgroundColor: '#FFFFFF',
    };
    // List of properties to ignore during comparison
    const ignoreProperties = ['reportID', 'dataID'];

    for (const key in defaultStyle) {
      if (defaultStyle.hasOwnProperty(key) && !ignoreProperties.includes(key)) {
        if ((style as any)[key] !== (defaultStyle as any)[key]) {
          return false;
        }
      }
    }

    return true;
  }

  exportDivToHtml() {
    //Get Report Title
    const reportDataString = localStorage.getItem('reportData');
    if (!reportDataString) {
      alert('No report data found to save');
      return;
    }
    const divToExport = this.exportedDiv.nativeElement.innerHTML;
    const exportDoc = document.implementation.createHTMLDocument(
      `${this.reportTitle} - Report.html`
    );

    // Create a div element to hold the exported content
    const exportDiv = exportDoc.createElement('div');
    exportDiv.innerHTML = divToExport;

    exportDiv.style.minHeight = '900px';
     // Set display flex for exportDiv
     exportDiv.style.display = 'flex';
     exportDiv.style.flexDirection = 'column';
    // Set bottom-section to position absolute and bottom 0
    const bottomSection = exportDiv.querySelector('.bottom-section') as HTMLElement;
    const repContainer = exportDiv.querySelector('.report-container') as HTMLElement;
    if (bottomSection) {
        bottomSection.style.marginTop = 'auto';
    }

    // Append the export div to the body of the export document
    exportDoc.body.appendChild(exportDiv);

    // Inject CSS styles
    const styles = Array.from(document.styleSheets)
      .filter(
        (styleSheet) =>
          !styleSheet.href || !styleSheet.href.endsWith('styles.css')
      ) // Exclude styles.css
      .map((styleSheet) =>
        Array.from(styleSheet.cssRules)
          .map((rule) => rule.cssText)
          .join('\n')
      )
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
    a.download = `${this.reportTitle} - Report.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  generatePDF() {
    // Select the printable section
    const exportedDiv = this.exportedDiv.nativeElement;
    const options = { scale: 1 };
  
    html2canvas(exportedDiv, options).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      // Calculate the dimensions of the content
      const contentWidth = canvas.width;
      const contentHeight = canvas.height;
  
      // Create a new jsPDF instance with custom page size matching content size
      const pdf = new jsPDF({
        orientation: contentWidth > contentHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [contentWidth, contentHeight],
      });
  
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, 0, contentWidth, contentHeight);
  
      pdf.save(`${this.reportTitle} - Report.pdf`);
    });
  }
  
  generateReportImage(){
    // Select the printable section
  const exportedDiv = this.exportedDiv.nativeElement;
  const options = { scale: 1 };

  html2canvas(exportedDiv, options).then(canvas => {
    const imgData = canvas.toDataURL('image/png');

    // Create a link element
    const link = document.createElement('a');
    link.href = imgData;
    link.download = `${this.reportTitle} - Image.png`;

    // Trigger a click event on the link to download the image
    link.click();
  });
  }
}
