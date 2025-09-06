export interface Driver {
  id?: number;
  name: string;
  phone: string;
  email: string;
  rating: number;
  status: DriverStatus;
  vehicle?: Vehicle;
  location?: Location;
  totalRides: number;
  createdDate?: Date;
  updatedDate?: Date;
}

export interface Vehicle {
  id?: number;
  model: string;
  plateNumber: string;
  year: number;
  color: string;
}

export interface Location {
  id?: number;
  latitude: number;
  longitude: number;
  address: string;
}

export interface CreateDriverRequest {
  name: string;
  phone: string;
  email: string;
  vehicle: {
    model: string;
    plateNumber: string;
    year: number;
    color: string;
  };
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface UpdateDriverRequest {
  name?: string;
  phone?: string;
  email?: string;
  status?: DriverStatus;
  vehicle?: {
    model?: string;
    plateNumber?: string;
    year?: number;
    color?: string;
  };
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
}

export interface RatingRequest {
  rating: number;
  rideId: number;
}

export enum DriverStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BUSY = 'BUSY',
  OFFLINE = 'OFFLINE',
  SUSPENDED = 'SUSPENDED'
}
