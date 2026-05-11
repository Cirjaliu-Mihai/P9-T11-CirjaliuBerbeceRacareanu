import { Component, OnInit } from '@angular/core';
import { AdminDashboardStore } from './admin-dashboard.store';


@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App implements OnInit {
  readonly sections = [
    { path: '/overview', label: 'Overview', eyebrow: 'Mission control' },
    { path: '/library', label: 'Library management', eyebrow: 'Books and branches' },
    { path: '/readers', label: 'Readers', eyebrow: 'Profiles and roles' },
    { path: '/returns', label: 'Returns', eyebrow: 'Loan processing' },
    { path: '/reports', label: 'Reports', eyebrow: 'Admin analytics' },
    { path: '/loans', label: 'My loans', eyebrow: 'Reader dashboard' },
  ];

  constructor(public readonly store: AdminDashboardStore) {}

  ngOnInit() {
    this.store.ensureLoaded();
  }
}
