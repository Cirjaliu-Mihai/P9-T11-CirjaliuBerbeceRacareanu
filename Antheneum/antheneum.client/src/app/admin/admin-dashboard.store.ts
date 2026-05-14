import { Injectable } from '@angular/core';
import { catchError, finalize, forkJoin, Observable, of, tap, throwError } from 'rxjs';
import {
  BlacklistReport,
  Book,
  Branch,
  InventoryReport,
  Loan,
  OverdueReport,
  PagedResult,
  Reader,
  ReportType,
  ReturnCandidate,
  TransactionReport,
} from './admin-dashboard.models';
import { AuthRole } from '../auth/auth.models';
import { AdminDashboardService } from './admin-dashboard.service';

export interface BranchFormValue {
  name: string;
  address: string;
}

export interface BookFormValue {
  isbn: string;
  title: string;
  authors: string;
  publisher: string;
}

export interface ProfileFormValue {
  phone: string;
  address: string;
  currentPassword: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class AdminDashboardStore {
  private viewerRole: AuthRole | null = null;
  private nextTemporaryId = -1;

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
  private initialized = false;

  readonly reportTypes: Array<{ id: ReportType; label: string; helper: string }> = [
    { id: 'inventory', label: 'Inventory', helper: 'Stock level per branch and title' },
    { id: 'overdue', label: 'Overdue', helper: 'Late loans and fine exposure' },
    { id: 'blacklist', label: 'Blacklist', helper: 'Penalty queue and risk review' },
    { id: 'transactions', label: 'Transactions', helper: 'Borrow and return audit trail' },
  ];

  constructor(private readonly dashboardService: AdminDashboardService) {}

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
    const totalBooks = this.books.length;
    const unresolvedPenalties = this.blacklistReport.filter((entry) => !entry.isResolved).length;

    return [
      { label: 'Branch network', value: this.branches.length, tone: 'sun' },
      { label: 'Catalog snapshot', value: totalBooks, tone: 'mint' },
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

    if (!this.initialized) {
      this.initialized = true;
      this.loadDashboard();
    }
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

    return this.dashboardService.changeReaderRole(reader.readerId, nextRole).pipe(
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

    return this.dashboardService.returnLoan(loanId).pipe(
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
    return this.dashboardService.resolvePenalty(entry.readerId).pipe(
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
        request$ = this.dashboardService.getOverdueReport(branchId, 1, 8);
        break;
      case 'blacklist':
        request$ = this.dashboardService.getBlacklistReport(branchId, 1, 8);
        break;
      case 'transactions':
        request$ = this.dashboardService.getTransactionsReport(this.reportFrom, this.reportTo, branchId, 1, 8);
        break;
      default:
        request$ = this.dashboardService.getInventoryReport(branchId, 1, 8);
        break;
    }

    request$.pipe(
      finalize(() => {
        this.isReportLoading = false;
      }),
    ).subscribe({
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
    const payload = {
      name: value.name.trim(),
      address: value.address.trim() || null,
    };

    const temporaryBranch: Branch = {
      branchId: this.consumeTemporaryId(),
      uniqueNumber: 'Pending',
      ...payload,
    };

    this.branches = [temporaryBranch, ...this.branches];

    return this.dashboardService.createBranch(payload).pipe(
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
    const payload = {
      name: value.name.trim(),
      address: value.address.trim() || null,
    };

    if (currentBranch) {
      const optimisticBranch: Branch = {
        ...currentBranch,
        ...payload,
      };

      this.branches = this.branches.map((item) => item.branchId === branchId ? optimisticBranch : item);
    }

    return this.dashboardService.updateBranch(branchId, payload).pipe(
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

    return this.dashboardService.deleteBranch(branchId).pipe(
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

    return this.dashboardService.createBook(formData).pipe(
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

    return this.dashboardService.updateBook(bookId, formData).pipe(
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

    return this.dashboardService.deleteBook(bookId).pipe(
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

    return this.dashboardService.updateMyProfile(payload).pipe(
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
      branches: this.dashboardService.getBranches(),
      books: this.dashboardService.getBooks('', 1, 6),
      readers: this.dashboardService.getReaders('', this.readerSort),
      overdue: this.dashboardService.getOverdueReport(null, 1, 6),
      blacklist: this.dashboardService.getBlacklistReport(null, 1, 6),
    }).pipe(
      finalize(() => {
        this.isLoading = false;
      }),
    ).subscribe({
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
      books: this.dashboardService.getBooks('', 1, 6),
      myLoans: this.dashboardService.getMyLoans(),
    }).pipe(
      finalize(() => {
        this.isLoading = false;
      }),
    ).subscribe({
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
