import { Component, OnInit } from '@angular/core';
import { Report } from '../shared/models/report.model';
import { ReportsService } from '../shared/services/reports.service';

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
    this.reportsService.getReports().subscribe((reports:any) => {
      this.reports = reports;
    });
  }

  searchTerm: string = "";
  searchResults: Report[] = [];
  isSearching: boolean = false;

  searchFunc(): void {
    if (this.searchTerm) {
      this.isSearching = true; // Set isSearching to true when performing a search
      this.reportsService.searchReports(this.searchTerm).subscribe(
        (reports: Report[]) => {
          this.searchResults = reports;
        },
        (error) => {
          console.error('Error searching reports:', error);
        }
      );
    } else {
      // Handle empty search term
      this.isSearching = false; // Set isSearching to false when the search term is empty
      this.searchResults = []; // Clear search results when search term is empty
    }
  }

  handleSearchChange(): void {
    this.isSearching = !!this.searchTerm.trim(); // Set isSearching based on whether the search term is empty
    if (this.isSearching) {
      this.searchFunc(); // Trigger search when there's text in the search box
    } else {
      this.searchResults = []; // Clear search results when the search box is empty
    }
  }

  openPopup(title: string, reportId: number, action: string): void {
    // Customize the title and ID based on your requirements
  this.popupTitle = title;
  
  // Determine the action to perform based on the provided parameter
  switch(action) {
    case 'view-report':
      this.reportsService.getReport(reportId).subscribe((report:any) => {
        this.popupData = Object.entries(report);
        this.showPopup = true;
      });
      break;
    case 'view-report-data':
      this.reportsService.getReportData(reportId).subscribe((report:any) => {
        this.popupData = report;
        this.showPopup = true;
      });
      break;
    case 'edit':
      console.log("edit");
      break;
    // Add more cases for different actions if needed
    default:
      console.log("Unga");
      break;
  } 
  }

  closePopup(): void {
    this.showPopup = false;
  }
}