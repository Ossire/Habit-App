import { Component, signal } from '@angular/core';
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
  activeTab = signal<'weekly' | 'monthly'>('weekly');

  // Mock data for the CSS charts to make the MVP look complete
  weeklyData = [20, 60, 40, 90, 30, 80, 50]; // Percentages for bars
  days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  // Generates 28 blocks for a 4-week mock heatmap (0-3 intensity)
  heatmapBlocks = Array.from({ length: 28 }, () => Math.floor(Math.random() * 4));

  setTab(tab: 'weekly' | 'monthly') {
    this.activeTab.set(tab);
  }
}
