import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-course-dialog',
  templateUrl: './course-dialog.component.html',
  styleUrls: ['./course-dialog.component.css']
})
export class CourseDialogComponent {
  isEditing: boolean;
  newCourse: any;
  featuresInput: string = '';

  constructor(
    public dialogRef: MatDialogRef<CourseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEditing = data.isEditing;
    this.newCourse = { ...data.course };
    this.featuresInput = this.newCourse.features ? this.newCourse.features.join(', ') : '';
  }

  saveCourse() {
    this.newCourse.features = this.featuresInput.split(',').map((f: string) => f.trim());
    this.dialogRef.close(this.newCourse);
  }

  closeDialog() {
    this.dialogRef.close();
  }

  updateFeatures() {
    this.newCourse.features = this.featuresInput.split(',').map((f: string) => f.trim());
  }
}