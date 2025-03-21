import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { StudentsService } from '../students.service';
import { AuthService } from '../services/auth.service';
import { ForgotPasswordDialogComponent } from '../signin/forgot-password-dialog.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  signinForm: FormGroup;
  hidePassword = true;
  roles = ['director', 'stakeholder', 'admin', 'trainer'];
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private dialog: MatDialog,
    private http: HttpClient,
    private studentsService: StudentsService
  ) {
    this.signinForm = this.formBuilder.group({
      role: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    if (this.signinForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    this.http.post<any>('http://localhost:3000/login', this.signinForm.value)
      .subscribe({
        next: (response) => {
          this.authService.signin(response.token, response.user);
          this.handleNavigation(response.user.role);
          this.loading = false;
        },
        error: (err) => {
          console.error('Login error:', err);
          this.errorMessage = err.error?.message || 'Login failed. Please check your credentials.';
          this.loading = false;
        }
      });
  }

  private handleNavigation(role: string) {
    switch(role.toLowerCase()) {
      case 'director':
        this.router.navigate(['/admin']);
        break;
      case 'admin':
        this.router.navigate(['/admin-staff']);
        break;
      case 'stakeholder':
        this.router.navigate(['/stakeholder']);
        break;
      case 'trainer':
        this.router.navigate(['/trainer']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }

  forgotPassword(): void {
    const dialogRef = this.dialog.open(ForgotPasswordDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(email => {
      if (email) {
        this.studentsService.sendPasswordResetEmail(email).subscribe({
          next: () => {
            this.snackBar.open('Password has been sent to your email.', 'Close', { duration: 3000 });
          },
          error: (error) => {
            this.snackBar.open(error.error?.message || 'Failed to send password', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
}