import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import {
  User,
  UserRole,
  UserStatus,
  UpdateUserRequest,
} from '../../models/user.model';

interface ProfileStats {
  totalRides: number;
  totalSpent: number;
  memberSince: string;
  averageRating: number;
  savedAddresses: number;
  paymentMethods: number;
}

interface ActivityLog {
  id: string;
  action: string;
  description: string;
  timestamp: Date;
  ipAddress?: string;
  device?: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  promotionalEmails: boolean;
  rideUpdates: boolean;
  paymentNotifications: boolean;
  securityAlerts: boolean;
}

interface PrivacySettings {
  shareLocationHistory: boolean;
  shareRideHistory: boolean;
  allowDataCollection: boolean;
  shareProfileWithDrivers: boolean;
  enableLocationTracking: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class Profile implements OnInit {
  currentUser: User | null = null;
  isLoading = true;

  // Modal states
  showEditProfileModal = false;
  showChangePasswordModal = false;
  showDeleteAccountModal = false;
  showProfilePictureModal = false;

  // Forms
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  notificationForm!: FormGroup;
  privacyForm!: FormGroup;

  // Profile data
  profileStats: ProfileStats = {
    totalRides: 0,
    totalSpent: 0,
    memberSince: '',
    averageRating: 0,
    savedAddresses: 0,
    paymentMethods: 0,
  };

  recentActivity: ActivityLog[] = [];

  // Settings
  notificationSettings: NotificationSettings = {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    promotionalEmails: false,
    rideUpdates: true,
    paymentNotifications: true,
    securityAlerts: true,
  };

  privacySettings: PrivacySettings = {
    shareLocationHistory: false,
    shareRideHistory: false,
    allowDataCollection: true,
    shareProfileWithDrivers: true,
    enableLocationTracking: true,
  };

  // Profile picture
  selectedProfilePicture: File | null = null;
  profilePicturePreview: string | null = null;
  isUploadingPicture = false;

  // Processing states
  isUpdatingProfile = false;
  isChangingPassword = false;
  isDeletingAccount = false;
  isSavingSettings = false;

  // Active tab
  activeTab: 'profile' | 'security' | 'notifications' | 'privacy' | 'activity' =
    'profile';

  // Enums for templates
  UserRole = UserRole;
  UserStatus = UserStatus;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.initializeForms();
    this.loadProfileData();
  }

  initializeForms(): void {
    // Profile form
    this.profileForm = this.fb.group({
      name: [
        this.currentUser?.name || '',
        [Validators.required, Validators.maxLength(100)],
      ],
      email: [
        this.currentUser?.email || '',
        [Validators.required, Validators.email],
      ],
      dateOfBirth: [this.currentUser?.dateOfBirth || ''],
      gender: [this.currentUser?.gender || ''],
      address: [this.currentUser?.address || '', Validators.maxLength(200)],
      bio: [this.currentUser?.bio || '', Validators.maxLength(500)],
    });

    // Password form
    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      {
        validator: this.passwordMatchValidator,
      }
    );

    // Notification settings form
    this.notificationForm = this.fb.group({
      emailNotifications: [this.notificationSettings.emailNotifications],
      pushNotifications: [this.notificationSettings.pushNotifications],
      smsNotifications: [this.notificationSettings.smsNotifications],
      promotionalEmails: [this.notificationSettings.promotionalEmails],
      rideUpdates: [this.notificationSettings.rideUpdates],
      paymentNotifications: [this.notificationSettings.paymentNotifications],
      securityAlerts: [this.notificationSettings.securityAlerts],
    });

