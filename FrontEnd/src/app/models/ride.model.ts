export interface Ride {
  id?: number;
  customerId: number;
  driverId?: number;
  customerName?: string;
  driverName?: string;
  pickupLocation: string;
  destinationLocation: string;
  status: RideStatus;
  rideType: RideType;
  estimatedFare?: number;
  actualFare?: number;
  distance?: number;
  estimatedDuration?: number;
  actualDuration?: number;
  driverRating?: number;
  customerRating?: number;
  pickupTime?: Date;
  completionTime?: Date;
  createdDate?: Date;
  updatedDate?: Date;
}

export interface CreateRideRequest {
  customerId: number;
  pickupLocation: string;
  destinationLocation: string;
  rideType: RideType;
}

export interface RideBookingResponse {
  rideId: number;
  customerName: string;
  driverName: string;
  pickupLocation: string;
  destinationLocation: string;
  status: RideStatus;
  rideType: RideType;
  estimatedFare: number;
  distance: number;
  estimatedDuration: number;
  bookingTime: Date;
  message: string;
  driverDetails: DriverDetails;
}

export interface DriverDetails {
  id: number;
  name: string;
  phone: string;
  rating: number;
  vehicle: VehicleDetails;
}

export interface VehicleDetails {
  model: string;
  plateNumber: string;
  color: string;
}

export interface RateDriverRequest {
  rating: number;
}

export enum RideType {
  ECONOMY = 'ECONOMY',
  PREMIUM = 'PREMIUM',
  LUXURY = 'LUXURY'
}

export enum RideStatus {
  REQUESTED = 'REQUESTED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}
