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
  showEditPopup: boolean = false;
  editingReport: Report = {} as Report; // Initialize with an empty object
  currentLogoImage: string | ArrayBuffer | null = null; // Hold the Base64 string of the current logo image
  selectedFile: File | null = null; // Hold the selected file

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
    case 'edit-report':
      this.reportsService.getReport(reportId).subscribe((report: Report) => {
        this.editingReport = { ...report }; // Create a copy of the report to avoid directly modifying the original
        this.showEditPopup = true;
      });
      break;
    default:
      console.log("No suitable function to handle this ");
      break;
  } 
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      // Convert the selected file to Uint8Array and update the currentLogoImage
      const reader = new FileReader();
      reader.readAsArrayBuffer(this.selectedFile);
      reader.onload = () => {
        this.currentLogoImage = reader.result;
      };
    }
  }

  // Convert Uint8Array to Base64 string
  arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    buffer.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return 'data:image/png;base64,' + btoa(binary);
  }

  showEditForm(): void {
    this.showEditPopup = true;
  }

  submitEdit(): void {
    const editedReport: Partial<Report> = {};
    // Check if a new logo image is selected
    editedReport.title = this.editingReport.title;
    if (this.selectedFile) {
      // Convert the selected file to Uint8Array
      const reader = new FileReader();
      reader.readAsArrayBuffer(this.selectedFile);
      reader.onload = () => {
        // Update the logo image of the editingReport with the new image data
        editedReport.logoImage = new Uint8Array(reader.result as ArrayBuffer);
        // Call the updateReport function here with the edited report details
        console.log(editedReport);
        this.reportsService.updateReport(this.editingReport.reportID, editedReport).subscribe(() => {
          console.log("Report updated successfully");
          this.showEditPopup = false;
          // Optionally, you can reload or update the data displayed in your component after the report is updated
        }, error => {
          console.error("Error updating report:", error);
          // Handle error if necessary
        });
      };
    } else {
      // If no new logo image is selected, update the report without changing the logo image, but still updating the title
      // Call the updateReport function here with the edited report details
      this.reportsService.updateReport(this.editingReport.reportID, this.editingReport).subscribe(() => {
        console.log("Report updated successfully");
        this.showEditPopup = false;
        // Optionally, you can reload or update the data displayed in your component after the report is updated
      }, error => {
        console.error("Error updating report:", error);
        // Handle error if necessary
      });
    }
  }
  

  closePopup(): void {
    this.showPopup = false;
    this.showEditPopup = false;
  }
}