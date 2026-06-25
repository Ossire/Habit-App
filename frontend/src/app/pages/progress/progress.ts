import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './progress.html',
  styleUrls: ['./progress.css'],
})
export class ProgressComponent {
  strongHabits = [
    { id: 1, title: 'Drink Water', streak: 24, consistency: 95 },
    { id: 2, title: 'Read 10 Pages', streak: 18, consistency: 91 },
  ];

  weakHabits = [
    { id: 3, title: 'Go for a Run', streak: 2, consistency: 42 },
    { id: 4, title: 'Meditate', streak: 0, consistency: 35 },
  ];

  // Values map to height percentages for the bar chart
  monthlyTrend = [
    { label: 'W1', height: 45, isHigh: false },
    { label: 'W2', height: 85, isHigh: true },
    { label: 'W3', height: 100, isHigh: true },
    { label: 'W4', height: 60, isHigh: false },
  ];
}
