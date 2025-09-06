import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User, UserRole } from '../../../models/user.model';
import { ROUTE_PATHS } from '../../../utils/constants';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header implements OnInit {
  currentUser: User | null = null;
  showUserMenu = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  navigateToProfile(): void {
    this.closeUserMenu();
    if (this.isAdmin()) {
      this.router.navigate(['/admin/profile']);
    } else {
      this.router.navigate(['/customer/profile']);
    }
  }

  logout(): void {
    this.closeUserMenu();
    this.authService.logout();
  }

  isAdmin(): boolean {
    return this.currentUser?.role === UserRole.ADMIN;
  }

  getInitials(): string {
    if (this.currentUser?.name) {
      return this.currentUser.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  }

  getRoleDisplayName(): string {
    return this.currentUser?.role === UserRole.ADMIN ? 'Administrator' : 'Customer';
  }
}
