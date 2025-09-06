export interface Payment {
  id?: number;
  customerId: number;
  rideId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  failureReason?: string;
  processedAt?: Date;
  createdDate?: Date;
  updatedDate?: Date;
}

export interface FareCalculationRequest {
  pickupLocation: string;
  destinationLocation: string;
  rideType: string;
}

export interface FareCalculationResponse {
  estimatedFare: number;
  distance: number;
  estimatedDuration: number;
  baseFare: number;
  pricePerMile: number;
  rideType: string;
}

export interface PaymentRequest {
  customerId: number;
  rideId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  cardToken?: string;
}

export interface PaymentResponse {
  paymentId: number;
  customerId: number;
  rideId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId: string;
  message: string;
  processedAt: Date;
  createdDate: Date;
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  DIGITAL_WALLET = 'DIGITAL_WALLET',
  CASH = 'CASH',
  UPI = 'UPI'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}
