import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { JobService } from '../../../services/job.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core'; // Add this line


@Component({
  selector: 'app-add-job-dialog',
  templateUrl: './add-job-dialog.component.html',
  styleUrls: ['./add-job-dialog.component.scss']
})
export class AddJobDialogComponent {
  jobForm: FormGroup;
  editMode: boolean;

  constructor(
    private dialogRef: MatDialogRef<AddJobDialogComponent>,
    private fb: FormBuilder,
    private jobService: JobService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log('MAT_DIALOG_DATA in AddJobDialogComponent =>', data); // debug line
  
    // Use optional chaining to avoid null/undefined errors:
    this.editMode = data?.editMode || false;
  
    this.jobForm = this.fb.group({
      student_name: ['', Validators.required],
      courses_enrolled: ['', Validators.required],
      job_type: ['', Validators.required],
      designation: ['', Validators.required],
      salary: ['', Validators.required],
      id: [''] // if you want an ID field
    });
  
    if (this.editMode && data?.job) {
      this.jobForm.patchValue(data.job);
    }
  }

  onSubmit() {
    if (this.jobForm.valid) {
      const job = this.jobForm.value;
      if (this.editMode) {
        this.jobService.updateJob(job.id, job).subscribe(
          () => {
            this.dialogRef.close(job);
          },
          (error: Error) => {
            console.error('Error updating job:', error);
          }
        );
      } else {
        this.jobService.createJob(job).subscribe(
          () => {
            this.dialogRef.close(job);
          },
          (error: Error) => {
            console.error('Error creating job:', error);
          }
        );
      }
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}