import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HabitsService {
  // Points directly to your local NestJS engine
  private apiUrl = 'http://localhost:3000/api/habits';

  constructor(private http: HttpClient) {}

  // Calls your GET endpoint
  getDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard`);
  }

  // Calls your PATCH endpoint
  toggleHabit(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/toggle`, {});
  }
}
