import { Injectable } from '@angular/core';
import { catchError, finalize, forkJoin, Observable, of, tap, throwError } from 'rxjs';
import { AuthRole } from '../../models/auth/auth-role.model';
import { BlacklistReport } from '../../models/reports/blacklist-report.model';
import { Book } from '../../models/library/book.model';
import { BookFormValue } from '../../models/library/book-form-value.model';
import { Branch } from '../../models/library/branch.model';
import { BranchFormValue } from '../../models/library/branch-form-value.model';
import { InventoryReport } from '../../models/reports/inventory-report.model';
import { Loan } from '../../models/reader/loan.model';
import { OverdueReport } from '../../models/reports/overdue-report.model';
import { PagedResult } from '../../models/common/paged-result.model';
import { ProfileFormValue } from '../../models/reader/profile-form-value.model';
import { Reader } from '../../models/reader/reader.model';
import { ReportType } from '../../models/reports/report-type.model';
import { ReturnCandidate } from '../../models/reports/return-candidate.model';
import { TransactionReport } from '../../models/reports/transaction-report.model';
import { BlacklistService } from '../services/blacklist.service';
import { BooksService } from '../services/books.service';
import { BranchesService } from '../services/branches.service';
import { LoansService } from '../services/loans.service';
import { ReadersService } from '../services/readers.service';
import { ReportsService } from '../services/reports.service';

@Injectable({ providedIn: 'root' })
export class LibraryStore {
  private viewerRole: AuthRole | null = null;
  private nextTemporaryId = -1;
  private initialized = false;

  selectedReportType: ReportType = 'inventory';
  selectedBranchId = '';
  reportFrom = this.getIsoDate(-30);
  reportTo = this.getIsoDate(0);
  readerSearch = '';
  readerSort = 'username';
  selectedReturnLoanId = '';

  books: Book[] = [];
  branches: Branch[] = [];
  readers: Reader[] = [];
  filteredReaders: Reader[] = [];
  myLoans: Loan[] = [];
  inventoryReport: InventoryReport[] = [];
  overdueReport: OverdueReport[] = [];
  blacklistReport: BlacklistReport[] = [];
  transactionReport: TransactionReport[] = [];
  selectedReturn: ReturnCandidate | null = null;
  currentProfile: Reader | null = null;
  reportStatus = 'Select a report type and generate a view.';
  isLoading = true;
  isReportLoading = false;

  readonly reportTypes: Array<{ id: ReportType; label: string; helper: string }> = [
    { id: 'inventory', label: 'Inventory', helper: 'Stock level per branch and title' },
    { id: 'overdue', label: 'Overdue', helper: 'Late loans and fine exposure' },
    { id: 'blacklist', label: 'Blacklist', helper: 'Penalty queue and risk review' },
    { id: 'transactions', label: 'Transactions', helper: 'Borrow and return audit trail' },
  ];

  constructor(
    private readonly booksService: BooksService,
    private readonly branchesService: BranchesService,
    private readonly readersService: ReadersService,
    private readonly loansService: LoansService,
    private readonly reportsService: ReportsService,
    private readonly blacklistService: BlacklistService,
  ) {}

  get metrics() {
    if (this.viewerRole === 'Reader') {
      const activeLoans = this.myLoans.filter((loan) => loan.isActive).length;
      const overdueLoans = this.myLoans.filter((loan) => loan.isActive && new Date(loan.dueDate) < new Date()).length;

      return [
        { label: 'Catalog snapshot', value: this.books.length, tone: 'sun' },
        { label: 'Active loans', value: activeLoans, tone: 'ocean' },
        { label: 'Overdue items', value: overdueLoans, tone: 'ember' },
        { label: 'Profile status', value: this.currentProfile ? 'Linked' : 'Pending', tone: 'mint' },
      ];
    }

    const activeLoans = this.myLoans.filter((loan) => loan.isActive).length;
    const overdueLoans = this.overdueReport.length;
    const unresolvedPenalties = this.blacklistReport.filter((entry) => !entry.isResolved).length;

    return [
      { label: 'Branch network', value: this.branches.length, tone: 'sun' },
      { label: 'Catalog snapshot', value: this.books.length, tone: 'mint' },
      { label: 'Active loans', value: activeLoans, tone: 'ocean' },
      { label: 'Penalty queue', value: unresolvedPenalties + overdueLoans, tone: 'ember' },
    ];
  }

