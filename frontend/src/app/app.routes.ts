import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/guest.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing').then((m) => m.LandingComponent),
    canActivate: [guestGuard],
  },

  // Auth pages (redirect to dashboard if already logged in)
  {
    path: 'signup',
    loadComponent: () => import('./pages/auth/signup/signup').then((m) => m.SignupComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then((m) => m.ProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
  },

  // Onboarding (requires auth)
  {
    path: 'habit-selection',
    loadComponent: () =>
      import('./pages/onboarding/habit-selection/habit-selection').then(
        (m) => m.HabitSelectionComponent,
      ),
    canActivate: [authGuard],
  },

  // Protected app routes
  {
    path: 'habit/:id',
    loadComponent: () =>
      import('./pages/habit-detail/habit-detail').then((m) => m.HabitDetailComponent),
    canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'progress',
    loadComponent: () => import('./pages/progress/progress').then((m) => m.ProgressComponent),
    canActivate: [authGuard],
  },

  {
    path: 'heatmap',
    loadComponent: () => import('./pages/heatmap/heatmap').then((m) => m.HeatmapComponent),
    canActivate: [authGuard],
  },

  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings),
    canActivate: [authGuard],
  },

  {
    path: 'settings/edit-profile',
    loadComponent: () =>
      import('./pages/edit-profile/edit-profile')
        .then(m => m.EditProfile),
    canActivate: [authGuard],
  },
  {
    path: 'settings/change-password',
    loadComponent: () =>
      import('./pages/change-password/change-password')
        .then(m => m.ChangePassword),
    canActivate: [authGuard],
  },

  {
    // Catch-all route for 404s
    path: '**',
    redirectTo: '',
  },
];
