import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DatentimeService {
  currentDateTime: string = '';
  currentDate: string = '';
  currentTime: string = '';

  constructor() { }

  // Function to update the current time in seconds
  updateCurrentTime(): void {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const amorpm = hours >= 12 ? 'PM' : 'AM';

    // Format seconds with leading zero if necessary
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes.toString() : minutes.toString();
    const formattedSeconds = seconds < 10 ? '0' + seconds.toString() : seconds.toString();

    const formattedDate = now.getDate().toString().padStart(2, '0') + '-' + (now.getMonth() + 1).toString().padStart(2, '0') + '-' +
      now.getFullYear().toString();
    // Update the currentTime property
    this.currentTime = formattedHours + ':' + formattedMinutes + ':' + formattedSeconds + ' ' + amorpm;
    this.currentDate = formattedDate;
    this.currentDateTime = formattedDate + ' ' + formattedHours + ':' + formattedMinutes + ':' + formattedSeconds + ' ' + amorpm;
  }
}
