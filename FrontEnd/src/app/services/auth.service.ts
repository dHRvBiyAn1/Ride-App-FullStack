import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { STORAGE_KEYS, ROUTE_PATHS } from '../utils/constants';
import { environment } from '../environment';
import {
  User,
  LoginRequest,
  LoginResponse,
  UserRole,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          if (response) {
            const user: User = {
              id: response.id,
              username: response.username,
              name: response.name,
              email: response.email,
              role: response.role,
              status: response.status,
            };
            this.setCurrentUser(user);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    this.currentUserSubject.next(null);
    this.router.navigate([ROUTE_PATHS.LOGIN]);
  }

  setCurrentUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  updateCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === UserRole.ADMIN;
  }

  isCustomer(): boolean {
    const user = this.getCurrentUser();
    return user?.role === UserRole.CUSTOMER;
  }

  private loadUserFromStorage(): void {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error loading user from storage:', error);
        this.logout();
      }
    }
  }

  navigateBasedOnRole(): void {
    const user = this.getCurrentUser();
    if (user) {
      if (user.role === UserRole.ADMIN) {
        this.router.navigate([ROUTE_PATHS.ADMIN_DASHBOARD]);
      } else {
        this.router.navigate([ROUTE_PATHS.CUSTOMER_DASHBOARD]);
      }
    }
  }
}
