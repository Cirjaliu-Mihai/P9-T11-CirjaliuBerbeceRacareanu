import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthSession } from '../../../models/auth/auth-session.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-auth-page',
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.css',
  standalone: false,
})
export class AuthPageComponent {
  mode: 'login' | 'register' = 'login';
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  confirmPassword = '';

  readonly login = { username: '', password: '' };
  readonly register = { username: '', email: '', password: '' };

  constructor(
    private readonly auth: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  setMode(mode: 'login' | 'register') {
    this.mode = mode;
    this.errorMessage = '';
    this.successMessage = '';
    this.isSubmitting = false;
  }

  submitLogin() {
    if (!this.login.username.trim() || !this.login.password.trim()) {
      this.errorMessage = 'Enter both username and password.';
      this.successMessage = '';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.auth
      .login({
        username: this.login.username.trim(),
        password: this.login.password,
      })
      .subscribe({
        next: (session) => {
          this.isSubmitting = false;
          this.handleAuthSuccess(session);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = error.error?.message ?? 'Unable to sign in with those credentials.';
        },
      });
  }

  submitRegister() {
    if (!this.register.username.trim() || !this.register.email.trim() || !this.register.password) {
      this.errorMessage = 'Complete username, email, and password to create a reader account.';
      this.successMessage = '';
      return;
    }

    if (this.register.password !== this.confirmPassword) {
      this.errorMessage = 'Password confirmation does not match.';
      this.successMessage = '';
      return;
    }

    // Client-side password policy: min 8 chars, at least one uppercase, one digit and one special char
    const policy = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!policy.test(this.register.password)) {
      this.errorMessage =
        'Password must be at least 8 characters and include an uppercase letter, a number and a special character.';
      this.successMessage = '';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.auth
      .register({
        username: this.register.username.trim(),
        email: this.register.email.trim(),
        password: this.register.password,
      })
      .subscribe({
        next: (session) => {
          this.isSubmitting = false;
          this.successMessage = 'Reader account created. Redirecting to your workspace.';
          this.handleAuthSuccess(session);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = error.error?.message ?? 'Unable to create that reader account.';
        },
      });
  }

  private handleAuthSuccess(session: AuthSession) {
    const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo');
    const target =
      redirectTo && redirectTo.startsWith('/')
        ? redirectTo
        : this.auth.defaultRouteFor(session.role);
    void this.router.navigateByUrl(target);
  }

  continueAsGuest() {
    void this.router.navigateByUrl('/reader/catalog');
  }
}
