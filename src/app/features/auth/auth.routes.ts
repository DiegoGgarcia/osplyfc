import { Routes } from '@angular/router';
import { NoAuthGuard } from '../../core/guards/auth.guard';

export const authRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    canActivate: [NoAuthGuard],
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  }
];
