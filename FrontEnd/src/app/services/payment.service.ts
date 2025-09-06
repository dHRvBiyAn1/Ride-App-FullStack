import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Payment, 
  FareCalculationRequest, 
  FareCalculationResponse, 
  PaymentRequest, 
  PaymentResponse 
} from '../models/payment.model';
import { environment } from '../environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  calculateFare(request: FareCalculationRequest): Observable<FareCalculationResponse> {
    return this.http.post<FareCalculationResponse>(`${this.apiUrl}/calculate-fare`, request);
  }

  processPayment(request: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/process`, request);
  }

  getCustomerPayments(customerId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/customer/${customerId}`);
  }

  getPaymentByRideId(rideId: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/ride/${rideId}`);
  }

  getAllPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.apiUrl);
  }
}
