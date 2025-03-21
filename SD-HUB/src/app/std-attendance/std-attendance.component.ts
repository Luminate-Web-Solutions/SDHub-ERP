import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
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

  // Table properties
  displayedColumns: string[] = ['name', 'phone_number', 'actions'];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadCourses(); // Load courses when the component initializes
  }

  // Load all courses
  loadCourses() {
    this.http.get<any[]>('http://localhost:3000/std-courses')
      .subscribe(data => {
        this.courses = data;
      }, error => {
        console.error('Error loading courses:', error);
      });
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
      .subscribe(() => {
        alert('Course added successfully!');
        this.loadCourses(); // Reload the courses list
      }, error => {
        console.error('Error adding course:', error);
        alert('Failed to add course.');
      });
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
      .subscribe(() => {
        alert('Student added successfully!');
        this.loadStudents(this.selectedCourse); // Reload students for the selected course
      }, error => {
        console.error('Error adding student:', error);
        alert('Failed to add student.');
      });
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
      .subscribe(data => {
        this.students = data;
        this.dataSource.data = data; // Update the table data
        this.dataSource.paginator = this.paginator; // Attach paginator
      }, error => {
        console.error('Error loading students:', error);
      });
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
      alert('Please select a date.');
      return;
    }

    const attendanceData = this.students.map(student => ({
      student_id: student.id,
      course_id: this.selectedCourse,
      attendance_date: this.selectedDate.toISOString().split('T')[0], // Format date as YYYY-MM-DD
      status: student.attendance || 'Absent' // Default to Absent if not marked
    }));

    this.http.post('http://localhost:3000/std-attendance', attendanceData)
      .subscribe(() => {
        // Reset the page
        this.selectedDate = null;
        this.selectedCourse = null;
        this.students = [];
        this.dataSource.data = [];
        this.submissionMessage = `Attendance for ${this.getCourseName(this.selectedCourse)} on ${this.selectedDate.toDateString()} submitted successfully!`;
      }, error => {
        console.error('Error submitting attendance:', error);
        alert('Failed to submit attendance.');
      });
  }

  // Get course name by ID
  getCourseName(courseId: number): string {
    const course = this.courses.find(c => c.id === courseId);
    return course ? course.title : 'Unknown Course';
  }

  // Load attendance records for a specific course and date
  loadAttendance() {
    if (this.viewCourseId && this.selectedDate) {
      this.http.get<any[]>(`http://localhost:3000/std-attendance/${this.viewCourseId}/${this.selectedDate}`)
        .subscribe(data => {
          this.attendanceRecords = data;
        }, error => {
          console.error('Error loading attendance records:', error);
        });
    }
  }
}