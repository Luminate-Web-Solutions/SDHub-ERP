import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrl: './data.component.css'
})
export class DataComponent {
  students: any[] = [];
  student = {
    id: 0,
    name: '',
    email: '',
    batch: '',
    course: '',
    placed: 'Not Placed',
    courseCompleted: 'Not Completed'
  };
  isEditMode = false;
  searchQuery = '';

  constructor(private studentService: DataService) { }

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents() {
    this.studentService.getStudents().subscribe({
      next: (data) => this.students = data,
      error: (err) => console.error(err)
    });
  }

  onSearch() {
    this.loadStudents();
  }

  resetSearch() {
    this.searchQuery = '';
    this.loadStudents();
  }

  onSubmit() {
    if (this.isEditMode) {
      this.studentService.updateStudent(this.student).subscribe({
        next: () => {
          this.loadStudents();
          this.resetForm();
        },
        error: (err) => console.error(err)
      });
    } else {
      this.studentService.addStudent(this.student).subscribe({
        next: () => {
          this.loadStudents();
          this.resetForm();
        },
        error: (err) => console.error(err)
      });
    }
  }

  onEdit(student: any) {
    this.student = { ...student };
    this.isEditMode = true;
  }

  onDelete(id: number) {
    this.studentService.deleteStudent(id).subscribe({
      next: () => this.loadStudents(),
      error: (err) => console.error(err)
    });
  }

  resetForm() {
    this.student = {
      id: 0,
      name: '',
      email: '',
      batch: '',
      course: '',
      placed: 'Not Placed',
      courseCompleted: 'Not Completed'
    };
    this.isEditMode = false;
  }
}