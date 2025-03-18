import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminStaffStdComponent } from './admin-staff-std.component';

describe('AdminStaffStdComponent', () => {
  let component: AdminStaffStdComponent;
  let fixture: ComponentFixture<AdminStaffStdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminStaffStdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminStaffStdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
