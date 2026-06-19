// Path: src/app/pages/profile/profile.ts

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class ProfileComponent {
  // Mock User State
  user = signal({
    name: 'Alex Johnson',
    school: 'University of Life',
  });

  // Interests State
  interests = signal([
    { name: 'Health', active: true },
    { name: 'Productivity', active: false },
    { name: 'Reading', active: true },
    { name: 'Coding', active: false },
    { name: 'Running', active: true },
  ]);

  // Notifications State
  dailyReminders = signal(true);
  streakAlerts = signal(false);

  toggleInterest(index: number) {
    this.interests.update((items) => {
      items[index].active = !items[index].active;
      return [...items]; // Return new array reference to trigger signal update
    });
  }

  toggleReminder() {
    this.dailyReminders.update((v) => !v);
  }
  toggleStreak() {
    this.streakAlerts.update((v) => !v);
  }

  logout() {
    alert('Logged out for MVP demo!');
  }
}
