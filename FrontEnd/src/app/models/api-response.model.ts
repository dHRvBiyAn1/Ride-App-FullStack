export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
}

export interface ErrorResponse {
  timestamp: Date;
  status: number;
  error: string;
  message: string;
  validationErrors?: { [key: string]: string };
}
