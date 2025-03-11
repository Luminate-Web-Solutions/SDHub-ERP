import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerDashComponent } from './trainer-dash.component';

describe('TrainerDashComponent', () => {
  let component: TrainerDashComponent;
  let fixture: ComponentFixture<TrainerDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TrainerDashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainerDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
