import { Injectable } from '@angular/core';
import { BehaviorSubject, finalize, forkJoin } from 'rxjs';
import { AuthRole } from '../../models/auth/auth-role.model';
import { BooksService } from '../services/books.service';
import { BranchesService } from '../services/branches.service';
import { LoansService } from '../services/loans.service';
import { ReadersService } from '../services/readers.service';
import { ReportsService } from '../services/reports.service';
import { BooksStore } from './books.store';
import { BranchesStore } from './branches.store';
import { LoansStore } from './loans.store';
import { ReadersStore } from './readers.store';
import { ReportsStore } from './reports.store';

@Injectable({ providedIn: 'root' })
export class LibraryStore {
  private viewerRole: AuthRole | null = null;
  private initialized = false;
  private readonly isLoadingSubject = new BehaviorSubject(true);

  readonly isLoading$ = this.isLoadingSubject.asObservable();

  constructor(
    private readonly booksStore: BooksStore,
    private readonly branchesStore: BranchesStore,
    private readonly readersStore: ReadersStore,
    private readonly loansStore: LoansStore,
    private readonly reportsStore: ReportsStore,
    private readonly booksService: BooksService,
    private readonly branchesService: BranchesService,
    private readonly readersService: ReadersService,
    private readonly loansService: LoansService,
    private readonly reportsService: ReportsService,
  ) {}

  get isLoading(): boolean {
    return this.isLoadingSubject.value;
  }

  private set isLoading(value: boolean) {
    this.isLoadingSubject.next(value);
  }

  get metrics() {
    if (this.viewerRole === 'Reader') {
      const activeLoans = this.loansStore.myLoans.filter((loan) => loan.isActive).length;
      const overdueLoans = this.loansStore.myLoans.filter((loan) => loan.isActive && new Date(loan.dueDate) < new Date()).length;

      return [
        { label: 'Catalog snapshot', value: this.booksStore.books.length, tone: 'sun' },
        { label: 'Active loans', value: activeLoans, tone: 'ocean' },
        { label: 'Overdue items', value: overdueLoans, tone: 'ember' },
        { label: 'Profile status', value: this.readersStore.currentProfile ? 'Linked' : 'Pending', tone: 'mint' },
      ];
    }

    const activeLoans = this.loansStore.myLoans.filter((loan) => loan.isActive).length;
    const overdueLoans = this.loansStore.overdueReport.length;
    const unresolvedPenalties = this.loansStore.blacklistReport.filter((entry) => !entry.isResolved).length;

    return [
      { label: 'Branch network', value: this.branchesStore.branches.length, tone: 'sun' },
      { label: 'Catalog snapshot', value: this.booksStore.books.length, tone: 'mint' },
      { label: 'Active loans', value: activeLoans, tone: 'ocean' },
      { label: 'Penalty queue', value: unresolvedPenalties + overdueLoans, tone: 'ember' },
    ];
  }

  setViewerRole(role: AuthRole | null) {
    if (this.viewerRole === role && (role === null || this.initialized)) {
      return;
    }

    this.viewerRole = role;
    this.initialized = false;
    this.resetAll();
    this.reportsStore.reportStatus = role === 'Administrator'
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

    this.resetAll();
    this.isLoading = false;
  }

  private loadAdministratorDashboard() {
    this.isLoading = true;

    forkJoin({
      branches: this.branchesService.list(),
      books: this.booksService.list('', 1, 6),
      readers: this.readersService.list('', this.readersStore.readerSort),
      overdue: this.reportsService.overdue(null, 1, 6),
      blacklist: this.reportsService.blacklist(null, 1, 6),
    }).pipe(finalize(() => { this.isLoading = false; })).subscribe({
      next: ({ branches, books, readers, overdue, blacklist }) => {
        this.branchesStore.branches = branches;
        this.booksStore.books = books.items;
        this.readersStore.readers = readers;
        this.loansStore.myLoans = [];
        this.loansStore.overdueReport = overdue.items;
        this.loansStore.blacklistReport = blacklist.items;
        this.readersStore.syncCurrentProfile();
        this.readersStore.applyReaderFilters();
        this.loansStore.lookupReturn();
        this.reportsStore.generateReport();
      },
      error: () => {
        this.resetAll();
        this.reportsStore.reportStatus = 'Unable to load administrator workspace data from the API.';
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
        this.booksStore.books = books.items;
        this.loansStore.myLoans = myLoans;
        this.branchesStore.reset();
        this.readersStore.reset();
        this.reportsStore.reset();
        this.loansStore.overdueReport = [];
        this.loansStore.blacklistReport = [];
        this.loansStore.selectedReturn = null;
        this.reportsStore.reportStatus = 'Reader workspace ready.';
      },
      error: () => {
        this.resetAll();
        this.reportsStore.reportStatus = 'Unable to load reader workspace data from the API.';
      },
    });
  }

  private resetAll() {
    this.booksStore.reset();
    this.branchesStore.reset();
    this.readersStore.reset();
    this.loansStore.reset();
    this.reportsStore.reset();
  }
}