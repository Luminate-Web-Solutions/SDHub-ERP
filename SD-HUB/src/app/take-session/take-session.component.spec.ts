import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TakeSessionComponent } from './take-session.component';

describe('TakeSessionComponent', () => {
  let component: TakeSessionComponent;
  let fixture: ComponentFixture<TakeSessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TakeSessionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TakeSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
