import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { AttendanceService } from '../../services/attendance.service';
import { MainService } from '../../services/main.service';

export interface AttendanceRecord {
  id: number;
  trainer_id: number;
  date: string;
  check_in_time: string;
  check_out_time: string | null;
  status: string;
  hours_worked: number | null;
}

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit {
  today: Date = new Date();
  displayedColumns: string[] = ['date', 'check_in_time', 'check_out_time', 'status', 'hours_worked'];
  dataSource: MatTableDataSource<AttendanceRecord>;
  todayAttendance: AttendanceRecord | null = null;
  totalHoursWorked: number = 0;
  isCheckedIn: boolean = false;
  startDate: Date | null = null;
  endDate: Date | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private attendanceService: AttendanceService,
    private authService: MainService,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<AttendanceRecord>();
  }

  ngOnInit() {
    this.loadAttendanceHistory();
    this.checkTodayAttendance();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadAttendanceHistory() {
    const email = this.authService.getUser()?.email;
    if (!email) {
      this.snackBar.open('User not authenticated', 'Close', { duration: 3000 });
      return;
    }

    this.attendanceService.getAttendanceHistory(email, this.startDate, this.endDate).subscribe({
      next: (records) => {
        this.dataSource.data = records;
        this.calculateTotalHours(records);
      },
      error: (error) => {
        console.error('Error loading attendance history:', error);
        this.snackBar.open('Failed to load attendance history', 'Close', { duration: 3000 });
      }
    });
  }

  checkTodayAttendance() {
    const email = this.authService.getUser()?.email;
    if (!email) return;

    this.attendanceService.getTodayAttendance(email).subscribe({
      next: (record) => {
        this.todayAttendance = record;
        this.isCheckedIn = !!record;
      },
      error: (error) => {
        console.error('Error checking today\'s attendance:', error);
      }
    });
  }

  checkIn() {
    const email = this.authService.getUser()?.email;
    if (!email) {
      this.snackBar.open('User not authenticated', 'Close', { duration: 3000 });
      return;
    }

    this.attendanceService.checkIn(email).subscribe({
      next: (response) => {
        this.snackBar.open('Check-in successful!', 'Close', { duration: 3000 });
        this.checkTodayAttendance();
        this.loadAttendanceHistory();
      },
      error: (error) => {
        console.error('Check-in error:', error);
        this.snackBar.open(error.error?.message || 'Check-in failed', 'Close', { duration: 3000 });
      }
    });
  }

  checkOut() {
    const email = this.authService.getUser()?.email;
    if (!email || !this.todayAttendance) {
      this.snackBar.open('Cannot check out', 'Close', { duration: 3000 });
      return;
    }

    this.attendanceService.checkOut(email).subscribe({
      next: (response) => {
        this.snackBar.open('Check-out successful!', 'Close', { duration: 3000 });
        this.checkTodayAttendance();
        this.loadAttendanceHistory();
      },
      error: (error) => {
        console.error('Check-out error:', error);
        this.snackBar.open(error.error?.message || 'Check-out failed', 'Close', { duration: 3000 });
      }
    });
  }

  calculateTotalHours(records: AttendanceRecord[]) {
    this.totalHoursWorked = records.reduce((total, record) => {
      return total + (record.hours_worked || 0);
    }, 0);
  }

  onDateRangeChange() {
    this.loadAttendanceHistory();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}