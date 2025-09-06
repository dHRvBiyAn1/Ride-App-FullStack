import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RideService } from '../../../services/ride.service';
import { PaymentService } from '../../../services/payment.service';
import { NotificationService } from '../../../services/notification.service';
import { User } from '../../../models/user.model';
import { Ride, RideStatus } from '../../../models/ride.model';
import { Payment, PaymentStatus } from '../../../models/payment.model';

interface DashboardStats {
  totalRides: number;
  completedRides: number;
  activeRides: number;
  totalSpent: number;
  averageRating: number;
}

@Component({
  selector: 'app-customer-dashboard',
  standalone: false,
  templateUrl: './customer-dashboard.html',
  styleUrls: ['./customer-dashboard.css'],
})
export class CustomerDashboard implements OnInit {
  currentUser: User | null = null;
  isLoading = true;
  stats: DashboardStats = {
    totalRides: 0,
    completedRides: 0,
    activeRides: 0,
    totalSpent: 0,
    averageRating: 0,
  };

  recentRides: Ride[] = [];
  recentPayments: Payment[] = [];
  activeRide: Ride | null = null;

  constructor(
    private authService: AuthService,
    private rideService: RideService,
    private paymentService: PaymentService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.loadDashboardData();
    }
  }

  loadDashboardData(): void {
    if (!this.currentUser?.id) return;

    this.isLoading = true;

    // Load rides
    this.rideService.getCustomerRides(this.currentUser.id).subscribe({
      next: (rides) => {
        this.processRidesData(rides);
        this.loadPaymentsData();
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

  getFirstName(): string {
    return this.currentUser?.name ? this.currentUser.name.split(' ')[0] : '';
  }

  processRidesData(rides: Ride[]): void {
    this.recentRides = rides.slice(0, 5);

    // Find active ride
    this.activeRide =
      rides.find(
        (ride) =>
          ride.status === RideStatus.CONFIRMED ||
          ride.status === RideStatus.IN_PROGRESS
      ) || null;

    // Calculate stats
    this.stats.totalRides = rides.length;
    this.stats.completedRides = rides.filter(
      (ride) => ride.status === RideStatus.COMPLETED
    ).length;
    this.stats.activeRides = rides.filter(
      (ride) =>
        ride.status === RideStatus.CONFIRMED ||
        ride.status === RideStatus.IN_PROGRESS
    ).length;

    // Calculate average rating given by customer
    const ratedRides = rides.filter(
      (ride) => ride.driverRating && ride.driverRating > 0
    );
    if (ratedRides.length > 0) {
      const totalRating = ratedRides.reduce(
        (sum, ride) => sum + (ride.driverRating || 0),
        0
      );
      this.stats.averageRating = Number(
        (totalRating / ratedRides.length).toFixed(1)
      );
    }
  }

  loadPaymentsData(): void {
    if (!this.currentUser?.id) return;

    this.paymentService.getCustomerPayments(this.currentUser.id).subscribe({
      next: (payments) => {
        this.recentPayments = payments.slice(0, 3);

        // Calculate total spent
        const completedPayments = payments.filter(
          (payment) => payment.status === PaymentStatus.COMPLETED
        );
        this.stats.totalSpent = completedPayments.reduce(
          (sum, payment) => sum + payment.amount,
          0
        );

        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.error('Error', 'Failed to load payment data');
      },
    });
  }

  bookNewRide(): void {
    this.router.navigate(['/customer/book-ride']);
  }

  viewAllRides(): void {
    this.router.navigate(['/customer/rides']);
  }

  viewProfile(): void {
    this.router.navigate(['/customer/profile']);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case RideStatus.COMPLETED:
        return 'var(--success-500)';
      case RideStatus.CONFIRMED:
      case RideStatus.IN_PROGRESS:
        return 'var(--primary-500)';
      case RideStatus.CANCELLED:
        return 'var(--error-500)';
      default:
        return 'var(--gray-500)';
    }
  }

  getPaymentStatusColor(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return 'var(--success-500)';
      case PaymentStatus.PENDING:
      case PaymentStatus.PROCESSING:
        return 'var(--warning-500)';
      case PaymentStatus.FAILED:
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

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }
}
