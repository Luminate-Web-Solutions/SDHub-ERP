import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router 
} from '@angular/router';
import { AuthService } from './services/auth.service';

@Injectable({
  providedIn: 'root'
})

export class adminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isAuthenticated()) {
      const userRole = this.authService.getUserRole();
      
      // Define allowed roles for each route
      const roleRoutes = {
        stakeholder: ['/stakeholder-dashboard'],
        director: ['/admin'],
        admin: ['/admin-dashboard'],
        trainer: ['/staff']
      };

      // Check if user has permission to access the route
      const allowedRoutes = roleRoutes[userRole as keyof typeof roleRoutes] || [];
      if (allowedRoutes.some(route => state.url.startsWith(route))) {
        return true;
      } else {
        // Redirect to appropriate dashboard based on role
        const defaultRoute = roleRoutes[userRole as keyof typeof roleRoutes]?.[0] || '/signin';
        this.router.navigate([defaultRoute]);
        return false;
      }
    }

    // Not logged in, redirect to login page
    this.router.navigate(['/signin'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}