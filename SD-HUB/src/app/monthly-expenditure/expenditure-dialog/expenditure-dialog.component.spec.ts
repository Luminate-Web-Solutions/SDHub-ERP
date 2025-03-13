import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenditureDialogComponent } from './expenditure-dialog.component';

describe('ExpenditureDialogComponent', () => {
  let component: ExpenditureDialogComponent;
  let fixture: ComponentFixture<ExpenditureDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExpenditureDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenditureDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
