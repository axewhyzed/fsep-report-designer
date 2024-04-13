// report-data.model.ts

export interface ReportData {
    dataID: number;
    reportID: number;
    rowIndex: number;
    columnIndex: number;
    cellValue: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
    fontSize: number;
    fontFamily: string;
    fontColor: string;
    backgroundColor: string;
    // Add other properties as needed
  }
  