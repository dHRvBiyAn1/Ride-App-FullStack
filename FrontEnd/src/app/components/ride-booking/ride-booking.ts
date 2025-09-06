import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RideService } from '../../services/ride.service';
import { PaymentService } from '../../services/payment.service';
import { NotificationService } from '../../services/notification.service';
import { User } from '../../models/user.model';
import {
  CreateRideRequest,
  RideType,
  RideBookingResponse,
} from '../../models/ride.model';
import {
  FareCalculationRequest,
  FareCalculationResponse,
} from '../../models/payment.model';
import { RIDE_TYPE_CONFIG } from '../../utils/constants';

interface LocationSuggestion {
  id: string;
  name: string;
  address: string;
  coordinates?: { lat: number; lng: number };
}

@Component({
  selector: 'app-ride-booking',
  standalone: false,
  templateUrl: './ride-booking.html',
  styleUrls: ['./ride-booking.css'],
})
export class RideBooking implements OnInit {
  currentUser: User | null = null;
  bookingForm!: FormGroup;

  // Booking flow steps
  currentStep = 1;
  totalSteps = 4;

  // State management
  isLoadingFare = false;
  isBookingRide = false;

  // Data
  fareEstimate: FareCalculationResponse | null = null;
  selectedRideType: RideType = RideType.ECONOMY;
  rideTypes = Object.values(RideType);
  rideTypeConfig = RIDE_TYPE_CONFIG;

  // Mock location suggestions (in real app, use Google Places API)
  locationSuggestions: LocationSuggestion[] = [
    { id: '1', name: 'Central Park', address: 'Central Park, Manhattan, NY' },
    { id: '2', name: 'Times Square', address: 'Times Square, Manhattan, NY' },
    {
      id: '3',
      name: 'Brooklyn Bridge',
      address: 'Brooklyn Bridge, Brooklyn, NY',
    },
    { id: '4', name: 'Wall Street', address: 'Wall Street, Manhattan, NY' },
    { id: '5', name: 'JFK Airport', address: 'JFK Airport, Queens, NY' },
    {
      id: '6',
      name: 'LaGuardia Airport',
      address: 'LaGuardia Airport, Queens, NY',
    },
    { id: '7', name: 'Penn Station', address: 'Penn Station, Manhattan, NY' },
    {
      id: '8',
      name: 'Grand Central Terminal',
      address: 'Grand Central Terminal, Manhattan, NY',
    },
  ];

