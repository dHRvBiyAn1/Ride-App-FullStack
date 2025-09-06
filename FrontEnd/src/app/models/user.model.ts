export interface User {
  id?: number;
  username: string;
  name: string;
  email: string;
  dateOfBirth?: Date | string;
  gender?: string;
  address?: string;
  bio?: string;
  role: UserRole;
  status: UserStatus;
  createdDate?: Date | string;
  updatedDate?: Date | string;
  profilePicture?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  message: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date | string;
  gender?: string;
  address?: string;
  bio?: string;
  status?: UserStatus;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}
