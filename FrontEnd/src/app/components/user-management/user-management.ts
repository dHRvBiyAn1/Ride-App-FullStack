import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import {
  User,
  UserRole,
  UserStatus,
  CreateUserRequest,
  UpdateUserRequest,
} from '../../models/user.model';

interface UserFilter {
  role: string;
  status: string;
  searchTerm: string;
}

@Component({
  selector: 'app-user-management',
  standalone: false,
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.css'],
})
export class UserManagement implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  isLoading = true;

  // Modal states
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedUser: User | null = null;

  // Forms
  createUserForm!: FormGroup;
  editUserForm!: FormGroup;
  filterForm!: FormGroup;

  // Filters
  showFilters = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;

  // Sorting
  sortBy: 'name' | 'email' | 'role' | 'status' | 'createdDate' = 'createdDate';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Enums for templates
  UserRole = UserRole;
  UserStatus = UserStatus;

  // Stats
  stats = {
    total: 0,
    active: 0,
    inactive: 0,
    customers: 0,
    admins: 0,
  };

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadUsers();
  }

  initializeForms(): void {
    // Create User Form
    this.createUserForm = this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(6)]],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      role: [UserRole.CUSTOMER, Validators.required],
    });

    // Edit User Form
    this.editUserForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      status: [UserStatus.ACTIVE, Validators.required],
    });

    // Filter Form
    this.filterForm = this.fb.group({
      role: [''],
      status: [''],
      searchTerm: [''],
    });

    // Subscribe to filter changes
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.calculateStats();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.error('Error', 'Failed to load users');
      },
    });
  }

  calculateStats(): void {
    this.stats.total = this.users.length;
    this.stats.active = this.users.filter(
      (u) => u.status === UserStatus.ACTIVE
    ).length;
    this.stats.inactive = this.users.filter(
      (u) => u.status !== UserStatus.ACTIVE
    ).length;
    this.stats.customers = this.users.filter(
      (u) => u.role === UserRole.CUSTOMER
    ).length;
    this.stats.admins = this.users.filter(
      (u) => u.role === UserRole.ADMIN
    ).length;
  }

  onStatusChange(user: User, event: Event): void {
    const value = (event.target as HTMLSelectElement)?.value as UserStatus;
    this.updateUserStatus(user, value);
  }

  applyFilters(): void {
    const filters = this.filterForm.value as UserFilter;
    let filtered = [...this.users];

    // Filter by role
    if (filters.role) {
      filtered = filtered.filter((user) => user.role === filters.role);
    }

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter((user) => user.status === filters.status);
    }

    // Filter by search term
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm) ||
          user.username.toLowerCase().includes(searchTerm)
      );
    }

    // Sort users
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (this.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'role':
          comparison = a.role.localeCompare(b.role);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'createdDate':
          comparison =
            new Date(a.createdDate || '').getTime() -
            new Date(b.createdDate || '').getTime();
          break;
      }

      return this.sortOrder === 'desc' ? -comparison : comparison;
    });

    this.filteredUsers = filtered;
    this.calculatePagination();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
  }

  getPaginatedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, endIndex);
  }

  // Sorting methods
  setSortBy(field: 'name' | 'email' | 'role' | 'status' | 'createdDate'): void {
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

  // Create User Modal
  openCreateModal(): void {
    this.createUserForm.reset();
    this.createUserForm.patchValue({ role: UserRole.CUSTOMER });
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.createUserForm.reset();
  }

  createUser(): void {
    if (this.createUserForm.valid) {
      const userData: CreateUserRequest = this.createUserForm.value;

      this.userService.createUser(userData).subscribe({
        next: (newUser) => {
          this.users.push(newUser);
          this.calculateStats();
          this.applyFilters();
          this.closeCreateModal();
          this.notificationService.success(
            'Success',
            `User ${newUser.name} created successfully`
          );
        },
        error: (error) => {
          this.notificationService.error('Error', 'Failed to create user');
        },
      });
    } else {
      this.markFormGroupTouched(this.createUserForm);
    }
  }

  // Edit User Modal
  openEditModal(user: User): void {
    this.selectedUser = user;
    this.editUserForm.patchValue({
      name: user.name,
      email: user.email,
      status: user.status,
    });
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedUser = null;
    this.editUserForm.reset();
  }

  updateUser(): void {
    if (this.editUserForm.valid && this.selectedUser?.id) {
      const updateData: UpdateUserRequest = this.editUserForm.value;

      this.userService.updateUser(this.selectedUser.id, updateData).subscribe({
        next: (updatedUser) => {
          const index = this.users.findIndex((u) => u.id === updatedUser.id);
          if (index !== -1) {
            this.users[index] = updatedUser;
            this.calculateStats();
            this.applyFilters();
          }
          this.closeEditModal();
          this.notificationService.success(
            'Success',
            `User ${updatedUser.name} updated successfully`
          );
        },
        error: (error) => {
          this.notificationService.error('Error', 'Failed to update user');
        },
      });
    } else {
      this.markFormGroupTouched(this.editUserForm);
    }
  }

  // Delete User Modal
  openDeleteModal(user: User): void {
    this.selectedUser = user;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedUser = null;
  }

  deleteUser(): void {
    if (this.selectedUser?.id) {
      // Note: In a real app, you'd call userService.deleteUser()
      // For now, we'll just remove from the local array
      this.users = this.users.filter((u) => u.id !== this.selectedUser?.id);
      this.calculateStats();
      this.applyFilters();
      this.closeDeleteModal();
      this.notificationService.success(
        'Success',
        `User ${this.selectedUser.name} deleted successfully`
      );
    }
  }

  // Status update methods
  updateUserStatus(user: User, status: UserStatus): void {
    if (user.id) {
      this.userService.updateUserStatus(user.id, status).subscribe({
        next: (updatedUser) => {
          const index = this.users.findIndex((u) => u.id === updatedUser.id);
          if (index !== -1) {
            this.users[index] = updatedUser;
            this.calculateStats();
            this.applyFilters();
          }
          this.notificationService.success(
            'Success',
            `User status updated to ${status}`
          );
        },
        error: (error) => {
          this.notificationService.error(
            'Error',
            'Failed to update user status'
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
    this.currentPage = 1;
  }

  // Utility methods
  getStatusColor(status: UserStatus): string {
    switch (status) {
      case UserStatus.ACTIVE:
        return 'var(--success-500)';
      case UserStatus.INACTIVE:
        return 'var(--gray-500)';
      case UserStatus.SUSPENDED:
        return 'var(--error-500)';
      default:
        return 'var(--gray-500)';
    }
  }

  getRoleColor(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN:
        return 'var(--warning-500)';
      case UserRole.CUSTOMER:
        return 'var(--primary-500)';
      default:
        return 'var(--gray-500)';
    }
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getTimeAgo(date: Date | string): string {
    const now = new Date();
    const userDate = new Date(date);
    const diffMs = now.getTime() - userDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Today';
  }

  // Form validation helper
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
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
      if (field.errors['minlength']) {
        return `${
          fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
        } must be at least ${
          field.errors['minlength'].requiredLength
        } characters`;
      }
      if (field.errors['maxlength']) {
        return `${
          fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
        } must not exceed ${
          field.errors['maxlength'].requiredLength
        } characters`;
      }
    }
    return '';
  }

  // Export functionality
  exportUsers(): void {
    // In a real app, implement CSV export
    this.notificationService.info(
      'Export',
      'Export functionality coming soon!'
    );
  }

  trackByUserId(index: number, user: User): number | undefined {
    return user.id;
  }
}
