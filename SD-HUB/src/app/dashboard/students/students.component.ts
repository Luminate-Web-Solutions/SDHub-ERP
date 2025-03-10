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
import { DatePipe } from '@angular/common';

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
    private snackBar: MatSnackBar,
    private datePipe: DatePipe
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

  printRegistrationForm(student: any) {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      this.snackBar.open('Please allow pop-ups to print the form', 'Close', { duration: 3000 });
      return;
    }

    // Format the date
    const formattedDate = this.datePipe.transform(new Date(), 'dd/MM/yyyy');
    const dob = this.datePipe.transform(student.dateOfBirth, 'dd/MM/yyyy');

    // Create the print content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Registration Form</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .header img {
            max-width: 200px;
          }
          .photo-box {
            float: right;
            width: 150px;
            height: 180px;
            border: 1px solid #000;
            text-align: center;
            padding-top: 70px;
          }
          .form-section {
            margin-bottom: 20px;
          }
          .form-field {
            margin-bottom: 10px;
          }
          .form-field label {
            font-weight: bold;
            display: inline-block;
            width: 200px;
          }
          .form-field span {
            border-bottom: 1px solid #000;
            display: inline-block;
            min-width: 300px;
          }
          .declaration {
            margin: 20px 0;
          }
          .signature-section {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
          }
          .signature-line {
            width: 200px;
            border-top: 1px solid #000;
            text-align: center;
            padding-top: 5px;
          }
          @media print {
            body {
              padding: 0;
              margin: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="/assets/SD logo M Rectangle.png" alt="SD Hub Logo">
          <h2>Admission Application Form</h2>
        </div>
        
        <div class="photo-box">
          Paste your passport size<br>Photograph here
        </div>

        <div class="form-section">
          <div class="form-field">
            <label>Student ID:</label>
            <span>${student.uniqueId || ''}</span>
          </div>
          <div class="form-field">
            <label>Date:</label>
            <span>${formattedDate || ''}</span>
          </div>
        </div>

        <div class="form-section">
          <h3>Applicant Information</h3>
          <div class="form-field">
            <label>Full Name:</label>
            <span>${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}</span>
          </div>
          <div class="form-field">
            <label>Father's Name:</label>
            <span>${student.fatherFirstName || ''} ${student.fatherMiddleName || ''} ${student.fatherLastName || ''}</span>
          </div>
          <div class="form-field">
            <label>Date of Birth:</label>
            <span>${dob || ''}</span>
          </div>
          <div class="form-field">
            <label>Phone No:</label>
            <span>${student.phoneNumber || ''}</span>
          </div>
          <div class="form-field">
            <label>Email:</label>
            <span>${student.email || ''}</span>
          </div>
          <div class="form-field">
            <label>Address (Permanent):</label>
            <span>${student.address || ''}</span>
          </div>
          <div class="form-field">
            <label>Parent/Guardian Contact:</label>
            <span>${student.guardianContact || ''}</span>
          </div>
          <div class="form-field">
            <label>Household Income (Yearly):</label>
            <span>${student.householdIncome || ''}</span>
          </div>
        </div>

        <div class="form-section">
          <h3>Course Details</h3>
          <div class="form-field">
            <label>Course Applied for:</label>
            <span>${student.course || ''}</span>
          </div>
        </div>

        <div class="form-section">
          <h3>Education Qualification</h3>
          <div class="form-field">
            <label>Degree:</label>
            <span>${student.degree || ''}</span>
          </div>
          <div class="form-field">
            <label>College name:</label>
            <span>${student.collegeName || ''}</span>
          </div>
          <div class="form-field">
            <label>Year of Passing:</label>
            <span>${student.yearOfPassing || ''}</span>
          </div>
          <div class="form-field">
            <label>Percentage:</label>
            <span>${student.percentage || ''}%</span>
          </div>
          <div class="form-field">
            <label>Stream:</label>
            <span>${student.stream || ''}</span>
          </div>
        </div>

        <div class="declaration">
          <p>I declare that my all the information given here are true and complete to the best of my knowledge.</p>
          <p>I understand that false or misleading information may result in my rejection of the application.</p>
        </div>

        <div class="signature-section">
          <div class="signature-line">Student's Signature</div>
          <div class="signature-line">Parent/Guardian Signature</div>
          <div class="signature-line">Director's Signature</div>
        </div>

        <div class="form-section">
          <h3>ENCLOSURES:</h3>
          <ol>
            <li>Passport size photograph – 3 No.</li>
            <li>Copy of Aadhar Card</li>
            <li>Copy of Photo ID proof</li>
            <li>Copy of College ID Card</li>
            <li>Original Certificates</li>
            <li>Income Certificate</li>
          </ol>
        </div>

        <button class="no-print" onclick="window.print()" style="margin: 20px 0;">Print Form</button>
      </body>
      </html>
    `;

    // Write the content to the new window and print
    printWindow.document.write(printContent);
    printWindow.document.close();
  }
}