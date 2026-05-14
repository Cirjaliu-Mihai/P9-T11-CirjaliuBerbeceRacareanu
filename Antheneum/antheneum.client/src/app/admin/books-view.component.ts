import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Book } from './admin-dashboard.models';
import { AdminDashboardStore, BookFormValue } from './admin-dashboard.store';
import {
  BookEditorDialogComponent,
  DeleteConfirmationDialogComponent,
} from './library-dialogs.component';

@Component({
  selector: 'app-books-view',
  template: `
    <mat-card class="panel">
      <div class="panel-heading">
        <div>
          <p class="kicker">Books</p>
          <h3>Catalog management</h3>
        </div>
        <div class="toolbar-actions">
          <mat-chip-set>
            <mat-chip>{{ store.books.length }} books</mat-chip>
          </mat-chip-set>
          <button mat-flat-button type="button" (click)="openCreateBookDialog()">New book</button>
        </div>
      </div>

      <div class="catalog-grid">
        <mat-card *ngFor="let book of store.books" class="catalog-card">
          <p>{{ book.isbn }}</p>
          <strong>{{ book.title }}</strong>
          <span>{{ book.authors || 'Author pending' }}</span>
          <small>{{ book.publisher || 'Publisher pending' }}</small>
          <div class="action-row action-row--spaced">
            <button mat-stroked-button type="button" (click)="openEditBookDialog(book)">Edit</button>
            <button mat-stroked-button type="button" color="warn" (click)="confirmDelete(book)">Delete</button>
          </div>
        </mat-card>
      </div>
    </mat-card>

    <mat-card *ngIf="feedbackMessage" class="panel feedback-panel">
      <p class="kicker">Catalog workflow</p>
      <p>{{ feedbackMessage }}</p>
    </mat-card>
  `,
  standalone: false,
})
export class BooksViewComponent {
  feedbackMessage = '';

  constructor(
    public readonly store: AdminDashboardStore,
    private readonly dialog: MatDialog,
  ) {}

  openCreateBookDialog() {
    this.dialog.open(BookEditorDialogComponent, {
      width: '720px',
      data: {
        title: 'Create book',
        editing: false,
        value: { isbn: '', title: '', authors: '', publisher: '' },
      },
    }).afterClosed().subscribe((result?: { value: BookFormValue; file: File | null }) => {
      if (!result) {
        return;
      }

      this.store.createBook(result.value, result.file).subscribe(() => {
        this.feedbackMessage = 'Book created.';
      });
    });
  }

  openEditBookDialog(book: Book) {
    this.dialog.open(BookEditorDialogComponent, {
      width: '720px',
      data: {
        title: 'Edit book',
        editing: true,
        value: {
          isbn: book.isbn,
          title: book.title,
          authors: book.authors ?? '',
          publisher: book.publisher ?? '',
        },
      },
    }).afterClosed().subscribe((result?: { value: BookFormValue; file: File | null }) => {
      if (!result) {
        return;
      }

      this.store.updateBook(book.bookId, result.value, result.file).subscribe(() => {
        this.feedbackMessage = 'Book updated.';
      });
    });
  }

  confirmDelete(book: Book) {
    this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '440px',
      data: {
        title: `Remove ${book.title}`,
        description: 'This action updates the current API state immediately.',
        confirmLabel: 'Delete',
      },
    }).afterClosed().subscribe((confirmed?: boolean) => {
      if (!confirmed) {
        return;
      }

      this.store.deleteBook(book.bookId).subscribe(() => {
        this.feedbackMessage = 'Book deleted.';
      });
    });
  }
}