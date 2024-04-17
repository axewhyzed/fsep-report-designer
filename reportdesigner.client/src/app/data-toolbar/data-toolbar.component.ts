import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-data-toolbar',
  templateUrl: './data-toolbar.component.html',
  styleUrl: './data-toolbar.component.css',
})
export class DataToolbarComponent {

  constructor(private router: Router){}

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

  resetReportData(){
    localStorage.removeItem('cellFormatting');
    localStorage.removeItem('reportData');
    localStorage.removeItem('tableSelections');
    localStorage.removeItem('selectedReportId')
    alert('New Report Initiated');
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      window.location.reload();
    });
  }
}
