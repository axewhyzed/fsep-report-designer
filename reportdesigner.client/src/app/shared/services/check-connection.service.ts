import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CheckConnectionService {

  constructor(private http: HttpClient) { }

  private baseUrl = 'https://localhost:4200/databaseinfo';

  checkConnectionStatus() {
    return this.http.get<string>(`${this.baseUrl}/status`);
  }
}
