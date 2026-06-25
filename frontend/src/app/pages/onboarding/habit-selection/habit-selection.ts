// import { Component, signal } from '@angular/core';
// import { Router } from '@angular/router';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-onboarding',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './habit-selection.html',
//   styleUrls: ['./habit-selection.css'],
// })
// export class HabitSelectionComponent {
//   // Category state
//   categories = ['Health', 'Study', 'Fitness', 'Mindfulness'];
//   activeCategory = signal<string>('Health');

//   // Available habits pool
//   habits = signal([
//     { id: 1, icon: '💧', name: 'Drink Water', desc: '8 glasses daily' },
//     { id: 2, icon: '📚', name: 'Read 10 Pages', desc: 'Broaden mind' },
//     { id: 3, icon: '🏃', name: 'Go for a Run', desc: 'Cardio health' },
//     { id: 4, icon: '🧘', name: 'Meditate', desc: '10 mins peace' },
//     { id: 5, icon: '✍️', name: 'Journaling', desc: 'Daily thoughts' },
//     { id: 6, icon: '🧍', name: 'Stretch', desc: 'Flexibility' },
//   ]);

//   // Reactive selection state
//   selectedHabits = signal<Set<number>>(new Set());

//   constructor(private router: Router) {}

//   setCategory(category: string) {
//     this.activeCategory.set(category);
//   }

//   toggleHabit(id: number) {
//     this.selectedHabits.update((set) => {
//       const newSet = new Set(set);
//       newSet.has(id) ? newSet.delete(id) : newSet.add(id);
//       return newSet;
//     });
//   }

//   continueToDashboard() {
//     // In a full app, you would POST this.selectedHabits() to your NestJS backend here.
//     // For the MVP flow, we just navigate to the dashboard.
//     this.router.navigate(['/dashboard']);
//   }
// }

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HabitStateService } from '../../../services/habits.service';
interface Habit {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  icon: string; // We'll use a string identifier to render the right SVG in HTML
}

@Component({
  selector: 'app-habit-selection',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './habit-selection.html',
  styleUrls: ['./habit-selection.css'],
})
export class HabitSelectionComponent {
  private router = inject(Router);
  private stateService = inject(HabitStateService);

  // State Management
  categories = ['Health', 'Study', 'Fitness', 'Mindfulness'];
  activeCategory = 'Health';
  selectedHabits = new Set<string>(['run-1']); // Pre-selecting "Go for a Run" to match your design

  // Mock Data
  habits: Habit[] = [
    {
      id: 'water-1',
      category: 'Health',
      title: 'Drink Water',
      subtitle: '8 glasses daily',
      icon: 'drop',
    },
    {
      id: 'read-1',
      category: 'Study',
      title: 'Read 10 Pages',
      subtitle: 'Broaden mind',
      icon: 'book',
    },
    {
      id: 'run-1',
      category: 'Fitness',
      title: 'Go for a Run',
      subtitle: 'Cardio health',
      icon: 'run',
    },
    {
      id: 'med-1',
      category: 'Mindfulness',
      title: 'Meditate',
      subtitle: '10 mins peace',
      icon: 'meditate',
    },
    {
      id: 'jour-1',
      category: 'Mindfulness',
      title: 'Journaling',
      subtitle: 'Daily thoughts',
      icon: 'journal',
    },
    {
      id: 'str-1',
      category: 'Fitness',
      title: 'Stretch',
      subtitle: 'Flexibility',
      icon: 'stretch',
    },
  ];

  // Derived state for the template
  get filteredHabits() {
    // If you want to actually filter by category, you would do it here.
    // For now, returning all to match the dense grid in your image.
    return this.habits;
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
    // 1. Map the selected IDs back to the full habit objects
    const fullSelectedHabits = this.habits.filter((h) => this.selectedHabits.has(h.id));

    // 2. Save them to our global Signal state
    this.stateService.setHabits(fullSelectedHabits);

    // 3. Navigate
    this.router.navigate(['/dashboard']);
  }
}
