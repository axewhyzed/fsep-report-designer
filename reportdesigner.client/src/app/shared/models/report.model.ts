// report.model.ts

export interface Report {
  reportID: number;
  title: string;
  logoImage: Uint8Array;
  createdDate: Date;
  lastModifiedDate: Date;
}
