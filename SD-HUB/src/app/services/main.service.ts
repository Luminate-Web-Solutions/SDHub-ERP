import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class MainService {
  private token: string | null = null;
  private user: any = null;

  constructor(private router: Router) {
    // Load token and user info from localStorage on service initialization
    this.token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
    }
  }

  signin(token: string, user: any): void {
    this.token = token;
    this.user = user;
    
    // Store token and user info in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  logout(): void {
    this.token = null;
    this.user = null;
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Navigate to home
    this.router.navigate(['/']);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): any {
    return this.user;
  }

  getUserRole(): string | null {
    return this.user?.role || null;
  }
}
