import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluatedResultComponent } from './evaluated-result.component';

describe('EvaluatedResultComponent', () => {
  let component: EvaluatedResultComponent;
  let fixture: ComponentFixture<EvaluatedResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EvaluatedResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluatedResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
