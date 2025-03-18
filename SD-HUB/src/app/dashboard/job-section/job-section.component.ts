import { Component, OnInit } from '@angular/core';
import { JobService } from '../../services/job.service';
import { forkJoin } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AddJobDialogComponent } from './add-job-dialog/add-job-dialog.component';



@Component({
  selector: 'app-job-section',
  templateUrl: './job-section.component.html',
  styleUrl: './job-section.component.css',
  standalone: false
})
export class JobSectionComponent implements OnInit {
  jobs: any[] = [];
  filteredJobs: any[] = [];
  selectedJobs: number[] = [];
  searchCategory: string = 'All';
  searchText: string = '';
  itemsPerPage: number = 10;
  categories = [
    'All',
    'Student name',
    'Courses enrolled',
    'Job type',
    'Designation',
    'Salary',
    'Date added'
  ];
  rowsPerPageOptions = [10, 20, 50, 100];

  constructor(
    private jobService: JobService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadJobs();
  }

  loadJobs() {
    this.jobService.getJobs().subscribe(
      (data) => {
        this.jobs = data;
        this.filteredJobs = data;
      },
      (error) => {
        console.error('Error loading jobs:', error);
      }
    );
  }

  onSearch() {
    if (this.searchCategory === 'All') {
      this.filteredJobs = this.jobs.filter(job => 
        Object.values(job).some(value => 
          String(value).toLowerCase().includes(this.searchText.toLowerCase())
        )
      );
    } else {
      const key = this.searchCategory.toLowerCase().replace(' ', '_');
      this.filteredJobs = this.jobs.filter(job =>
        String(job[key]).toLowerCase().includes(this.searchText.toLowerCase())
      );
    }
  }

  onDelete(id: number) {
    this.jobService.deleteJob(id).subscribe(
      () => {
        this.loadJobs();
      },
      (error) => {
        console.error('Error deleting job:', error);
      }
    );
  }
  onUpdate(job: any) {
    const dialogRef = this.dialog.open(AddJobDialogComponent, {
      width: '500px',
      data: {
        editMode: true,
        job: job
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadJobs(); // Reload jobs after successful update
      }
    });
  }

  toggleSelection(id: number) {
    const index = this.selectedJobs.indexOf(id);
    if (index === -1) {
      this.selectedJobs.push(id);
    } else {
      this.selectedJobs.splice(index, 1);
    }
  }

  toggleAllSelection(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target) {
      const isChecked = target.checked;
      this.selectedJobs = isChecked ? this.jobs.map(job => job.id) : [];
    }
  }

  onBulkAction(event: Event) {
    const target = event.target as HTMLSelectElement;
    const action = target.value;
    if (action === 'delete') {
      const deleteObservables = this.selectedJobs.map(id => this.jobService.deleteJob(id));
      forkJoin(deleteObservables).subscribe({
        next: () => {
          this.loadJobs();
          this.selectedJobs = [];
        },
        error: (error: any) => {
          console.error('Error performing bulk delete:', error);
        }
      });
    }
  }

  openAddJobDialog() {
    const dialogRef = this.dialog.open(AddJobDialogComponent, {
      width: '500px'
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadJobs(); // Only reload jobs after dialog closes
      }
    });
  }
}