import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './change-password.html',
  styleUrls: ['./change-password.css'],
})
export class ChangePassword {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);

  currentPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');

  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  isSaving = signal(false);

  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  changePassword() {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (!this.currentPassword().trim()) {
      this.errorMessage.set('Current password is required.');
      return;
    }

    if (!this.newPassword().trim()) {
      this.errorMessage.set('New password is required.');
      return;
    }

    if (this.newPassword().length < 8) {
      this.errorMessage.set(
        'Password must be at least 8 characters long.',
      );
      return;
    }

    if (!this.confirmPassword().trim()) {
      this.errorMessage.set('Please confirm your new password.');
      return;
    }

    if (this.newPassword() !== this.confirmPassword()) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    this.isSaving.set(true);

    this.userService
      .changePassword({
        currentPassword: this.currentPassword(),
        newPassword: this.newPassword(),
      })
      .subscribe({
        next: (response) => {
          this.isSaving.set(false);

          this.successMessage.set(response.message);

          setTimeout(() => {
            this.authService.logout();
            this.router.navigate(['/login']);
          }, 1500);
        },

        error: (error) => {
          this.isSaving.set(false);

          this.errorMessage.set(
            error.error?.message ??
              'Unable to change password.',
          );
        },
      });
  }
}