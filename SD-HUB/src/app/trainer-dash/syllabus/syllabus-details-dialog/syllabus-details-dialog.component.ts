import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SyllabusEntry } from '../../../services/syllabus.service';

@Component({
  selector: 'app-syllabus-details-dialog',
  templateUrl: './syllabus-details-dialog.component.html',
  styleUrl: './syllabus-details-dialog.component.css'
})
export class SyllabusDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SyllabusDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SyllabusEntry
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
