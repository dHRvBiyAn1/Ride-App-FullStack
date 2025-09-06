# 🚗 Uber Clone - Angular Frontend

A modern, full-featured ride-sharing application built with Angular 19, featuring real-time ride booking, driver management, payment processing, and comprehensive admin controls.

![Node.js](https://img.shields.io/badge/Node.jsty
- **Secure Login/Register** without JWT authentication
- **Role-based access control** (Customer/Admin)
- **Route guards** and HTTP interceptors
- **Password encryption** and validation

### 🚖 Ride Management
- **Real-time ride booking** with multiple vehicle types
- **Live driver tracking** and ETA updates
- **Ride history** with detailed trip information
- **Fare estimation** and route optimization
- **Ride status tracking** (Pending → Accepted → In Progress → Completed)

### 👥 User Management (Admin)
- **Complete user CRUD operations**
- **Advanced filtering** by status, role, date
- **Bulk user operations**
- **User activity monitoring**
- **Profile management** with avatar upload

### 🚗 Driver Management (Admin)
- **Driver onboarding** with vehicle registration
- **Real-time driver status** (Active/Busy/Offline)
- **Performance tracking** with ratings and ride counts
- **Vehicle information management**
- **Location tracking** and availability

### 💳 Payment System
- **Multiple payment methods** (Credit/Debit cards, Digital wallets, UPI, Cash)
- **Secure payment processing** with Stripe integration
- **Payment history** and transaction tracking
- **Refund management** for admins
- **Saved payment methods**

### 📱 User Experience
- **Responsive design** for all devices
- **Material Design** inspired UI
- **Real-time notifications**
- **Progressive Web App** capabilities

## 🛠️ Tech Stack

### Frontend
- **Angular 19** - Modern web framework
- **TypeScript 5.0** - Type-safe development
- **RxJS** - Reactive programming
- **Angular Material** - UI components
- **CSS3** with custom properties
- **PWA** capabilities

### Backend
- **SpringBoot** - Modern Java Framework

### Development Tools
- **Angular CLI** - Project scaffolding
- **Prettier** - Code formatting

## 📋 Prerequisites

Before running this project, make sure you have:

- **Java (17 or higher)
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Angular CLI** (`npm install -g @angular/cli`)
- **Git** for version control

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/dHRvBiyAn1/Ride-App-FullStack
cd Ride-App-FullStack
cd Frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create environment files:

### 4. Start Development Server
```bash
ng serve
```

Navigate to `http://localhost:4200` in your browser.

## 🌐 API Endpoints

The frontend expects these backend endpoints:

### Authentication
```
POST /api/auth/login              # User login
POST /api/auth/register           # User registration
POST /api/auth/refresh            # Refresh token
POST /api/auth/logout             # User logout
```

### Rides
```
GET    /api/rides                 # Get all rides (admin)
POST   /api/rides                 # Book new ride
GET    /api/rides/user/:id        # Get user rides
GET    /api/rides/:id             # Get ride details
PUT    /api/rides/:id/status      # Update ride status
DELETE /api/rides/:id             # Cancel ride
```

### Users
```
GET    /api/users                 # Get all users (admin)
POST   /api/users                 # Create user
GET    /api/users/:id             # Get user details
PUT    /api/users/:id             # Update user
DELETE /api/users/:id             # Delete user
```

### Drivers
```
GET    /api/drivers               # Get all drivers
POST   /api/drivers               # Register driver
PUT    /api/drivers/:id/status    # Update driver status
GET    /api/drivers/nearby        # Get nearby drivers
```

### Payments
```
GET    /api/payments              # Get payment history
POST   /api/payments              # Process payment
POST   /api/payments/refund       # Process refund
GET    /api/payments/methods      # Get saved payment methods
```

## 🎨 UI Components

### Core Components
- **🔐 Authentication** - Login/Register with validation
- **📊 Dashboard** - Overview with statistics and quick actions
- **🚖 Ride Booking** - Interactive booking with map integration
- **📋 Ride History** - Detailed trip history with filters
- **👥 User Management** - Complete CRUD with advanced filtering
- **🚗 Driver Management** - Driver onboarding and tracking
- **💳 Payment** - Secure payment processing with multiple methods
- **👤 Profile** - User profile with settings and preferences

### Shared Components
- **⚡ Loading** - Consistent loading indicators
- **🗂️ Modal** - Reusable modal dialogs
- **🔔 Notifications** - Toast notifications
