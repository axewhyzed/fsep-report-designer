// report.model.ts

export interface Report {
  reportID: number;
  title: string;
  logoImage: File | null;
  createdDate?: Date;
  lastModifiedDate?: Date;
}
