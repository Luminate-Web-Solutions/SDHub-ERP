import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SyllabusDetailsDialogComponent } from './syllabus-details-dialog.component';

describe('SyllabusDetailsDialogComponent', () => {
  let component: SyllabusDetailsDialogComponent;
  let fixture: ComponentFixture<SyllabusDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SyllabusDetailsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SyllabusDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
