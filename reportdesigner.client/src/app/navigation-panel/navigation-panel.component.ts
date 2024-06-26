import { Component, OnInit } from '@angular/core';
import { Report } from '../shared/models/report.model';
import { ReportsService } from '../shared/services/reports.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-navigation-panel',
  templateUrl: './navigation-panel.component.html',
  styleUrl: './navigation-panel.component.css',
})
export class NavigationPanelComponent implements OnInit {
  reportDetails: any;
  popupTitle: string = '';
  popupData: any;
  reports: Report[] = [];
  showDetailsPopup: boolean = false;
  showReportPopup: boolean = false;
  showEditPopup: boolean = false;
  showDeletePopup: boolean = false;
  currentReportId!: number;
  editingReport: Report = {} as Report; // Initialize with an empty object
  currentLogoImage: string | null = null; // Hold the Base64 string of the current logo image
  selectedFile!: File | undefined; // Hold the selected file

  constructor(private reportsService: ReportsService, private router: Router, private toastr: ToastrService) {}

  ngOnInit(): void {
    const reportDetailsJson = localStorage.getItem('reportDetails');
    if (reportDetailsJson) {
      this.reportDetails = JSON.parse(reportDetailsJson);
    }
    this.loadReports();
  }

  loadReports() {
    this.reportsService.getReports().subscribe((reports: any) => {
      this.reports = reports;
    });
  }

  logoURL: string = '';

  fetchLogo(reportId: number){
    this.reportsService.getReportLogo(reportId).subscribe(
      (logoBlob: Blob) => {
        // Convert the logo blob to a data URL
        const reader = new FileReader();
        reader.readAsDataURL(logoBlob);
        reader.onloadend = () => {
          // Once the file is read, set the logoDataURL property
          this.logoURL = reader.result as string;
        };
      },
      (error) => {
        console.error('Error fetching report logo:', error);
      }
    );
  }

  searchTerm: string = '';
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
    switch (action) {
      case 'view-details':
        this.reportsService.getReport(reportId).subscribe((report: any) => {
          this.popupData = report;
          this.showDetailsPopup = true;
          this.fetchLogo(reportId);
        });
        break;
      case 'edit-report':
        this.reportsService.getReport(reportId).subscribe((report: Report) => {
          this.popupData = report;
          this.editingReport = { ...report }; // Create a copy of the report to avoid directly modifying the original
          this.showEditPopup = true;
          this.fetchLogo(reportId);
        });
        break;
      case 'delete-report':
        this.showDeletePopup = true;
        this.currentReportId = reportId;
        break;
      default:
        console.log('No suitable function to handle this ');
        break;
    }
  }

  onFileSelected(event: any): void {
    const file: File | undefined = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Update currentLogoImage directly with the selected file
      // Create a temporary URL for the selected file
      this.currentLogoImage = URL.createObjectURL(file);
      console.log(this.currentLogoImage);
    }
  }

  getLogoUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  showEditForm(): void {
    this.showEditPopup = true;
  }

  submitDelete(reportId: number): void {
    this.reportsService
      .deleteReport(this.currentReportId)
      .subscribe((report: Report) => {
        const delReport = this.reports.find(
          (report) => report.reportID === reportId
        );
        const delReportIndex = this.reports.findIndex(
          (report) => report.reportID === reportId
        );
        const currentRep = localStorage.getItem('selectedReportId');
        if (currentRep === String(reportId)) {
          this.router
            .navigateByUrl('/', { skipLocationChange: true })
            .then(() => {
              window.location.reload();
            });
          localStorage.removeItem('selectedReportId');
        }
        const reportTitle = delReport ? delReport.title : 'Unknown Title';
        this.reports.splice(delReportIndex, 1);
        this.showDeletePopup = false;
        this.toastr.success(`${delReport?.title} has been deleted`, 'Report Deleted Successfully', {
          timeOut: 5000,
          easing: 'ease-in',
          easeTime: 300,
          progressBar: true,
          progressAnimation: 'decreasing'
        });
      });
  }

  submitEdit(): void {
    // Create FormData object to construct the multipart/form-data request
    const formData = new FormData();

    // Append the title field to the FormData
    formData.append('Title', this.editingReport.title || '');

    // Append the logoImage field to the FormData if it exists
    if (this.selectedFile) {
      formData.append('LogoImage', this.selectedFile, this.selectedFile.name);
    }

    // Call the updateReport function here with the edited report details
    this.reportsService
      .updateReport(this.editingReport.reportID, formData)
      .subscribe(
        () => {
          console.log('Report updated successfully');
          this.toastr.success('', 'Changes saved', {
            timeOut: 5000,
            easing: 'ease-in',
            easeTime: 300,
            progressBar: true,
            progressAnimation: 'decreasing'
          });
          this.reports.forEach((report) => {
            if (report.reportID === this.editingReport.reportID) {
              report.title = this.editingReport.title!;
              console.log(report.title);
            }
          });

          this.searchResults.forEach((report) => {
            if (report.reportID === this.editingReport.reportID) {
              report.title = this.editingReport.title!;
              console.log(report.title);
            }
          });
          // Optionally, you can reload or update the data displayed in your component after the report is updated
          this.showEditPopup = false;
        },
        (error) => {
          this.toastr.error('There was an error while saving changes', 'Error', {
            timeOut: 5000,
            easing: 'ease-in',
            easeTime: 300,
            progressBar: true,
            progressAnimation: 'decreasing'
          });
          // Handle error if necessary
        }
      );
  }

  closePopup(): void {
    this.showDetailsPopup = false;
    this.showReportPopup = false;
    this.showEditPopup = false;
    this.showDeletePopup = false;
  }
}
