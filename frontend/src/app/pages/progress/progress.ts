// src/app/pages/progress/progress.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HabitsService, ProgressHabit, MonthlyTrend, DomainMastery } from '../../services/habits.service';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './progress.html',
  styleUrls: ['./progress.css'],
})
export class ProgressComponent implements OnInit {
  private habitsService = inject(HabitsService);

  strongHabits = signal<ProgressHabit[]>([]);
  needsAttention = signal<ProgressHabit[]>([]);
  monthlyTrend = signal<MonthlyTrend[]>([]);
  domainMastery = signal<DomainMastery[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.habitsService.getProgress().subscribe({
      next: (data) => {
        this.strongHabits.set(data.strongHabits);
        this.needsAttention.set(data.needsAttention);
        this.monthlyTrend.set(data.monthlyTrend);
        this.domainMastery.set(data.domainMastery);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load progress.');
        this.isLoading.set(false);
      },
    });
  }

  getMaxCompletions(): number {
    const max = Math.max(...this.monthlyTrend().map((w) => w.completions));
    return max === 0 ? 1 : max;
  }
}
