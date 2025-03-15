import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile-dialog',
  templateUrl: './profile-dialog.component.html',
  styleUrls: ['./profile-dialog.component.css']
})
export class ProfileDialogComponent {
  profileForm: FormGroup;
  isEditMode: boolean;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEditMode = data.isEditMode;
    this.profileForm = this.fb.group({
      name: [data.profile?.name || '', Validators.required],
      role: [data.profile?.role || '', Validators.required],
      email: [data.profile?.email || '', [Validators.required, Validators.email]],
      login_id: [data.profile?.login_id || '', Validators.required],
      registered_date: [data.profile?.registered_date || '', Validators.required],
      date_of_birth: [data.profile?.date_of_birth || '', Validators.required],
      phone_number: [data.profile?.phone_number || '', Validators.required]
    });
  }

  onSave(): void {
    if (this.profileForm.valid) {
      this.dialogRef.close(this.profileForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}