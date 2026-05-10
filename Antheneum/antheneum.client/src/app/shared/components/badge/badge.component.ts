import { Component, Input } from '@angular/core';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

@Component({
  selector: 'app-badge',
  standalone: false,
  template: `<span class="badge badge--{{ variant }}">{{ label }}</span>`,
  styles: [`
    .badge {
      display: inline-block;
      padding: 0.2em 0.65em;
      border-radius: var(--radius-full);
      font-size: var(--text-xs);
      font-weight: 600;
      letter-spacing: 0.03em;
      text-transform: uppercase;
    }
    .badge--primary  { background: var(--color-primary-light); color: var(--color-primary-dark); }
    .badge--success  { background: var(--color-success-light); color: var(--color-success-dark); }
    .badge--warning  { background: var(--color-warning-light); color: var(--color-warning-dark); }
    .badge--danger   { background: var(--color-danger-light);  color: var(--color-danger-dark); }
    .badge--neutral  { background: var(--color-neutral-100);   color: var(--color-neutral-700); }
  `],
})
export class BadgeComponent {
  @Input() label = '';
  @Input() variant: BadgeVariant = 'neutral';
}
