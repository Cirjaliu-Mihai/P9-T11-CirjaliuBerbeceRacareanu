import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { catchError, finalize, of } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BooksService } from '../../../../core/services/books.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ReadersStore } from '../../../../core/state/readers.store';
import { BookAvailability } from '../../../../models/library/book-availability.model';
import { Book } from '../../../../models/library/book.model';
import {
  BorrowConfirmDialogComponent,
  BorrowConfirmDialogData,
} from '../borrow-confirm-dialog/borrow-confirm-dialog.component';

@Component({
  selector: 'app-book-detail-dialog',
  templateUrl: './book-detail-dialog.component.html',
  styleUrl: './book-detail-dialog.component.css',
  standalone: false,
})
export class BookDetailDialogComponent implements OnInit {
  readonly dialogRef = inject<MatDialogRef<BookDetailDialogComponent>>(MatDialogRef);
  private readonly booksService = inject(BooksService);
  readonly auth = inject(AuthService);
  readonly readersStore = inject(ReadersStore);
  private readonly dialog = inject(MatDialog);

  readonly availability = signal<BookAvailability[]>([]);
  readonly isLoading = signal(true);

  constructor(@Inject(MAT_DIALOG_DATA) public readonly book: Book) {}

  ngOnInit() {
    this.booksService
      .getAvailability(this.book.bookId)
      .pipe(
        catchError(() => of([])),
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe((data) => {
        this.availability.set(data);
      });
  }

  get isReader(): boolean {
    const role = (this.auth.role() ?? '').toString().toLowerCase();
    return role === 'reader';
  }

  get isSubscribed(): boolean {
    return this.readersStore.currentProfile?.hasActiveSubscription ?? false;
  }

  borrowCopy(copy: BookAvailability) {
    const data: BorrowConfirmDialogData = {
      copyId: copy.copyId,
      bookTitle: this.book.title,
      branchName: copy.branchName,
    };

    this.dialog
      .open(BorrowConfirmDialogComponent, { width: '480px', data })
      .afterClosed()
      .subscribe((borrowed: boolean) => {
        if (borrowed) {
          this.dialogRef.close();
        }
      });
  }

  borrowFromBranch(branchName: string) {
    const copy = this.availability().find(
      (c) => c.branchName === branchName && c.status === 'Available',
    );
    if (!copy) return;
    this.borrowCopy(copy);
  }

  branchSummaries(): {
    branchName: string;
    availableCount: number;
    totalCount: number;
  }[] {
    const map = new Map<string, { available: number; total: number }>();
    for (const c of this.availability()) {
      const entry = map.get(c.branchName) ?? { available: 0, total: 0 };
      entry.total++;
      if (c.status === 'Available') entry.available++;
      map.set(c.branchName, entry);
    }
    return Array.from(map.entries())
      .map(([branchName, { available, total }]) => ({
        branchName,
        availableCount: available,
        totalCount: total,
      }))
      .sort((a, b) => b.availableCount - a.availableCount);
  }
}
