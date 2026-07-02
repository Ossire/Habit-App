import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service'

import {
  UserService,
  UserProfile,
} from '../../services/user.service';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './edit-profile.html',
  styleUrls: ['./edit-profile.css'],
})
export class EditProfile implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);
  private authService = inject(AuthService);

  profile = signal<UserProfile | null>(null);

  fullName = signal('');
  school = signal('');
  email = signal('');

  isLoading = signal(true);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  ngOnInit() {
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.profile.set(user);

        this.fullName.set(user.fullName);
        this.school.set(user.school);
        this.email.set(user.email);

        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load profile.');
        this.isLoading.set(false);
      },
    });
  }

  saveProfile() {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (!this.fullName().trim()) {
      this.errorMessage.set('Full name is required.');
      return;
    }

    if (!this.school().trim()) {
      this.errorMessage.set('School is required.');
      return;
    }

    this.isSaving.set(true);

    this.userService.updateProfile({
      fullName: this.fullName(),
      school: this.school(),
    }).subscribe({
      next: (updatedUser) => {
        this.profile.set(updatedUser);

        this.fullName.set(updatedUser.fullName);
        this.school.set(updatedUser.school);
        this.email.set(updatedUser.email);

        this.authService.updateCurrentUser(updatedUser);

        this.isSaving.set(false);
        
        // Return to Settings 
        this.successMessage.set('Profile updated successfully!');
        setTimeout(() => {
          this.router.navigate(['/settings']);
        }, 1000);
      },
      error: (error) => {
        this.errorMessage.set(
          error.error?.message ?? 'Failed to update profile.'
        );

        this.isSaving.set(false);
      },
    });
  }
}