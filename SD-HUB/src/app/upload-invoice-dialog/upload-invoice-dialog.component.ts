import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExpenditureService } from '../services/expenditure.service';

@Component({
  selector: 'app-upload-invoice-dialog',
  templateUrl: './upload-invoice-dialog.component.html',
  styleUrls: ['./upload-invoice-dialog.component.css']
})
export class UploadInvoiceDialogComponent {
  invoiceForm: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UploadInvoiceDialogComponent>,
    private snackBar: MatSnackBar,
    private expenditureService: ExpenditureService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.invoiceForm = this.fb.group({
      description: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      date: ['', Validators.required]
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onUpload() {
    if (this.invoiceForm.valid && this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('description', this.invoiceForm.value.description);
      formData.append('amount', this.invoiceForm.value.amount);
      formData.append('date', this.invoiceForm.value.date);

      this.expenditureService.uploadInvoice(formData).subscribe({
        next: (response: any) => {
          this.snackBar.open('Invoice uploaded successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(response);
        },
        error: (error: any) => {
          console.error('Error uploading invoice:', error);
          this.snackBar.open('Failed to upload invoice', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}