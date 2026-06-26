// src/app/pages/habit-detail/habit-detail.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HabitsService, HabitDetail } from '../../services/habits.service';

@Component({
  selector: 'app-habit-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './habit-detail.html',
  styleUrls: ['./habit-detail.css'],
})
export class HabitDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private habitsService = inject(HabitsService);

  habit = signal<HabitDetail | null>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  markedDone = signal(false);

  days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) this.loadHabit(id);
    });
  }

  loadHabit(id: string) {
    this.isLoading.set(true);
    this.habitsService.getHabitDetail(id).subscribe({
      next: (data) => {
        this.habit.set(data);
        // Check if already completed today
        const today = new Date().toISOString().split('T')[0];
        const todayEntry = data.weeklyActivity.find((d) => d.date === today);
        this.markedDone.set(todayEntry?.completed ?? false);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load habit.');
        this.isLoading.set(false);
      },
    });
  }

  markAsDone() {
    const id = this.habit()?.id;
    if (!id) return;

    const request$ = this.markedDone()
      ? this.habitsService.uncompleteHabit(id)
      : this.habitsService.completeHabit(id);

    request$.subscribe({
      next: () => {
        this.markedDone.update((v) => !v);
        this.loadHabit(id);
      },
      error: () => this.errorMessage.set('Failed to update habit.'),
    });
  }
}
