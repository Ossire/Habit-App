import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-habit-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './habit-detail.html',
  styleUrls: ['./habit-detail.css'],
})
export class HabitDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);

  // The signal holding our dynamic habit data
  habit = signal<any>(null);

  days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  ngOnInit() {
    // Listen to the URL. If the ID changes, reload the data!
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadDynamicData(id);
      }
    });
  }

  loadDynamicData(id: string) {
    // In the future, this will be: this.http.get(`/api/habits/${id}`)
    // For now, we mock it. If they clicked Drink Water, show water. Otherwise, make it generic.
    const isWater = id === 'water-1';

    this.habit.set({
      id: id,
      title: isWater ? 'Drink Water' : 'Build Habit',
      category: isWater ? 'HEALTH' : 'LIFESTYLE',
      streak: isWater ? 12 : 5,
      // Array representing Mon-Sun completion status
      weeklyActivity: [true, true, true, true, true, false, false],
      // Array representing chart heights
      intakeData: [60, 80, 100, 90, 100, 0, 0],
      insight: isWater
        ? 'You are at 85% of your hydration goal this week. Keep up the momentum for a 14-day record.'
        : 'You are doing great this week. Complete today to extend your streak.',
    });
  }

  markAsDone() {
    console.log('Marking habit complete for today!');
    // This will eventually trigger the optimistic UI save we discussed earlier
  }
}
