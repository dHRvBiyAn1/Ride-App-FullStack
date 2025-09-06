import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { DriverService } from '../../../services/driver.service';
import { RideService } from '../../../services/ride.service';
import { PaymentService } from '../../../services/payment.service';
import { NotificationService } from '../../../services/notification.service';
import { User, UserRole, UserStatus } from '../../../models/user.model';
import { Driver, DriverStatus } from '../../../models/driver.model';
import { Ride, RideStatus } from '../../../models/ride.model';
import { Payment, PaymentStatus } from '../../../models/payment.model';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalDrivers: number;
  activeDrivers: number;
  totalRides: number;
  activeRides: number;
  completedRides: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageRideValue: number;
}

interface RecentActivity {
  id: string;
  type: 'user' | 'driver' | 'ride' | 'payment';
  title: string;
  description: string;
  timestamp: Date;
  status?: string;
  amount?: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
})
export class AdminDashboard implements OnInit {
  currentUser: User | null = null;
  isLoading = true;

  stats: AdminStats = {
    totalUsers: 0,
    activeUsers: 0,
    totalDrivers: 0,
    activeDrivers: 0,
    totalRides: 0,
    activeRides: 0,
    completedRides: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    averageRideValue: 0,
  };

  recentActivities: RecentActivity[] = [];
  topDrivers: Driver[] = [];
  recentUsers: User[] = [];
  systemHealth = {
    usersService: 'healthy',
    driversService: 'healthy',
    ridesService: 'healthy',
    paymentsService: 'healthy',
  };

  // Chart data for revenue trends
  revenueChartData: any[] = [];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private driverService: DriverService,
    private rideService: RideService,
    private paymentService: PaymentService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;

