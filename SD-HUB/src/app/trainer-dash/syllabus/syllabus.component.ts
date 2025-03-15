import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { SyllabusService,SyllabusEntry } from '../../services/syllabus.service';
import { AuthService } from '../../services/auth.service';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: 'app-syllabus',
  templateUrl: './syllabus.component.html',
  styleUrl: './syllabus.component.css'
})
export class SyllabusComponent implements OnInit {
  syllabusForm: FormGroup;
  displayedColumns: string[] = ['date', 'content', 'completion_status', 'actions'];
  dataSource: MatTableDataSource<SyllabusEntry>;
  weeklyCompletion: number = 0;
  startDate: Date | null = null;
  endDate: Date | null = null;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    weekends: false,
    events: [],
    eventClick: this.handleEventClick.bind(this),
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
    }
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private syllabusService: SyllabusService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.syllabusForm = this.fb.group({
      content: ['', Validators.required],
      date: [new Date(), Validators.required],
      completion_status: [false]
    });

    this.dataSource = new MatTableDataSource<SyllabusEntry>();
  }

  ngOnInit() {
    this.loadSyllabusEntries();
    this.calculateWeeklyCompletion();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadSyllabusEntries() {
    const email = this.authService.getUser()?.email;
    if (!email) {
      this.snackBar.open('User not authenticated', 'Close', { duration: 3000 });
      return;
    }

    this.syllabusService.getSyllabusEntries(email, this.startDate || undefined, this.endDate || undefined)
      .subscribe({
        next: (entries) => {
          this.dataSource.data = entries;
          this.updateCalendarEvents(entries);
        },
        error: (error) => {
          console.error('Error loading syllabus entries:', error);
          this.snackBar.open('Failed to load syllabus entries', 'Close', { duration: 3000 });
        }
      });
  }

  updateCalendarEvents(entries: SyllabusEntry[]) {
    this.calendarOptions.events = entries.map(entry => ({
      title: entry.content.substring(0, 30) + '...',
      date: entry.date,
      color: entry.completion_status ? '#4CAF50' : '#FFC107'
    }));
  }

  handleEventClick(info: any) {
    const entry = this.dataSource.data.find(e => e.date === info.event.startStr);
    if (entry) {
      // Show entry details in a dialog
      // this.dialog.open(SyllabusDetailsDialog, {
      //   width: '500px',
      //   data: entry
      // });
    }
  }

  onSubmit() {
    if (this.syllabusForm.valid) {
      const email = this.authService.getUser()?.email;
      if (!email) {
        this.snackBar.open('User not authenticated', 'Close', { duration: 3000 });
        return;
      }

      const entry: SyllabusEntry = {
        ...this.syllabusForm.value,
        trainer_email: email
      };

      this.syllabusService.addSyllabusEntry(entry).subscribe({
        next: () => {
          this.snackBar.open('Syllabus entry added successfully', 'Close', { duration: 3000 });
          this.syllabusForm.reset({ date: new Date(), completion_status: false });
          this.loadSyllabusEntries();
          this.calculateWeeklyCompletion();
        },
        error: (error) => {
          console.error('Error adding syllabus entry:', error);
          this.snackBar.open('Failed to add syllabus entry', 'Close', { duration: 3000 });
        }
      });
    }
  }

  calculateWeeklyCompletion() {
    const email = this.authService.getUser()?.email;
    if (!email) return;

    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay() + 1));

    this.syllabusService.getWeeklyCompletion(email, weekStart).subscribe({
      next: (completion) => {
        this.weeklyCompletion = completion;
      },
      error: (error) => {
        console.error('Error calculating weekly completion:', error);
      }
    });
  }

  onDateRangeChange() {
    this.loadSyllabusEntries();
  }

  toggleCompletion(entry: SyllabusEntry) {
    if (!entry.id) return;

    this.syllabusService.updateSyllabusEntry(entry.id, {
      completion_status: !entry.completion_status
    }).subscribe({
      next: () => {
        this.loadSyllabusEntries();
        this.calculateWeeklyCompletion();
      },
      error: (error) => {
        console.error('Error updating completion status:', error);
        this.snackBar.open('Failed to update completion status', 'Close', { duration: 3000 });
      }
    });
  }

  deleteEntry(entry: SyllabusEntry) {
    if (!entry.id) return;

    if (confirm('Are you sure you want to delete this syllabus entry?')) {
      this.syllabusService.deleteSyllabusEntry(entry.id).subscribe({
        next: () => {
          this.snackBar.open('Syllabus entry deleted successfully', 'Close', { duration: 3000 });
          this.loadSyllabusEntries();
          this.calculateWeeklyCompletion();
        },
        error: (error) => {
          console.error('Error deleting syllabus entry:', error);
          this.snackBar.open('Failed to delete syllabus entry', 'Close', { duration: 3000 });
        }
      });
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
