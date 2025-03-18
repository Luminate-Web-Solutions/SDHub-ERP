import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-trainer-dash',
  templateUrl: './trainer-dash.component.html',
  styleUrl: './trainer-dash.component.css'
})
export class TrainerDashComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  navItems = [
    { icon: 'dashboard', label: 'Attendance', link: '/trainer/attendance' },
    { icon: 'person', label: 'Syllabus board', link: '/trainer/syllabus' },
    { icon: 'account_circle', label: 'Profile', link: '/trainer/profile' },
  ];

  constructor(
    private router: Router,
    // private AuthService: AuthService
  ) {}

  toggleSidenav() {
    this.sidenav.toggle();
  }

  logout() {
    // this.AuthService.logout();
    this.router.navigate(['/portal']);
  }
}
