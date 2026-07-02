import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
  id: string;
  fullName: string;
  school: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileDto {
  fullName: string;
  school: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/users';

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`);
  }

  updateProfile(payload: UpdateProfileDto): Observable<UserProfile> {
    return this.http.patch<UserProfile>(
      `${this.apiUrl}/profile`,
      payload,
    );
  }
}