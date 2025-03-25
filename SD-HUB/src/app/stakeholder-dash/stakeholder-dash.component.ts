import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { HttpClient } from '@angular/common/http';


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
    private http: HttpClient,
    // private AuthService: AuthService
  ) {}

  toggleSidenav() {
    this.sidenav.toggle();
  }

  logout() {
    // this.AuthService.logout();
    this.router.navigate(['/portal']);
  }

  remarkText: string = '';

submitRemark() {
  if (this.remarkText.trim()) {
    this.http.post('http://localhost:3000/api/remarks', { remark: this.remarkText })
      .subscribe({
        next: () => {
          this.remarkText = '';
        },
        error: (err) => {
          console.error('Error submitting remark:', err);
        }
      });
  }
}

}

