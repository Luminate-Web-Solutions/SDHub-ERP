import { Component, OnInit } from '@angular/core';
import { SessionService } from '../services/session.service';
import { Member, ExtendedAttendanceRecord } from '../models/models';
import { MatDialog } from '@angular/material/dialog';
import { MemberFormDialogComponent } from './member-form-dialog/member-form-dialog.component';

@Component({
  selector: 'app-member-sessions',
  templateUrl: './member-sessions.component.html',
  styleUrls: ['./member-sessions.component.css']
})
export class MemberSessionsComponent implements OnInit {
  members: Member[] = [];
  selectedMemberId: number | null = null;
  attendanceRecords: ExtendedAttendanceRecord[] = [];
  displayedColumns: string[] = ['session_id', 'topic_name', 'session_date', 'status'];

  constructor(private sessionService: SessionService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.sessionService.getMembersByTopic(0).subscribe(members => this.members = members); // Adjust to fetch all members
  }

  selectMember(): void {
    const dialogRef = this.dialog.open(MemberFormDialogComponent, {
      width: '400px',
      data: { members: this.members }
    });
    dialogRef.afterClosed().subscribe(member => {
      if (member) {
        this.selectedMemberId = member.id;
        this.sessionService.getAttendanceForMember(member.id).subscribe(records => {
          this.attendanceRecords = records;
        });
      }
    });
  }
}