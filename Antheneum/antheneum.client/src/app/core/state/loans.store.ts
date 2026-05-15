import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map, of, tap } from 'rxjs';
import { BlacklistReport } from '../../models/reports/blacklist-report.model';
import { BlacklistedUser } from '../../models/reports/blacklisted-user.model';
import { Loan } from '../../models/reader/loan.model';
import { OverdueReport } from '../../models/reports/overdue-report.model';
import { ReturnCandidate } from '../../models/reports/return-candidate.model';
import { ApiService } from '../services/api.service';
import { LoansService } from '../services/loans.service';
import { ReadersStore } from './readers.store';
import { BooksStore } from './books.store';

@Injectable({ providedIn: 'root' })
export class LoansStore {
  private readonly myLoansSubject = new BehaviorSubject<Loan[]>([]);
  private readonly overdueReportSubject = new BehaviorSubject<OverdueReport[]>([]);
  private readonly blacklistReportSubject = new BehaviorSubject<BlacklistReport[]>([]);
  private readonly selectedReturnSubject = new BehaviorSubject<ReturnCandidate | null>(null);
  private readonly returnCandidatesSubject = new BehaviorSubject<ReturnCandidate[]>([]);
  private readonly finesSearchSubject = new BehaviorSubject<string>('');

  readonly myLoans$ = this.myLoansSubject.asObservable();
  readonly overdueReport$ = this.overdueReportSubject.asObservable();
  readonly blacklistReport$ = this.blacklistReportSubject.asObservable();
  readonly selectedReturn$ = this.selectedReturnSubject.asObservable();
  readonly returnCandidates$ = this.returnCandidatesSubject.asObservable();

  readonly blacklistedUsers$: Observable<BlacklistedUser[]> = this.blacklistReportSubject.pipe(
    map((entries) => {
      const map = new Map<number, BlacklistedUser>();
      for (const e of entries) {
        const existing = map.get(e.readerId);
        if (existing) {
          existing.totalAmount += e.penaltyAmount;
          existing.penaltyCount++;
        } else {
          map.set(e.readerId, {
            readerId: e.readerId,
            username: e.username,
            libraryCardNumber: e.libraryCardNumber,
            totalAmount: e.penaltyAmount,
            penaltyCount: 1,
          });
        }
      }
      return Array.from(map.values());
    }),
  );

  readonly filteredFines$: Observable<BlacklistReport[]> = combineLatest([
    this.blacklistReportSubject,
    this.finesSearchSubject,
  ]).pipe(
    map(([entries, term]) => {
      const lower = term.trim().toLowerCase();
      return lower ? entries.filter((e) => e.username.toLowerCase().includes(lower)) : entries;
    }),
  );

  get finesSearch(): string {
    return this.finesSearchSubject.value;
  }

  set finesSearch(value: string) {
    this.finesSearchSubject.next(value);
  }

  returnSearchTerm = '';

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

  get returnCandidates(): ReturnCandidate[] {
    return this.returnCandidatesSubject.value;
  }

  private set returnCandidates(value: ReturnCandidate[]) {
    this.returnCandidatesSubject.next(value);
  }

  lookupReturn(): Observable<ReturnCandidate[]> {
    const term = this.returnSearchTerm.trim();
    if (!term) {
      this.returnCandidates = [];
      this.selectedReturn = null;
      return of([]);
    }
    return this.loansService.searchActive(term).pipe(
      tap((results) => {
        const candidates: ReturnCandidate[] = results.map((r) => ({
          loanId: r.loanId,
          readerName: r.readerName,
          bookTitle: r.bookTitle,
          branchName: r.branchName,
          dueDate: r.dueDate,
          overdueDays: r.overdueDays,
          fineAmount: r.fineAmount,
        }));
        this.returnCandidates = candidates;
        this.selectedReturn = candidates.length === 1 ? candidates[0] : null;
      }),
    );
  }

  selectReturnCandidate(loanId: number): void {
    this.selectedReturn = this.returnCandidates.find((c) => c.loanId === loanId) ?? null;
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
        this.myLoans = this.myLoans.map((loan) =>
          loan.loanId === loanId
            ? { ...loan, actualReturnDate: this.getIsoDate(0), isActive: false }
            : loan,
        );
        this.returnCandidates = this.returnCandidates.filter((c) => c.loanId !== loanId);
        this.selectedReturn = null;
        this.returnSearchTerm = '';
      }),
    );
  }

  resolvePenalty(entry: BlacklistReport): Observable<void> {
    return this.api.put<void>(`blacklist/${entry.penaltyId}/resolve`, {}).pipe(
      tap(() => {
        this.blacklistReport = this.blacklistReport.filter(
          (item) => item.penaltyId !== entry.penaltyId,
        );
        const hasRemainingPenalty = this.blacklistReport.some(
          (item) => item.readerId === entry.readerId,
        );
        this.readersStore.updateBlacklistStatus(entry.readerId, hasRemainingPenalty);
      }),
    );
  }

  resolveAllFinesForReader(readerId: number): Observable<void> {
    return this.api.put<void>(`blacklist/reader/${readerId}/resolve-all`, {}).pipe(
      tap(() => {
        this.blacklistReport = this.blacklistReport.filter((item) => item.readerId !== readerId);
        this.readersStore.updateBlacklistStatus(readerId, false);
      }),
    );
  }

  reset(): void {
    this.myLoans = [];
    this.overdueReport = [];
    this.blacklistReport = [];
    this.selectedReturn = null;
    this.returnCandidates = [];
    this.returnSearchTerm = '';
    this.finesSearch = '';
  }

  loadMyLoans(): Observable<Loan[]> {
    return this.loansService.myLoans().pipe(
      tap((loans) => {
        this.myLoans = loans;
      }),
    );
  }

  constructor(
    private readonly loansService: LoansService,
    private readonly api: ApiService,
    private readonly readersStore: ReadersStore,
    private readonly booksStore: BooksStore,
  ) {}

  borrowBook(copyId: number): Observable<Loan> {
    return this.loansService.createLoan(copyId).pipe(
      tap((loan) => {
        this.myLoans = [...this.myLoans, loan];
        // refresh books list so availability reflects the borrowed copy
        try {
          this.booksStore.loadPage(this.booksStore.page, this.booksStore.searchTerm);
        } catch {
          // ignore refresh errors
        }
      }),
    );
  }

  renewLoan(loanId: number): Observable<Loan> {
    return this.loansService.renewLoan(loanId).pipe(
      tap((updated) => {
        this.myLoans = this.myLoans.map((l) => (l.loanId === loanId ? updated : l));
      }),
    );
  }

  private getIsoDate(offsetDays: number) {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    return date.toISOString().slice(0, 10);
  }
}
