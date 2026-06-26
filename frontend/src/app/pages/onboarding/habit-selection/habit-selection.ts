// src/app/pages/onboarding/habit-selection/habit-selection.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HabitsService, Habit } from '../../../services/habits.service';

@Component({
  selector: 'app-habit-selection',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './habit-selection.html',
  styleUrls: ['./habit-selection.css'],
})
export class HabitSelectionComponent implements OnInit {
  private router = inject(Router);
  private habitsService = inject(HabitsService);

  categories = ['Health', 'Study', 'Fitness', 'Mindfulness'];
  activeCategory = 'Health';
  selectedHabits = new Set<string>();

  habits = signal<Habit[]>([]);
  isLoading = signal(true);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.habitsService.getSystemHabits().subscribe({
      next: (habits) => {
        this.habits.set(habits);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load habits. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  get filteredHabits() {
    return this.habits().filter((h) => h.category === this.activeCategory);
  }

  setCategory(cat: string) {
    this.activeCategory = cat;
  }

  toggleHabit(id: string) {
    if (this.selectedHabits.has(id)) {
      this.selectedHabits.delete(id);
    } else {
      this.selectedHabits.add(id);
    }
  }

  onContinue() {
    if (this.selectedHabits.size === 0) return;

    this.isSubmitting.set(true);

    this.habitsService.selectHabits([...this.selectedHabits]).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.errorMessage.set('Failed to save habits. Please try again.');
      },
    });
  }
}
