import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

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

  signupForm = this.fb.nonNullable.group({
    // Pre-filled with demo data
    fullName: ['Alex Developer', Validators.required],
    school: ['University of Technology'],
    email: ['alex@habitup.app', [Validators.required, Validators.email]],
    password: ['demo1234', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit() {
    if (this.signupForm.valid) {
      console.log('Sending to backend:', this.signupForm.getRawValue());
      this.router.navigate(['/login']);
    } else {
      this.signupForm.markAllAsTouched();
    }
  }

  onGoogleAuth() {
    console.log('Triggering Google OAuth flow...');
    // TODO: Implement Google Auth
  }
}
