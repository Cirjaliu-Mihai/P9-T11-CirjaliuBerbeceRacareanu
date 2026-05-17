import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { BooksService } from '../../../../core/services/books.service';
import { Book } from '../../../../models/library/book.model';
import { BookDetailDialogComponent } from '../../dialogs/book-detail-dialog/book-detail-dialog.component';

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

  searchTerm = '';
  authorOptions: string[] = [];
  publisherOptions: string[] = [];
  selectedAuthor = '';
  selectedPublisher = '';

  ngOnInit() {
    this.loadFilterOptions();
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

  selectAuthor(author: string) {
    this.selectedAuthor = author;
    this.page.set(1);
    this.fetch(this.searchTerm);
  }

  selectPublisher(publisher: string) {
    this.selectedPublisher = publisher;
    this.page.set(1);
    this.fetch(this.searchTerm);
  }

  clearFilters() {
    this.selectedAuthor = '';
    this.selectedPublisher = '';
    this.searchTerm = '';
    this.page.set(1);
    this.fetch('');
  }

  loadPage(p: number) {
    this.page.set(p);
    this.fetch(this.searchTerm);
  }

  openBook(book: Book) {
    this.dialog.open(BookDetailDialogComponent, {
      width: '860px',
      maxWidth: '92vw',
      maxHeight: '88vh',
      panelClass: 'book-detail-dialog-panel',
      autoFocus: false,
      data: book,
    });
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount() / this.pageSize);
  }

  private loadFilterOptions() {
    this.sub.add(
      this.booksService.getFilterOptions().subscribe({
        next: (options) => {
          this.authorOptions = [...options.authors].sort((a, b) => a.localeCompare(b));
          this.publisherOptions = [...options.publishers].sort((a, b) => a.localeCompare(b));
        },
      }),
    );
  }

  private fetch(term: string) {
    const search = term.trim();
    const author = this.selectedAuthor;
    const publisher = this.selectedPublisher;
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
