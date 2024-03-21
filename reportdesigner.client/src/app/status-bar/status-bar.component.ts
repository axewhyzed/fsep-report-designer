import { Component, OnInit } from '@angular/core';
import { DatentimeService } from '../datentime.service';

@Component({
  selector: 'app-status-bar',
  templateUrl: './status-bar.component.html',
  styleUrl: './status-bar.component.css'
})
export class StatusBarComponent implements OnInit{

  constructor(private datentimeService: DatentimeService) { }

  ngOnInit(): void {
      this.datentimeService.updateCurrentTime(); // Initial update
  
      // Update the current time every second
      setInterval(() => {
        this.datentimeService.updateCurrentTime();
      }, 1000);
  }

  get currentDateTime(): string {
    return this.datentimeService.currentDateTime;
  }

  get currentDate(): string {
    return this.datentimeService.currentDate;
  }

  get currentTime(): string {
    return this.datentimeService.currentTime;
  }

  viewNameArr: string[] = ['Report View', 'Print Preview', 'Layout View', 'Design View'];
  viewName: string = 'Report View';
  updateViewName(newView: string) {
    this.viewName = newView;
  }
}
