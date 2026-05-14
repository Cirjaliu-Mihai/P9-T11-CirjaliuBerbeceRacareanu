import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Book } from '../../../../models/library/book.model';
import { BooksService } from '../../../../core/services/books.service';
import { BranchesStore } from '../../../../core/state/branches.store';
import { CopiesStore } from '../../../../core/state/copies.store';
import { AddCopiesDialogComponent } from '../../dialogs/add-copies-dialog/add-copies-dialog.component';

@Component({
  selector: 'app-copies-view',
  templateUrl: './copies-view.component.html',
  styleUrl: './copies-view.component.css',
  standalone: false,
})
export class CopiesViewComponent implements OnInit {
  books: Book[] = [];
  bookSearch = '';

  get filteredBooks(): Book[] {
    const q = this.bookSearch.toLowerCase();
    return q ? this.books.filter((b) => b.title.toLowerCase().includes(q)) : this.books;
  }

  constructor(
    public readonly store: CopiesStore,
    public readonly branches: BranchesStore,
    private readonly booksService: BooksService,
    private readonly dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.booksService.list('', 1, 200).subscribe((result) => {
      this.books = result.items;
    });
  }

  onBookChange(bookId: number) {
    if (bookId) {
      this.store.loadCopies(bookId);
    } else {
      this.store.selectedBookId = null;
    }
  }

  openAddCopiesDialog() {
    if (!this.store.selectedBookId) {
      return;
    }

    this.dialog.open(AddCopiesDialogComponent, {
      width: '440px',
      data: { branches: this.branches.branches },
    }).afterClosed().subscribe((result?: { branchId: number; count: number }) => {
      if (!result) {
        return;
      }
      this.store.addCopies(this.store.selectedBookId!, result.branchId, result.count).subscribe();
    });
  }
}
