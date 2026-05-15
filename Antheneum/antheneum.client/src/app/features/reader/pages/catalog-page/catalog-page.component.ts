import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { BooksService } from '../../../../core/services/books.service';
import { Book } from '../../../../models/library/book.model';
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
  private readonly dialog = inject(MatDialog);
  private readonly searchInput$ = new Subject<string>();
  private sub = new Subscription();

  readonly books = signal<Book[]>([]);
  readonly isLoading = signal(false);
  readonly totalCount = signal(0);
  readonly page = signal(1);
  readonly pageSize = 24;

  filterMode: FilterMode = 'all';
  searchTerm = '';

  ngOnInit() {
    this.sub.add(
      this.searchInput$
        .pipe(debounceTime(350), distinctUntilChanged())
        .subscribe((term) => this.fetch(term)),
    );
    this.fetch('');
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  onSearchChange(value: string) {
    this.searchTerm = value;
    this.page.set(1);
    this.searchInput$.next(value);
  }

  setFilterMode(mode: FilterMode) {
    this.filterMode = mode;
    this.page.set(1);
    this.fetch(this.searchTerm);
  }

  loadPage(p: number) {
    this.page.set(p);
    this.fetch(this.searchTerm);
  }

  openBook(book: Book) {
    this.dialog.open(BookDetailDialogComponent, { width: '640px', data: book });
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount() / this.pageSize);
  }

  private fetch(term: string) {
    const search = this.filterMode === 'all' || this.filterMode === 'title' ? term : '';
    const author = this.filterMode === 'author' ? term : '';
    const publisher = this.filterMode === 'publisher' ? term : '';
    this.isLoading.set(true);
    this.sub.add(
      this.booksService.list(search, this.page(), this.pageSize, author, publisher).subscribe({
        next: (result) => {
          this.books.set(result.items);
          this.totalCount.set(result.totalCount);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      }),
    );
  }
}
