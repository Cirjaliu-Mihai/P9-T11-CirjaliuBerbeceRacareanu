import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { BlacklistReport } from '../../models/reports/blacklist-report.model';
import { Loan } from '../../models/reader/loan.model';
import { OverdueReport } from '../../models/reports/overdue-report.model';
import { ReturnCandidate } from '../../models/reports/return-candidate.model';
import { BlacklistService } from '../services/blacklist.service';
import { LoansService } from '../services/loans.service';
import { ReadersStore } from './readers.store';

@Injectable({ providedIn: 'root' })
export class LoansStore {
  private readonly myLoansSubject = new BehaviorSubject<Loan[]>([]);
  private readonly overdueReportSubject = new BehaviorSubject<OverdueReport[]>([]);
  private readonly blacklistReportSubject = new BehaviorSubject<BlacklistReport[]>([]);
  private readonly selectedReturnSubject = new BehaviorSubject<ReturnCandidate | null>(null);

  readonly myLoans$ = this.myLoansSubject.asObservable();
  readonly overdueReport$ = this.overdueReportSubject.asObservable();
  readonly blacklistReport$ = this.blacklistReportSubject.asObservable();
  readonly selectedReturn$ = this.selectedReturnSubject.asObservable();

  selectedReturnLoanId = '';

  constructor(
    private readonly loansService: LoansService,
    private readonly blacklistService: BlacklistService,
    private readonly readersStore: ReadersStore,
  ) {}

  get myLoans(): Loan[] {
    return this.myLoansSubject.value;
  }

  set myLoans(value: Loan[]) {
    this.myLoansSubject.next(value);
  }

  get overdueReport(): OverdueReport[] {
    return this.overdueReportSubject.value;
  }

  set overdueReport(value: OverdueReport[]) {
    this.overdueReportSubject.next(value);
  }

  get blacklistReport(): BlacklistReport[] {
    return this.blacklistReportSubject.value;
  }

  set blacklistReport(value: BlacklistReport[]) {
    this.blacklistReportSubject.next(value);
  }

  get selectedReturn(): ReturnCandidate | null {
    return this.selectedReturnSubject.value;
  }

  set selectedReturn(value: ReturnCandidate | null) {
    this.selectedReturnSubject.next(value);
  }

  lookupReturn(): void {
    const loanId = Number(this.selectedReturnLoanId);
    this.selectedReturn = this.buildReturnCandidates().find((candidate) => candidate.loanId === loanId) ?? null;
  }

  confirmReturn(): Observable<Loan | null> {
    if (!this.selectedReturn) {
      return of(null);
    }

    const loanId = this.selectedReturn.loanId;

    return this.loansService.returnLoan(loanId).pipe(
      tap(() => {
        this.overdueReport = this.overdueReport.filter((entry) => entry.loanId !== loanId);
        this.blacklistReport = this.blacklistReport.filter((entry) => entry.loanId !== loanId);
        this.myLoans = this.myLoans.map((loan) => loan.loanId === loanId
          ? { ...loan, actualReturnDate: this.getIsoDate(0), isActive: false }
          : loan);
        this.selectedReturn = null;
        this.selectedReturnLoanId = '';
      }),
    );
  }

  resolvePenalty(entry: BlacklistReport): Observable<void> {
    return this.blacklistService.resolve(entry.penaltyId).pipe(
      tap(() => {
        this.blacklistReport = this.blacklistReport.filter((item) => item.penaltyId !== entry.penaltyId);
        const hasRemainingPenalty = this.blacklistReport.some((item) => item.readerId === entry.readerId);
        this.readersStore.updateBlacklistStatus(entry.readerId, hasRemainingPenalty);
      }),
    );
  }

  reset(): void {
    this.myLoans = [];
    this.overdueReport = [];
    this.blacklistReport = [];
    this.selectedReturn = null;
    this.selectedReturnLoanId = '';
  }

  private buildReturnCandidates(): ReturnCandidate[] {
    return this.overdueReport.map((item) => ({
      loanId: item.loanId,
      readerName: item.username,
      branchName: item.branchName,
      bookTitle: item.bookTitle,
      dueDate: item.dueDate,
      overdueDays: item.overdueDays,
      fineAmount: item.loanFineTotal,
    }));
  }

  private getIsoDate(offsetDays: number) {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    return date.toISOString().slice(0, 10);
  }
}
