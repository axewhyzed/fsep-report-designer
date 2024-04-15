import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditReportModalComponent } from './edit-report-modal.component';

describe('EditReportModalComponent', () => {
  let component: EditReportModalComponent;
  let fixture: ComponentFixture<EditReportModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditReportModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditReportModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
