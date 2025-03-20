import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../services/session.service';
import { Session, Attendance, Student } from '../../models/session.js';

@Component({
  selector: 'app-session-manager',
  template: `
    <div class="container" *ngIf="session">
      <h1>Session Manager</h1>
      
      <div class="session-info">
        <div class="info-item">
          <span class="label">Course Name:</span>
          <span class="value">{{session.courseName}}</span>
        </div>
        <div class="info-item">
          <span class="label">Date:</span>
          <span class="value">{{session.date | date:'dd MMM, yyyy'}}</span>
        </div>
      </div>

      <table mat-table [dataSource]="attendanceList" class="mat-elevation-z8">
        <!-- S.No Column -->
        <ng-container matColumnDef="sno">
          <th mat-header-cell *matHeaderCellDef>S.no</th>
          <td mat-cell *matCellDef="let i = index">{{i + 1}}</td>
        </ng-container>

        <!-- Student Name Column -->
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Student Name</th>
          <td mat-cell *matCellDef="let record">{{record.student.name}}</td>
        </ng-container>

        <!-- Phone Column -->
        <ng-container matColumnDef="phone">
          <th mat-header-cell *matHeaderCellDef>Phone</th>
          <td mat-cell *matCellDef="let record">{{record.student.contactNumber}}</td>
        </ng-container>

        <!-- Email Column -->
        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef>Email</th>
          <td mat-cell *matCellDef="let record">{{record.student.email}}</td>
        </ng-container>

        <!-- Status Column -->
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let record">
            <button mat-button 
                    [color]="record.attendance?.status === 'present' ? 'primary' : ''"
                    (click)="markAttendance(record, 'present')">
              Present
            </button>
            <button mat-button
                    [color]="record.attendance?.status === 'absent' ? 'warn' : ''"
                    (click)="markAttendance(record, 'absent')">
              Absent
            </button>
          </td>
        </ng-container>

        <!-- Remark Column -->
        <ng-container matColumnDef="remark">
          <th mat-header-cell *matHeaderCellDef>Remark</th>
          <td mat-cell *matCellDef="let record">
            <mat-form-field>
              <input matInput [(ngModel)]="record.attendance.remark" placeholder="Enter remark">
            </mat-form-field>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>

      <div class="actions">
        <button mat-raised-button color="primary" (click)="saveChanges()">
          Save Changes
        </button>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 2rem;
    }
    .session-info {
      margin-bottom: 2rem;
    }
    .info-item {
      margin-bottom: 0.5rem;
    }
    .label {
      font-weight: bold;
      margin-right: 1rem;
    }
    table {
      width: 100%;
      margin-bottom: 2rem;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class SessionManagerComponent implements OnInit {
  session: Session | null = null;
  attendanceList: Array<{
    student: Student;
    attendance: Partial<Attendance>;
  }> = [];
  displayedColumns: string[] = ['sno', 'name', 'phone', 'email', 'status', 'remark'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    const sessionId = this.route.snapshot.paramMap.get('id');
    if (sessionId) {
      this.loadSessionData(sessionId);
    }
  }

  loadSessionData(sessionId: string): void {
    this.sessionService.getSessionAttendance(sessionId).subscribe(
      attendance => {
        this.attendanceList = attendance.map(a => ({
          student: a.student,
          attendance: {
            sessionId,
            studentId: a.student.id,
            status: a.status,
            remark: a.remark
          }
        }));
      }
    );
  }

  markAttendance(record: any, status: 'present' | 'absent'): void {
    record.attendance.status = status;
  }

  saveChanges(): void {
    if (this.session) {
      const attendance = this.attendanceList.map(record => record.attendance);
      this.sessionService.saveAttendance(this.session.id, attendance).subscribe(
        () => {
          this.router.navigate(['/sessions']);
        }
      );
    }
  }
}