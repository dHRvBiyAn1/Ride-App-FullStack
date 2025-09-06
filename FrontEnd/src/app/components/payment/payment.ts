import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { RideService } from '../../services/ride.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { User, UserRole } from '../../models/user.model';
import { Ride } from '../../models/ride.model';
import { 
  Payment, 
  PaymentMethod, 
  PaymentStatus, 
  PaymentRequest, 
  FareCalculationRequest,
  FareCalculationResponse 
} from '../../models/payment.model';

interface PaymentFilter {
  status: string;
  method: string;
  dateFrom: string;
  dateTo: string;
  searchTerm: string;
}

interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  averageAmount: number;
  monthlyRevenue: number;
  successRate: number;
}

interface SavedPaymentMethod {
  id: string;
  type: PaymentMethod;
  displayName: string;
  lastFour?: string;
  expiryDate?: string;
  isDefault: boolean;
}

@Component({
  selector: 'app-payment',
  standalone: false,
  templateUrl: './payment.html',
  styleUrls: ['./payment.css']
})
export class PaymentComponent implements OnInit {
  currentUser: User | null = null;
  payments: Payment[] = [];
  filteredPayments: Payment[] = [];
  isLoading = true;
  
  // Current ride context (if processing payment for specific ride)
  currentRide: Ride | null = null;
  fareEstimate: FareCalculationResponse | null = null;
  rideId: number | null = null;
  
  // Modal states
  showProcessPaymentModal = false;
  showAddPaymentMethodModal = false;
  showPaymentDetailsModal = false;
  showRefundModal = false;
  selectedPayment: Payment | null = null;
  
  // Forms
  paymentForm!: FormGroup;
  cardForm!: FormGroup;
  filterForm!: FormGroup;
  refundForm!: FormGroup;
  
  // Saved payment methods
  savedPaymentMethods: SavedPaymentMethod[] = [];
  selectedPaymentMethod: SavedPaymentMethod | null = null;
  
  // Processing states
  isProcessingPayment = false;
  isAddingPaymentMethod = false;
  isProcessingRefund = false;
  
  // Filters and view
  showFilters = false;
  viewMode: 'grid' | 'list' = 'list';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  
  // Sorting
  sortBy: 'createdDate' | 'amount' | 'status' | 'method' = 'createdDate';
  sortOrder: 'asc' | 'desc' = 'desc';
  
  // Stats
  stats: PaymentStats = {
    totalPayments: 0,
    totalAmount: 0,
    completedPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
    averageAmount: 0,
    monthlyRevenue: 0,
    successRate: 0
  };
  
  // Enums for templates
  PaymentMethod = PaymentMethod;
  PaymentStatus = PaymentStatus;
  UserRole = UserRole;
  
  // Payment method configurations
  paymentMethodConfig = {
    [PaymentMethod.CREDIT_CARD]: {
      name: 'Credit Card',
      icon: '💳',
      description: 'Visa, MasterCard, American Express'
    },
    [PaymentMethod.DEBIT_CARD]: {
      name: 'Debit Card',
      icon: '💳',
      description: 'Direct bank debit'
    },
    [PaymentMethod.DIGITAL_WALLET]: {
      name: 'Digital Wallet',
      icon: '📱',
      description: 'PayPal, Apple Pay, Google Pay'
    },
    [PaymentMethod.UPI]: {
      name: 'UPI',
      icon: '📲',
      description: 'UPI payments'
    },
    [PaymentMethod.CASH]: {
      name: 'Cash',
      icon: '💵',
      description: 'Pay with cash'
    }
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private rideService: RideService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.initializeForms();
    this.loadPaymentMethods();
    
    // Check if payment is for specific ride
    this.route.queryParams.subscribe(params => {
      if (params['rideId']) {
        this.rideId = +params['rideId'];
        this.loadRideForPayment();
      } else {
        this.loadPayments();
      }
    });
  }

  initializeForms(): void {
    // Payment processing form
    this.paymentForm = this.fb.group({
      paymentMethod: [PaymentMethod.CREDIT_CARD, Validators.required],
      useExistingMethod: [false],
      existingMethodId: [''],
      cardToken: ['']
    });

    // Card details form
    this.cardForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      expiryMonth: ['', [Validators.required, Validators.min(1), Validators.max(12)]],
      expiryYear: ['', [Validators.required, Validators.min(new Date().getFullYear())]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      cardholderName: ['', Validators.required],
      saveMethod: [false]
    });

