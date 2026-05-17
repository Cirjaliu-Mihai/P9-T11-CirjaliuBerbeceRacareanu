import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LibraryStore } from '../../../core/state/library.store';
import { AuthService } from '../../../core/services/auth.service';

interface NavSection {
  path: string;
  label: string;
  eyebrow: string;
}

@Component({
  selector: 'app-admin-shell',
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.css',
  standalone: false,
})
export class AdminShellComponent implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  readonly store = inject(LibraryStore);
  private readonly router = inject(Router);

  private sessionSubscription?: Subscription;

  readonly sections: NavSection[] = [
    { path: '/admin/branches', label: 'Branches', eyebrow: '' },
    { path: '/admin/books', label: 'Books', eyebrow: '' },
    { path: '/admin/users', label: 'Users', eyebrow: '' },
    { path: '/admin/returns', label: 'Loans', eyebrow: '' },
    { path: '/admin/reports', label: 'Reports', eyebrow: '' },
    { path: '/admin/events', label: 'Events', eyebrow: '' },
  ];

  get username(): string {
    return this.auth.username();
  }

  ngOnInit() {
    this.sessionSubscription = this.auth.session$.subscribe((session) => {
      this.store.setViewerRole(session?.role ?? null);
    });
  }

  ngOnDestroy() {
    this.sessionSubscription?.unsubscribe();
  }

  logout() {
    this.auth.logout().subscribe(() => {
      void this.router.navigateByUrl('/auth');
    });
  }
}
