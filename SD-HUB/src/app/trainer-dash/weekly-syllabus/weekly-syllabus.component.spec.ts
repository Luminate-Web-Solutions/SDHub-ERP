import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklySyllabusComponent } from './weekly-syllabus.component';

describe('WeeklySyllabusComponent', () => {
  let component: WeeklySyllabusComponent;
  let fixture: ComponentFixture<WeeklySyllabusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WeeklySyllabusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeeklySyllabusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
