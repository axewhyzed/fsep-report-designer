import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-status-bar',
  templateUrl: './status-bar.component.html',
  styleUrl: './status-bar.component.css'
})
export class StatusBarComponent implements OnInit{
  currentRoute : string = '';
  currentDateTime: string = '';

  constructor(private router: Router) { }

  ngOnInit(): void {  
      // Update the current time every second
      setInterval(() => {
        this.currentDateTime = new Date().toLocaleString();
      }, 1000);

      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          // Extract the current route from the URL
          this.currentRoute = event.urlAfterRedirects.substring(1);
          console.log(this.currentRoute);
        }
      });
  }
}
