import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-ribbon',
  templateUrl: './ribbon.component.html',
  styleUrl: './ribbon.component.css'
})
export class RibbonComponent {
  @Output() toggleComponent = new EventEmitter<string>();

  constructor() { }

  toggle(targetComponent: string) {
    this.toggleComponent.emit(targetComponent);
  }
}
