// src/app/pages/heatmap/heatmap.ts
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HabitsService } from '../../services/habits.service';

type Tab = 'weekly' | 'monthly' | 'annual';

@Component({
  selector: 'app-heatmap',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './heatmap.html',
  styleUrls: ['./heatmap.css'],
})
export class HeatmapComponent implements OnInit {
  private habitsService = inject(HabitsService);

  allGrid = signal<{ date: string; count: number; intensity: number }[]>([]);
  activeTab = signal<Tab>('weekly');
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  // Slice the full 84-day grid based on active tab
  visibleGrid = computed(() => {
    const grid = this.allGrid();
    const tab = this.activeTab();
    if (tab === 'weekly') return grid.slice(-7);
    if (tab === 'monthly') return grid.slice(-28);
    return grid; // annual = all 84 days
  });

  ngOnInit() {
    this.habitsService.getHeatmap().subscribe({
      next: (data) => {
        this.allGrid.set(data.grid);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load heatmap.');
        this.isLoading.set(false);
      },
    });
  }

  setTab(tab: Tab) {
    this.activeTab.set(tab);
  }
}
