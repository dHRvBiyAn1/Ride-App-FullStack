import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DriverService } from '../../services/driver.service';
import { NotificationService } from '../../services/notification.service';
import {
  Driver,
  DriverStatus,
  CreateDriverRequest,
  UpdateDriverRequest,
  RatingRequest,
} from '../../models/driver.model';

interface DriverFilter {
  status: string;
  minRating: number;
  searchTerm: string;
  location: string;
}

@Component({
  selector: 'app-driver-management',
  standalone: false,
  templateUrl: './driver-management.html',
  styleUrls: ['./driver-management.css'],
})
export class DriverManagement implements OnInit {
  currentYear = new Date().getFullYear();
  drivers: Driver[] = [];
  filteredDrivers: Driver[] = [];
  isLoading = true;

  // Modal states
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  showViewModal = false;
  showLocationModal = false;
  selectedDriver: Driver | null = null;

  // Forms
  createDriverForm!: FormGroup;
  editDriverForm!: FormGroup;
  filterForm!: FormGroup;

  // Filters and view
  showFilters = false;
  viewMode: 'grid' | 'list' = 'grid';

  // Pagination
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 0;

  // Sorting
  sortBy: 'name' | 'rating' | 'status' | 'totalRides' | 'createdDate' =
    'createdDate';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Enums for templates
  DriverStatus = DriverStatus;

  // Stats
  stats = {
    total: 0,
    active: 0,
    busy: 0,
    offline: 0,
    inactive: 0,
    suspended: 0,
    averageRating: 0,
    totalRides: 0,
    onlinePercentage: 0,
  };

  // Mock locations for demo
  availableLocations = [
    'Downtown',
    'Airport',
    'Mall District',
    'Business Center',
    'University Area',
    'Hospital District',
    'Residential North',
    'Residential South',
    'Industrial Zone',
    'Suburban Area',
  ];

  constructor(
    private fb: FormBuilder,
    private driverService: DriverService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadDrivers();
  }

