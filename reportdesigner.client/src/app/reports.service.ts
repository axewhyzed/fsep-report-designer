import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Report } from '../../src/models/report.model'; // Define the Report model as per your requirements
import { ReportData } from '../../src/models/report-data.model'; // Define the ReportData model as per your requirements

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private baseUrl = 'https://localhost:4200/reports';

  constructor(private http: HttpClient) { }

  // Methods for Reports Endpoints

  getReports(): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.baseUrl}`);
  }

  getReport(id: number): Observable<Report> {
    return this.http.get<Report>(`${this.baseUrl}/${id}`);
  }

  createReport(report: Report): Observable<Report> {
    return this.http.post<Report>(`${this.baseUrl}`, report);
  }

  updateReport(id: number, report: Report): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, report);
  }

  deleteReport(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  // Methods for ReportData Endpoints

  getReportData(reportId: number): Observable<ReportData[]> {
    return this.http.get<ReportData[]>(`${this.baseUrl}/${reportId}/ReportData`);
  }

  getSingleReportData(reportId: number, dataId: number): Observable<ReportData> {
    return this.http.get<ReportData>(`${this.baseUrl}/${reportId}/ReportData/${dataId}`);
  }

  createReportData(reportId: number, reportData: ReportData): Observable<ReportData> {
    return this.http.post<ReportData>(`${this.baseUrl}/${reportId}/ReportData`, reportData);
  }

  updateReportData(reportId: number, dataId: number, updateDataDto: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${reportId}/ReportData/${dataId}`, updateDataDto);
  }

  deleteReportData(reportId: number, dataId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${reportId}/ReportData/${dataId}`);
  }
}
