// src/app/services/habits.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Habit {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  completedToday?: boolean;
}

export interface DashboardResponse {
  date: string;
  progressPercentage: number;
  completedCount: number;
  totalCount: number;
  habits: Habit[];
}

export interface HabitDetail {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  currentStreak: number;
  weeklyActivity: { date: string; completed: boolean }[];
}

@Injectable({
  providedIn: 'root',
})
export class HabitsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/habits';

  // add to habits.service.ts
  hasUserHabits(): Observable<boolean> {
    return this.getDashboard().pipe(map((data) => data.totalCount > 0));
  }

  getSystemHabits(): Observable<Habit[]> {
    return this.http.get<Habit[]>(`${this.apiUrl}/system`);
  }

  selectHabits(habitIds: string[]): Observable<Habit[]> {
    return this.http.post<Habit[]>(`${this.apiUrl}/select`, { habitIds });
  }

  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.apiUrl}/dashboard`);
  }

  completeHabit(habitId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${habitId}/complete`, {});
  }

  uncompleteHabit(habitId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${habitId}/complete`);
  }

  getHabitDetail(habitId: string): Observable<HabitDetail> {
    return this.http.get<HabitDetail>(`${this.apiUrl}/${habitId}`);
  }

  getProgress(): Observable<any> {
    return this.http.get(`${this.apiUrl}/progress`);
  }

  getHeatmap(): Observable<any> {
    return this.http.get(`${this.apiUrl}/heatmap`);
  }
}
