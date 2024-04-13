import { Component, OnInit } from '@angular/core';
import { Report } from '../../models/report.model';
import { ReportsService } from '../reports.service';

@Component({
  selector: 'app-navigation-panel',
  templateUrl: './navigation-panel.component.html',
  styleUrl: './navigation-panel.component.css'
})
export class NavigationPanelComponent implements OnInit{
  databaseInfo: any;
  showPopup: boolean = false;
  popupTitle: string = '';
  popupData: any;
  reports: Report[] = [];

  constructor(private reportsService: ReportsService) { }
  
  ngOnInit(): void {
    const databaseInfoJson = localStorage.getItem('databaseInfo');
    if (databaseInfoJson) {
      this.databaseInfo = JSON.parse(databaseInfoJson);
    }
    this.loadReports();
  }

  loadReports() {
    this.reportsService.getReports().subscribe(reports => {
      this.reports = reports;
    });
  }

  openPopup(title: string, reportId: number): void {
    this.popupTitle = title;
    this.reportsService.getReportData(reportId).subscribe(reportData => {
    this.popupData = reportData;
    this.showPopup = true;
  });
  }

  closePopup(): void {
    this.showPopup = false;
  }
}