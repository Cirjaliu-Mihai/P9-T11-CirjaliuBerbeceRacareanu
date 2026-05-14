import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-shell-header-summary',
  templateUrl: './shell-header-summary.component.html',
  styleUrl: './shell-header-summary.component.css',
  standalone: false,
})
export class ShellHeaderSummaryComponent {
  @Input() eyebrow = '';
  @Input() title = '';
  @Input() description = '';
  @Input() chip = '';
  @Input() sectionCount = 0;
}