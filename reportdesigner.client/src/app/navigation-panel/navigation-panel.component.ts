import { Component, OnInit } from '@angular/core';

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

  constructor() { }
  
  ngOnInit(): void {
    const databaseInfoJson = localStorage.getItem('databaseInfo');
    if (databaseInfoJson) {
      this.databaseInfo = JSON.parse(databaseInfoJson);
    }
  }

  openPopup(title: string, data: any): void {
    this.popupTitle = title;
    this.popupData = data;
    this.showPopup = true;
  }

  closePopup(): void {
    this.showPopup = false;
  }
}
