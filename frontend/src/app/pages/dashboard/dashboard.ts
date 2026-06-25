import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HabitStateService } from '../../services/habits.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent {
  // Inject our new local state brain
  private stateService = inject(HabitStateService);

  // 1. Directly read the signal from the service
  // No ngOnInit or .subscribe() needed! It is instantly available.
  habits = this.stateService.selectedHabits;

  // 2. Automatically calculate derived state
  totalHabits = computed(() => this.habits().length);

  completedHabits = computed(() => this.habits().filter((h) => h.completed).length);

  progressPercentage = computed(() => {
    if (this.totalHabits() === 0) return 0;
    return Math.round((this.completedHabits() / this.totalHabits()) * 100);
  });

  // 3. Update state locally
  toggleHabit(id: string) {
    this.stateService.toggleCompletion(id);
  }
}
