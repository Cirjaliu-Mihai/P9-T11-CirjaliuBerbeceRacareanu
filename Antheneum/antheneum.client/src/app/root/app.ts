import { Component } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { LibraryStore } from '../core/state/library.store';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: false,
})
export class App {
  readonly workspaceEyebrow = 'Library Management System';
  readonly workspaceTitle = 'Antheneum';
  readonly sections = [
    { path: '/admin/books', label: 'Books', eyebrow: 'Admin' },
    { path: '/admin/readers', label: 'Readers', eyebrow: 'Admin' },
    { path: '/admin/branches', label: 'Branches', eyebrow: 'Admin' },
    { path: '/admin/loans', label: 'Loans', eyebrow: 'Admin' },
    { path: '/admin/reports', label: 'Reports', eyebrow: 'Admin' },
  ];

  constructor(
    public readonly auth: AuthService,
    public readonly store: LibraryStore,
  ) {}

  logout(): void {
    this.auth.logout().subscribe();
  }
}
