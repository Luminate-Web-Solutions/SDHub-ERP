import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
 selector: 'app-admin-staff-std',
 templateUrl: './admin-staff-std.component.html',
 styleUrls: ['./admin-staff-std.component.css' ]
})
export class AdminStaffStdComponent {
 @ViewChild('sidenav') sidenav!: MatSidenav;

 navItems = [
   { icon: 'width_normal', label: 'Gallery', link: '/admin-staff/gallery' },
   { icon: 'check_box', label: 'Student Attendance', link: '/admin-staff/std-attendance' },
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

 // Add this method to handle tab changes
 tabChanged(tabChangeEvent: MatTabChangeEvent) {
   if (tabChangeEvent.index === 1) { // Index 1 is the "View Attendance" tab
     this.router.navigate(['/admin-staff/std-attendance']);
   }
 }
}