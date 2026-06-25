export class Login {}
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService)

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  // onSubmit() {
  //   if (this.loginForm.valid) {
  //     // Mocking the user data payload
  //     console.log('Mocking login payload:', this.loginForm.getRawValue());

  //     // Simulate successful auth and route to dashboard
  //     this.router.navigate(['/habit-selection']);
  //   } else {
  //     this.loginForm.markAllAsTouched();
  //   }
  // }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
 
    this.isLoading.set(true);
    this.errorMessage.set(null);
 
    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/habit-selection']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        console.log(err);
        this.errorMessage.set(
          err.error?.message || err.message
        );
      },
    });
  }



  onGoogleAuth() {
    console.log('Triggering mocked Google OAuth flow...');
    this.router.navigate(['/habit-selection']);
  }
}