  filteredPickupSuggestions: LocationSuggestion[] = [];
  filteredDestinationSuggestions: LocationSuggestion[] = [];
  showPickupSuggestions = false;
  showDestinationSuggestions = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private rideService: RideService,
    private paymentService: PaymentService,
    private notificationService: NotificationService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.initializeForm();
  }

  hidePickupSuggestions(): void {
    setTimeout(() => (this.showPickupSuggestions = false), 200);
  }

  hideDestinationSuggestions(): void {
    setTimeout(() => (this.showDestinationSuggestions = false), 200);
  }

  initializeForm(): void {
    this.bookingForm = this.fb.group({
      pickupLocation: ['', [Validators.required, Validators.minLength(3)]],
      destinationLocation: ['', [Validators.required, Validators.minLength(3)]],
      rideType: [RideType.ECONOMY, Validators.required],
      scheduledTime: [''],
      specialInstructions: [''],
    });
  }

  // Step navigation
  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      if (this.currentStep === 1 && this.validateStep1()) {
        this.calculateFare();
      } else if (this.currentStep === 2 && this.validateStep2()) {
        this.currentStep++;
      } else if (this.currentStep === 3) {
        this.currentStep++;
      }
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step <= this.currentStep || this.canAccessStep(step)) {
      this.currentStep = step;
    }
  }

  canAccessStep(step: number): boolean {
    switch (step) {
      case 1:
        return true;
      case 2:
        return this.validateStep1();
      case 3:
        return this.validateStep1() && this.validateStep2();
      case 4:
        return (
          this.validateStep1() &&
          this.validateStep2() &&
          this.fareEstimate !== null
        );
      default:
        return false;
    }
  }

  validateStep1(): boolean {
    const pickup = this.bookingForm.get('pickupLocation')?.value;
    const destination = this.bookingForm.get('destinationLocation')?.value;
    return !!(pickup && destination && pickup !== destination);
  }

  validateStep2(): boolean {
    return !!this.bookingForm.get('rideType')?.value;
  }

  // Location suggestions
  onPickupInput(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.filteredPickupSuggestions = this.filterLocations(input);
    this.showPickupSuggestions = input.length > 0;
  }

  onDestinationInput(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.filteredDestinationSuggestions = this.filterLocations(input);
    this.showDestinationSuggestions = input.length > 0;
  }

  filterLocations(query: string): LocationSuggestion[] {
    if (!query) return [];
    return this.locationSuggestions.filter(
      (location) =>
        location.name.toLowerCase().includes(query.toLowerCase()) ||
        location.address.toLowerCase().includes(query.toLowerCase())
    );
  }

  selectPickupLocation(location: LocationSuggestion): void {
    this.bookingForm.patchValue({ pickupLocation: location.address });
    this.showPickupSuggestions = false;
  }

  selectDestinationLocation(location: LocationSuggestion): void {
    this.bookingForm.patchValue({ destinationLocation: location.address });
    this.showDestinationSuggestions = false;
  }

  // Ride type selection
  selectRideType(rideType: RideType): void {
    this.selectedRideType = rideType;
    this.bookingForm.patchValue({ rideType });
  }

  // Fare calculation
  calculateFare(): void {
    if (!this.validateStep1()) return;

    this.isLoadingFare = true;
    const fareRequest: FareCalculationRequest = {
      pickupLocation: this.bookingForm.get('pickupLocation')?.value,
      destinationLocation: this.bookingForm.get('destinationLocation')?.value,
      rideType: this.selectedRideType,
    };

    this.paymentService.calculateFare(fareRequest).subscribe({
      next: (response) => {
        this.fareEstimate = response;
        this.isLoadingFare = false;
        this.currentStep = 2;
      },
      error: (error) => {
        this.isLoadingFare = false;
        this.notificationService.error('Error', 'Failed to calculate fare');
      },
    });
  }

  // Booking confirmation
  confirmBooking(): void {
    if (!this.currentUser?.id || !this.validateStep1() || !this.fareEstimate)
      return;

    this.isBookingRide = true;
    const rideRequest: CreateRideRequest = {
      customerId: this.currentUser.id,
      pickupLocation: this.bookingForm.get('pickupLocation')?.value,
      destinationLocation: this.bookingForm.get('destinationLocation')?.value,
      rideType: this.selectedRideType,
    };

    this.rideService.bookRide(rideRequest).subscribe({
      next: (response: RideBookingResponse) => {
        this.isBookingRide = false;
        this.notificationService.success(
          'Ride Booked!',
          'Your ride has been confirmed. Driver details have been shared.'
        );
        // Navigate to ride tracking or history
        this.router.navigate(['/customer/rides']);
      },
      error: (error) => {
        this.isBookingRide = false;
        this.notificationService.error(
          'Booking Failed',
          'Unable to book ride at this moment'
        );
      },
    });
  }

  // Utility methods
  getRideTypeIcon(rideType: RideType): string {
    return this.rideTypeConfig[rideType]?.icon || '🚗';
  }

  getRideTypeDescription(rideType: RideType): string {
    return this.rideTypeConfig[rideType]?.description || '';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  swapLocations(): void {
    const pickup = this.bookingForm.get('pickupLocation')?.value;
    const destination = this.bookingForm.get('destinationLocation')?.value;

    this.bookingForm.patchValue({
      pickupLocation: destination,
      destinationLocation: pickup,
    });
  }

  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In real app, reverse geocode the coordinates
          this.bookingForm.patchValue({
            pickupLocation: 'Current Location',
          });
          this.notificationService.success(
            'Location',
            'Current location set as pickup'
          );
        },
        (error) => {
          this.notificationService.error(
            'Location Error',
            'Unable to get current location'
          );
        }
      );
    }
  }

  resetForm(): void {
    this.bookingForm.reset();
    this.currentStep = 1;
    this.fareEstimate = null;
    this.selectedRideType = RideType.ECONOMY;
    this.bookingForm.patchValue({ rideType: RideType.ECONOMY });
  }
}
