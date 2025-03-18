import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { TrainerService, TrainerStats, Trainer } from '../../../services/trainer.service';


interface AttendanceRecord {
  date: string;
  check_in_time: string;
  check_out_time: string | null;
  hours_worked: number;
  status: 'Present' | 'Absent' | 'Leave' | 'Holiday';
  leave_reason?: string;
  leave_type?: string;
}

@Component({
  selector: 'app-trainer-management',
  templateUrl: './trainer-management.component.html',
  styleUrls: ['./trainer-management.component.css']
})
export class TrainerManagementComponent implements OnInit {
  trainerStats: TrainerStats = {
    total: 0,
    present: 0,
    absent: 0,
    onLeave: 0
  };

  trainers: Trainer[] = [];
  selectedTrainer: Trainer | null = null;
  startDate: Date = new Date();
  endDate: Date = new Date();
  
  displayedColumns: string[] = [
    'date',
    'check_in_time',
    'check_out_time',
    'hours_worked',
    'status',
    'leave_type',
    'leave_reason'
  ];
  
  dataSource: MatTableDataSource<AttendanceRecord>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private trainerService: TrainerService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<AttendanceRecord>();
  }

  ngOnInit() {
    this.loadTrainerStats();
    this.loadTrainers();
    
    // Set default date range to current month
    this.startDate = new Date();
    this.startDate.setDate(1);
    this.endDate = new Date();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

 

  private loadTrainerStats() {
    this.trainerService.getTrainerStats().subscribe({
      next: (stats) => {
        this.trainerStats = stats;
      },
      error: (error) => {
        console.error('Error loading trainer stats:', error);
        this.snackBar.open('Failed to load trainer statistics', 'Close', {
          duration: 3000
        });
      }
    });
  }

  private loadTrainers() {
    this.trainerService.getAllTrainers().subscribe({
      next: (trainers) => {
        this.trainers = trainers;
      },
      error: (error) => {
        console.error('Error loading trainers:', error);
        this.snackBar.open('Failed to load trainers', 'Close', {
          duration: 3000
        });
      }
    });
  }

  onTrainerSelect() {
    if (this.selectedTrainer) {
      this.loadTrainerAttendance();
    }
  }

  onDateRangeChange() {
    if (this.selectedTrainer) {
      this.loadTrainerAttendance();
    }
  }

  private loadTrainerAttendance() {
    if (!this.selectedTrainer) return;

    this.trainerService.getTrainerAttendance(
      this.selectedTrainer.email,
      this.startDate,
      this.endDate
    ).subscribe({
      next: (records) => {
        this.dataSource.data = records;
      },
      error: (error) => {
        console.error('Error loading attendance:', error);
        this.snackBar.open('Failed to load attendance records', 'Close', {
          duration: 3000
        });
      }
    });
  }


  

  exportAttendance() {
    if (!this.selectedTrainer) {
      this.snackBar.open('Please select a trainer first', 'Close', {
        duration: 3000
      });
      return;
    }

    const csvData = this.convertToCSV(this.dataSource.data);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance_${this.selectedTrainer.name}_${this.startDate.toISOString().split('T')[0]}_${this.endDate.toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private convertToCSV(data: AttendanceRecord[]): string {
    const headers = ['Date', 'Check In', 'Check Out', 'Hours Worked', 'Status', 'Leave Type', 'Leave Reason'];
    const rows = data.map(record => [
      record.date,
      record.check_in_time || 'N/A',
      record.check_out_time || 'N/A',
      record.hours_worked || 0,
      record.status,
      record.leave_type || 'N/A',
      record.leave_reason || 'N/A'
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}