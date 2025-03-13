import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-expenditure-dialog',
  templateUrl: './expenditure-dialog.component.html',
  styleUrls: ['./expenditure-dialog.component.css']
})
export class ExpenditureDialogComponent {
  form: FormGroup;
  dialogTitle: string;

  paymentModes = ['Cash', 'Bank Transfer', 'UPI', 'Check'];
  categories = ['Office Supplies', 'Utilities', 'Maintenance', 'Equipment', 'Others'];
  statuses = ['Pending', 'Paid', 'Cancelled'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ExpenditureDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dialogTitle = data.mode === 'add' ? 'Add Expenditure' : 'Edit Expenditure';
    
    this.form = this.fb.group({
      date: [data.expenditure?.date || new Date(), Validators.required],
      category: [data.expenditure?.category || '', Validators.required],
      description: [data.expenditure?.description || '', Validators.required],
      amount: [data.expenditure?.amount || '', [Validators.required, Validators.min(0)]],
      paymentMode: [data.expenditure?.paymentMode || '', Validators.required],
      status: [data.expenditure?.status || 'Pending', Validators.required]
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}