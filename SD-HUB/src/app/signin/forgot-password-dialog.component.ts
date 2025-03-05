import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-forgot-password-dialog',
  template: `
    <h2 mat-dialog-title>Forgot Password</h2>
    <mat-dialog-content>
      <form [formGroup]="forgotPasswordForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email" placeholder="Please enter your registered email" required>
          <mat-error *ngIf="forgotPasswordForm.get('email')?.hasError('required')">
            Email is required
          </mat-error>
          <mat-error *ngIf="forgotPasswordForm.get('email')?.hasError('email')">
            Please enter a valid email
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" 
              [disabled]="!forgotPasswordForm.valid"
              (click)="onSubmit()">
        Send Reset Link
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }
  `]
})
export class ForgotPasswordDialogComponent {
  forgotPasswordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ForgotPasswordDialogComponent>
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.dialogRef.close(this.forgotPasswordForm.get('email')?.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}