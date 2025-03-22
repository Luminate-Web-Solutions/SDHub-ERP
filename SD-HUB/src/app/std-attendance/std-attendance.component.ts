import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddCourseDialogComponent } from '../add-course-dialog/add-course-dialog.component';
import { AddStudentDialogComponent } from '../add-student-dialog/add-student-dialog.component';

@Component({
  selector: 'app-std-attendance',
  templateUrl: './std-attendance.component.html',
  styleUrls: ['./std-attendance.component.css']
})
export class StdAttendanceComponent implements OnInit {
  courses: any[] = []; // Array to store all courses
  students: any[] = []; // Array to store students for the selected course
  selectedCourse: any; // Currently selected course
  selectedDate: any; // Selected date for attendance
  attendanceRecords: any[] = []; // Array to store attendance records
  viewCourseId: any; // Course ID for viewing attendance
  submissionMessage: string = ''; // Confirmation message
  isLoading: boolean = false; // Loading flag for API calls

  // Table properties
  displayedColumns: string[] = ['name', 'phone_number', 'actions'];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCourses(); // Load courses when the component initializes
  }

  // Load all courses
  loadCourses() {
    this.http.get<any[]>('http://localhost:3000/std-courses')
      .subscribe(
        data => {
          this.courses = data;
        },
        error => {
          console.error('Error loading courses:', error);
          this.snackBar.open('Failed to load courses. Please try again.', 'Close', { duration: 3000 });
        }
      );
  }

  // Open Add Course Dialog
  openAddCourseDialog() {
    const dialogRef = this.dialog.open(AddCourseDialogComponent, {
      width: '400px',
      data: {} // Pass any data if needed
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addCourse(result);
      }
    });
  }

  // Add a new course
  addCourse(course: { title: string, description: string }) {
    this.http.post('http://localhost:3000/std-courses', course)
      .subscribe(
        () => {
          this.snackBar.open('Course added successfully!', 'Close', { duration: 3000 });
          this.loadCourses(); // Reload the courses list
        },
        error => {
          console.error('Error adding course:', error);
          this.snackBar.open('Failed to add course.', 'Close', { duration: 3000 });
        }
      );
  }

  // Open Add Student Dialog
  openAddStudentDialog() {
    const dialogRef = this.dialog.open(AddStudentDialogComponent, {
      width: '400px',
      data: { courseId: this.selectedCourse } // Pass the selected course ID
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addStudent(result);
      }
    });
  }

  // Add a new student
  addStudent(student: { name: string, s_no: string, phone_number: string }) {
    const studentData = { ...student, course_id: this.selectedCourse };
    this.http.post('http://localhost:3000/std-students', studentData)
      .subscribe(
        () => {
          this.snackBar.open('Student added successfully!', 'Close', { duration: 3000 });
          this.loadStudents(this.selectedCourse); // Reload students for the selected course
        },
        error => {
          console.error('Error adding student:', error);
          this.snackBar.open('Failed to add student.', 'Close', { duration: 3000 });
        }
      );
  }

  // Handle course selection change
  onCourseChange() {
    if (this.selectedCourse) {
      this.loadStudents(this.selectedCourse); // Load students for the selected course
    } else {
      this.students = []; // Clear students if no course is selected
      this.dataSource.data = []; // Clear the table data
    }
  }

  // Load students for a specific course
  loadStudents(courseId: number) {
    this.http.get<any[]>(`http://localhost:3000/std-students/${courseId}`)
      .subscribe(
        data => {
          this.students = data;
          this.dataSource.data = data; // Update the table data
          this.dataSource.paginator = this.paginator; // Attach paginator
        },
        error => {
          console.error('Error loading students:', error);
          this.snackBar.open('Failed to load students.', 'Close', { duration: 3000 });
        }
      );
  }

  // Mark a student as present
  markPresent(student: any) {
    student.attendance = 'Present';
  }

  // Mark a student as absent
  markAbsent(student: any) {
    student.attendance = 'Absent';
  }

  // Submit attendance for all students
  submitAttendance() {
    if (!this.selectedDate) {
      this.snackBar.open('Please select a date.', 'Close', { duration: 3000 });
      return;
    }

    const attendanceData = this.students.map(student => ({
      student_id: student.id,
      course_id: this.selectedCourse,
      attendance_date: this.selectedDate.toISOString().split('T')[0], // Format date as YYYY-MM-DD
      status: student.attendance || 'Absent' // Default to Absent if not marked
    }));

    this.http.post('http://localhost:3000/std-attendance', attendanceData)
      .subscribe(
        () => {
          // Reset the page
          this.selectedDate = null;
          this.selectedCourse = null;
          this.students = [];
          this.dataSource.data = [];
          this.submissionMessage = `Attendance for ${this.getCourseName(this.selectedCourse)} on ${this.selectedDate.toDateString()} submitted successfully!`;
          this.snackBar.open('Attendance submitted successfully!', 'Close', { duration: 3000 });
        },
        error => {
          console.error('Error submitting attendance:', error);
          this.snackBar.open('Failed to submit attendance.', 'Close', { duration: 3000 });
        }
      );
  }

  // Get course name by ID
  getCourseName(courseId: number): string {
    const course = this.courses.find(c => c.id === courseId);
    return course ? course.title : 'Unknown Course';
  }

  // Load attendance records for a specific course and date
  loadAttendance() {
    if (!this.viewCourseId || !this.selectedDate) {
      this.snackBar.open('Please select both a course and a date.', 'Close', { duration: 3000 });
      return;
    }

    // Format the date as YYYY-MM-DD
    const formattedDate = this.selectedDate.toISOString().split('T')[0];

    this.isLoading = true; // Show loading spinner
    this.attendanceRecords = []; // Clear previous records

    this.http.get<any[]>(`http://localhost:3000/std-attendance/${this.viewCourseId}/${formattedDate}`)
      .subscribe(
        data => {
          this.attendanceRecords = data;
          this.isLoading = false; // Hide loading spinner
        },
        error => {
          console.error('Error loading attendance records:', error);
          this.snackBar.open('Failed to load attendance records. Please try again.', 'Close', { duration: 3000 });
          this.isLoading = false; // Hide loading spinner
        }
      );
  }
}