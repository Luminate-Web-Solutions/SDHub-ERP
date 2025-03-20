import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Topic } from '../../models/models';

@Component({
  selector: 'app-topic-dialog',
  templateUrl: './topic-dialog.component.html',
  styleUrls: ['./topic-dialog.component.css']
})
export class TopicDialogComponent {
  topicForm: FormGroup;
  isEdit: boolean;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TopicDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { topic: Topic }
  ) {
    this.isEdit = !!data?.topic;
    this.topicForm = this.fb.group({
      name: [data?.topic?.name || '', Validators.required],
      description: [data?.topic?.description || '']
    });
  }

  onSubmit(): void {
    if (this.topicForm.valid) {
      this.dialogRef.close(this.topicForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}