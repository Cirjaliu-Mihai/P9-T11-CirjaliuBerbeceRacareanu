import { describe, expect, it } from 'vitest';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { AdminDashboardStore } from './admin/admin-dashboard.store';
import { App } from './app';
import { AuthService } from './auth/auth.service';

const adminDashboardStoreStub = {
  metrics: [{ label: 'Branch network', value: 1, tone: 'sun' }],
  loadDashboard: () => undefined,
  ensureLoaded: () => undefined,
  setViewerRole: () => undefined,
} as unknown as AdminDashboardStore;

const routerStub = {
  navigateByUrl: () => Promise.resolve(true),
} as unknown as Router;

describe('App', () => {
  it('should create the app', () => {
    const authStub = {
      session$: of(null),
      role: () => null,
      isAuthenticated: () => false,
      logout: () => of(void 0),
      username: () => '',
    } as unknown as AuthService;

    const component = new App(adminDashboardStoreStub, authStub, routerStub);

    expect(component).toBeTruthy();
  });

  it('should expose administrator sections for admin sessions', () => {
    const authStub = {
      session$: of({ role: 'Administrator' }),
      role: () => 'Administrator',
      isAuthenticated: () => true,
      logout: () => of(void 0),
      username: () => 'librarian',
    } as unknown as AuthService;

    const component = new App(adminDashboardStoreStub, authStub, routerStub);

    expect(component.sections).toHaveLength(6);
    expect(component.sections[1].label).toBe('Branches');
    expect(component.sections[5].path).toBe('/reports');
  });

  it('should expose reader navigation for reader sessions', () => {
    const authStub = {
      session$: of({ role: 'Reader' }),
      role: () => 'Reader',
      isAuthenticated: () => true,
      logout: () => of(void 0),
      username: () => 'reader',
    } as unknown as AuthService;

    const component = new App(adminDashboardStoreStub, authStub, routerStub);

    expect(component.sections).toHaveLength(1);
    expect(component.sections[0].path).toBe('/loans');
  });
});