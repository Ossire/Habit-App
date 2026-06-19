import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitsService } from '../../services/habits.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  // 1. Define the Signal
  dashboardState = signal<{ progressPercentage: number; habits: any[] }>({
    progressPercentage: 0,
    habits: [],
  });

  // NEW: Automatically calculate derived state
  totalHabits = computed(() => this.dashboardState().habits.length);
  completedHabits = computed(
    () => this.dashboardState().habits.filter((h) => h.isCompletedToday).length,
  );

  constructor(private habitsService: HabitsService) {}

  ngOnInit() {
    this.habitsService.getDashboard().subscribe((response) => {
      this.dashboardState.set(response);
    });
  }

  toggleHabit(id: number) {
    this.habitsService.toggleHabit(id).subscribe((response) => {
      // 2. Reactively update the state
      this.dashboardState.set(response);
    });
  }
}
