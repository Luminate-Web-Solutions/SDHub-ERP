import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-create-session-dialog',
  template: `
    <h2 mat-dialog-title>Create Session</h2>
    <form [formGroup]="sessionForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="form-field">
          <mat-form-field appearance="fill">
            <mat-label>Date</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="date">
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>
        </div>
        <div class="form-field">
          <mat-form-field appearance="fill">
            <mat-label>Course</mat-label>
            <mat-select formControlName="courseName">
              <mat-option *ngFor="let course of courses$ | async" [value]="course">
                {{course}}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="!sessionForm.valid">
          Create
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .form-field {
      width: 100%;
      margin-bottom: 1rem;
    }
    mat-form-field {
      width: 100%;
    }
  `]
})
export class CreateSessionDialogComponent implements OnInit {
  sessionForm: FormGroup;
  courses$: Observable<string[]>;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateSessionDialogComponent>,
    private http: HttpClient
  ) {
    this.sessionForm = this.fb.group({
      date: ['', Validators.required],
      courseName: ['', Validators.required]
    });

    this.courses$ = this.http.get<any[]>('http://localhost:3000/api/courses').pipe(
      map(results => [...new Set(results.map(r => r.course))])
    );
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.sessionForm.valid) {
      this.dialogRef.close(this.sessionForm.value);
    }
  }
}