    // Load all data concurrently
    forkJoin({
      users: this.userService.getAllUsers(),
      drivers: this.driverService.getAllDrivers(),
      rides: this.rideService.getAllRides(),
      payments: this.paymentService.getAllPayments(),
    }).subscribe({
      next: (data) => {
        this.processAllData(data);
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.error(
          'Error',
          'Failed to load dashboard data'
        );
      },
    });
  }

  getUserJoinedDate(user: User): Date {
  return new Date(user.createdDate || '');
}

  processAllData(data: any): void {
    const { users, drivers, rides, payments } = data;

    // Process stats
    this.calculateStats(users, drivers, rides, payments);

    // Process recent activities
    this.generateRecentActivities(users, drivers, rides, payments);

    // Get top drivers (by rating and rides)
    this.topDrivers = drivers
      .sort((a: Driver, b: Driver) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5);

    // Get recent users
    this.recentUsers = users
      .filter((user: User) => user.role === UserRole.CUSTOMER)
      .sort(
        (a: User, b: User) =>
          new Date(b.createdDate || 0).getTime() -
          new Date(a.createdDate || 0).getTime()
      )
      .slice(0, 5);

    // Generate revenue chart data (mock monthly data)
    this.generateRevenueChartData(payments);
  }

  calculateStats(
    users: User[],
    drivers: Driver[],
    rides: Ride[],
    payments: Payment[]
  ): void {
    // User stats
    this.stats.totalUsers = users.filter(
      (u) => u.role === UserRole.CUSTOMER
    ).length;
    this.stats.activeUsers = users.filter(
      (u) => u.role === UserRole.CUSTOMER && u.status === UserStatus.ACTIVE
    ).length;

    // Driver stats
    this.stats.totalDrivers = drivers.length;
    this.stats.activeDrivers = drivers.filter(
      (d) => d.status === DriverStatus.ACTIVE
    ).length;

    // Ride stats
    this.stats.totalRides = rides.length;
    this.stats.activeRides = rides.filter(
      (r) =>
        r.status === RideStatus.CONFIRMED || r.status === RideStatus.IN_PROGRESS
    ).length;
    this.stats.completedRides = rides.filter(
      (r) => r.status === RideStatus.COMPLETED
    ).length;

    // Payment/Revenue stats
    const completedPayments = payments.filter(
      (p) => p.status === PaymentStatus.COMPLETED
    );
    this.stats.totalRevenue = completedPayments.reduce(
      (sum, p) => sum + p.amount,
      0
    );

    // Monthly revenue (current month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyPayments = completedPayments.filter((p) => {
      const paymentDate = new Date(p.createdDate || '');
      return (
        paymentDate.getMonth() === currentMonth &&
        paymentDate.getFullYear() === currentYear
      );
    });
    this.stats.monthlyRevenue = monthlyPayments.reduce(
      (sum, p) => sum + p.amount,
      0
    );

    // Average ride value
    if (completedPayments.length > 0) {
      this.stats.averageRideValue =
        this.stats.totalRevenue / completedPayments.length;
    }
  }

  generateRecentActivities(
    users: User[],
    drivers: Driver[],
    rides: Ride[],
    payments: Payment[]
  ): void {
    const activities: RecentActivity[] = [];

    // Recent users
    const recentNewUsers = users
      .filter((u) => u.role === UserRole.CUSTOMER)
      .sort(
        (a, b) =>
          new Date(b.createdDate || 0).getTime() -
          new Date(a.createdDate || 0).getTime()
      )
      .slice(0, 3);

    recentNewUsers.forEach((user) => {
      activities.push({
        id: `user-${user.id}`,
        type: 'user',
        title: 'New Customer Registered',
        description: `${user.name} joined the platform`,
        timestamp: new Date(user.createdDate || ''),
        status: user.status,
      });
    });

    // Recent drivers
    const recentNewDrivers = drivers
      .sort(
        (a, b) =>
          new Date(b.createdDate || 0).getTime() -
          new Date(a.createdDate || 0).getTime()
      )
      .slice(0, 2);

    recentNewDrivers.forEach((driver) => {
      activities.push({
        id: `driver-${driver.id}`,
        type: 'driver',
        title: 'New Driver Registered',
        description: `${driver.name} joined as a driver`,
        timestamp: new Date(driver.createdDate || ''),
        status: driver.status,
      });
    });

    // Recent rides
    const recentRides = rides
      .sort(
        (a, b) =>
          new Date(b.createdDate || 0).getTime() -
          new Date(a.createdDate || 0).getTime()
      )
      .slice(0, 3);

    recentRides.forEach((ride) => {
      activities.push({
        id: `ride-${ride.id}`,
        type: 'ride',
        title: 'Ride Completed',
        description: `${ride.customerName || 'Customer'} → ${
          ride.destinationLocation
        }`,
        timestamp: new Date(ride.createdDate || ''),
        status: ride.status,
        amount: ride.estimatedFare,
      });
    });

    // Recent payments
    const recentPayments = payments
      .sort(
        (a, b) =>
          new Date(b.createdDate || 0).getTime() -
          new Date(a.createdDate || 0).getTime()
      )
      .slice(0, 3);

    recentPayments.forEach((payment) => {
      activities.push({
        id: `payment-${payment.id}`,
        type: 'payment',
        title: 'Payment Processed',
        description: `Payment via ${payment.paymentMethod}`,
        timestamp: new Date(payment.createdDate || ''),
        status: payment.status,
        amount: payment.amount,
      });
    });

    // Sort all activities by timestamp
    this.recentActivities = activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
  }

  generateRevenueChartData(payments: Payment[]): void {
    // Generate mock monthly revenue data for the last 6 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const completedPayments = payments.filter(
      (p) => p.status === PaymentStatus.COMPLETED
    );

    this.revenueChartData = months.map((month, index) => ({
      name: month,
      value:
        completedPayments.reduce((sum, p) => sum + p.amount, 0) / 6 +
        Math.random() * 5000,
    }));
  }

  // Navigation methods
  navigateToUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  navigateToDrivers(): void {
    this.router.navigate(['/admin/drivers']);
  }

  navigateToRides(): void {
    this.router.navigate(['/admin/rides']);
  }

  // Utility methods
  getActivityIcon(type: string): string {
    const icons = {
      user: '👤',
      driver: '🚗',
      ride: '📍',
      payment: '💳',
    };
    return icons[type as keyof typeof icons] || '📋';
  }

  getStatusColor(status: string): string {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
      case 'COMPLETED':
        return 'var(--success-500)';
      case 'CONFIRMED':
      case 'IN_PROGRESS':
      case 'PROCESSING':
        return 'var(--primary-500)';
      case 'PENDING':
        return 'var(--warning-500)';
      case 'INACTIVE':
      case 'CANCELLED':
      case 'FAILED':
        return 'var(--error-500)';
      default:
        return 'var(--gray-500)';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num);
  }

  getGrowthPercentage(current: number, total: number): number {
    return total > 0 ? Math.round((current / total) * 100) : 0;
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  }
  // Add this method to the AdminDashboardComponent class
  trackByActivityId(index: number, activity: RecentActivity): string {
    return activity.id;
  }
}
