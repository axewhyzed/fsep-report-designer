import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-status-bar',
  templateUrl: './status-bar.component.html',
  styleUrl: './status-bar.component.css'
})
export class StatusBarComponent implements OnInit {

  currentDateTime: string = '';

  constructor() { }

  ngOnInit(): void {
    this.updateCurrentTime(); // Initial update

    // Update the current time every second
    setInterval(() => {
      this.updateCurrentTime();
    }, 1000);
  }

  // Function to update the current time in seconds
  updateCurrentTime(): void {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Format seconds with leading zero if necessary
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes.toString() : minutes.toString();
    const formattedSeconds = seconds < 10 ? '0' + seconds.toString() : seconds.toString();

    const formattedDate = now.getDate().toString().padStart(2, '0') + '-' + (now.getMonth() + 1).toString().padStart(2, '0') + '-' +
      now.getFullYear().toString();
    // Update the currentTime property
    this.currentDateTime = formattedDate + ' ' + formattedHours + ':' + formattedMinutes + ':' + formattedSeconds + ' ' + ampm;
  }

  viewNameArr: string[] = ['Report View', 'Print Preview', 'Layout View', 'Design View'];
  viewName: string = 'Report View';
  updateViewName(newView: string) {
    this.viewName = newView;
  }
}
