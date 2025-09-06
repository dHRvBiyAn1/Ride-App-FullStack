import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Driver, CreateDriverRequest, UpdateDriverRequest, RatingRequest } from '../models/driver.model';
import { environment } from '../environment';

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private apiUrl = `${environment.apiUrl}/drivers`;

  constructor(private http: HttpClient) {}

  getAllDrivers(): Observable<Driver[]> {
    return this.http.get<Driver[]>(this.apiUrl);
  }

  getAvailableDrivers(): Observable<Driver[]> {
    return this.http.get<Driver[]>(`${this.apiUrl}/available`);
  }

  getDriverById(id: number): Observable<Driver> {
    return this.http.get<Driver>(`${this.apiUrl}/${id}`);
  }

  createDriver(driver: CreateDriverRequest): Observable<Driver> {
    return this.http.post<Driver>(this.apiUrl, driver);
  }

  updateDriver(id: number, driver: UpdateDriverRequest): Observable<Driver> {
    return this.http.put<Driver>(`${this.apiUrl}/${id}`, driver);
  }

  updateDriverStatus(id: number, status: string): Observable<Driver> {
    return this.http.put<Driver>(`${this.apiUrl}/${id}/status?status=${status}`, {});
  }

  updateDriverRating(id: number, rating: RatingRequest): Observable<Driver> {
    return this.http.put<Driver>(`${this.apiUrl}/${id}/rating`, rating);
  }
}
