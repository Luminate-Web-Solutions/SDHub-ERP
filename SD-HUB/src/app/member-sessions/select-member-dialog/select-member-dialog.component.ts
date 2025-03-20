import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Member } from '../../models/models';

@Component({
  selector: 'app-select-member-dialog',
  templateUrl: './select-member-dialog.component.html',
  styleUrls: ['./select-member-dialog.component.css']
})
export class SelectMemberDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SelectMemberDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { members: Member[] }
  ) {}

  onSelect(member: Member): void {
    this.dialogRef.close(member);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}