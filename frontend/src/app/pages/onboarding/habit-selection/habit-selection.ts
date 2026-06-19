import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './habit-selection.html',
  styleUrls: ['./habit-selection.css'],
})
export class HabitSelectionComponent {
  // Category state
  categories = ['Health', 'Study', 'Fitness', 'Mindfulness'];
  activeCategory = signal<string>('Health');

  // Available habits pool
  habits = signal([
    { id: 1, icon: '💧', name: 'Drink Water', desc: '8 glasses daily' },
    { id: 2, icon: '📚', name: 'Read 10 Pages', desc: 'Broaden mind' },
    { id: 3, icon: '🏃', name: 'Go for a Run', desc: 'Cardio health' },
    { id: 4, icon: '🧘', name: 'Meditate', desc: '10 mins peace' },
    { id: 5, icon: '✍️', name: 'Journaling', desc: 'Daily thoughts' },
    { id: 6, icon: '🧍', name: 'Stretch', desc: 'Flexibility' },
  ]);

  // Reactive selection state
  selectedHabits = signal<Set<number>>(new Set());

  constructor(private router: Router) {}

  setCategory(category: string) {
    this.activeCategory.set(category);
  }

  toggleHabit(id: number) {
    this.selectedHabits.update((set) => {
      const newSet = new Set(set);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  }

  continueToDashboard() {
    // In a full app, you would POST this.selectedHabits() to your NestJS backend here.
    // For the MVP flow, we just navigate to the dashboard.
    this.router.navigate(['/dashboard']);
  }
}
