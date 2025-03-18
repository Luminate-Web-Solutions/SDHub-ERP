import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

export interface LeaveRequest {
  type: string;
  reason: string;
}

@Component({
  selector: 'app-leave-request-dialog',
  template: `
    <div class="leave-dialog">
      <h2 mat-dialog-title>Request Leave</h2>
      <form [formGroup]="leaveForm" (ngSubmit)="onSubmit()">
        <mat-dialog-content>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Leave Type</mat-label>
            <mat-select formControlName="type" required>
              <mat-option value="paid">Paid Leave</mat-option>
              <mat-option value="unpaid">Unpaid Leave</mat-option>
              <mat-option value="sick">Sick Leave</mat-option>
              <mat-option value="casual">Casual Leave</mat-option>
            </mat-select>
            <mat-error *ngIf="leaveForm.get('type')?.hasError('required')">
              Leave type is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Reason for Leave</mat-label>
            <textarea 
              matInput 
              formControlName="reason" 
              rows="4"
              placeholder="Please provide your reason for leave">
            </textarea>
            <mat-error *ngIf="leaveForm.get('reason')?.hasError('required')">
              Reason is required
            </mat-error>
          </mat-form-field>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
          <button mat-button (click)="onCancel()">Cancel</button>
          <button 
            mat-raised-button 
            color="primary" 
            type="submit"
            [disabled]="!leaveForm.valid">
            Submit
          </button>
        </mat-dialog-actions>
      </form>
    </div>
  `,
  styles: [`
    .leave-dialog {
      padding: 20px;
      min-width: 350px;
    }
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    mat-dialog-actions {
      margin-top: 20px;
    }
  `]
})
export class LeaveRequestDialogComponent {
  leaveForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<LeaveRequestDialogComponent>
  ) {
    this.leaveForm = this.fb.group({
      type: ['', Validators.required],
      reason: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.leaveForm.valid) {
      this.dialogRef.close(this.leaveForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}