import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LibraryStore } from '../core/state/library.store';
import { AuthService } from '../core/services/auth.service';

interface NavSection {
  path: string;
  label: string;
  eyebrow: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: false,
})
export class App implements OnInit, OnDestroy {
  private readonly adminSections: NavSection[] = [
    { path: '/admin/overview', label: 'Overview', eyebrow: 'Mission control' },
    { path: '/admin/branches', label: 'Branches', eyebrow: 'Network and locations' },
    { path: '/admin/books', label: 'Books', eyebrow: 'Catalog and metadata' },
    { path: '/admin/users', label: 'Users', eyebrow: 'Profiles and roles' },
    { path: '/admin/returns', label: 'Loans', eyebrow: 'Loan processing' },
    { path: '/admin/reports', label: 'Reports', eyebrow: 'Admin analytics' },
  ];
  private readonly readerSections: NavSection[] = [
    { path: '/reader/loans', label: 'My loans', eyebrow: 'Reader dashboard' },
  ];

  private sessionSubscription?: Subscription;

  constructor(
    public readonly store: LibraryStore,
    public readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  get sections(): NavSection[] {
    const role = this.auth.role();
    if (role === 'Administrator') {
      return this.adminSections;
    }
    if (role === 'Reader') {
      return this.readerSections;
    }
    return [];
  }

  get workspaceEyebrow() {
    return this.auth.role() === 'Administrator' ? 'Antheneum' : 'Antheneum reader';
  }

  get workspaceTitle() {
    return this.auth.role() === 'Administrator' ? 'Control room' : 'Reader workspace';
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
