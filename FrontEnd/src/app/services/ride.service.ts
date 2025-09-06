import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ride, CreateRideRequest, RideBookingResponse, RateDriverRequest } from '../models/ride.model';
import { environment } from '../environment';

@Injectable({
  providedIn: 'root'
})
export class RideService {
  private apiUrl = `${environment.apiUrl}/rides`;

  constructor(private http: HttpClient) {}

  bookRide(rideRequest: CreateRideRequest): Observable<RideBookingResponse> {
    return this.http.post<RideBookingResponse>(this.apiUrl, rideRequest);
  }

  getAllRides(): Observable<Ride[]> {
    return this.http.get<Ride[]>(this.apiUrl);
  }

  getRideById(id: number): Observable<Ride> {
    return this.http.get<Ride>(`${this.apiUrl}/${id}`);
  }

  getCustomerRides(customerId: number): Observable<Ride[]> {
    return this.http.get<Ride[]>(`${this.apiUrl}?customerId=${customerId}`);
  }

  getDriverRides(driverId: number): Observable<Ride[]> {
    return this.http.get<Ride[]>(`${this.apiUrl}?driverId=${driverId}`);
  }

  rateDriver(rideId: number, rating: RateDriverRequest): Observable<Ride> {
    return this.http.put<Ride>(`${this.apiUrl}/${rideId}/rating`, rating);
  }
}
