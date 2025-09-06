import { Component, signal, OnInit} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('FrontEnd');
  showNavigation = false;
notnotificationService: any;

  constructor(
    private router: Router,
    private authService: AuthService,
    public notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Listen to router events to show/hide navigation
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showNavigation = !event.url.includes('/login');
      });
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
