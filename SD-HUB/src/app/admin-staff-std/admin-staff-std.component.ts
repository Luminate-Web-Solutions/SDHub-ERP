import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-admin-staff-std',
  templateUrl: './admin-staff-std.component.html',
  styleUrl: './admin-staff-std.component.css'
})
export class AdminStaffStdComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  navItems = [
    { icon: 'gallery_thumbnail', label: 'Gallery', link: '/admin-staff/gallery' },
    { icon: 'account_circle', label: 'Profile', link: '/admin-staff/profile' },
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