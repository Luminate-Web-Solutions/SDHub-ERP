import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StakeholderProfileComponent } from './stakeholder-profile.component';

describe('StakeholderProfileComponent', () => {
  let component: StakeholderProfileComponent;
  let fixture: ComponentFixture<StakeholderProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StakeholderProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StakeholderProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
