import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { BooksService } from '../../../../core/services/books.service';
import { BranchesService } from '../../../../core/services/branches.service';
import { Book } from '../../../../models/library/book.model';
import { Branch } from '../../../../models/library/branch.model';
import { BookDetailDialogComponent } from '../../dialogs/book-detail-dialog/book-detail-dialog.component';

type FilterMode = 'all' | 'title' | 'author' | 'publisher';

@Component({
  selector: 'app-catalog-page',
  templateUrl: './catalog-page.component.html',
  styleUrl: './catalog-page.component.css',
  standalone: false,
})
export class CatalogPageComponent implements OnInit, OnDestroy {
  private readonly booksService = inject(BooksService);
  private readonly branchesService = inject(BranchesService);
  private readonly dialog = inject(MatDialog);
  private readonly destroy$ = new Subject<void>();
  private readonly searchInput$ = new Subject<string>();

  books: Book[] = [];
  branches: Branch[] = [];
  isLoading = false;
  filterMode: FilterMode = 'all';
  searchTerm = '';
  totalCount = 0;
  page = 1;
  readonly pageSize = 24;

  ngOnInit() {
    this.branchesService.list().subscribe((branches) => {
      this.branches = branches;
    });

    this.searchInput$
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        switchMap((term) => {
          this.isLoading = true;
          return this.loadBooks(term, this.page);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (result) => {
          this.books = result.items;
          this.totalCount = result.totalCount;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });

    this.searchInput$.next('');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(value: string) {
    this.searchTerm = value;
    this.searchInput$.next(value);
  }

  setFilterMode(mode: FilterMode) {
    this.filterMode = mode;
    this.page = 1;
    this.searchInput$.next(this.searchTerm);
  }

  loadPage(page: number) {
    this.page = page;
    this.searchInput$.next(this.searchTerm);
  }

  private loadBooks(term: string, page: number) {
    const search = this.filterMode === 'all' || this.filterMode === 'title' ? term : '';
    const author = this.filterMode === 'author' ? term : '';
    const publisher = this.filterMode === 'publisher' ? term : '';
    return this.booksService.list(search, page, this.pageSize, author, publisher);
  }

  openBook(book: Book) {
    this.dialog.open(BookDetailDialogComponent, {
      width: '640px',
      data: book,
    });
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }
}
