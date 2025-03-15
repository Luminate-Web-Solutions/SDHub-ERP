import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-trainer-dialog',
  template: `
    <h2 mat-dialog-title>Add New Trainer</h2>
    <form [formGroup]="trainerForm" (ngSubmit)="onSubmit()">
      <div mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" required>
          <mat-error *ngIf="trainerForm.get('name')?.hasError('required')">
            Name is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email" required>
          <mat-error *ngIf="trainerForm.get('email')?.hasError('required')">
            Email is required
          </mat-error>
          <mat-error *ngIf="trainerForm.get('email')?.hasError('email')">
            Please enter a valid email address
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Course</mat-label>
          <mat-select formControlName="course" required>
            <mat-option value="Web Development">Web Development</mat-option>
            <mat-option value="Data Analytics">Data Analytics</mat-option>
            <mat-option value="Digital Marketing">Digital Marketing</mat-option>
            <mat-option value="Office Administration">Office Administration</mat-option>
          </mat-select>
          <mat-error *ngIf="trainerForm.get('course')?.hasError('required')">
            Course is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Contact Number</mat-label>
          <input matInput formControlName="contactNumber" required>
          <mat-error *ngIf="trainerForm.get('contactNumber')?.hasError('required')">
            Contact number is required
          </mat-error>
          <mat-error *ngIf="trainerForm.get('contactNumber')?.hasError('pattern')">
            Please enter a valid 10-digit number
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Current Batch</mat-label>
          <input matInput formControlName="currentBatch" required>
          <mat-error *ngIf="trainerForm.get('currentBatch')?.hasError('required')">
            Current batch is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Password</mat-label>
          <input matInput formControlName="password" type="password" required>
          <mat-error *ngIf="trainerForm.get('password')?.hasError('required')">
            Password is required
          </mat-error>
        </mat-form-field>
      </div>

      <div mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="trainerForm.invalid">
          Add Trainer
        </button>
      </div>
    </form>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
  `]
})
export class AddTrainerDialogComponent {
  trainerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddTrainerDialogComponent>
  ) {
    this.trainerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      course: ['', Validators.required],
      contactNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      currentBatch: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.trainerForm.valid) {
      this.dialogRef.close(this.trainerForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}