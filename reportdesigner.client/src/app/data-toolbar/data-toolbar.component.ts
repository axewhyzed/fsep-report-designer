import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReportsService } from '../shared/services/reports.service';
import { Report } from '../shared/models/report.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-data-toolbar',
  templateUrl: './data-toolbar.component.html',
  styleUrl: './data-toolbar.component.css',
})
export class DataToolbarComponent implements OnInit {
  selectedReportId: number | null = 0;
  errorMessage: string = '';
  report!: Report;

  constructor(private router: Router, private reportsService: ReportsService) {}

  ngOnInit(): void {
    const selectedReportIdStr = localStorage.getItem('selectedReportId');
    this.selectedReportId = selectedReportIdStr
      ? parseInt(selectedReportIdStr, 10)
      : null;

    if (this.selectedReportId) {
      this.reportsService.getReport(this.selectedReportId).subscribe(
        (report: Report) => {
          this.report = report;
        },
        (error) => {
          console.error('Error fetching report:', error);
          // Handle error if needed
        }
      );
    } else {
      this.errorMessage = 'No Report Selected';
    }
  }

  saveReportState() {
    const reportDataString = localStorage.getItem('reportData');
    if (!reportDataString) {
      alert('No report data found to save');
      return;
    }
    const savedReportData = JSON.parse(reportDataString);
    const savedReportTitle = savedReportData.reportTitle;
    const data = JSON.stringify(localStorage);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${savedReportTitle}-ReportData.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  loadReportState(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = JSON.parse((event.target as FileReader).result as string);
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          localStorage.setItem(key, data[key]);
        }
      }
      alert('Report loaded successfully!');
    };
    reader.readAsText(file);

    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      window.location.reload();
    });
  }

  initNewReport() {
    localStorage.removeItem('reportData');
    localStorage.removeItem('reportDetails');
    localStorage.removeItem('selectedReportId');
    alert('New Report Initiated');
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      window.location.reload();
    });
  }

  resetReportData() {
    const updatedCellsJSON = localStorage.getItem('updatedCells');
    if (updatedCellsJSON) {
      const updatedCells = new Set<string>(JSON.parse(updatedCellsJSON));
      const previousFlagValue = (window as any)['showConfirmationDialog'];
      (window as any)['showConfirmationDialog'] = true;
      if (updatedCells.size > 0) {
        const confirmation = confirm(
          'You have unsaved changes. Discard changes and open new report?'
        );
        if (confirmation) {
          this.initNewReport();
        } else {
          (window as any)['showConfirmationDialog'] = previousFlagValue;
          return;
        }
      } else {
        this.initNewReport();
      }
      (window as any)['showConfirmationDialog'] = previousFlagValue;
    } else {
      this.initNewReport();
    }
  }
}
