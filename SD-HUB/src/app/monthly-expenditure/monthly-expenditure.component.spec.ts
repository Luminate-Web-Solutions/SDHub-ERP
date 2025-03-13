import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyExpenditureComponent } from './monthly-expenditure.component';

describe('MonthlyExpenditureComponent', () => {
  let component: MonthlyExpenditureComponent;
  let fixture: ComponentFixture<MonthlyExpenditureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MonthlyExpenditureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyExpenditureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
