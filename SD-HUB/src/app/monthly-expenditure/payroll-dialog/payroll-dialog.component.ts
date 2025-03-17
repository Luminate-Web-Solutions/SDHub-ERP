import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-payroll-dialog',
  templateUrl: './payroll-dialog.component.html',
  styleUrls: ['./payroll-dialog.component.css']
})
export class PayrollDialogComponent {
  form: FormGroup;
  dialogTitle: string;

  designations = ['Trainer', 'Administrator', 'Support Staff', 'Coordinator'];
  paymentStatuses = ['Pending', 'Paid', 'Processing'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PayrollDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dialogTitle = data.mode === 'add' ? 'Add Payroll Entry' : 'Edit Payroll Entry';
    
    this.form = this.fb.group({
      employeeName: [data.payroll?.employeeName || '', Validators.required],
      designation: [data.payroll?.designation || '', Validators.required],
      basicSalary: [data.payroll?.basicSalary || '', [Validators.required, Validators.min(0)]],
      allowances: [data.payroll?.allowances || 0, [Validators.required, Validators.min(0)]],
      deductions: [data.payroll?.deductions || 0, [Validators.required, Validators.min(0)]],
      paymentStatus: [data.payroll?.paymentStatus || 'Pending', Validators.required],
      paymentDate: [data.payroll?.paymentDate || new Date(), Validators.required]
    });

    // Calculate net salary whenever relevant fields change
    this.form.valueChanges.subscribe(() => {
      this.calculateNetSalary();
    });
  }

  calculateNetSalary() {
    const basicSalary = this.form.get('basicSalary')?.value || 0;
    const allowances = this.form.get('allowances')?.value || 0;
    const deductions = this.form.get('deductions')?.value || 0;
    const netSalary = basicSalary + allowances - deductions;
    this.form.patchValue({ netSalary: netSalary }, { emitEvent: false });
  }

  onSubmit() {
    if (this.form.valid) {
      const formData = this.form.value;
      formData.netSalary = (formData.basicSalary + formData.allowances - formData.deductions);
      this.dialogRef.close(formData);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}