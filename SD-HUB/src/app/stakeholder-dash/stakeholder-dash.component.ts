import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-stakeholder-dash',
  templateUrl: './stakeholder-dash.component.html',
  styleUrl: './stakeholder-dash.component.css'
})
export class StakeholderDashComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  navItems = [
    { icon: 'dashboard', label: 'Dashboard', link: '/stakeholder/dashboard' },
    { icon: 'account_circle', label: 'Profile', link: '/stakeholder/profile' },
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

