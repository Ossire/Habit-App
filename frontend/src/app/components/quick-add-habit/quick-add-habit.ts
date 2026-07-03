import {
  Component,
  EventEmitter,
  Output,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { DOMAINS } from '../../constants/domainS';

import {
  HabitsService,
  CreateHabitDto,
} from '../../services/habits.service';

@Component({
  selector: 'app-quick-add-habit',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-add-habit.html',
  styleUrl: './quick-add-habit.css',
})
export class QuickAddHabitComponent {
  private habitsService = inject(HabitsService);

  @Output() close = new EventEmitter<void>();
  @Output() habitCreated = new EventEmitter<void>();

  readonly domains = DOMAINS;

  readonly trackingTypes = [
    'duration',
    'count',
    'toggle',
    'timer',
  ];

  // Form State
  name = signal('');

  selectedDomain = signal('Health');

  selectedTrackingType = signal('duration');

  dailyTarget = signal(30);

  targetUnit = signal('minutes');

  isSaving = signal(false);

  errorMessage = signal('');

  // Domain Selection
  setDomain(domain: string) {
    this.selectedDomain.set(domain);
  }

  // Tracking Type Selection
  setTrackingType(type: string) {
    this.selectedTrackingType.set(type);

    switch (type) {
      case 'duration':
        this.targetUnit.set('minutes');
        this.dailyTarget.set(30);
        break;

      case 'count':
        this.targetUnit.set('times');
        this.dailyTarget.set(10);
        break;

      case 'toggle':
        this.targetUnit.set('completion');
        this.dailyTarget.set(1);
        break;

      case 'timer':
        this.targetUnit.set('minutes');
        this.dailyTarget.set(25);
        break;
    }
  }

  createHabit() {
    this.errorMessage.set('');

    if (!this.name().trim()) {
      this.errorMessage.set('Habit name is required.');
      return;
    }

    const payload: CreateHabitDto = {
      name: this.name().trim(),
      description: '',
      category: this.selectedDomain(),
      trackingType: this.selectedTrackingType(),
      dailyTarget: this.dailyTarget(),
      targetUnit: this.targetUnit(),
    };

    this.isSaving.set(true);

    this.habitsService.createHabit(payload).subscribe({
      next: () => {
        this.isSaving.set(false);

        this.habitCreated.emit();

        this.close.emit();
      },

      error: (err) => {
        this.errorMessage.set(
          err.error?.message ?? 'Unable to create habit.'
        );

        this.isSaving.set(false);
      },
    });
  }

  closeModal() {
    this.close.emit();
  }
}