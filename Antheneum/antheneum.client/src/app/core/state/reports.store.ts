import { Injectable } from '@angular/core';
import { BehaviorSubject, finalize, Observable } from 'rxjs';
import { BlacklistReport } from '../../models/reports/blacklist-report.model';
import { InventoryReport } from '../../models/reports/inventory-report.model';
import { OverdueReport } from '../../models/reports/overdue-report.model';
import { PagedResult } from '../../models/common/paged-result.model';
import { ReportType } from '../../models/reports/report-type.model';
import { TransactionReport } from '../../models/reports/transaction-report.model';
import { ReportsService } from '../services/reports.service';
import { BranchesStore } from './branches.store';
import { LoansStore } from './loans.store';

@Injectable({ providedIn: 'root' })
export class ReportsStore {
  private readonly inventoryReportSubject = new BehaviorSubject<InventoryReport[]>([]);
  private readonly transactionReportSubject = new BehaviorSubject<TransactionReport[]>([]);
  private readonly reportStatusSubject = new BehaviorSubject('Select a report type and generate a view.');
  private readonly isReportLoadingSubject = new BehaviorSubject(false);

  readonly inventoryReport$ = this.inventoryReportSubject.asObservable();
  readonly transactionReport$ = this.transactionReportSubject.asObservable();
  readonly reportStatus$ = this.reportStatusSubject.asObservable();
  readonly isReportLoading$ = this.isReportLoadingSubject.asObservable();

  readonly reportTypes: Array<{ id: ReportType; label: string; helper: string }> = [
    { id: 'inventory', label: 'Inventory', helper: 'Stock level per branch and title' },
    { id: 'overdue', label: 'Overdue', helper: 'Late loans and fine exposure' },
    { id: 'blacklist', label: 'Blacklist', helper: 'Penalty queue and risk review' },
    { id: 'transactions', label: 'Transactions', helper: 'Borrow and return audit trail' },
  ];

  selectedReportType: ReportType = 'inventory';
  selectedBranchId = '';
  reportFrom = this.getIsoDate(-30);
  reportTo = this.getIsoDate(0);

  constructor(
    private readonly reportsService: ReportsService,
    private readonly loansStore: LoansStore,
    private readonly branchesStore: BranchesStore,
  ) {}

  get inventoryReport(): InventoryReport[] {
    return this.inventoryReportSubject.value;
  }

  private set inventoryReport(value: InventoryReport[]) {
    this.inventoryReportSubject.next(value);
  }

  get transactionReport(): TransactionReport[] {
    return this.transactionReportSubject.value;
  }

  private set transactionReport(value: TransactionReport[]) {
    this.transactionReportSubject.next(value);
  }

  get reportStatus(): string {
    return this.reportStatusSubject.value;
  }

  set reportStatus(value: string) {
    this.reportStatusSubject.next(value);
  }

  get isReportLoading(): boolean {
    return this.isReportLoadingSubject.value;
  }

  private set isReportLoading(value: boolean) {
    this.isReportLoadingSubject.next(value);
  }

  get branchName(): string {
    return this.branchesStore.getBranchName(this.selectedBranchId);
  }

  generateReport(): void {
    this.isReportLoading = true;
    const branchId = this.selectedBranchId ? Number(this.selectedBranchId) : null;

    let request$: Observable<
      | PagedResult<InventoryReport>
      | PagedResult<OverdueReport>
      | PagedResult<BlacklistReport>
      | PagedResult<TransactionReport>
    >;

    switch (this.selectedReportType) {
      case 'overdue':
        request$ = this.reportsService.overdue(branchId, 1, 8);
        break;
      case 'blacklist':
        request$ = this.reportsService.blacklist(branchId, 1, 8);
        break;
      case 'transactions':
        request$ = this.reportsService.transactions(this.reportFrom, this.reportTo, branchId, 1, 8);
        break;
      default:
        request$ = this.reportsService.inventory(branchId, 1, 8);
        break;
    }

    request$.pipe(finalize(() => { this.isReportLoading = false; })).subscribe({
      next: (response) => {
        this.inventoryReport = this.selectedReportType === 'inventory' ? response.items as InventoryReport[] : [];
        if (this.selectedReportType === 'overdue') {
          this.loansStore.overdueReport = response.items as OverdueReport[];
        }
        if (this.selectedReportType === 'blacklist') {
          this.loansStore.blacklistReport = response.items as BlacklistReport[];
        }
        this.transactionReport = this.selectedReportType === 'transactions' ? response.items as TransactionReport[] : [];
        this.reportStatus = `${this.reportTypes.find((item) => item.id === this.selectedReportType)?.label} report for ${this.branchName}.`;
      },
      error: () => {
        this.clearReportData();
        this.reportStatus = `Unable to load the ${this.selectedReportType} report from the API.`;
      },
    });
  }

  reset(): void {
    this.inventoryReport = [];
    this.transactionReport = [];
    this.isReportLoading = false;
  }

  private clearReportData(): void {
    switch (this.selectedReportType) {
      case 'inventory':
        this.inventoryReport = [];
        break;
      case 'overdue':
        this.loansStore.overdueReport = [];
        this.loansStore.selectedReturn = null;
        break;
      case 'blacklist':
        this.loansStore.blacklistReport = [];
        break;
      case 'transactions':
        this.transactionReport = [];
        break;
    }
  }

  private getIsoDate(offsetDays: number) {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    return date.toISOString().slice(0, 10);
  }
}
