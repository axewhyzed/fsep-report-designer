import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Report } from '../models/report.model';  // Define the Report model as per your requirements
import { ReportData } from '../models/report-data.model'; // Define the ReportData model as per your requirements
import { ReportFormatting } from '../models/report-formatting.model';
import { UpdateDataDto } from '../models/update-data-dto.model';
import { ReportCustomization } from '../models/report-customization.model';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private baseUrl = 'https://localhost:4200/reports';

  constructor(private http: HttpClient) { }

  // Methods for Reports Endpoints

  getReports(): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.baseUrl}`)
    .pipe(
      catchError(this.handleError)
    );
  }

  getReport(id: number): Observable<Report> {
    return this.http.get<Report>(`${this.baseUrl}/${id}`)
    .pipe(
      catchError(this.handleError)
    );
  }

  // Fetch the logo image for a report
  getReportLogo(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/logo`, { responseType: 'blob' })
      .pipe(
        catchError(this.handleError)
      );
  }

  createReport(report: any, logoImage: File | null): Observable<any> {
    const formData = new FormData();
    formData.append('title', report.title);
    if (logoImage) {
      formData.append('logoImage', logoImage, logoImage.name);
    }
    return this.http.post(`${this.baseUrl}`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  searchReports(searchTerm: string): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.baseUrl}/Search`, { params: { searchTerm } })
    .pipe(
      catchError(this.handleError)
    );
  }

  updateReport(id: number, report: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, report)
    .pipe(
      catchError(this.handleError)
    );
  }

  deleteReport(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`)
    .pipe(
      catchError(this.handleError)
    );
  }

  // Methods for ReportData Endpoints

  getReportData(reportId: number): Observable<ReportData[]> {
    return this.http.get<ReportData[]>(`${this.baseUrl}/${reportId}/ReportData`)
    .pipe(
      catchError(this.handleError)
    );
  }

  getSingleReportData(reportId: number, dataId: number): Observable<ReportData> {
    return this.http.get<ReportData>(`${this.baseUrl}/${reportId}/ReportData/${dataId}`)
    .pipe(
      catchError(this.handleError)
    );
  }

  createReportData(reportId: number, reportData: ReportData[]): Observable<ReportData[]> {
    return this.http.post<ReportData[]>(`${this.baseUrl}/${reportId}/ReportData`, reportData)
    .pipe(
      catchError(this.handleError)
    );
  }

   // Methods for ReportFormatting Endpoints

   getReportFormatting(reportId: number): Observable<ReportFormatting[]> {
    return this.http.get<ReportFormatting[]>(`${this.baseUrl}/${reportId}/ReportFormatting`)
      .pipe(
        catchError(this.handleError)
      );
  }

  createReportFormatting(reportId: number, reportFormatting: ReportFormatting[]): Observable<ReportFormatting[]> {
    return this.http.post<ReportFormatting[]>(`${this.baseUrl}/${reportId}/ReportFormatting`, reportFormatting)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateReportFormatting(reportId: number, updateDataDtos: UpdateDataDto[]): Observable<any> {
    return this.http.put(`${this.baseUrl}/${reportId}/ReportFormatting`, updateDataDtos)
      .pipe(
        catchError(this.handleError)
      );
  }

  getSingleReportFormatting(reportId: number, dataId: number): Observable<ReportFormatting> {
    return this.http.get<ReportFormatting>(`${this.baseUrl}/${reportId}/ReportFormatting/${dataId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Methods for Report Customizations

  // GET request to fetch report customization by ID
  getReportCustomization(id: number): Observable<ReportCustomization> {
    return this.http.get<ReportCustomization>(`${this.baseUrl}/${id}/ReportCustomize`);
  }

  // POST request to add report customization
  addReportCustomization(id: number, reportCustomization: ReportCustomization): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/ReportCustomize`, reportCustomization);
  }

  // PUT request to update report customization
  updateReportCustomization(id: number, reportCustomization: ReportCustomization): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}/ReportCustomize`, reportCustomization);
  }

   // Method for Error handling

  private handleError(error: any): Observable<any> {
    console.error('An error occurred:', error);
    return throwError(error);
  }
}
