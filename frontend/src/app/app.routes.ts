import { Routes } from '@angular/router';

import { Landing } from './pages/landing/landing';
import { Signup } from './pages/auth/signup/signup';
import { Login } from './pages/auth/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { HabitSelectionComponent } from './pages/onboarding/habit-selection/habit-selection';
import { ProgressComponent } from './pages/progress/progress';
import { ProfileComponent } from './pages/profile/profile';

export const routes: Routes = [
  { path: '', component: HabitSelectionComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'progress', component: ProgressComponent },
  { path: 'settings', component: ProfileComponent },

  { path: '**', redirectTo: '' },

  {
    path: '',
    component: Landing,
  },

  {
    path: 'signup',
    component: Signup,
  },

  {
    path: 'login',
    component: Login,
  },
];
