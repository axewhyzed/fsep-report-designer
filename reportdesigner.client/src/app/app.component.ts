import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

interface WeatherForecast {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  currentComponent: string = 'design-view';

  toggleComponent(componentName: string) {
    this.currentComponent = componentName;
    console.log(componentName);
  }

  public forecasts: WeatherForecast[] = [];

  constructor(private http: HttpClient) {}

  // ngOnInit() {
  //   this.getForecasts();
  // }

  // getForecasts() {
  //   this.http.get<WeatherForecast[]>('/databaseinfo/databases').subscribe(
  //     (result) => {
  //       this.forecasts = result;
  //     },
  //     (error) => {
  //       console.error(error);
  //     }
  //   );
  // }

  title = 'reportdesignerprac.client';
}
