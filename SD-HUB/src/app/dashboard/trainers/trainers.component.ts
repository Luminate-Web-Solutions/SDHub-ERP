import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TrainerService } from '../../services/trainer.service';
import { TrainerDialogComponent } from './trainer-dialog/trainer-dialog.component';

export interface Trainer {
  id: number;
  name: string;
  email: string;
  course: string;
  contactNumber: string;
  currentBatch: string;
  role: string;
  status: string;
  password: string;
}

@Component({
  selector: 'app-trainers',
  templateUrl: './trainers.component.html',
  styleUrl: './trainers.component.css'
})
export class TrainersComponent implements AfterViewInit {
  displayedColumns: string[] = ['name', 'course', 'contactNumber', 'email', 'currentBatch', 'actions'];
  dataSource: MatTableDataSource<Trainer>;
  trainers: Trainer[] = [];

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  sort!: MatSort;

  constructor(
    private trainerService: TrainerService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<Trainer>();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.loadTrainers();
  }

  private loadTrainers() {
    this.trainerService.getAllTrainers().subscribe({
      next: (trainers) => {
        this.trainers = trainers;
        this.dataSource.data = trainers;
      },
      error: (error) => {
        console.error('Error loading trainers:', error);
        this.snackBar.open('Failed to load trainers', 'Close', {
          duration: 3000
        });
      }
    });
  }

  openAddTrainerDialog(): void {
    const dialogRef = this.dialog.open(TrainerDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.trainerService.addTrainer(result).subscribe({
          next: () => {
            this.loadTrainers();
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

  openEditDialog(trainer: Trainer): void {
    const dialogRef = this.dialog.open(TrainerDialogComponent, {
      width: '400px',
      data: { mode: 'edit', trainer: trainer }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.trainerService.updateTrainer(trainer.id, result).subscribe({
          next: () => {
            this.loadTrainers();
            this.snackBar.open('Trainer updated successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error updating trainer:', error);
            this.snackBar.open('Failed to update trainer', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  deleteTrainer(trainer: Trainer): void {
    this.trainerService.deleteTrainer(trainer.id).subscribe({
      next: () => {
        this.loadTrainers();
        this.snackBar.open('Trainer deleted successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error deleting trainer:', error);
        this.snackBar.open('Failed to delete trainer', 'Close', { duration: 3000 });
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