import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StudentsService } from '../../students.service';
import { UserDialogComponent } from './user-dialog/user-dialog.component';
import { StudentDialogComponent } from './student-dialog/student-dialog.component';
import { SelectionModel } from '@angular/cdk/collections';

export interface UserData {
  id?: number;
  course: string;
  name: string;
  contactNumber: string;
  password?: string;
  confirmPassword?: string;
  email: string;
  status: string;
}

export interface StudentData {
  id?: number;
  uniqueId: string;
  firstName: string;
  lastName: string;
  applicationDate: string;
  course: string;
  email: string;
}

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css']
})
export class StudentsComponent implements OnInit, AfterViewInit {
  displayedUserColumns: string[] = ['select','course', 'name', 'contactNumber', 'email', 'status', 'actions'];
  displayedStudentColumns: string[] = ['select','uniqueId', 'firstName', 'lastName', 'applicationDate', 'course', 'email', 'actions'];
  
  userDataSource: MatTableDataSource<UserData>;
  studentDataSource: MatTableDataSource<StudentData>;

   userSelection = new SelectionModel<UserData>(true, []);
   studentSelection = new SelectionModel<StudentData>(true, []);

  @ViewChild('userPaginator') userPaginator!: MatPaginator;
  @ViewChild('studentPaginator') studentPaginator!: MatPaginator;
  @ViewChild('userSort') userSort!: MatSort;
  @ViewChild('studentSort') studentSort!: MatSort;

  constructor(
    private studentsService: StudentsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.userDataSource = new MatTableDataSource<UserData>();
    this.studentDataSource = new MatTableDataSource<StudentData>();
  }

  // Selection methods for Users
  isAllUsersSelected() {
    const numSelected = this.userSelection.selected.length;
    const numRows = this.userDataSource.data.length;
    return numSelected === numRows;
  }

  masterToggleUsers() {
    if (this.isAllUsersSelected()) {
      this.userSelection.clear();
      return;
    }
    this.userSelection.select(...this.userDataSource.data);
  }

  // Selection methods for Students
  isAllStudentsSelected() {
    const numSelected = this.studentSelection.selected.length;
    const numRows = this.studentDataSource.data.length;
    return numSelected === numRows;
  }

  masterToggleStudents() {
    if (this.isAllStudentsSelected()) {
      this.studentSelection.clear();
      return;
    }
    this.studentSelection.select(...this.studentDataSource.data);
  }

  // Export methods
  exportSelectedUsers() {
    const selectedUsers = this.userSelection.selected;
    if (selectedUsers.length === 0) {
      this.snackBar.open('Please select at least one user to export', 'Close', { duration: 3000 });
      return;
    }

    const csvData = this.convertToCSV(selectedUsers);
    this.downloadCSV(csvData, 'users.csv');
  }

  exportSelectedStudents() {
    const selectedStudents = this.studentSelection.selected;
    if (selectedStudents.length === 0) {
      this.snackBar.open('Please select at least one student to export', 'Close', { duration: 3000 });
      return;
    }

    const csvData = this.convertToCSV(selectedStudents);
    this.downloadCSV(csvData, 'students.csv');
  }

  convertToCSV(data: any[]): string {
    const headers = Object.keys(data[0]).filter(key => key !== 'id' && key !== 'password' && key !== 'confirmPassword');
    const csvRows = [headers.join(',')];

    for (const item of data) {
      const values = headers.map(header => {
        const value = item[header];
        return typeof value === 'string' ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  downloadCSV(csvData: string, filename: string) {
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  ngOnInit() {
    this.getUsers();
    this.getStudents();
  }

  ngAfterViewInit() {
    this.userDataSource.paginator = this.userPaginator;
    this.userDataSource.sort = this.userSort;
    this.studentDataSource.paginator = this.studentPaginator;
    this.studentDataSource.sort = this.studentSort;
  }

  getUsers() {
    this.studentsService.getsignupusers().subscribe(users => {
      console.log('Users:', users);
      this.userDataSource.data = users;
    });
  }

  getStudents() {
    this.studentsService.getUsers().subscribe(students => {
      console.log('Students:', students);
      this.studentDataSource.data = students;
    });
  }

  openAddUserDialog() {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '500px',
      data: { mode: 'add' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.studentsService.signup(result).subscribe({
          next: (response) => {
            this.snackBar.open('User added successfully!', 'Close', { duration: 3000 });
            this.getUsers(); // Refresh the list
          },
          error: (error) => {
            console.error('Error adding user:', error);
            this.snackBar.open('Failed to add user', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  openEditUserDialog(user: UserData) {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '500px',
      data: { mode: 'edit', user: user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.studentsService.updateUser(result).subscribe({
          next: (response) => {
            this.snackBar.open('User updated successfully!', 'Close', { duration: 3000 });
            this.getUsers(); // Refresh the list
          },
          error: (error) => {
            console.error('Error updating user:', error);
            this.snackBar.open('Failed to update user', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  deleteUser(user: UserData) {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      this.studentsService.deleteUser(user.id!).subscribe({
        next: (response) => {
          this.snackBar.open('User deleted successfully!', 'Close', { duration: 3000 });
          this.getUsers(); // Refresh the list
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.snackBar.open('Failed to delete user', 'Close', { duration: 3000 });
        }
      });
    }
  }

  openAddStudentDialog() {
    const dialogRef = this.dialog.open(StudentDialogComponent, {
      width: '500px',
      data: { mode: 'add' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.studentsService.addstudents(result).subscribe({
          next: (response) => {
            this.snackBar.open('Student added successfully!', 'Close', { duration: 3000 });
            this.getStudents(); // Refresh the list
          },
          error: (error) => {
            console.error('Error adding student:', error);
            this.snackBar.open('Failed to add student', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  openEditStudentDialog(student: StudentData) {
    const dialogRef = this.dialog.open(StudentDialogComponent, {
      width: '500px',
      data: { mode: 'edit', student: student }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.studentsService.updateStudent(result).subscribe({
          next: (response) => {
            this.snackBar.open('Student updated successfully!', 'Close', { duration: 3000 });
            this.getStudents(); // Refresh the list
          },
          error: (error) => {
            console.error('Error updating student:', error);
            this.snackBar.open('Failed to update student', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  deleteStudent(student: StudentData) {
    if (confirm(`Are you sure you want to delete ${student.firstName} ${student.lastName}?`)) {
      this.studentsService.deleteStudent(student.id!).subscribe({
        next: (response) => {
          this.snackBar.open('Student deleted successfully!', 'Close', { duration: 3000 });
          this.getStudents(); // Refresh the list
        },
        error: (error) => {
          console.error('Error deleting student:', error);
          this.snackBar.open('Failed to delete student', 'Close', { duration: 3000 });
        }
      });
    }
  }

  applyUserFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.userDataSource.filter = filterValue.trim().toLowerCase();

    if (this.userDataSource.paginator) {
      this.userDataSource.paginator.firstPage();
    }
  }

  applyStudentFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.studentDataSource.filter = filterValue.trim().toLowerCase();

    if (this.studentDataSource.paginator) {
      this.studentDataSource.paginator.firstPage();
    }
  }
}