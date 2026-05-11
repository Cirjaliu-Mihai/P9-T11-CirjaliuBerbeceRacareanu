import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Book, Branch } from './admin-dashboard.models';
import { AdminDashboardStore, BookFormValue, BranchFormValue } from './admin-dashboard.store';
import {
  BookEditorDialogComponent,
  BranchEditorDialogComponent,
  DeleteConfirmationDialogComponent,
} from './library-dialogs.component';

@Component({
  selector: 'app-library-management-page',
  template: `
    <section class="page-grid page-grid--two">
      <mat-card class="panel">
        <div class="panel-heading">
          <div>
            <p class="kicker">Branches</p>
            <h3>Branch management</h3>
          </div>
          <div class="toolbar-actions">
            <mat-chip-set>
              <mat-chip>{{ store.branches.length }} branches</mat-chip>
            </mat-chip-set>
            <button mat-flat-button type="button" (click)="openCreateBranchDialog()">New branch</button>
          </div>
        </div>

        <div class="stack-list">
          <mat-card *ngFor="let branch of store.branches" class="stack-card">
            <div>
              <strong>{{ branch.name }}</strong>
              <p>{{ branch.address || 'Address pending' }}</p>
            </div>
            <div class="card-actions">
              <span>{{ branch.uniqueNumber }}</span>
              <div class="action-row">
                <button mat-stroked-button type="button" (click)="openEditBranchDialog(branch)">Edit</button>
                <button mat-stroked-button type="button" color="warn" (click)="confirmDelete('branch', branch)">Delete</button>
              </div>
            </div>
          </mat-card>
        </div>
      </mat-card>

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
              <button mat-stroked-button type="button" color="warn" (click)="confirmDelete('book', book)">Delete</button>
            </div>
          </mat-card>
        </div>
      </mat-card>
    </section>

    <mat-card *ngIf="feedbackMessage" class="panel feedback-panel">
      <p class="kicker">Library workflow</p>
      <p>{{ feedbackMessage }}</p>
    </mat-card>
  `,
  standalone: false,
})
export class LibraryManagementPageComponent {
  feedbackMessage = '';

  constructor(
    public readonly store: AdminDashboardStore,
    private readonly dialog: MatDialog,
  ) {}

  openCreateBranchDialog() {
    this.dialog.open(BranchEditorDialogComponent, {
      width: '560px',
      data: {
        title: 'Create branch',
        value: { name: '', address: '' },
      },
    }).afterClosed().subscribe((value?: BranchFormValue) => {
      if (!value) {
        return;
      }

      this.store.createBranch(value).subscribe(() => {
        this.feedbackMessage = 'Branch created.';
      });
    });
  }

  openEditBranchDialog(branch: Branch) {
    this.dialog.open(BranchEditorDialogComponent, {
      width: '560px',
      data: {
        title: 'Edit branch',
        value: { name: branch.name, address: branch.address ?? '' },
      },
    }).afterClosed().subscribe((value?: BranchFormValue) => {
      if (!value) {
        return;
      }

      this.store.updateBranch(branch.branchId, value).subscribe(() => {
        this.feedbackMessage = 'Branch updated.';
      });
    });
  }

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

  confirmDelete(kind: 'branch' | 'book', target: Branch | Book) {
    const label = kind === 'branch' ? (target as Branch).name : (target as Book).title;
    const id = kind === 'branch' ? (target as Branch).branchId : (target as Book).bookId;

    this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '440px',
      data: {
        title: `Remove ${label}`,
        description: 'This action updates the current API state immediately.',
        confirmLabel: 'Delete',
      },
    }).afterClosed().subscribe((confirmed?: boolean) => {
      if (!confirmed) {
        return;
      }

      const action$ = kind === 'branch'
        ? this.store.deleteBranch(id)
        : this.store.deleteBook(id);

      action$.subscribe(() => {
        this.feedbackMessage = kind === 'branch' ? 'Branch deleted.' : 'Book deleted.';
      });
    });
  }
}
