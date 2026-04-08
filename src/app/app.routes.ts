import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { adminGuard, teacherGuard } from './guards/auth.guards';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./components/auth/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./components/auth/register.component').then(m => m.RegisterComponent) },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'establishments', canActivate: [teacherGuard], loadComponent: () => import('./components/establishment-manager/establishment-manager.component').then(m => m.EstablishmentManagerComponent) },
      { path: 'establishment/:id', canActivate: [teacherGuard], loadComponent: () => import('./components/class-manager/class-manager.component').then(m => m.ClassManagerComponent) },
      { path: 'class/:id', canActivate: [teacherGuard], loadComponent: () => import('./components/student-manager/student-manager.component').then(m => m.StudentManagerComponent) },
      { path: 'gradebook/:id', canActivate: [teacherGuard], loadComponent: () => import('./components/gradebook/gradebook.component').then(m => m.GradebookComponent) },
      { path: 'attendance/:id', canActivate: [teacherGuard], loadComponent: () => import('./components/attendance-manager/attendance-manager.component').then(m => m.AttendanceManagerComponent) },
      { path: 'admin/users', canActivate: [adminGuard], loadComponent: () => import('./components/admin/user-manager/user-manager.component').then(m => m.UserManagerComponent) },
      { path: 'admin/dashboard', canActivate: [adminGuard], loadComponent: () => import('./components/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
