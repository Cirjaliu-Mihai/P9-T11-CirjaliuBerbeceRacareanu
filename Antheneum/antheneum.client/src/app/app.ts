import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AdminDashboardStore } from './admin/admin-dashboard.store';
import { AuthRole } from './auth/auth.models';
import { AuthService } from './auth/auth.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  private readonly adminSections = [
    { path: '/overview', label: 'Overview', eyebrow: 'Mission control' },
    { path: '/branches', label: 'Branches', eyebrow: 'Network and locations' },
    { path: '/books', label: 'Books', eyebrow: 'Catalog and metadata' },
    { path: '/users', label: 'Users', eyebrow: 'Profiles and roles' },
    { path: '/returns', label: 'Loans', eyebrow: 'Loan processing' },
    { path: '/reports', label: 'Reports', eyebrow: 'Admin analytics' },
  ];
  private readonly readerSections = [
    { path: '/loans', label: 'My loans', eyebrow: 'Reader dashboard' },
  ];
  private sessionSubscription?: Subscription;

  constructor(
    public readonly store: AdminDashboardStore,
    public readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  get sections() {
    return this.auth.role() === 'Administrator' ? this.adminSections : this.auth.role() === 'Reader' ? this.readerSections : [];
  }

  get workspaceEyebrow() {
    return this.auth.role() === 'Administrator' ? 'Antheneum' : 'Antheneum reader';
  }

  get workspaceTitle() {
    return this.auth.role() === 'Administrator' ? 'Control room' : 'Reader workspace';
  }

  get workspaceDescription() {
    return this.auth.role() === 'Administrator'
      ? 'Admin dashboard and reports workspace for the library operations rollout.'
      : 'Track current loans, review account details, and stay ahead of return dates.';
  }

  get workspaceChip() {
    return this.auth.role() === 'Administrator' ? 'Operations suite' : 'Reader access';
  }

  get heroEyebrow() {
    return this.auth.role() === 'Administrator' ? 'Library operations' : 'Borrowing activity';
  }

  get heroTitle() {
    return this.auth.role() === 'Administrator'
      ? 'Modern admin control across branches, readers, and reports.'
      : 'One clear view of your current loans and next due dates.';
  }

  get heroCopy() {
    return this.auth.role() === 'Administrator'
      ? 'A brighter, streamlined workspace for day-to-day catalog, circulation, and reporting activity with live data flowing in automatically.'
      : 'A reader-first view for active items, profile updates, and the loan status that matters right now.';
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
