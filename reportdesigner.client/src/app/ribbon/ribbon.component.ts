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
    const updatedCellsJSON = localStorage.getItem('updatedCells');
    if(updatedCellsJSON){
      const updatedCells = new Set<string>(JSON.parse(updatedCellsJSON));
      if(updatedCells.size > 0){
        const confirmation = confirm("You have unsaved changes. Discard changes?");
        if(confirmation){
          this.router.navigate([targetRoute]);
          localStorage.removeItem('updatedCells');
        }
        else{
          return;
        }
      }
      else{
        this.router.navigate([targetRoute]);
      }
    }
    else{
      this.router.navigate([targetRoute]);
    }
  }
}
