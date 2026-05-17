import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { BlacklistReport } from '../../../../models/reports/blacklist-report.model';
import { LoansStore } from '../../../../core/state/loans.store';
import { LibraryStore } from '../../../../core/state/library.store';

@Component({
  selector: 'app-returns-view',
  templateUrl: './returns-view.component.html',
  styleUrl: './returns-view.component.css',
  standalone: false,
})
export class ReturnsViewComponent implements OnInit, OnDestroy {
  readonly store = inject(LoansStore);
  private readonly libraryStore = inject(LibraryStore);

  isSearching = false;
  hasSearched = false;

  private readonly snackBar = inject(MatSnackBar);
  private readonly destroy$ = new Subject<void>();

  ngOnInit() {
    this.libraryStore.refreshLoansData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  lookupReturn() {
    this.isSearching = true;
    this.store
      .lookupReturn()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: () =>
          this.snackBar.open('Search failed. Please try again.', 'Dismiss', { duration: 4000 }),
        complete: () => {
          this.isSearching = false;
          this.hasSearched = true;
        },
      });
  }

  confirmReturn() {
    this.store
      .confirmReturn()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.hasSearched = false;
        },
        error: () => this.snackBar.open('Failed to process return.', 'Dismiss', { duration: 4000 }),
      });
  }

  resolvePenalty(entry: BlacklistReport) {
    this.store
      .resolvePenalty(entry)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: () =>
          this.snackBar.open('Failed to resolve penalty.', 'Dismiss', { duration: 4000 }),
      });
  }

  resolveAllFinesForReader(readerId: number, username: string) {
    this.store
      .resolveAllFinesForReader(readerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: () =>
          this.snackBar.open(`Failed to resolve all fines for ${username}.`, 'Dismiss', {
            duration: 4000,
          }),
      });
  }
}
