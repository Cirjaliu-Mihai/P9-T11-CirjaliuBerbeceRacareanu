import { Component, Inject, OnDestroy, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, of, switchMap, takeUntil } from 'rxjs';
import { Book } from '../../../../models/library/book.model';
import { BranchesStore } from '../../../../core/state/branches.store';
import { CopiesStore } from '../../../../core/state/copies.store';
import { AddCopiesDialogComponent } from '../add-copies-dialog/add-copies-dialog.component';

@Component({
  selector: 'app-manage-copies-dialog',
  templateUrl: './manage-copies-dialog.component.html',
  styleUrl: './manage-copies-dialog.component.css',
  standalone: false,
})
export class ManageCopiesDialogComponent implements OnInit, OnDestroy {
  readonly store = inject(CopiesStore);
  readonly branches = inject(BranchesStore);

  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialogRef = inject(MatDialogRef<ManageCopiesDialogComponent>);
  private readonly destroy$ = new Subject<void>();

  constructor(@Inject(MAT_DIALOG_DATA) public readonly book: Book) {}

  ngOnInit() {
    this.store.loadCopies(this.book.bookId);
  }

  ngOnDestroy() {
    this.store.selectedBookId = null;
    this.destroy$.next();
    this.destroy$.complete();
  }

  openAddCopiesDialog() {
    this.dialog
      .open(AddCopiesDialogComponent, {
        width: '440px',
        data: { branches: this.branches.branches },
      })
      .afterClosed()
      .pipe(
        switchMap((result?: { branchId: number; count: number }) => {
          if (!result) return of(null);
          return this.store.addCopies(this.book.bookId, result.branchId, result.count);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        error: () => this.snackBar.open('Failed to add copies.', 'Dismiss', { duration: 4000 }),
      });
  }

  deleteCopy(copyId: number) {
    this.store
      .deleteCopy(copyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: () => this.snackBar.open('Failed to delete copy.', 'Close', { duration: 4000 }),
      });
  }

  markAsLost(copyId: number) {
    this.store
      .updateStatus(copyId, 'Lost')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: () => this.snackBar.open('Failed to update status.', 'Close', { duration: 4000 }),
      });
  }
}
