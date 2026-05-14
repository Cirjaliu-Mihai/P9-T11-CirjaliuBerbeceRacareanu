import { Component } from '@angular/core';
import { BranchesStore } from '../../../../core/state/branches.store';
import { LoansStore } from '../../../../core/state/loans.store';
import { ReportsStore } from '../../../../core/state/reports.store';

@Component({
  selector: 'app-reports-view',
  templateUrl: './reports-view.component.html',
  styleUrl: './reports-view.component.css',
  standalone: false,
})
export class ReportsViewComponent {
  constructor(
    public readonly store: ReportsStore,
    public readonly loans: LoansStore,
    public readonly branches: BranchesStore,
  ) {}
}
