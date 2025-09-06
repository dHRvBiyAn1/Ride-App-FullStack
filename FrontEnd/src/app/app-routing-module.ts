import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { AdminDashboard } from './components/dashboard/admin-dashboard/admin-dashboard';
import { CustomerDashboard } from './components/dashboard/customer-dashboard/customer-dashboard';
import { Login } from './components/login/login';
import { RideBooking } from './components/ride-booking/ride-booking';
import { RideHistory } from './components/ride-history/ride-history';
import { UserManagement } from './components/user-management/user-management';
import { DriverManagement } from './components/driver-management/driver-management';
import { PaymentComponent } from './components/payment/payment';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { UserRole } from './models/user.model';
import { Profile } from './components/profile/profile';


const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  
  // Customer Routes
  {
    path: 'customer',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: UserRole.CUSTOMER },
    children: [
      { path: 'dashboard', component: CustomerDashboard },
      { path: 'book-ride', component: RideBooking },
      { path: 'rides', component: RideHistory },
      { path: 'profile', component: Profile },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  
  // Admin Routes
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: UserRole.ADMIN },
    children: [
      { path: 'dashboard', component: AdminDashboard },
      { path: 'users', component: UserManagement },
      { path: 'drivers', component: DriverManagement },
      { path: 'rides', component: RideHistory },
      { path: 'profile', component: Profile },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  
  // Shared Routes
  {
    path: 'payment',
    component: PaymentComponent,
    canActivate: [AuthGuard]
  },
  
  // Fallback
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
