import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

// Components
// import { LoginComponent } from './components/login/login.component';
// import { CustomerDashboardComponent } from './components/dashboard/customer-dashboard/customer-dashboard.component';
// import { AdminDashboardComponent } from './components/dashboard/admin-dashboard/admin-dashboard.component';
// import { RideBookingComponent } from './components/ride-booking/ride-booking.component';
// import { RideHistoryComponent } from './components/ride-history/ride-history.component';
// import { UserManagementComponent } from './components/user-management/user-management.component';
// import { DriverManagementComponent } from './components/driver-management/driver-management.component';
// import { PaymentComponent } from './components/payment/payment.component';
// import { ProfileComponent } from './components/profile/profile.component';

// Shared Components
import { Header } from './components/shared/header/header';
import { Loading } from './components/shared/loading/loading';
import { Modal} from './components/shared/modal/modal';
import { Sidebar } from './components/shared/sidebar/sidebar';

// Interceptors
import { HttpErrorInterceptor } from './interceptors/http.interceptor';
import { RouterModule } from '@angular/router';
import { Login } from './components/login/login';
import { CustomerDashboard } from './components/dashboard/customer-dashboard/customer-dashboard';
import { AdminDashboard } from './components/dashboard/admin-dashboard/admin-dashboard';
import { RideBooking } from './components/ride-booking/ride-booking';
import { RideHistory } from './components/ride-history/ride-history';
import { UserManagement } from './components/user-management/user-management';
import { DriverManagement } from './components/driver-management/driver-management';
import { PaymentComponent } from './components/payment/payment';
import { TitleCasePipe } from '@angular/common';
import { Profile } from './components/profile/profile';



@NgModule({
  declarations: [
    App,
    Login,
    // RideBookingComponent,
    // RideHistoryComponent,
    // UserManagementComponent,
    // DriverManagementComponent,
    // PaymentComponent,
    // ProfileComponent,
    Header,
    Sidebar,
    Loading,
    Modal,
    CustomerDashboard,
    AdminDashboard,
    RideBooking,
    RideHistory,
    UserManagement,
    DriverManagement,
    PaymentComponent,
    Profile
  ],
  imports: [
    BrowserModule,
    RouterModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    TitleCasePipe
  ],
  exports: [
    Modal
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    }
  ],
  bootstrap: [App]
})
export class AppModule { }