  get branchName() {
    const branchId = Number(this.selectedBranchId);
    if (!branchId) {
      return 'All branches';
    }
    return this.branches.find((branch) => branch.branchId === branchId)?.name ?? 'Selected branch';
  }

  setViewerRole(role: AuthRole | null) {
    if (this.viewerRole === role && (role === null || this.initialized)) {
      return;
    }

    this.viewerRole = role;
    this.initialized = false;
    this.resetDashboardData();
    this.reportStatus = role === 'Administrator'
      ? 'Select a report type and generate a view.'
      : role === 'Reader'
        ? 'Reader workspace ready.'
        : 'Sign in to load workspace data.';

    if (role) {
      this.ensureLoaded();
    } else {
      this.isLoading = false;
    }
  }

  ensureLoaded() {
    if (!this.viewerRole || this.initialized) {
      return;
    }

    this.initialized = true;
    this.loadDashboard();
  }

  loadDashboard() {
    if (this.viewerRole === 'Administrator') {
      this.loadAdministratorDashboard();
      return;
    }

    if (this.viewerRole === 'Reader') {
      this.loadReaderDashboard();
      return;
    }

    this.resetDashboardData();
    this.isLoading = false;
  }

  applyReaderFilters() {
    const term = this.readerSearch.trim().toLowerCase();
    const filtered = this.readers.filter((reader) => {
      if (!term) {
        return true;
      }
      return [reader.username, reader.email, reader.phone ?? '', reader.libraryCardNumber]
        .some((value) => value.toLowerCase().includes(term));
    });

    filtered.sort((left, right) => {
      switch (this.readerSort) {
        case 'cardnumber':
          return left.libraryCardNumber.localeCompare(right.libraryCardNumber);
        case 'role':
          return left.role.localeCompare(right.role) || left.username.localeCompare(right.username);
        default:
          return left.username.localeCompare(right.username);
      }
    });

    this.filteredReaders = filtered;
  }

  updateReaderRole(reader: Reader, nextRole: string): Observable<Reader> {
    if (reader.role === nextRole) {
      return of(reader);
    }

    const previousReaders = this.readers;
    const previousCurrentProfile = this.currentProfile;

    this.readers = this.readers.map((item) => item.readerId === reader.readerId
      ? { ...item, role: nextRole }
      : item);

    if (this.currentProfile?.readerId === reader.readerId) {
      this.currentProfile = { ...this.currentProfile, role: nextRole };
    }

    this.applyReaderFilters();

    return this.readersService.changeRole(reader.readerId, nextRole).pipe(
      tap((updated) => {
        const target = this.readers.find((item) => item.readerId === reader.readerId);
        if (target) {
          target.role = updated.role;
        }
        if (this.currentProfile?.readerId === reader.readerId) {
          this.currentProfile = { ...this.currentProfile, role: updated.role };
        }
        this.applyReaderFilters();
      }),
      catchError((error) => {
        this.readers = previousReaders;
        this.currentProfile = previousCurrentProfile;
        this.applyReaderFilters();
        return throwError(() => error);
      }),
    );
  }

