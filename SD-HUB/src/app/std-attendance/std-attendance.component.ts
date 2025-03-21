import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
 selector: 'app-std-attendance',
 templateUrl: './std-attendance.component.html',
 styleUrls: ['./std-attendance.component.css' ]
})
export class StdAttendanceComponent implements OnInit {
 courses: any[] = [];
 students: any[] = [];
 selectedCourse: any;
 attendanceRecords: any[] = [];
 selectedDate: any;
 viewCourseId: any;

 constructor(private http: HttpClient) {}

 ngOnInit(): void {
   this.loadCourses();
 }

 loadCourses() {
   this.http.get<any[]>('http://localhost:3000/courses')
     .subscribe(data => {
       this.courses = data;
     });
 }

 onCourseChange() {
   if (this.selectedCourse) {
     this.loadStudents(this.selectedCourse);
   } else {
     this.students = [];
   }
 }

 loadStudents(courseId: number) {
   this.http.get<any[]>('http://localhost:3000/students?course=' + courseId)
     .subscribe(data => {
       this.students = data;
     });
 }

 markPresent(student: any) {
   student.attendance = 'present';
 }

 markAbsent(student: any) {
   student.attendance = 'absent';
 }

 submitAttendance() {
   console.log(this.students);
   // Send this.students to your database
 }

 loadAttendance() {
   if (this.viewCourseId && this.selectedDate) {
     // Fetch attendance records from the database
     // using this.viewCourseId and this.selectedDate
     this.attendanceRecords = [
       { studentName: 'John Doe', status: 'Present' },
       { studentName: 'Jane Smith', status: 'Absent' }
     ];
   }
 }
}