  initializeForms(): void {
    // Create Driver Form
    this.createDriverForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      phone: [
        '',
        [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)],
      ],
      email: ['', [Validators.required, Validators.email]],
      vehicle: this.fb.group({
        model: ['', [Validators.required, Validators.maxLength(50)]],
        plateNumber: ['', [Validators.required, Validators.maxLength(20)]],
        year: [
          '',
          [
            Validators.required,
            Validators.min(1990),
            Validators.max(new Date().getFullYear()),
          ],
        ],
        color: ['', [Validators.required, Validators.maxLength(30)]],
      }),
      location: this.fb.group({
        latitude: [
          0,
          [Validators.required, Validators.min(-90), Validators.max(90)],
        ],
        longitude: [
          0,
          [Validators.required, Validators.min(-180), Validators.max(180)],
        ],
        address: ['', [Validators.required, Validators.maxLength(200)]],
      }),
    });

    // Edit Driver Form
    this.editDriverForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      phone: [
        '',
        [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)],
      ],
      email: ['', [Validators.required, Validators.email]],
      status: [DriverStatus.ACTIVE, Validators.required],
      vehicle: this.fb.group({
        model: ['', [Validators.required, Validators.maxLength(50)]],
        plateNumber: ['', [Validators.required, Validators.maxLength(20)]],
        year: [
          '',
          [
            Validators.required,
            Validators.min(1990),
            Validators.max(new Date().getFullYear()),
          ],
        ],
        color: ['', [Validators.required, Validators.maxLength(30)]],
      }),
      location: this.fb.group({
        latitude: [
          0,
          [Validators.required, Validators.min(-90), Validators.max(90)],
        ],
        longitude: [
          0,
          [Validators.required, Validators.min(-180), Validators.max(180)],
        ],
        address: ['', [Validators.required, Validators.maxLength(200)]],
      }),
    });

    // Filter Form
    this.filterForm = this.fb.group({
      status: [''],
      minRating: [0],
      searchTerm: [''],
      location: [''],
    });

    // Subscribe to filter changes
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadDrivers(): void {
    this.isLoading = true;
    this.driverService.getAllDrivers().subscribe({
      next: (drivers) => {
        this.drivers = drivers;
        this.calculateStats();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.error('Error', 'Failed to load drivers');
      },
    });
  }

  calculateStats(): void {
    this.stats.total = this.drivers.length;
    this.stats.active = this.drivers.filter(
      (d) => d.status === DriverStatus.ACTIVE
    ).length;
    this.stats.busy = this.drivers.filter(
      (d) => d.status === DriverStatus.BUSY
    ).length;
    this.stats.offline = this.drivers.filter(
      (d) => d.status === DriverStatus.OFFLINE
    ).length;
    this.stats.inactive = this.drivers.filter(
      (d) => d.status === DriverStatus.INACTIVE
    ).length;
    this.stats.suspended = this.drivers.filter(
      (d) => d.status === DriverStatus.SUSPENDED
    ).length;
    this.stats.totalRides = this.drivers.reduce(
      (sum, d) => sum + (d.totalRides || 0),
      0
    );

    // Calculate average rating
    const ratedDrivers = this.drivers.filter((d) => d.rating && d.rating > 0);
    if (ratedDrivers.length > 0) {
      this.stats.averageRating = Number(
        (
          ratedDrivers.reduce((sum, d) => sum + (d.rating || 0), 0) /
          ratedDrivers.length
        ).toFixed(2)
      );
    }

    // Calculate online percentage
    const onlineDrivers = this.stats.active + this.stats.busy;
    this.stats.onlinePercentage =
      this.stats.total > 0
        ? Number(((onlineDrivers / this.stats.total) * 100).toFixed(1))
        : 0;
  }

  applyFilters(): void {
    const filters = this.filterForm.value as DriverFilter;
    let filtered = [...this.drivers];

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter((driver) => driver.status === filters.status);
    }

    // Filter by minimum rating
    if (filters.minRating > 0) {
      filtered = filtered.filter(
        (driver) => (driver.rating || 0) >= filters.minRating
      );
    }

    // Filter by location
    if (filters.location) {
      filtered = filtered.filter((driver) =>
        driver.location?.address
          .toLowerCase()
          .includes(filters.location.toLowerCase())
      );
    }

    // Filter by search term
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (driver) =>
          driver.name.toLowerCase().includes(searchTerm) ||
          driver.email.toLowerCase().includes(searchTerm) ||
          driver.phone.includes(searchTerm) ||
          driver.vehicle?.model.toLowerCase().includes(searchTerm) ||
          driver.vehicle?.plateNumber.toLowerCase().includes(searchTerm) ||
          driver.vehicle?.color.toLowerCase().includes(searchTerm)
      );
    }

    // Sort drivers
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (this.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'totalRides':
          comparison = (a.totalRides || 0) - (b.totalRides || 0);
          break;
        case 'createdDate':
          comparison =
            new Date(a.createdDate || '').getTime() -
            new Date(b.createdDate || '').getTime();
          break;
      }

      return this.sortOrder === 'desc' ? -comparison : comparison;
    });

    this.filteredDrivers = filtered;
    this.calculatePagination();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(
      this.filteredDrivers.length / this.itemsPerPage
    );
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
  }

  getPaginatedDrivers(): Driver[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredDrivers.slice(startIndex, endIndex);
  }

  // Sorting methods
  setSortBy(
    field: 'name' | 'rating' | 'status' | 'totalRides' | 'createdDate'
  ): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.applyFilters();
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

  // Create Driver Modal
  openCreateModal(): void {
    this.createDriverForm.reset();
    this.createDriverForm.patchValue({
      vehicle: { year: new Date().getFullYear() },
      location: { latitude: 0, longitude: 0 },
    });
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.createDriverForm.reset();
  }

  createDriver(): void {
    if (this.createDriverForm.valid) {
      const driverData: CreateDriverRequest = this.createDriverForm.value;

      this.driverService.createDriver(driverData).subscribe({
        next: (newDriver) => {
          this.drivers.push(newDriver);
          this.calculateStats();
          this.applyFilters();
          this.closeCreateModal();
          this.notificationService.success(
            'Success',
            `Driver ${newDriver.name} created successfully`
          );
        },
        error: (error) => {
          this.notificationService.error('Error', 'Failed to create driver');
        },
      });
    } else {
      this.markFormGroupTouched(this.createDriverForm);
    }
  }

  // View Driver Modal
  openViewModal(driver: Driver): void {
    this.selectedDriver = driver;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedDriver = null;
  }

  // Edit Driver Modal
  openEditModal(driver: Driver): void {
    this.selectedDriver = driver;
    this.editDriverForm.patchValue({
      name: driver.name,
      phone: driver.phone,
      email: driver.email,
      status: driver.status,
      vehicle: driver.vehicle,
      location: driver.location,
    });
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedDriver = null;
    this.editDriverForm.reset();
  }

  updateDriver(): void {
    if (this.editDriverForm.valid && this.selectedDriver?.id) {
      const updateData: UpdateDriverRequest = this.editDriverForm.value;

      this.driverService
        .updateDriver(this.selectedDriver.id, updateData)
        .subscribe({
          next: (updatedDriver) => {
            const index = this.drivers.findIndex(
              (d) => d.id === updatedDriver.id
            );
            if (index !== -1) {
              this.drivers[index] = updatedDriver;
              this.calculateStats();
              this.applyFilters();
            }
            this.closeEditModal();
            this.notificationService.success(
              'Success',
              `Driver ${updatedDriver.name} updated successfully`
            );
          },
          error: (error) => {
            this.notificationService.error('Error', 'Failed to update driver');
          },
        });
    } else {
      this.markFormGroupTouched(this.editDriverForm);
    }
  }

  // Delete Driver Modal
  openDeleteModal(driver: Driver): void {
    this.selectedDriver = driver;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedDriver = null;
  }

  deleteDriver(): void {
    if (this.selectedDriver?.id) {
      // In a real app, you'd call driverService.deleteDriver()
      this.drivers = this.drivers.filter(
        (d) => d.id !== this.selectedDriver?.id
      );
      this.calculateStats();
      this.applyFilters();
      this.closeDeleteModal();
      this.notificationService.success(
        'Success',
        `Driver ${this.selectedDriver.name} deleted successfully`
      );
    }
  }

  // Location Modal
  openLocationModal(driver: Driver): void {
    this.selectedDriver = driver;
    this.showLocationModal = true;
  }

  closeLocationModal(): void {
    this.showLocationModal = false;
    this.selectedDriver = null;
  }

  // Status update methods
  updateDriverStatus(driver: Driver, status: DriverStatus): void {
    if (driver.id) {
      this.driverService.updateDriverStatus(driver.id, status).subscribe({
        next: (updatedDriver) => {
          const index = this.drivers.findIndex(
            (d) => d.id === updatedDriver.id
          );
          if (index !== -1) {
            this.drivers[index] = updatedDriver;
            this.calculateStats();
            this.applyFilters();
          }
          this.notificationService.success(
            'Success',
            `Driver status updated to ${status}`
          );
        },
        error: (error) => {
          this.notificationService.error(
            'Error',
            'Failed to update driver status'
          );
        },
      });
    }
  }

  // Rating methods
  updateDriverRating(driver: Driver, rating: number): void {
    if (driver.id) {
      const ratingRequest: RatingRequest = {
        rating,
        rideId: 1, // This would come from context in a real app
      };

      this.driverService
        .updateDriverRating(driver.id, ratingRequest)
        .subscribe({
          next: (updatedDriver) => {
            const index = this.drivers.findIndex(
              (d) => d.id === updatedDriver.id
            );
            if (index !== -1) {
              this.drivers[index] = updatedDriver;
              this.calculateStats();
              this.applyFilters();
            }
            this.notificationService.success(
              'Success',
              `Driver rating updated`
            );
          },
          error: (error) => {
            this.notificationService.error(
              'Error',
              'Failed to update driver rating'
            );
          },
        });
    }
  }

  // Filter methods
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.filterForm.patchValue({ minRating: 0 });
    this.currentPage = 1;
  }

  // View methods
  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  // Utility methods
  getStatusColor(status: DriverStatus): string {
    switch (status) {
      case DriverStatus.ACTIVE:
        return 'var(--success-500)';
      case DriverStatus.BUSY:
        return 'var(--warning-500)';
      case DriverStatus.OFFLINE:
        return 'var(--gray-500)';
      case DriverStatus.INACTIVE:
        return 'var(--gray-400)';
      case DriverStatus.SUSPENDED:
        return 'var(--error-500)';
      default:
        return 'var(--gray-500)';
    }
  }

  getStatusIcon(status: DriverStatus): string {
    switch (status) {
      case DriverStatus.ACTIVE:
        return '🟢';
      case DriverStatus.BUSY:
        return '🟡';
      case DriverStatus.OFFLINE:
        return '⚫';
      case DriverStatus.INACTIVE:
        return '⚪';
      case DriverStatus.SUSPENDED:
        return '🔴';
      default:
        return '⚫';
    }
  }

  getRatingStars(rating: number): string[] {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push('★');
      } else if (i === fullStars && hasHalfStar) {
        stars.push('☆');
      } else {
        stars.push('☆');
      }
    }

    return stars;
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatDateTime(date: Date | string): string {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getTimeAgo(date: Date | string): string {
    const now = new Date();
    const driverDate = new Date(date);
    const diffMs = now.getTime() - driverDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  }

  // Form validation helper
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${
          fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
        } is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['pattern']) {
        return 'Please enter a valid phone number';
      }
      if (field.errors['min']) {
        return `Value must be at least ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `Value must not exceed ${field.errors['max'].max}`;
      }
      if (field.errors['maxlength']) {
        return `Maximum ${field.errors['maxlength'].requiredLength} characters allowed`;
      }
    }
    return '';
  }

  // Export functionality
  exportDrivers(): void {
    // In a real app, implement CSV export
    this.notificationService.info(
      'Export',
      'Export functionality coming soon!'
    );
  }

  // Bulk operations
  bulkStatusUpdate(status: DriverStatus): void {
    // In a real app, implement bulk status update
    this.notificationService.info(
      'Bulk Update',
      'Bulk operations coming soon!'
    );
  }

  onBulkStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement)?.value as DriverStatus;
    if (value) {
      this.bulkStatusUpdate(value);
      (event.target as HTMLSelectElement).value = '';
    }
  }

  onStatusChange(driver: Driver, event: Event): void {
    const value = (event.target as HTMLSelectElement)?.value as DriverStatus;
    this.updateDriverStatus(driver, value);
  }

  trackByDriverId(index: number, driver: Driver): number | undefined {
    return driver.id;
  }
}
