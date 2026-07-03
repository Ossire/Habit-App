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
  trackingType: string; // 'toggle' | 'count' | 'duration' | 'timer'
  dailyTarget: number | null;
  targetUnit: string | null;
  completedToday?: boolean;
  loggedValue?: number | null;
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
  trackingType: string;
  dailyTarget: number | null;
  targetUnit: string | null;
  currentStreak: number;
  weeklyActivity: { date: string; completed: boolean; value: number | null }[];
}

export interface ProgressHabit {
  id: string;
  name: string;
  icon: string;
  category: string;
  consistency: number;
  streak: number;
  status: string; // 'MISSED_3_DAYS' | 'STAGNANT' | 'LOW_CONSISTENCY'
  completedToday: boolean;
}

export interface MonthlyTrend {
  label: string;
  completions: number;
}

export interface DomainMastery {
  category: string;
  consistency: number;
  totalHabits: number;
  completedToday: number;
}

export interface ProgressResponse {
  strongHabits: ProgressHabit[];
  needsAttention: ProgressHabit[];
  monthlyTrend: MonthlyTrend[];
  domainMastery: DomainMastery[];
}

export interface CreateHabitDto {
  name: string;
  description?: string;
  category: string;
  icon?: string;
  trackingType?: string;
  dailyTarget?: number;
  targetUnit?: string;
}

export interface LogHabitResponse {
  message: string;
  value: number;
  target: number;
  targetUnit: string;
  completed: boolean;
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

  // For count and duration habits — logs a numeric value
  logHabit(habitId: string, value: number): Observable<LogHabitResponse> {
    return this.http.post<LogHabitResponse>(`${this.apiUrl}/${habitId}/log`, { value });
  }

  getHabitDetail(habitId: string): Observable<HabitDetail> {
    return this.http.get<HabitDetail>(`${this.apiUrl}/${habitId}`);
  }

  getProgress(): Observable<ProgressResponse> {
    return this.http.get<ProgressResponse>(`${this.apiUrl}/progress`);
  }

  getHeatmap(): Observable<any> {
    return this.http.get(`${this.apiUrl}/heatmap`);
  }

  // Create a custom habit from the Quick Add modal
  createHabit(dto: CreateHabitDto): Observable<Habit> {
    return this.http.post<Habit>(`${this.apiUrl}`, dto);
  }
}
