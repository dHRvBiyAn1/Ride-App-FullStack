export const API_ENDPOINTS = {
  USERS: '/users',
  DRIVERS: '/drivers',
  RIDES: '/rides',
  PAYMENTS: '/payments'
};

export const ROUTE_PATHS = {
  LOGIN: '/login',
  CUSTOMER_DASHBOARD: '/customer/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  RIDE_BOOKING: '/customer/book-ride',
  RIDE_HISTORY: '/customer/rides',
  USER_MANAGEMENT: '/admin/users',
  DRIVER_MANAGEMENT: '/admin/drivers',
  PAYMENT: '/payment',
  PROFILE: '/profile'
};

export const STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'token'
};

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export const RIDE_TYPE_CONFIG = {
  ECONOMY: {
    name: 'Economy',
    description: 'Affordable rides for everyday travel',
    baseFare: 2.5,
    pricePerMile: 1.5,
    icon: '🚗'
  },
  PREMIUM: {
    name: 'Premium',
    description: 'Comfortable rides with newer vehicles',
    baseFare: 3.5,
    pricePerMile: 2.0,
    icon: '🚙'
  },
  LUXURY: {
    name: 'Luxury',
    description: 'High-end vehicles for special occasions',
    baseFare: 5.0,
    pricePerMile: 3.0,
    icon: '🚖'
  }
};

export const STATUS_COLORS = {
  ACTIVE: '#10B981',
  INACTIVE: '#EF4444',
  SUSPENDED: '#F59E0B',
  CONFIRMED: '#3B82F6',
  COMPLETED: '#10B981',
  CANCELLED: '#EF4444'
};
