import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RideService } from '../../services/ride.service';
import { NotificationService } from '../../services/notification.service';
import { User, UserRole } from '../../models/user.model';
import {
  Ride,
  RideStatus,
  RideType,
  RateDriverRequest,
} from '../../models/ride.model';

interface RideFilter {
  status: string;
  rideType: string;
  dateFrom: string;
  dateTo: string;
  searchTerm: string;
}

@Component({
  selector: 'app-ride-history',
  standalone: false,
  templateUrl: './ride-history.html',
  styleUrls: ['./ride-history.css'],
})
export class RideHistory implements OnInit {
  currentUser: User | null = null;
  rides: Ride[] = [];
  filteredRides: Ride[] = [];
  isLoading = true;

  // Filter form
  filterForm!: FormGroup;
  showFilters = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;

  // Enums for templates
  RideStatus = RideStatus;
  RideType = RideType;
  UserRole = UserRole;

  // Modal states
  showRatingModal = false;
  selectedRideForRating: Ride | null = null;
  ratingValue = 5;

  // View options
  viewMode: 'list' | 'grid' = 'list';
  sortBy: 'date' | 'fare' | 'status' = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private rideService: RideService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.initializeFilterForm();
    this.loadRides();
  }

  initializeFilterForm(): void {
    this.filterForm = this.fb.group({
      status: [''],
      rideType: [''],
      dateFrom: [''],
      dateTo: [''],
      searchTerm: [''],
    });

    // Subscribe to form changes for real-time filtering
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadRides(): void {
    this.isLoading = true;

    if (this.isAdmin()) {
      this.rideService.getAllRides().subscribe({
        next: (rides) => {
          this.rides = rides;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.notificationService.error('Error', 'Failed to load rides');
        },
      });
    } else if (this.currentUser?.id) {
      this.rideService.getCustomerRides(this.currentUser.id).subscribe({
        next: (rides) => {
          this.rides = rides;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.notificationService.error('Error', 'Failed to load rides');
        },
      });
    }
  }

  applyFilters(): void {
    const filters = this.filterForm.value as RideFilter;
    let filtered = [...this.rides];

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter((ride) => ride.status === filters.status);
    }

    // Filter by ride type
    if (filters.rideType) {
      filtered = filtered.filter((ride) => ride.rideType === filters.rideType);
    }

    // Filter by date range
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(
        (ride) => new Date(ride.createdDate || '') >= fromDate
      );
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (ride) => new Date(ride.createdDate || '') <= toDate
      );
    }

    // Filter by search term
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (ride) =>
          ride.pickupLocation.toLowerCase().includes(searchTerm) ||
          ride.destinationLocation.toLowerCase().includes(searchTerm) ||
          ride.customerName?.toLowerCase().includes(searchTerm) ||
          ride.driverName?.toLowerCase().includes(searchTerm)
      );
    }

    // Sort rides
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (this.sortBy) {
        case 'date':
          comparison =
            new Date(a.createdDate || '').getTime() -
            new Date(b.createdDate || '').getTime();
          break;
        case 'fare':
          comparison = (a.estimatedFare || 0) - (b.estimatedFare || 0);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return this.sortOrder === 'desc' ? -comparison : comparison;
    });

    this.filteredRides = filtered;
    this.calculatePagination();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredRides.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
  }

  getPaginatedRides(): Ride[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredRides.slice(startIndex, endIndex);
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  // Sorting methods
  setSortBy(field: 'date' | 'fare' | 'status'): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'desc';
    }
    this.applyFilters();
  }

  // Rating methods
  openRatingModal(ride: Ride): void {
    this.selectedRideForRating = ride;
    this.ratingValue = 5;
    this.showRatingModal = true;
  }

  closeRatingModal(): void {
    this.showRatingModal = false;
    this.selectedRideForRating = null;
  }

  submitRating(): void {
    if (!this.selectedRideForRating?.id) return;

    const ratingRequest: RateDriverRequest = {
      rating: this.ratingValue,
    };

    this.rideService
      .rateDriver(this.selectedRideForRating.id, ratingRequest)
      .subscribe({
        next: (updatedRide) => {
          // Update the ride in the list
          const index = this.rides.findIndex((r) => r.id === updatedRide.id);
          if (index !== -1) {
            this.rides[index] = updatedRide;
            this.applyFilters();
          }

          this.notificationService.success(
            'Rating Submitted',
            'Thank you for rating your driver!'
          );
          this.closeRatingModal();
        },
        error: (error) => {
          this.notificationService.error('Error', 'Failed to submit rating');
        },
      });
  }

  // Filter methods
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.currentPage = 1;
  }

  // View methods
  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'list' ? 'grid' : 'list';
  }

  // Utility methods
  isAdmin(): boolean {
    return this.currentUser?.role === UserRole.ADMIN;
  }

  canRateRide(ride: Ride): boolean {
    return (
      ride.status === RideStatus.COMPLETED &&
      !ride.driverRating &&
      !this.isAdmin()
    );
  }

  getStatusColor(status: RideStatus): string {
    switch (status) {
      case RideStatus.COMPLETED:
        return 'var(--success-500)';
      case RideStatus.CONFIRMED:
      case RideStatus.IN_PROGRESS:
        return 'var(--primary-500)';
      case RideStatus.CANCELLED:
        return 'var(--error-500)';
      case RideStatus.REQUESTED:
        return 'var(--warning-500)';
      default:
        return 'var(--gray-500)';
    }
  }

  getRideTypeIcon(rideType: RideType): string {
    switch (rideType) {
      case RideType.ECONOMY:
        return '🚗';
      case RideType.PREMIUM:
        return '🚙';
      case RideType.LUXURY:
        return '🚖';
      default:
        return '🚗';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getTimeAgo(date: Date | string): string {
    const now = new Date();
    const rideDate = new Date(date);
    const diffMs = now.getTime() - rideDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  }

  exportRides(): void {
    // In a real app, implement CSV export
    this.notificationService.info(
      'Export',
      'Export functionality coming soon!'
    );
  }
  // Add this method to RideHistoryComponent
  trackByRideId(index: number, ride: Ride): number | undefined {
    return ride.id;
  }
}
