import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollDialogComponent } from './payroll-dialog.component';

describe('PayrollDialogComponent', () => {
  let component: PayrollDialogComponent;
  let fixture: ComponentFixture<PayrollDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PayrollDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayrollDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
