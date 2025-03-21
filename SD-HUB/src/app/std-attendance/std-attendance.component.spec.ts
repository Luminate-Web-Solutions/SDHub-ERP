import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StdAttendanceComponent } from './std-attendance.component';

describe('StdAttendanceComponent', () => {
  let component: StdAttendanceComponent;
  let fixture: ComponentFixture<StdAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StdAttendanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StdAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
