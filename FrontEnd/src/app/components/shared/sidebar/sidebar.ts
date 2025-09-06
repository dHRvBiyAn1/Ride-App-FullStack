import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { User, UserRole } from '../../../models/user.model';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar implements OnInit {
  currentUser: User | null = null;
  currentRoute = '';
  isCollapsed = false;

  customerMenuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/customer/dashboard', icon: 'dashboard' },
    { label: 'Book Ride', route: '/customer/book-ride', icon: 'car' },
    { label: 'Ride History', route: '/customer/rides', icon: 'history' },
    { label: 'Profile', route: '/customer/profile', icon: 'profile' }
  ];

  adminMenuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Users', route: '/admin/users', icon: 'users' },
    { label: 'Drivers', route: '/admin/drivers', icon: 'drivers' },
    { label: 'All Rides', route: '/admin/rides', icon: 'history' },
    { label: 'Profile', route: '/admin/profile', icon: 'profile' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Subscribe to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.url;
    });
  }

  getLastChangedDate(): Date {
  return new Date(this.currentUser?.updatedDate || this.currentUser?.createdDate || Date.now());
}

getTimeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

  getMenuItems(): MenuItem[] {
    return this.isAdmin() ? this.adminMenuItems : this.customerMenuItems;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === UserRole.ADMIN;
  }

  isActiveRoute(route: string): boolean {
    return this.currentRoute.includes(route);
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  getIconSvg(iconName: string): string {
    const icons: { [key: string]: string } = {
      dashboard: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
      </svg>`,
      car: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.293-.707L19 9.414a1 1 0 0 0-.707-.293H15.5L14 7H9L7.5 9.121H5.207a1 1 0 0 0-.707.293L2 12.121V16h3"/>
        <circle cx="6.5" cy="16" r="2.5"/>
        <circle cx="16.5" cy="16" r="2.5"/>
      </svg>`,
      history: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12,6 12,12 16,14"/>
      </svg>`,
      users: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>`,
      drivers: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3 3 3 0 0 0 3-3V5a3 3 0 0 0-3-3z"/>
        <path d="M19 11v4a7 7 0 0 1-14 0v-4"/>
        <path d="M8 21l8-8"/>
      </svg>`,
      profile: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>`
    };
    return icons[iconName] || icons['dashboard'];
  }
}