    // Filter form
    this.filterForm = this.fb.group({
      status: [''],
      method: [''],
      dateFrom: [''],
      dateTo: [''],
      searchTerm: ['']
    });

    // Refund form
    this.refundForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      reason: ['', Validators.required]
    });

    // Subscribe to form changes
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    this.paymentForm.get('useExistingMethod')?.valueChanges.subscribe(useExisting => {
      const existingMethodControl = this.paymentForm.get('existingMethodId');
      if (useExisting) {
        existingMethodControl?.setValidators([Validators.required]);
      } else {
        existingMethodControl?.clearValidators();
      }
      existingMethodControl?.updateValueAndValidity();
    });
  }

  loadRideForPayment(): void {
    if (!this.rideId) return;
    
    this.rideService.getRideById(this.rideId).subscribe({
      next: (ride) => {
        this.currentRide = ride;
        if (ride.estimatedFare) {
          this.fareEstimate = {
            estimatedFare: ride.estimatedFare,
            distance: ride.distance || 0,
            estimatedDuration: ride.estimatedDuration || 0,
            baseFare: 5.0, // Mock base fare
            pricePerMile: 2.0, // Mock price per mile
            rideType: ride.rideType
          };
        }
        this.loadPayments();
      },
      error: () => {
        this.notificationService.error('Error', 'Failed to load ride details');
        this.loadPayments();
      }
    });
  }

  loadPayments(): void {
    this.isLoading = true;
    
    if (this.isAdmin()) {
      this.paymentService.getAllPayments().subscribe({
        next: (payments) => {
          this.payments = payments;
          this.calculateStats();
          this.applyFilters();
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.notificationService.error('Error', 'Failed to load payments');
        }
      });
    } else if (this.currentUser?.id) {
      this.paymentService.getCustomerPayments(this.currentUser.id).subscribe({
        next: (payments) => {
          this.payments = payments;
          this.calculateStats();
          this.applyFilters();
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.notificationService.error('Error', 'Failed to load payments');
        }
      });
    }
  }

  loadPaymentMethods(): void {
    // Mock saved payment methods - in real app, load from backend
    this.savedPaymentMethods = [
      {
        id: '1',
        type: PaymentMethod.CREDIT_CARD,
        displayName: 'Visa ending in 4242',
        lastFour: '4242',
        expiryDate: '12/25',
        isDefault: true
      },
      {
        id: '2',
        type: PaymentMethod.DIGITAL_WALLET,
        displayName: 'PayPal Account',
        isDefault: false
      }
    ];
  }

  calculateStats(): void {
    this.stats.totalPayments = this.payments.length;
    this.stats.totalAmount = this.payments.reduce((sum, p) => sum + p.amount, 0);
    this.stats.completedPayments = this.payments.filter(p => p.status === PaymentStatus.COMPLETED).length;
    this.stats.pendingPayments = this.payments.filter(p => 
      p.status === PaymentStatus.PENDING || p.status === PaymentStatus.PROCESSING
    ).length;
    this.stats.failedPayments = this.payments.filter(p => p.status === PaymentStatus.FAILED).length;
    
    this.stats.averageAmount = this.stats.totalPayments > 0 ? 
      this.stats.totalAmount / this.stats.totalPayments : 0;
    
    this.stats.successRate = this.stats.totalPayments > 0 ? 
      (this.stats.completedPayments / this.stats.totalPayments) * 100 : 0;
    
    // Calculate monthly revenue (current month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyPayments = this.payments.filter(p => {
      const paymentDate = new Date(p.createdDate || '');
      return paymentDate.getMonth() === currentMonth && 
             paymentDate.getFullYear() === currentYear &&
             p.status === PaymentStatus.COMPLETED;
    });
    this.stats.monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
  }

  applyFilters(): void {
    const filters = this.filterForm.value as PaymentFilter;
    let filtered = [...this.payments];

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(payment => payment.status === filters.status);
    }

    // Filter by payment method
    if (filters.method) {
      filtered = filtered.filter(payment => payment.paymentMethod === filters.method);
    }

    // Filter by date range
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(payment => 
        new Date(payment.createdDate || '') >= fromDate
      );
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(payment => 
        new Date(payment.createdDate || '') <= toDate
      );
    }

    // Filter by search term
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(payment =>
        payment.transactionId?.toLowerCase().includes(searchTerm) ||
        payment.paymentMethod.toLowerCase().includes(searchTerm) ||
        payment.amount.toString().includes(searchTerm)
      );
    }

    // Sort payments
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortBy) {
        case 'createdDate':
          comparison = new Date(a.createdDate || '').getTime() - new Date(b.createdDate || '').getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'method':
          comparison = a.paymentMethod.localeCompare(b.paymentMethod);
          break;
      }
      
      return this.sortOrder === 'desc' ? -comparison : comparison;
    });

    this.filteredPayments = filtered;
    this.calculatePagination();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredPayments.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
  }

  getPaginatedPayments(): Payment[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredPayments.slice(startIndex, endIndex);
  }

  // Sorting methods
  setSortBy(field: 'createdDate' | 'amount' | 'status' | 'method'): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'desc';
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

  // Payment processing modal
  openProcessPaymentModal(): void {
    if (!this.currentRide || !this.fareEstimate) {
      this.notificationService.error('Error', 'No ride selected for payment');
      return;
    }
    this.paymentForm.reset();
    this.paymentForm.patchValue({ paymentMethod: PaymentMethod.CREDIT_CARD });
    this.showProcessPaymentModal = true;
  }

  closeProcessPaymentModal(): void {
    this.showProcessPaymentModal = false;
    this.paymentForm.reset();
    this.cardForm.reset();
  }

  // Add payment method modal
  openAddPaymentMethodModal(): void {
    this.cardForm.reset();
    this.showAddPaymentMethodModal = true;
  }

  closeAddPaymentMethodModal(): void {
    this.showAddPaymentMethodModal = false;
    this.cardForm.reset();
  }

  // Payment details modal
  openPaymentDetailsModal(payment: Payment): void {
    this.selectedPayment = payment;
    this.showPaymentDetailsModal = true;
  }

  closePaymentDetailsModal(): void {
    this.showPaymentDetailsModal = false;
    this.selectedPayment = null;
  }

  // Refund modal
  openRefundModal(payment: Payment): void {
    this.selectedPayment = payment;
    this.refundForm.patchValue({
      amount: payment.amount,
      reason: ''
    });
    this.showRefundModal = true;
  }

  closeRefundModal(): void {
    this.showRefundModal = false;
    this.selectedPayment = null;
    this.refundForm.reset();
  }

  // Process payment
  processPayment(): void {
    if (!this.paymentForm.valid || !this.currentUser?.id || !this.currentRide?.id || !this.fareEstimate) {
      this.markFormGroupTouched(this.paymentForm);
      return;
    }

    const useExisting = this.paymentForm.get('useExistingMethod')?.value;
    
    if (!useExisting && !this.cardForm.valid) {
      this.markFormGroupTouched(this.cardForm);
      return;
    }

    this.isProcessingPayment = true;
    
    const paymentRequest: PaymentRequest = {
      customerId: this.currentUser.id,
      rideId: this.currentRide.id,
      amount: this.fareEstimate.estimatedFare,
      paymentMethod: this.paymentForm.get('paymentMethod')?.value,
      cardToken: useExisting ? 
        this.paymentForm.get('existingMethodId')?.value : 
        this.generateCardToken()
    };

    this.paymentService.processPayment(paymentRequest).subscribe({
      next: (response) => {
        this.isProcessingPayment = false;
        this.notificationService.success('Payment Successful', 'Your payment has been processed');
        this.closeProcessPaymentModal();
        
        // Save payment method if requested
        if (!useExisting && this.cardForm.get('saveMethod')?.value) {
          this.savePaymentMethod();
        }
        
        // Redirect back to ride history or dashboard
        this.router.navigate(['/customer/rides']);
      },
      error: () => {
        this.isProcessingPayment = false;
        this.notificationService.error('Payment Failed', 'Unable to process payment. Please try again.');
      }
    });
  }

  // Add payment method
  addPaymentMethod(): void {
    if (!this.cardForm.valid) {
      this.markFormGroupTouched(this.cardForm);
      return;
    }

    this.isAddingPaymentMethod = true;
    
    // In real app, securely tokenize card details
    setTimeout(() => {
      const newMethod: SavedPaymentMethod = {
        id: Date.now().toString(),
        type: PaymentMethod.CREDIT_CARD,
        displayName: `${this.getCardType()} ending in ${this.cardForm.get('cardNumber')?.value.slice(-4)}`,
        lastFour: this.cardForm.get('cardNumber')?.value.slice(-4),
        expiryDate: `${this.cardForm.get('expiryMonth')?.value}/${this.cardForm.get('expiryYear')?.value.toString().slice(-2)}`,
        isDefault: this.savedPaymentMethods.length === 0
      };
      
      this.savedPaymentMethods.push(newMethod);
      this.isAddingPaymentMethod = false;
      this.closeAddPaymentMethodModal();
      this.notificationService.success('Success', 'Payment method added successfully');
    }, 2000);
  }

  // Process refund
  processRefund(): void {
    if (!this.refundForm.valid || !this.selectedPayment) {
      this.markFormGroupTouched(this.refundForm);
      return;
    }

    this.isProcessingRefund = true;
    
    // In real app, call refund API
    setTimeout(() => {
      const refundAmount = this.refundForm.get('amount')?.value;
      const reason = this.refundForm.get('reason')?.value;
      
      // Update payment status to refunded
      const paymentIndex = this.payments.findIndex(p => p.id === this.selectedPayment?.id);
      if (paymentIndex !== -1) {
        this.payments[paymentIndex].status = PaymentStatus.REFUNDED;
        this.calculateStats();
        this.applyFilters();
      }
      
      this.isProcessingRefund = false;
      this.closeRefundModal();
      this.notificationService.success('Refund Processed', `Refund of ${this.formatCurrency(refundAmount)} has been initiated`);
    }, 2000);
  }

  // Helper methods
  savePaymentMethod(): void {
    const cardNumber = this.cardForm.get('cardNumber')?.value;
    const newMethod: SavedPaymentMethod = {
      id: Date.now().toString(),
      type: PaymentMethod.CREDIT_CARD,
      displayName: `${this.getCardType()} ending in ${cardNumber.slice(-4)}`,
      lastFour: cardNumber.slice(-4),
      expiryDate: `${this.cardForm.get('expiryMonth')?.value}/${this.cardForm.get('expiryYear')?.value.toString().slice(-2)}`,
      isDefault: this.savedPaymentMethods.length === 0
    };
    
    this.savedPaymentMethods.push(newMethod);
  }

  generateCardToken(): string {
    // In real app, use secure tokenization service
    return `tok_${Math.random().toString(36).substr(2, 9)}`;
  }

  getCardType(): string {
    const cardNumber = this.cardForm.get('cardNumber')?.value;
    if (cardNumber?.startsWith('4')) return 'Visa';
    if (cardNumber?.startsWith('5')) return 'MasterCard';
    if (cardNumber?.startsWith('3')) return 'American Express';
    return 'Card';
  }

  removePaymentMethod(methodId: string): void {
    this.savedPaymentMethods = this.savedPaymentMethods.filter(m => m.id !== methodId);
    this.notificationService.success('Success', 'Payment method removed');
  }

  setDefaultPaymentMethod(methodId: string): void {
    this.savedPaymentMethods.forEach(method => {
      method.isDefault = method.id === methodId;
    });
    this.notificationService.success('Success', 'Default payment method updated');
  }

  // Filter methods
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.currentPage = 1;
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  // Utility methods
  isAdmin(): boolean {
    return this.currentUser?.role === UserRole.ADMIN;
  }

  getStatusColor(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return 'var(--success-500)';
      case PaymentStatus.PENDING:
      case PaymentStatus.PROCESSING:
        return 'var(--warning-500)';
      case PaymentStatus.FAILED:
        return 'var(--error-500)';
      case PaymentStatus.CANCELLED:
        return 'var(--gray-500)';
      case PaymentStatus.REFUNDED:
        return 'var(--primary-500)';
      default:
        return 'var(--gray-500)';
    }
  }

  getMethodIcon(method: PaymentMethod): string {
    return this.paymentMethodConfig[method]?.icon || '💳';
  }

  getMethodName(method: PaymentMethod): string {
    return this.paymentMethodConfig[method]?.name || method;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTimeAgo(date: Date | string): string {
    const now = new Date();
    const paymentDate = new Date(date);
    const diffMs = now.getTime() - paymentDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  }

  // Form validation helper
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
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
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['pattern']) {
        return 'Please enter a valid format';
      }
      if (field.errors['min']) {
        return `Value must be at least ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `Value must not exceed ${field.errors['max'].max}`;
      }
    }
    return '';
  }

  exportPayments(): void {
    this.notificationService.info('Export', 'Export functionality coming soon!');
  }

  trackByPaymentId(index: number, payment: Payment): number | undefined {
    return payment.id;
  }
}
