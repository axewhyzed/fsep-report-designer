import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Report } from '../models/report.model';  // Define the Report model as per your requirements
import { ReportData } from '../models/report-data.model'; // Define the ReportData model as per your requirements
import { ReportFormatting } from '../models/report-formatting.model';

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

  createReport(report: Report): Observable<Report> {
    return this.http.post<Report>(`${this.baseUrl}`, report)
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

  createReportData(reportId: number, reportData: ReportData): Observable<ReportData> {
    return this.http.post<ReportData>(`${this.baseUrl}/${reportId}/ReportData`, reportData)
    .pipe(
      catchError(this.handleError)
    );
  }

   // Methods for ReportData Endpoints

   getReportFormatting(reportId: number): Observable<ReportFormatting[]> {
    return this.http.get<ReportFormatting[]>(`${this.baseUrl}/${reportId}/ReportFormatting`)
      .pipe(
        catchError(this.handleError)
      );
  }

  createReportFormatting(reportId: number, reportFormatting: ReportFormatting): Observable<ReportFormatting> {
    return this.http.post<ReportFormatting>(`${this.baseUrl}/${reportId}/ReportFormatting`, reportFormatting)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateReportFormatting(reportId: number, reportFormatting: ReportFormatting): Observable<any> {
    return this.http.put(`${this.baseUrl}/${reportId}/ReportFormatting`, reportFormatting)
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

   // Method for Error handling

  private handleError(error: any): Observable<any> {
    console.error('An error occurred:', error);
    return throwError(error);
  }
}