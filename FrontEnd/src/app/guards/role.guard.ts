import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';
import { ROUTE_PATHS } from '../utils/constants';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRole = route.data['role'] as UserRole;
    const user = this.authService.getCurrentUser();

    if (user && user.role === requiredRole) {
      return true;
    }

    // Redirect to appropriate dashboard based on user role
    if (user) {
      this.authService.navigateBasedOnRole();
    } else {
      this.router.navigate([ROUTE_PATHS.LOGIN]);
    }
    
    return false;
  }
}
