import { Component} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ribbon',
  templateUrl: './ribbon.component.html',
  styleUrl: './ribbon.component.css'
})
export class RibbonComponent {
  constructor(private router: Router) { }

  navigateTo(targetRoute: string) {
    this.router.navigate([targetRoute]);
  }
}