  lookupReturn() {
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
        this.reportStatus = `Loan ${loanId} marked as returned.`;
      }),
    );
  }

  resolvePenalty(entry: BlacklistReport): Observable<void> {
    return this.blacklistService.resolve(entry.readerId).pipe(
      tap(() => {
        this.blacklistReport = this.blacklistReport.filter((item) => item.penaltyId !== entry.penaltyId);
        const reader = this.readers.find((item) => item.readerId === entry.readerId);
        if (reader) {
          reader.isBlacklisted = false;
        }
        if (this.currentProfile?.readerId === entry.readerId) {
          this.currentProfile = { ...this.currentProfile, isBlacklisted: false };
        }
        this.applyReaderFilters();
      }),
    );
  }

  generateReport() {
    if (this.viewerRole !== 'Administrator') {
      this.isReportLoading = false;
      this.clearReportData();
      return;
    }

    this.isReportLoading = true;
    const branchId = this.selectedBranchId ? Number(this.selectedBranchId) : null;

    let request$: Observable<PagedResult<InventoryReport> | PagedResult<OverdueReport> | PagedResult<BlacklistReport> | PagedResult<TransactionReport>>;

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
        this.overdueReport = this.selectedReportType === 'overdue' ? response.items as OverdueReport[] : this.overdueReport;
        this.blacklistReport = this.selectedReportType === 'blacklist' ? response.items as BlacklistReport[] : this.blacklistReport;
        this.transactionReport = this.selectedReportType === 'transactions' ? response.items as TransactionReport[] : [];
        this.reportStatus = `${this.reportTypes.find((item) => item.id === this.selectedReportType)?.label} report for ${this.branchName}.`;
      },
      error: () => {
        this.clearReportData();
        this.reportStatus = `Unable to load the ${this.selectedReportType} report from the API.`;
      },
    });
  }

  createBranch(value: BranchFormValue): Observable<Branch> {
    const payload = { name: value.name.trim(), address: value.address.trim() || null };
    const temporaryBranch: Branch = { branchId: this.consumeTemporaryId(), uniqueNumber: 'Pending', ...payload };
    this.branches = [temporaryBranch, ...this.branches];

    return this.branchesService.create(payload).pipe(
      tap((branch) => {
        this.branches = this.branches.map((item) => item.branchId === temporaryBranch.branchId ? branch : item);
      }),
      catchError((error) => {
        this.branches = this.branches.filter((item) => item.branchId !== temporaryBranch.branchId);
        return throwError(() => error);
      }),
    );
  }

  updateBranch(branchId: number, value: BranchFormValue): Observable<Branch> {
    const previousBranches = this.branches;
    const currentBranch = this.branches.find((item) => item.branchId === branchId);
    const payload = { name: value.name.trim(), address: value.address.trim() || null };

    if (currentBranch) {
      const optimisticBranch: Branch = { ...currentBranch, ...payload };
      this.branches = this.branches.map((item) => item.branchId === branchId ? optimisticBranch : item);
    }

    return this.branchesService.update(branchId, payload).pipe(
      tap((branch) => {
        this.branches = this.branches.map((item) => item.branchId === branchId ? branch : item);
      }),
      catchError((error) => {
        this.branches = previousBranches;
        return throwError(() => error);
      }),
    );
  }

  deleteBranch(branchId: number): Observable<void> {
    const previousBranches = this.branches;
    this.branches = this.branches.filter((item) => item.branchId !== branchId);

    return this.branchesService.remove(branchId).pipe(
      catchError((error) => {
        this.branches = previousBranches;
        return throwError(() => error);
      }),
    );
  }

  createBook(value: BookFormValue, coverFile: File | null): Observable<Book> {
    const formData = this.buildBookFormData(value, coverFile, false);
    const temporaryBook: Book = {
      bookId: this.consumeTemporaryId(),
      isbn: value.isbn.trim(),
      title: value.title.trim(),
      authors: value.authors.trim() || null,
      publisher: value.publisher.trim() || null,
      imgUrl: null,
    };
    this.books = [temporaryBook, ...this.books];

    return this.booksService.create(formData).pipe(
      tap((book) => {
        this.books = this.books.map((item) => item.bookId === temporaryBook.bookId ? book : item);
      }),
      catchError((error) => {
        this.books = this.books.filter((item) => item.bookId !== temporaryBook.bookId);
        return throwError(() => error);
      }),
    );
  }

  updateBook(bookId: number, value: BookFormValue, coverFile: File | null): Observable<Book> {
    const previousBooks = this.books;
    const currentBook = this.books.find((item) => item.bookId === bookId);
    const formData = this.buildBookFormData(value, coverFile, true);

    if (currentBook) {
      const optimisticBook: Book = {
        ...currentBook,
        title: value.title.trim(),
        authors: value.authors.trim() || null,
        publisher: value.publisher.trim() || null,
      };
      this.books = this.books.map((item) => item.bookId === bookId ? optimisticBook : item);
    }

    return this.booksService.update(bookId, formData).pipe(
      tap((book) => {
        this.books = this.books.map((item) => item.bookId === bookId ? book : item);
      }),
      catchError((error) => {
        this.books = previousBooks;
        return throwError(() => error);
      }),
    );
  }

  deleteBook(bookId: number): Observable<void> {
    const previousBooks = this.books;
    this.books = this.books.filter((item) => item.bookId !== bookId);

    return this.booksService.remove(bookId).pipe(
      catchError((error) => {
        this.books = previousBooks;
        return throwError(() => error);
      }),
    );
  }

  updateMyProfile(value: ProfileFormValue): Observable<Reader> {
    const payload = {
      phone: value.phone.trim() || null,
      address: value.address.trim() || null,
      currentPassword: value.currentPassword.trim() || null,
      newPassword: value.newPassword.trim() || null,
    };

    return this.readersService.updateMyProfile(payload).pipe(
      tap((reader) => {
        this.currentProfile = reader;
        this.readers = this.readers.map((item) => item.readerId === reader.readerId ? reader : item);
        this.applyReaderFilters();
      }),
    );
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

  private buildBookFormData(value: BookFormValue, coverFile: File | null, isUpdate: boolean) {
    const formData = new FormData();
    if (!isUpdate) {
      formData.append('isbn', value.isbn.trim());
    }
    formData.append('title', value.title.trim());
    formData.append('authors', value.authors.trim());
    formData.append('publisher', value.publisher.trim());
    if (coverFile) {
      formData.append('cover', coverFile, coverFile.name);
    }
    return formData;
  }

  private syncCurrentProfile() {
    if (this.currentProfile) {
      const updated = this.readers.find((reader) => reader.readerId === this.currentProfile?.readerId);
      this.currentProfile = updated ?? this.currentProfile;
      return;
    }
    this.currentProfile = this.readers.find((reader) => reader.role === 'Reader') ?? this.readers[0] ?? null;
  }

  private loadAdministratorDashboard() {
    this.isLoading = true;

    forkJoin({
      branches: this.branchesService.list(),
      books: this.booksService.list('', 1, 6),
      readers: this.readersService.list('', this.readerSort),
      overdue: this.reportsService.overdue(null, 1, 6),
      blacklist: this.reportsService.blacklist(null, 1, 6),
    }).pipe(finalize(() => { this.isLoading = false; })).subscribe({
      next: ({ branches, books, readers, overdue, blacklist }) => {
        this.branches = branches;
        this.books = books.items;
        this.readers = readers;
        this.myLoans = [];
        this.overdueReport = overdue.items;
        this.blacklistReport = blacklist.items;
        this.syncCurrentProfile();
        this.applyReaderFilters();
        this.lookupReturn();
        this.generateReport();
      },
      error: () => {
        this.resetDashboardData();
        this.reportStatus = 'Unable to load administrator workspace data from the API.';
      },
    });
  }

  private loadReaderDashboard() {
    this.isLoading = true;

    forkJoin({
      books: this.booksService.list('', 1, 6),
      myLoans: this.loansService.myLoans(),
    }).pipe(finalize(() => { this.isLoading = false; })).subscribe({
      next: ({ books, myLoans }) => {
        this.books = books.items;
        this.myLoans = myLoans;
        this.branches = [];
        this.readers = [];
        this.filteredReaders = [];
        this.inventoryReport = [];
        this.overdueReport = [];
        this.blacklistReport = [];
        this.transactionReport = [];
        this.selectedReturn = null;
        this.reportStatus = 'Reader workspace ready.';
      },
      error: () => {
        this.resetDashboardData();
        this.reportStatus = 'Unable to load reader workspace data from the API.';
      },
    });
  }

  private resetDashboardData() {
    this.branches = [];
    this.books = [];
    this.readers = [];
    this.filteredReaders = [];
    this.myLoans = [];
    this.inventoryReport = [];
    this.overdueReport = [];
    this.blacklistReport = [];
    this.transactionReport = [];
    this.selectedReturn = null;
    this.currentProfile = null;
    this.isReportLoading = false;
  }

  private clearReportData() {
    switch (this.selectedReportType) {
      case 'inventory':
        this.inventoryReport = [];
        break;
      case 'overdue':
        this.overdueReport = [];
        this.selectedReturn = null;
        break;
      case 'blacklist':
        this.blacklistReport = [];
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

  private consumeTemporaryId() {
    return this.nextTemporaryId--;
  }
}
