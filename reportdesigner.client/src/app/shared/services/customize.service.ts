import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomizeService {
  private variable1Subject = new BehaviorSubject<string>('initial value 1');
  private variable2Subject = new BehaviorSubject<string>('initial value 2');
  private variable3Subject = new BehaviorSubject<string>('initial value 3');
  private variable4Subject = new BehaviorSubject<string>('initial value 4');

  variable1$ = this.variable1Subject.asObservable();
  variable2$ = this.variable2Subject.asObservable();
  variable3$ = this.variable3Subject.asObservable();
  variable4$ = this.variable4Subject.asObservable();

  private submitActionSubject = new Subject<void>();
  submitAction$ = this.submitActionSubject.asObservable();

  constructor() { }

  updateVariables(variable1Value: string, variable2Value: string, variable3Value: string, variable4Value: string) {
    this.variable1Subject.next(variable1Value);
    this.variable2Subject.next(variable2Value);
    this.variable3Subject.next(variable3Value);
    this.variable4Subject.next(variable4Value);
  }

  submitAction() {
    this.submitActionSubject.next();
  }
}
