// database-info.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatabaseInfoService {

  constructor(private http: HttpClient) { }

  // API endpoint URLs
  private apiUrl = 'https://127.0.0.1:4200/databaseinfo';

  // Fetch list of databases from the backend
  getDatabases(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/databases`);
  }

  // Fetch list of tables for a specific database
  getTables(databaseName: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/tables?databaseName=${databaseName}`);
  }

  // Fetch data for a specific table in a specific database
  getTableData(databaseName: string, tableName: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tabledata?databaseName=${databaseName}&tableName=${tableName}`);
  }
}
