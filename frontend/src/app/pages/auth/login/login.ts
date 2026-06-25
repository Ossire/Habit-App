export class Login {}
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

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

  loginForm = this.fb.nonNullable.group({
    // Pre-filled with matching demo data
    email: ['alex@habitup.app', [Validators.required, Validators.email]],
    password: ['demo1234', Validators.required],
  });

  onSubmit() {
    if (this.loginForm.valid) {
      // Mocking the user data payload
      console.log('Mocking login payload:', this.loginForm.getRawValue());

      // Simulate successful auth and route to dashboard
      this.router.navigate(['/habit-selection']);
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  onGoogleAuth() {
    console.log('Triggering mocked Google OAuth flow...');
    this.router.navigate(['/habit-selection']);
  }
}
