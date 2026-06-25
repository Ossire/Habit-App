import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  signupForm = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    school: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  // onSubmit() {
  //   if (this.signupForm.valid) {
  //     console.log('Sending to backend:', this.signupForm.getRawValue());
  //     this.router.navigate(['/login']);
  //   } else {
  //     this.signupForm.markAllAsTouched();
  //   }
  // }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }
 
    this.isLoading.set(true);
    this.errorMessage.set(null);
 
    this.authService.register(this.signupForm.getRawValue()).subscribe({
      next: () => {
        this.isLoading.set(false);
        // Registration also logs the user in — go straight to onboarding
        this.router.navigate(['/habit-selection']);
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message);
      },
    });
  }

  onGoogleAuth() {
    console.log('Triggering Google OAuth flow...');
    // TODO: Implement Google Auth
  }
}
