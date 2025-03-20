import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { SessionService } from '../../services/session.service';
import { Member } from '../../models/models';
import { MemberFormDialogComponent } from '../member-form-dialog/member-form-dialog.component';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css']
})
export class MembersComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'email', 'topic_id', 'actions'];
  dataSource = new MatTableDataSource<Member>();

  constructor(private sessionService: SessionService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers(): void {
    this.sessionService.getAllMembers().subscribe(members => {
      this.dataSource.data = members;
    });
  }

  addMember(): void {
    const dialogRef = this.dialog.open(MemberFormDialogComponent, {
      width: '400px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.sessionService.createMember(result).subscribe(() => {
          this.loadMembers();
        });
      }
    });
  }

  editMember(member: Member): void {
    const dialogRef = this.dialog.open(MemberFormDialogComponent, {
      width: '400px',
      data: { member }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.sessionService.updateMember(member.id, result).subscribe(() => {
          this.loadMembers();
        });
      }
    });
  }

  deleteMember(id: number): void {
    if (confirm('Are you sure you want to delete this member?')) {
      this.sessionService.deleteMember(id).subscribe(() => {
        this.loadMembers();
      });
    }
  }
}