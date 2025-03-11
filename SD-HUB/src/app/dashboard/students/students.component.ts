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

    // Split date of birth into components
    let dobDay = '', dobMonth = '', dobYear = '';
    if (dob) {
      const dobParts = dob.split('/');
      dobDay = dobParts[0] || '';
      dobMonth = dobParts[1] || '';
      dobYear = dobParts[2] || '';
    }

    // Create Angular initialization with student data
    const angularInit = `
      angular.module('admissionForm', [])
        .controller('formController', ['$scope', function($scope) {
          $scope.form = {
            studentId: '${student.uniqueId || ''}',
            currentDate: '${formattedDate || ''}',
            firstName: '${student.firstName || ''}',
            middleName: '${student.middleName || ''}',
            lastName: '${student.lastName || ''}',
            fatherFirst: '${student.fatherFirstName || ''}',
            fatherMiddle: '${student.fatherMiddleName || ''}',
            fatherLast: '${student.fatherLastName || ''}',
            birthDay: '${dobDay}',
            birthMonth: '${dobMonth}',
            birthYear: '${dobYear}',
            phone: '${student.phoneNumber || ''}',
            email: '${student.email || ''}',
            address: '${student.address || ''}',
            guardianContact: '${student.guardianContact || ''}',
            income: '${student.householdIncome || ''}',
            course: '${student.course || ''}',
            degree: '${student.degree || ''}',
            college: '${student.collegeName || ''}',
            passingYear: '${student.yearOfPassing || ''}',
            percentage: '${student.percentage || ''}',
            stream: '${student.stream || ''}'
          };
          
          $scope.submitForm = function() {
            console.log('Form submitted:', $scope.form);
          };
        }]);
    `;
    // Create the print content
    const printContent = `
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SD Hub Admission Form</title>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.8.2/angular.min.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            margin: 0;
            padding: 10px;
            font-size: 12px;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
            position: relative;
        }

        .logo-container {
            display: flex;
            flex-direction: column;
            align-items: left;
            gap: 10px;
        }

        .logo {
            width: 400px;
            height: 80px;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 8px;
            text-align: center;
            line-height: 1.2;
            margin-left: 30px;
        }

        .logo-2 {
            width: 300px;
            height: 80px;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 8px;
            text-align: center;
            line-height: 1.2;
            margin-left: 60px;
        }

        .photo-box {
            position: absolute;
            top: 0;
            right: 0;
            width: 100px;
            height: 120px;
            border: 1px solid #000;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            font-size: 10px;
            padding: 5px;
        }

        .section-header {
            background-color: #4b5563;
            color: white;
            padding: 5px;
            margin: 15px 0 10px 0;
            font-size: 14px;
        }

        .form-group {
            margin-bottom: 10px;
            display: flex;
            align-items: center;
        }

        .form-group label {
            width: 120px;
            margin-right: 5px;
            font-size: 12px;
        }

        .form-control {
            border: none;
            border-bottom: 1px solid #000;
            outline: none;
            padding: 3px 0;
            width: 100%;
            font-family: inherit;
            font-size: 12px;
        }

        .date-input {
            display: flex;
            gap: 3px;
            align-items: center;
        }

        .date-input input {
            width: 30px;
            text-align: center;
            border: none;
            border-bottom: 1px solid #000;
            outline: none;
            font-size: 12px;
        }

        .date-input input.year {
            width: 50px;
        }

        .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
            margin-bottom: 20px;
        }

        .signature-line {
            border-bottom: 1px solid #000;
            width: 120px;
            display: inline-block;
            margin-left: 5px;
        }

        .enclosures {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 5px;
            padding-left: 15px;
        }

        .enclosures li {
            margin-bottom: 3px;
            font-size: 12px;
        }

        .terms {
            font-size: 10px;
            text-align: justify;
            margin-top: 15px;
        }

        .terms ol {
            padding-left: 15px;
            margin: 5px 0;
        }

        .terms li {
            margin-bottom: 5px;
        }

        .director-signature {
            text-align: right;
            margin-top: 20px;
        }

        .form-row {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
        }

        .form-row .form-group {
            flex: 1;
        }

        @media print {
            body {
                background-color: white;
                color: black;
            }

            .container {
                box-shadow: none;
                padding: 0;
            }

            .section-header {
                background-color: #4b5563 !important;
                color: white !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            .photo-box {
                border: 1px solid #000 !important;
            }

            .signature-line, .signature-line-2 {
                border-bottom: 1px solid #000 !important;
            }
        }
    </style>
</head>
<body ng-app="admissionForm" ng-controller="formController">
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo-container">
                <img src="SD Hub Logo Q 2.png" alt="logo" class="logo">
                <img src="SD Hub Logo sp.png" alt="logo" class="logo-2">
            </div>
            <div class="photo-box">
                Paste your passport size<br>Photograph here
            </div>
        </div>

        <div style="margin-bottom: 15px; font-size: 12px;">
            <span style="float: left">Student ID: {{form.studentId}}</span>
            <span style="margin-left: 250px;">Admission Application Form</span>
            <span style="float: right">Date: {{form.currentDate}}<input type="text" class="form-control" style="width: 80px"></span>
            <div style="clear: both"></div>
        </div>

              <!-- Form -->
              <form ng-submit="submitForm()">
            <div class="section-header">Applicant Information</div>

            <div class="form-group">
                <label>Full Name:</label>
                <input type="text" class="form-control" ng-model="form.firstName" placeholder="First">
                <input type="text" class="form-control" ng-model="form.middleName" placeholder="Middle">
                <input type="text" class="form-control" ng-model="form.lastName" placeholder="Last">
            </div>

            <div class="form-group">
                <label>Father's Name:</label>
                <input type="text" class="form-control" ng-model="form.fatherFirst" placeholder="First">
                <input type="text" class="form-control" ng-model="form.fatherMiddle" placeholder="Middle">
                <input type="text" class="form-control" ng-model="form.fatherLast" placeholder="Last">
            </div>

            <div class="form-group">
                <label>Date of Birth:</label>
                <div class="date-input">
                    <input type="text" ng-model="form.birthDay" readonly>
                    <span>/</span>
                    <input type="text" ng-model="form.birthMonth" readonly>
                    <span>/</span>
                    <input type="text" class="year" ng-model="form.birthYear" readonly>
                </div>
            </div>

            <!-- Phone and Email in the same line -->
            <div class="form-row">
                <div class="form-group">
                    <label>Phone No:</label>
                    <input type="text" class="form-control" ng-model="form.phone" readonly>
                </div>
                <div class="form-group">
                    <label>Email:</label>
                    <input type="email" class="form-control" ng-model="form.email" readonly>
                </div>
            </div>

            <div class="form-group">
                <label>Address (Permanent):</label>
                <input type="text" class="form-control" ng-model="form.address" readonly>
            </div>

            <!-- Parent Contact and Income in the same line -->
            <div class="form-row">
                <div class="form-group">
                    <label>Parent/Guardian Contact Details:</label>
                    <input type="text" class="form-control" ng-model="form.guardianContact">
                </div>
                <div class="form-group">
                    <label>Household Income (Yearly):</label>
                    <input type="text" class="form-control" ng-model="form.income" readonly>
                </div>
            </div>

            <div class="section-header">Course Details</div>
            <div class="form-group">
                <label>Course Applied for:</label>
                <input type="text" class="form-control" ng-model="form.course" readonly>
            </div>

            <div class="section-header">Education Qualification</div>

            <!-- Degree and College Name in the same line -->
            <div class="form-row">
                <div class="form-group">
                    <label>Degree:</label>
                    <input type="text" class="form-control" ng-model="form.degree" readonly>
                </div>
                <div class="form-group">
                    <label>College name:</label>
                    <input type="text" class="form-control" ng-model="form.college" readonly>
                </div>
            </div>

            <!-- Year of Passing, Percentage, and Stream in the same line -->
            <div class="form-row">
                <div class="form-group">
                    <label>Year of Passing:</label>
                    <input type="text" class="form-control" ng-model="form.passingYear" readonly>
                </div>
                <div class="form-group">
                    <label>Percentage:</label>
                    <input type="text" class="form-control" ng-model="form.percentage" readonly>
                </div>
                <div class="form-group">
                    <label>Stream:</label>
                    <input type="text" class="form-control" ng-model="form.stream" readonly>
                </div>
            </div>

            <div style="margin: 15px 0; text-align: center; font-size: 12px;">
                <p>I declare that my all the information given here are true and complete to the best of my knowledge.</p>
                <p>I understand that false or misleading information may result in my rejection of the application.</p>
            </div>

            <div class="signatures">
                <div>
                    Student's Signature:<span class="signature-line"></span>
                </div>
                <div>
                    Parent/Guardian Signature:<span class="signature-line"></span>
                </div>
                <div>
                    Date:<span class="signature-line"></span>
                </div>
            </div>

            <div class="section-header">ENCLOSURES:</div>
            <!-- Enclosures in a 3x2 grid -->
            <ol class="enclosures">
                <li>Passport size photograph – 3 No.</li>
                <li>Copy of Aadhar Card.</li>
                <li>Copy of Photo ID proof</li>
                <li>Copy of College ID Card</li>
                <li>Original Certificates</li>
                <li>Income Certificate</li>
            </ol>

            <div class="section-header">TERMS & CONDITIONS</div>
            <div class="terms">
                <ol>
                    <li>Applicants are required to provide true and complete information when filling out the application form and attaching documents. Provision of false information may result in the termination of the application / enrolment.</li>
                    <li>SD Hub does not claim responsibility for the accuracy or veracity of information provided by the student.</li>
                    <li>We shall not be responsible or liable for the loss of your personal belongings in the premises.</li>
                    <li>Candidates should maintain strict discipline, no one should misbehave with the institute's staff and teaching faculties, if any person found to misbehave then strict action will be taken against him/her, and their enrolment will be cancelled.</li>
                    <li>Candidates are required to take utmost care while handling institute's infrastructure, anyone found mishandling the same will be held responsible and liable for the damage and he shall pay the complete amount for the damages caused.</li>
                    <li>Candidates are required to maintain their batch timings as per the instructions, no person shall be allowed to change the batch once allotted.</li>
                </ol>
            </div>

            <div class="director-signature">
                Director's Signature: <span class="signature-line"></span>
            </div>
        </form>
    </div>

    <script>${angularInit}</script>
          <script>
              // Add print button functionality
              window.onload = function() {
                  const printButton = document.createElement('button');
                  printButton.innerHTML = 'Print Form';
                  printButton.style.position = 'fixed';
                  printButton.style.bottom = '20px';
                  printButton.style.right = '20px';
                  printButton.style.padding = '10px 20px';
                  printButton.style.backgroundColor = '#2e53aa';
                  printButton.style.color = 'white';
                  printButton.style.border = 'none';
                  printButton.style.borderRadius = '5px';
                  printButton.style.cursor = 'pointer';
                  printButton.onclick = function() {
                      this.style.display = 'none';
                      window.print();
                      this.style.display = 'block';
                  };
                  document.body.appendChild(printButton);
              };
          </script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  }
}