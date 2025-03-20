import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectMemberDialogComponent } from './select-member-dialog.component';

describe('SelectMemberDialogComponent', () => {
  let component: SelectMemberDialogComponent;
  let fixture: ComponentFixture<SelectMemberDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectMemberDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectMemberDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
