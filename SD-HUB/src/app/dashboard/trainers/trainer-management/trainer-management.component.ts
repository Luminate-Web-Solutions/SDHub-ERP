import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { TrainerService, TrainerStats, Trainer } from '../../../services/trainer.service';
import { AddTrainerDialogComponent } from '../add-trainer-dialog';

interface AttendanceRecord {
  date: string;
  check_in_time: string;
  check_out_time: string | null;
  hours_worked: number;
  status: 'Present' | 'Absent' | 'Leave' | 'Holiday';
  leave_reason?: string;
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

  openAddTrainerDialog(): void {
    const dialogRef = this.dialog.open(AddTrainerDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.trainerService.addTrainer(result).subscribe({
          next: () => {
            this.loadTrainers();
            this.loadTrainerStats();
            this.snackBar.open('Trainer added successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error adding trainer:', error);
            this.snackBar.open('Failed to add trainer', 'Close', { duration: 3000 });
          }
        });
      }
    });
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

    this.trainerService.exportAttendanceReport(
      this.selectedTrainer.email,
      this.startDate,
      this.endDate
    ).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `attendance_${this.selectedTrainer?.name}_${this.startDate.toISOString().split('T')[0]}_${this.endDate.toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error exporting attendance:', error);
        this.snackBar.open('Failed to export attendance report', 'Close', {
          duration: 3000
        });
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}