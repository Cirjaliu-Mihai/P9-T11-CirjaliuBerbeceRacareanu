import { Component, Inject, OnInit, inject } from '@angular/core';
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

  availability: BookAvailability[] = [];
  isLoading = true;

  constructor(@Inject(MAT_DIALOG_DATA) public readonly book: Book) {}

  ngOnInit() {
    this.booksService.getAvailability(this.book.bookId).subscribe({
      next: (data) => {
        this.availability = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  get isReader(): boolean {
    return this.auth.role() === 'Reader';
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

  groupedByBranch(): { branchName: string; copies: BookAvailability[] }[] {
    const map = new Map<string, BookAvailability[]>();
    for (const c of this.availability) {
      const list = map.get(c.branchName) ?? [];
      list.push(c);
      map.set(c.branchName, list);
    }
    return Array.from(map.entries()).map(([branchName, copies]) => ({ branchName, copies }));
  }
}
