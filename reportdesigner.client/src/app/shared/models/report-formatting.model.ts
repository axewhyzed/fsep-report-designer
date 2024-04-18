// report-formatting.model.ts

export interface ReportFormatting {
    dataID: number;
    reportID: number;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    fontSize?: string;
    fontFamily?: string;
    fontColor?: string;
    backgroundColor?: string;
  }
  