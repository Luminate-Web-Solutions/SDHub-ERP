import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SessionService } from '../../services/session.service';
import { Topic, Member } from '../../models/models';

@Component({
  selector: 'app-member-form-dialog',
  templateUrl: './member-form-dialog.component.html',
  styleUrls: ['./member-form-dialog.component.css']
})
export class MemberFormDialogComponent {
  memberForm: FormGroup;
  isEdit: boolean;
  topics: Topic[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<MemberFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { member: Member },
    private sessionService: SessionService
  ) {
    this.isEdit = !!data?.member;
    this.memberForm = this.fb.group({
      name: [data?.member?.name || '', Validators.required],
      email: [data?.member?.email || '', [Validators.required, Validators.email]],
      topicId: [data?.member?.topic_id || '', Validators.required]
    });
    this.sessionService.getTopics().subscribe(topics => this.topics = topics);
  }

  onSubmit(): void {
    if (this.memberForm.valid) {
      this.dialogRef.close(this.memberForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}