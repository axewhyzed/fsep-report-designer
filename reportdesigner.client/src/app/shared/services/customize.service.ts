import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomizeService {
  private headerBGSubject = new BehaviorSubject<string>('#ffffff');
  private footerBGSubject = new BehaviorSubject<string>('#ffffff');
  private bodyBGSubject = new BehaviorSubject<string>('#ffffff');
  private tableBorderSubject = new BehaviorSubject<boolean>(true);
  private cellPaddingSubject = new BehaviorSubject<number>(5);
  private tablePaddingSubject = new BehaviorSubject<number>(50);
  private tableAlignSubject = new BehaviorSubject<string>('left');
  private footerContentSubject = new BehaviorSubject<string>('Add text here');

  headerBG$ = this.headerBGSubject.asObservable();
  footerBG$ = this.footerBGSubject.asObservable();
  bodyBG$ = this.bodyBGSubject.asObservable();
  tableBorder$ = this.tableBorderSubject.asObservable();
  cellPadding$ = this.cellPaddingSubject.asObservable();
  tablePadding$ = this.tablePaddingSubject.asObservable();
  tableAlign$ = this.tableAlignSubject.asObservable();
  footerContent$ = this.footerContentSubject.asObservable();

  private submitActionSubject = new Subject<void>();
  submitAction$ = this.submitActionSubject.asObservable();

  constructor() { }

  updateVariables(headerBGValue: string, footerBGValue: string, bodyBGValue: string, tableBorderValue: boolean, cellPaddingValue: number, tablePaddingValue: number, tableAlignValue: string, footerContentValue: string) {
    this.headerBGSubject.next(headerBGValue);
    this.footerBGSubject.next(footerBGValue);
    this.bodyBGSubject.next(bodyBGValue);
    this.tableBorderSubject.next(tableBorderValue);
    this.cellPaddingSubject.next(cellPaddingValue);
    this.tablePaddingSubject.next(tablePaddingValue);
    this.tableAlignSubject.next(tableAlignValue);
    this.footerContentSubject.next(footerContentValue);
  }

  submitAction() {
    this.submitActionSubject.next();
  }
}
