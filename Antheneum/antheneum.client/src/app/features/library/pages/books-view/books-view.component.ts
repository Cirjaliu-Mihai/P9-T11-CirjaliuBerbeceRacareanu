import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, of, switchMap, takeUntil } from 'rxjs';
import { Book } from '../../../../models/library/book.model';
import { BookFormValue } from '../../../../models/library/book-form-value.model';
import { BooksStore } from '../../../../core/state/books.store';
import { BookEditorDialogComponent } from '../../dialogs/book-editor-dialog/book-editor-dialog.component';
import { DeleteConfirmationDialogComponent } from '../../dialogs/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { ManageCopiesDialogComponent } from '../../dialogs/manage-copies-dialog/manage-copies-dialog.component';

@Component({
  selector: 'app-books-view',
  templateUrl: './books-view.component.html',
  styleUrl: './books-view.component.css',
  standalone: false,
})
export class BooksViewComponent implements OnInit, OnDestroy {
  readonly store = inject(BooksStore);
  searchTerm = '';

  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroy$ = new Subject<void>();

  ngOnInit() {
    this.searchTerm = this.store.searchTerm;
    this.store.loadPage(1, '');
  }

  onSearch() {
    this.store.loadPage(1, this.searchTerm);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToPage(page: number) {
    this.store.loadPage(page);
  }

  openCreateBookDialog() {
    this.dialog
      .open(BookEditorDialogComponent, {
        width: '720px',
        data: {
          title: 'Create book',
          editing: false,
          imageUrl: null,
          value: { isbn: '', title: '', authors: '', publisher: '' },
        },
      })
      .afterClosed()
      .pipe(
        switchMap((result?: { value: BookFormValue; file: File | null }) => {
          if (!result) {
            return of(null);
          }
          return this.store.createBook(result.value, result.file);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        error: () => this.snackBar.open('Failed to create book.', 'Dismiss', { duration: 4000 }),
      });
  }

  openEditBookDialog(book: Book) {
    this.dialog
      .open(BookEditorDialogComponent, {
        width: '720px',
        data: {
          title: 'Edit book',
          editing: true,
          imageUrl: book.imgUrl,
          value: {
            isbn: book.isbn,
            title: book.title,
            authors: book.authors ?? '',
            publisher: book.publisher ?? '',
          },
        },
      })
      .afterClosed()
      .pipe(
        switchMap((result?: { value: BookFormValue; file: File | null }) => {
          if (!result) {
            return of(null);
          }
          return this.store.updateBook(book.bookId, result.value, result.file);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        error: () => this.snackBar.open('Failed to update book.', 'Dismiss', { duration: 4000 }),
      });
  }

  openManageCopies(book: Book) {
    this.dialog.open(ManageCopiesDialogComponent, {
      width: '720px',
      data: book,
    });
  }

  confirmDelete(book: Book) {
    this.dialog
      .open(DeleteConfirmationDialogComponent, {
        width: '440px',
        data: {
          title: `Remove ${book.title}`,
          confirmLabel: 'Delete',
        },
      })
      .afterClosed()
      .pipe(
        switchMap((confirmed?: boolean) => {
          if (!confirmed) {
            return of(null);
          }
          return this.store.deleteBook(book.bookId);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        error: () => this.snackBar.open('Failed to delete book.', 'Dismiss', { duration: 4000 }),
      });
  }
}