    // Privacy settings form
    this.privacyForm = this.fb.group({
      shareLocationHistory: [this.privacySettings.shareLocationHistory],
      shareRideHistory: [this.privacySettings.shareRideHistory],
      allowDataCollection: [this.privacySettings.allowDataCollection],
      shareProfileWithDrivers: [this.privacySettings.shareProfileWithDrivers],
      enableLocationTracking: [this.privacySettings.enableLocationTracking],
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (
      newPassword &&
      confirmPassword &&
      newPassword.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else if (confirmPassword?.hasError('passwordMismatch')) {
      delete confirmPassword.errors!['passwordMismatch'];
      if (Object.keys(confirmPassword.errors!).length === 0) {
        confirmPassword.setErrors(null);
      }
    }
    return null;
  }

  getLastChangedDate(): Date {
    return new Date(
      this.currentUser?.updatedDate ||
        this.currentUser?.createdDate ||
        Date.now()
    );
  }

  loadProfileData(): void {
    this.isLoading = true;

    // Mock profile stats - in real app, fetch from backend
    this.profileStats = {
      totalRides: 24,
      totalSpent: 487.5,
      memberSince: this.formatDate(this.currentUser?.createdDate || new Date()),
      averageRating: 4.8,
      savedAddresses: 3,
      paymentMethods: 2,
    };

    // Mock recent activity
    this.recentActivity = [
      {
        id: '1',
        action: 'Profile Updated',
        description: 'Updated profile information',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        ipAddress: '192.168.1.1',
        device: 'Chrome on Windows',
      },
      {
        id: '2',
        action: 'Password Changed',
        description: 'Successfully changed account password',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        ipAddress: '192.168.1.1',
        device: 'Safari on iPhone',
      },
      {
        id: '3',
        action: 'Login',
        description: 'Logged into account',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        ipAddress: '10.0.0.1',
        device: 'Chrome on Android',
      },
      {
        id: '4',
        action: 'Payment Method Added',
        description: 'Added new credit card ending in 4242',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        ipAddress: '192.168.1.1',
        device: 'Chrome on Windows',
      },
    ];

    this.isLoading = false;
  }

  // Tab navigation
  setActiveTab(
    tab: 'profile' | 'security' | 'notifications' | 'privacy' | 'activity'
  ): void {
    this.activeTab = tab;
  }

  // Profile editing modal
  openEditProfileModal(): void {
    this.profileForm.patchValue({
      name: this.currentUser?.name || '',
      email: this.currentUser?.email || '',
      dateOfBirth: this.currentUser?.dateOfBirth || '',
      gender: this.currentUser?.gender || '',
      address: this.currentUser?.address || '',
      bio: this.currentUser?.bio || '',
    });
    this.showEditProfileModal = true;
  }

  closeEditProfileModal(): void {
    this.showEditProfileModal = false;
    this.profileForm.reset();
  }

  updateProfile(): void {
    if (this.profileForm.valid && this.currentUser?.id) {
      this.isUpdatingProfile = true;

      const updateData: UpdateUserRequest = {
        name: this.profileForm.get('name')?.value,
        email: this.profileForm.get('email')?.value,
        dateOfBirth: this.profileForm.get('dateOfBirth')?.value,
        gender: this.profileForm.get('gender')?.value,
        address: this.profileForm.get('address')?.value,
        bio: this.profileForm.get('bio')?.value,
      };

      this.userService.updateUser(this.currentUser.id, updateData).subscribe({
        next: (updatedUser) => {
          this.currentUser = updatedUser;
          this.authService.updateCurrentUser(updatedUser);
          this.isUpdatingProfile = false;
          this.closeEditProfileModal();
          this.notificationService.success(
            'Success',
            'Profile updated successfully'
          );
        },
        error: () => {
          this.isUpdatingProfile = false;
          this.notificationService.error('Error', 'Failed to update profile');
        },
      });
    } else {
      this.markFormGroupTouched(this.profileForm);
    }
  }

  // Password change modal
  openChangePasswordModal(): void {
    this.passwordForm.reset();
    this.showChangePasswordModal = true;
  }

  closeChangePasswordModal(): void {
    this.showChangePasswordModal = false;
    this.passwordForm.reset();
  }

  changePassword(): void {
    if (this.passwordForm.valid && this.currentUser?.id) {
      this.isChangingPassword = true;

      const passwordData = {
        currentPassword: this.passwordForm.get('currentPassword')?.value,
        newPassword: this.passwordForm.get('newPassword')?.value,
      };

      // In real app, call userService.changePassword()
      setTimeout(() => {
        this.isChangingPassword = false;
        this.closeChangePasswordModal();
        this.notificationService.success(
          'Success',
          'Password changed successfully'
        );

        // Add to activity log
        this.recentActivity.unshift({
          id: Date.now().toString(),
          action: 'Password Changed',
          description: 'Successfully changed account password',
          timestamp: new Date(),
          ipAddress: '192.168.1.1',
          device: 'Current Device',
        });
      }, 2000);
    } else {
      this.markFormGroupTouched(this.passwordForm);
    }
  }

  // Profile picture modal
  openProfilePictureModal(): void {
    this.selectedProfilePicture = null;
    this.profilePicturePreview = null;
    this.showProfilePictureModal = true;
  }

  closeProfilePictureModal(): void {
    this.showProfilePictureModal = false;
    this.selectedProfilePicture = null;
    this.profilePicturePreview = null;
  }

  onProfilePictureSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.notificationService.error(
          'Invalid File',
          'Please select an image file'
        );
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        this.notificationService.error(
          'File Too Large',
          'Please select an image smaller than 5MB'
        );
        return;
      }

      this.selectedProfilePicture = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profilePicturePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadProfilePicture(): void {
    if (this.selectedProfilePicture && this.currentUser?.id) {
      this.isUploadingPicture = true;

      // In real app, upload to server
      setTimeout(() => {
        // Mock successful upload
        if (this.currentUser && this.profilePicturePreview) {
          this.currentUser.profilePicture = this.profilePicturePreview;
          this.authService.updateCurrentUser(this.currentUser);
        }

        this.isUploadingPicture = false;
        this.closeProfilePictureModal();
        this.notificationService.success(
          'Success',
          'Profile picture updated successfully'
        );
      }, 2000);
    }
  }

  removeProfilePicture(): void {
    if (this.currentUser) {
      this.currentUser.profilePicture = undefined;
      this.authService.updateCurrentUser(this.currentUser);
      this.notificationService.success(
        'Success',
        'Profile picture removed successfully'
      );
    }
  }

  // Account deletion modal
  openDeleteAccountModal(): void {
    this.showDeleteAccountModal = true;
  }

  closeDeleteAccountModal(): void {
    this.showDeleteAccountModal = false;
  }

  deleteAccount(): void {
    if (this.currentUser?.id) {
      this.isDeletingAccount = true;

      // In real app, call userService.deleteAccount()
      setTimeout(() => {
        this.isDeletingAccount = false;
        this.closeDeleteAccountModal();
        this.notificationService.success(
          'Account Deleted',
          'Your account has been permanently deleted'
        );
        this.authService.logout();
        this.router.navigate(['/']);
      }, 3000);
    }
  }

  // Settings save methods
  saveNotificationSettings(): void {
    this.isSavingSettings = true;
    this.notificationSettings = { ...this.notificationForm.value };

    // In real app, save to backend
    setTimeout(() => {
      this.isSavingSettings = false;
      this.notificationService.success(
        'Success',
        'Notification settings saved'
      );
    }, 1000);
  }

  savePrivacySettings(): void {
    this.isSavingSettings = true;
    this.privacySettings = { ...this.privacyForm.value };

    // In real app, save to backend
    setTimeout(() => {
      this.isSavingSettings = false;
      this.notificationService.success('Success', 'Privacy settings saved');
    }, 1000);
  }

  // Download user data
  downloadUserData(): void {
    // Mock data export
    const userData = {
      profile: this.currentUser,
      stats: this.profileStats,
      activity: this.recentActivity,
      settings: {
        notifications: this.notificationSettings,
        privacy: this.privacySettings,
      },
    };

    const blob = new Blob([JSON.stringify(userData, null, 2)], {
      type: 'application/json',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-data-${Date.now()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    this.notificationService.success(
      'Download Started',
      'Your user data is being downloaded'
    );
  }

  // Two-factor authentication
  enableTwoFactor(): void {
    this.notificationService.info(
      'Coming Soon',
      '2FA setup will be available soon'
    );
  }

  disableTwoFactor(): void {
    this.notificationService.info(
      'Coming Soon',
      '2FA management will be available soon'
    );
  }

  // Utility methods
  getInitials(): string {
    if (!this.currentUser?.name) return 'U';
    return this.currentUser.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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
    const activityDate = new Date(date);
    const diffMs = now.getTime() - activityDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
      if (field.errors['pattern']) {
        return 'Please enter a valid format';
      }
      if (field.errors['minlength']) {
        return `Minimum ${field.errors['minlength'].requiredLength} characters required`;
      }
      if (field.errors['maxlength']) {
        return `Maximum ${field.errors['maxlength'].requiredLength} characters allowed`;
      }
      if (field.errors['passwordMismatch']) {
        return 'Passwords do not match';
      }
    }
    return '';
  }

  // Logout
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
