import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthSession } from './auth.models';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth-page',
  template: `
    <section class="auth-page">
      <mat-card class="auth-page__panel auth-page__panel--form panel">
        <div class="panel-heading auth-heading">
          <div>
            <p class="kicker">{{ mode === 'login' ? 'Sign in' : 'Reader account' }}</p>
            <h3>{{ mode === 'login' ? 'Continue to Antheneum' : 'Create a reader account' }}</h3>
          </div>
        </div>

        <form *ngIf="mode === 'login'; else registerForm" class="auth-form" (ngSubmit)="submitLogin()">
          <mat-form-field appearance="outline">
            <mat-label>Username</mat-label>
            <input matInput name="loginUsername" [(ngModel)]="login.username" autocomplete="username" required>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput name="loginPassword" [(ngModel)]="login.password" type="password" autocomplete="current-password" required>
          </mat-form-field>

          <p *ngIf="errorMessage" class="auth-feedback auth-feedback--error">{{ errorMessage }}</p>
          <p *ngIf="successMessage" class="auth-feedback auth-feedback--success">{{ successMessage }}</p>

          <button mat-flat-button color="primary" type="submit" [disabled]="isSubmitting">
            {{ isSubmitting ? 'Signing in...' : 'Sign in' }}
          </button>

          <button mat-button type="button" class="auth-toggle" (click)="setMode('register')">
            Create new reader account
          </button>
        </form>

        <ng-template #registerForm>
          <form class="auth-form" (ngSubmit)="submitRegister()">
            <mat-form-field appearance="outline">
              <mat-label>Username</mat-label>
              <input matInput name="registerUsername" [(ngModel)]="register.username" autocomplete="username" required>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput name="registerEmail" [(ngModel)]="register.email" type="email" autocomplete="email" required>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Password</mat-label>
              <input matInput name="registerPassword" [(ngModel)]="register.password" type="password" autocomplete="new-password" required>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Confirm password</mat-label>
              <input matInput name="confirmPassword" [(ngModel)]="confirmPassword" type="password" autocomplete="new-password" required>
            </mat-form-field>

            <p class="auth-note">New accounts are created with the Reader role.</p>

            <p *ngIf="errorMessage" class="auth-feedback auth-feedback--error">{{ errorMessage }}</p>
            <p *ngIf="successMessage" class="auth-feedback auth-feedback--success">{{ successMessage }}</p>

            <button mat-flat-button color="primary" type="submit" [disabled]="isSubmitting">
              {{ isSubmitting ? 'Creating account...' : 'Create account' }}
            </button>

            <button mat-button type="button" class="auth-toggle" (click)="setMode('login')">
              Back to sign in
            </button>
          </form>
        </ng-template>
      </mat-card>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }

    .auth-page {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: clamp(1.2rem, 4vw, 2rem);
    }

    .auth-page__panel {
      min-width: 0;
    }

    .auth-page__panel--form {
      width: min(100%, 460px);
      padding: 1.5rem;
    }

    .auth-heading {
      margin-bottom: 1.25rem;
    }

    .auth-form {
      display: grid;
      gap: 1rem;
    }

    .auth-feedback {
      margin: 0;
      padding: 0.85rem 1rem;
      border-radius: 16px;
    }

    .auth-note {
      margin: -0.15rem 0 0;
      color: var(--muted);
      font-size: 0.95rem;
    }

    .auth-feedback--error {
      background: rgba(255, 142, 127, 0.12);
      color: #9f3a30;
    }

    .auth-feedback--success {
      background: rgba(146, 224, 215, 0.16);
      color: #11675c;
    }

    .auth-toggle {
      justify-self: start;
      padding-left: 0;
    }

    @media (max-width: 640px) {
      .auth-page__panel--form {
        padding: 1.15rem;
      }
    }
  `],
  standalone: false,
})
export class AuthPageComponent {
  mode: 'login' | 'register' = 'login';
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  confirmPassword = '';

  readonly login = {
    username: '',
    password: '',
  };

  readonly register = {
    username: '',
    email: '',
    password: '',
  };

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

    this.auth.login({
      username: this.login.username.trim(),
      password: this.login.password,
    }).subscribe({
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

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.auth.register({
      username: this.register.username.trim(),
      email: this.register.email.trim(),
      password: this.register.password,
    }).subscribe({
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
    const target = redirectTo && redirectTo.startsWith('/') ? redirectTo : this.auth.defaultRouteFor(session.role);
    void this.router.navigateByUrl(target);
  }
}