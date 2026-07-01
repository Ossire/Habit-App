// src/app/pages/dashboard/dashboard.ts
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HabitsService, DashboardResponse } from '../../services/habits.service';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  private habitsService = inject(HabitsService);
  private authService = inject(AuthService);

  dashboard = signal<DashboardResponse | null>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  // Pull first name from localStorage
  firstName = computed(() => {
    const user = this.authService.getCurrentUser();
    if (!user?.fullName) return 'there';
    return user.fullName.split(' ')[0];
  });

  today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  });

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.habitsService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load dashboard.');
        this.isLoading.set(false);
      },
    });
  }

  toggleHabit(habitId: string, completedToday: boolean) {
    const request$ = completedToday
      ? this.habitsService.uncompleteHabit(habitId)
      : this.habitsService.completeHabit(habitId);

    request$.subscribe({
      next: () => this.loadDashboard(),
      error: () => this.errorMessage.set('Failed to update habit.'),
    });
  }
}
