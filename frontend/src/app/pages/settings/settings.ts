import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

const ALL_INTERESTS = [
  'Health',
  'Productivity',
  'Reading',
  'Coding',
  'Running',
  'Fitness',
  'Mindfulness',
  'Study',
];

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  user = signal<any>(null);
  isLoading = signal(true);
  dailyReminders = signal(true);
  streakAlerts = signal(false);

  allInterests = ALL_INTERESTS;
  selectedInterests = signal<Set<string>>(new Set(['Health', 'Productivity', 'Reading']));

  ngOnInit() {
    // Load saved interests from localStorage
    const saved = localStorage.getItem('interests');
    if (saved) {
      this.selectedInterests.set(new Set(JSON.parse(saved)));
    }

    this.authService.getProfile().subscribe({
      next: (data) => {
        this.user.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  toggleInterest(interest: string) {
    this.selectedInterests.update((set) => {
      const newSet = new Set(set);
      if (newSet.has(interest)) {
        newSet.delete(interest);
      } else {
        newSet.add(interest);
      }
      // Save to localStorage immediately
      localStorage.setItem('interests', JSON.stringify([...newSet]));
      return newSet;
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
