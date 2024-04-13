// report.model.ts

export interface Report {
    reportID: number;
    title: string;
    logoImage: string | null;
    createdDate: Date;
    lastModifiedDate: Date;
    // Add other properties as needed
  }
  