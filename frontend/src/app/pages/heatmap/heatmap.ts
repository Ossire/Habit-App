import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-heatmap',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './heatmap.html',
  styleUrls: ['./heatmap.css'],
})
export class HeatmapComponent {
  // 1. The core state
  activeTab = signal<'weekly' | 'monthly' | 'annual'>('weekly');

  // 2. Reactive Bar Chart Data
  chartData = computed(() => {
    const tab = this.activeTab();
    if (tab === 'weekly') return [20, 60, 40, 90, 30, 80, 50];
    if (tab === 'monthly') return [40, 75, 60, 90]; // 4 weeks
    return [30, 40, 50, 60, 80, 90, 70, 60, 50, 40, 30, 60]; // 12 months
  });

  // 3. Reactive Bar Chart Labels
  chartLabels = computed(() => {
    const tab = this.activeTab();
    if (tab === 'weekly') return ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    if (tab === 'monthly') return ['W1', 'W2', 'W3', 'W4'];
    return ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  });

  // 4. Reactive Heatmap Grid (Generates random intensity 0-3)
  heatmapBlocks = computed(() => {
    const tab = this.activeTab();
    // Weekly = 7 squares, Monthly = 28 squares, Annual = 84 squares (12 weeks for visual fit)
    const blockCount = tab === 'weekly' ? 7 : tab === 'monthly' ? 28 : 84;
    return Array.from({ length: blockCount }, () => Math.floor(Math.random() * 4));
  });

  setTab(tab: 'weekly' | 'monthly' | 'annual') {
    this.activeTab.set(tab);
  }
}
