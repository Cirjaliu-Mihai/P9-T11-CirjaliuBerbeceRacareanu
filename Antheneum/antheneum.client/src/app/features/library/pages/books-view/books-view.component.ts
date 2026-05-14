import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Book } from '../../../../models/library/book.model';
import { BookFormValue } from '../../../../models/library/book-form-value.model';
import { LibraryStore } from '../../../../core/state/library.store';
import { BookEditorDialogComponent } from '../../dialogs/book-editor-dialog/book-editor-dialog.component';
import { DeleteConfirmationDialogComponent } from '../../dialogs/delete-confirmation-dialog/delete-confirmation-dialog.component';

@Component({
  selector: 'app-books-view',
  templateUrl: './books-view.component.html',
  styleUrl: './books-view.component.css',
  standalone: false,
})
export class BooksViewComponent {
  feedbackMessage = '';

  constructor(
    public readonly store: LibraryStore,
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
