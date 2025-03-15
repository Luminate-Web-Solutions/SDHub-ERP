import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadInvoiceDialogComponent } from './upload-invoice-dialog.component';

describe('UploadInvoiceDialogComponent', () => {
  let component: UploadInvoiceDialogComponent;
  let fixture: ComponentFixture<UploadInvoiceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UploadInvoiceDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadInvoiceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
