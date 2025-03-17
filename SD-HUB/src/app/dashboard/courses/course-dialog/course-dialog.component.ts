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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newCourse.image = e.target.result; // Store full base64 data URL
      };
      reader.readAsDataURL(file);
    }
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