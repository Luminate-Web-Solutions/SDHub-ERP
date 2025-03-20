import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SessionService } from '../services/session.service';
import { Session } from '../models/session.js';
import { CreateSessionDialogComponent } from './create-session-dialog/create-session-dialog.component';

@Component({
  selector: 'app-session-attendance',
  template: `
    <div class="container">
      <h1>Session Attendance</h1>
      <div class="actions">
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          Create Session Attendance
        </button>
      </div>
      
      <table mat-table [dataSource]="sessions" class="mat-elevation-z8">
        <!-- S.No Column -->
        <ng-container matColumnDef="sno">
          <th mat-header-cell *matHeaderCellDef>S.no</th>
          <td mat-cell *matCellDef="let i = index">{{i + 1}}</td>
        </ng-container>

        <!-- Session ID Column -->
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef>Session ID</th>
          <td mat-cell *matCellDef="let session">{{session.id}}</td>
        </ng-container>

        <!-- Course Name Column -->
        <ng-container matColumnDef="courseName">
          <th mat-header-cell *matHeaderCellDef>Course Name</th>
          <td mat-cell *matCellDef="let session">{{session.courseName}}</td>
        </ng-container>

        <!-- Date Column -->
        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef>Date</th>
          <td mat-cell *matCellDef="let session">{{session.date | date:'dd MMM yyyy'}}</td>
        </ng-container>

        <!-- Actions Column -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let session">
            <button mat-button color="primary" (click)="viewSession(session)">View/Edit</button>
            <button mat-button color="warn" (click)="deleteSession(session)">Delete</button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>
  `,
  styles: [`
    .container {
      padding: 2rem;
    }
    .actions {
      margin-bottom: 1rem;
    }
    table {
      width: 100%;
    }
  `]
})
export class SessionAttendanceComponent implements OnInit {
  sessions: Session[] = [];
  displayedColumns: string[] = ['sno', 'id', 'courseName', 'date', 'actions'];

  constructor(
    private sessionService: SessionService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.sessionService.getSessions().subscribe(
      sessions => this.sessions = sessions
    );
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateSessionDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.sessionService.createSession(result).subscribe(
          session => {
            this.router.navigate(['/sessions/manage', session.id]);
          }
        );
      }
    });
  }

  viewSession(session: Session): void {
    this.router.navigate(['/sessions/manage', session.id]);
  }

  deleteSession(session: Session): void {
    if (confirm('Are you sure you want to delete this session?')) {
      this.sessionService.deleteSession(session.id).subscribe(
        () => {
          this.loadSessions();
        }
      );
    }
  }
}