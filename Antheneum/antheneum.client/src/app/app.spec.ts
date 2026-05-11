import { describe, expect, it } from 'vitest';
import { App } from './app';
import { AdminDashboardStore } from './admin-dashboard.store';

const adminDashboardStoreStub = {
  metrics: [{ label: 'Branch network', value: 1, tone: 'sun' }],
  loadDashboard: () => undefined,
  ensureLoaded: () => undefined,
} as unknown as AdminDashboardStore;

describe('App', () => {
  it('should create the app', () => {
    const component = new App(adminDashboardStoreStub);

    expect(component).toBeTruthy();
  });

  it('should expose routed dashboard sections', () => {
    const component = new App(adminDashboardStoreStub);

    expect(component.sections).toHaveLength(6);
    expect(component.sections[1].label).toBe('Library management');
    expect(component.sections[4].path).toBe('/reports');
  });
});