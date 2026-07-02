// src/app/pages/dashboard/dashboard.ts
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HabitsService, DashboardResponse, Habit } from '../../services/habits.service';
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
  readonly radius = 54;
  readonly circumference = 2 * Math.PI * this.radius;
  readonly quotes = [
    {
      quote: 'Consistency is the playground of the unimaginative.',
      author: 'Azooki, 2025 HackUp Coding'
    },
    {
      quote: 'Small habits become remarkable results.',
      author: 'HabitUp'
    },
    {
      quote: 'Progress beats perfection every time.',
      author: 'HabitUp'
    },
    {
      quote: 'Success is built one habit at a time.',
      author: 'HabitUp'
    }
  ];

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

  domains = computed(() => {
    const dashboard = this.dashboard();

    if (!dashboard) return [];

    const grouped = new Map<string, Habit[]>();

    dashboard.habits.forEach((habit) => {
      if (!grouped.has(habit.category)) {
        grouped.set(habit.category, []);
      }

      grouped.get(habit.category)!.push(habit);
    });

    return Array.from(grouped.entries()).map(([category, habits]) => ({
      category,
      activeCount: habits.length,
    }));
  });

  quoteOfTheDay = computed(() => {
    const day = new Date().getDate();

    return this.quotes[day % this.quotes.length];
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

  getProgressOffset(progress: number): number {
    return this.circumference - (progress / 100) * this.circumference;
  }
}
