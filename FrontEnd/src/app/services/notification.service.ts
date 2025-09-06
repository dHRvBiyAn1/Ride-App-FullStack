import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor() {}

  show(notification: Omit<Notification, 'id'>): void {
    const id = this.generateId();
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, newNotification]);

    // Auto remove after duration
    setTimeout(() => {
      this.remove(id);
    }, newNotification.duration);
  }

  success(title: string, message: string): void {
    this.show({ type: 'success', title, message });
  }

  error(title: string, message: string): void {
    this.show({ type: 'error', title, message });
  }

  warning(title: string, message: string): void {
    this.show({ type: 'warning', title, message });
  }

  info(title: string, message: string): void {
    this.show({ type: 'info', title, message });
  }

  remove(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const filteredNotifications = currentNotifications.filter(n => n.id !== id);
    this.notificationsSubject.next(filteredNotifications);
  }

  clear(): void {
    this.notificationsSubject.next([]);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
