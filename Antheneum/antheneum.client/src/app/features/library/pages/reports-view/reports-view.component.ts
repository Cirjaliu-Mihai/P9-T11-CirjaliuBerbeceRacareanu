import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BranchesStore } from '../../../../core/state/branches.store';
import { LoansStore } from '../../../../core/state/loans.store';
import { ReportsStore } from '../../../../core/state/reports.store';

@Component({
  selector: 'app-reports-view',
  templateUrl: './reports-view.component.html',
  styleUrl: './reports-view.component.css',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsViewComponent {
  transactionFromDate: Date | null;
  transactionToDate: Date | null;

  constructor(
    public readonly store: ReportsStore,
    public readonly loans: LoansStore,
    public readonly branches: BranchesStore,
  ) {
    this.transactionFromDate = this.parseIsoDate(this.store.reportFrom);
    this.transactionToDate = this.parseIsoDate(this.store.reportTo);
  }

  onReportTypeChange(value: string): void {
    this.store.selectedReportType = value as any;
  }

  onBranchChange(value: string): void {
    this.store.selectedBranchId = value;
  }

  onFromDateChange(value: Date | null): void {
    this.transactionFromDate = value;
    this.store.reportFrom = this.toIsoDate(value);
  }

  onToDateChange(value: Date | null): void {
    this.transactionToDate = value;
    this.store.reportTo = this.toIsoDate(value);
  }

  trackByLoanId(index: number, item: any): number {
    return item?.loanId ?? index;
  }

  trackByBranchId(index: number, item: any): any {
    return item?.branchId ?? index;
  }

  trackByReportItemId(index: number, item: any): any {
    return item?.id ?? item?.loanId ?? item?.branchId ?? index;
  }

  private parseIsoDate(value: string): Date | null {
    if (!value) {
      return null;
    }
    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private toIsoDate(value: Date | null): string {
    if (!value) {
      return '';
    }
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
