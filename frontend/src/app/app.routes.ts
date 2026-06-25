import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing').then((m) => m.LandingComponent),
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/auth/signup/signup').then((m) => m.SignupComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'habit-selection',
    loadComponent: () =>
      import('./pages/onboarding/habit-selection/habit-selection').then(
        (m) => m.HabitSelectionComponent,
      ),
  },

  {
    path: 'habit/:id',
    loadComponent: () =>
      import('./pages/habit-detail/habit-detail').then((m) => m.HabitDetailComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.DashboardComponent),
  },
  {
    path: 'progress',
    loadComponent: () => import('./pages/progress/progress').then((m) => m.ProgressComponent),
  },

  {
    path: 'heatmap',
    loadComponent: () => import('./pages/heatmap/heatmap').then((m) => m.HeatmapComponent),
  },

  {
    // Catch-all route for 404s
    path: '**',
    redirectTo: '',
  },
];
