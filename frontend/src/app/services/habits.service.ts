// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root',
// })
// export class HabitsService {
//   // Points directly to your local NestJS engine
//   private apiUrl = 'http://localhost:3000/api/habits';

//   constructor(private http: HttpClient) {}

//   // Calls your GET endpoint
//   getDashboard(): Observable<any> {
//     return this.http.get(`${this.apiUrl}/dashboard`);
//   }

//   // Calls your PATCH endpoint
//   toggleHabit(id: number): Observable<any> {
//     return this.http.patch(`${this.apiUrl}/${id}/toggle`, {});
//   }
// }

import { Injectable, signal } from '@angular/core';

// Define the shape of our data
export interface Habit {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  completed?: boolean;
}

@Injectable({
  providedIn: 'root', // This makes the service a singleton available everywhere
})
export class HabitStateService {
  // The Signal holding our active state
  selectedHabits = signal<Habit[]>([]);

  // Called by Onboarding to save selections
  setHabits(habits: Habit[]) {
    // Add a completed flag defaulted to false
    this.selectedHabits.set(habits.map((h) => ({ ...h, completed: false })));
  }

  // Called by Dashboard to check things off
  toggleCompletion(habitId: string) {
    this.selectedHabits.update((habits) =>
      habits.map((h) => (h.id === habitId ? { ...h, completed: !h.completed } : h)),
    );
  }
}
