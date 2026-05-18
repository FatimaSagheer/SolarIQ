import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { LoginComponent } from './pages/login/login';
import { authGuard } from './guards/auth-guard';
import { SystemDetail } from './pages/system-detail/system-detail';
import { ActivityLog } from './pages/activity-log/activity-log';

export const routes: Routes = [
   { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard]  // ← protect dashboard
  },
   { 
    path: 'systems/:id',      // ← :id is the system ID
    component: SystemDetail,
    canActivate: [authGuard]  // ← also protected
  },
  { 
  path: 'activity', 
  component: ActivityLog,
  canActivate: [authGuard]
}
];