import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { ReportsService } from '../shared/services/reports.service';
import { Report } from '../shared/models/report.model';
import { ReportData } from '../shared/models/report-data.model';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

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
    private reportsService: ReportsService
  ) {}

  ngOnInit(): void {
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
    };

    // Retrieve cellFormatting from localStorage
    const cellFormatting = localStorage.getItem('cellFormatting');
    if (cellFormatting) {
      const cellKey = `${cellReportId}|${cellDataId}`;
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
    html2canvas(this.exportedDiv.nativeElement, { scale: 1 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      // Create a new jsPDF instance
      const pdf = new jsPDF();
      const imgWidth = pdf.internal.pageSize.getWidth();
      // const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
       // Check if content exceeds page size
    if (imgHeight > pdf.internal.pageSize.getHeight()) {
      // Scale down content to fit within page
      const scaleFactor = pdf.internal.pageSize.getHeight() / imgHeight;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth * scaleFactor, pdf.internal.pageSize.getHeight());
    } else {
      // Add content as is if it fits within page
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    }
      pdf.save(`${this.reportTitle} - Report.pdf`);
    });
  }
}
