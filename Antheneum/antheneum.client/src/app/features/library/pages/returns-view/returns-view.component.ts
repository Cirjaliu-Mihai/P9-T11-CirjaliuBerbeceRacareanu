import { Component } from '@angular/core';
import { BlacklistReport } from '../../../../models/reports/blacklist-report.model';
import { LoansStore } from '../../../../core/state/loans.store';

@Component({
  selector: 'app-returns-view',
  templateUrl: './returns-view.component.html',
  styleUrl: './returns-view.component.css',
  standalone: false,
})
export class ReturnsViewComponent {
  constructor(public readonly store: LoansStore) {}

  confirmReturn() {
    this.store.confirmReturn().subscribe();
  }

  resolvePenalty(entry: BlacklistReport) {
    this.store.resolvePenalty(entry).subscribe();
  }
}
