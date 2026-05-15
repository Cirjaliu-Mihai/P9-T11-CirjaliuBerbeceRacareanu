import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, finalize, Observable, tap, throwError } from 'rxjs';
import { Book } from '../../models/library/book.model';
import { BookFormValue } from '../../models/library/book-form-value.model';
import { BooksService } from '../services/books.service';

@Injectable({ providedIn: 'root' })
export class BooksStore {
  private nextTemporaryId = -1;
  private readonly booksSubject = new BehaviorSubject<Book[]>([]);
  private readonly isLoadingSubject = new BehaviorSubject(false);

  readonly books$ = this.booksSubject.asObservable();
  readonly isLoading$ = this.isLoadingSubject.asObservable();

  page = 1;
  readonly pageSize = 24;
  totalCount = 0;
  searchTerm = '';

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  constructor(private readonly booksService: BooksService) {}

  get books(): Book[] {
    return this.booksSubject.value;
  }

  set books(value: Book[]) {
    this.booksSubject.next(value);
  }

  private set isLoading(value: boolean) {
    this.isLoadingSubject.next(value);
  }

  loadPage(page: number, search = this.searchTerm, author?: string, publisher?: string): void {
    this.page = page;
    this.searchTerm = search;
    this.isLoading = true;
    this.booksService
      .list(search, page, this.pageSize, author, publisher)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (result) => {
          this.books = result.items;
          this.totalCount = result.totalCount;
        },
      });
  }

  createBook(value: BookFormValue, coverFile: File | null): Observable<Book> {
    const formData = this.buildBookFormData(value, coverFile, false);
    const temporaryBook: Book = {
      bookId: this.consumeTemporaryId(),
      isbn: value.isbn.trim(),
      title: value.title.trim(),
      authors: value.authors.trim() || null,
      publisher: value.publisher.trim() || null,
      imgUrl: null,
    };
    this.books = [temporaryBook, ...this.books];

    return this.booksService.create(formData).pipe(
      tap((book) => {
        this.books = this.books.map((item) => (item.bookId === temporaryBook.bookId ? book : item));
        this.loadPage(this.page);
      }),
      catchError((error) => {
        this.books = this.books.filter((item) => item.bookId !== temporaryBook.bookId);
        return throwError(() => error);
      }),
    );
  }

  updateBook(bookId: number, value: BookFormValue, coverFile: File | null): Observable<Book> {
    const previousBooks = this.books;
    const currentBook = this.books.find((item) => item.bookId === bookId);
    const formData = this.buildBookFormData(value, coverFile, true);

    if (currentBook) {
      const optimisticBook: Book = {
        ...currentBook,
        title: value.title.trim(),
        authors: value.authors.trim() || null,
        publisher: value.publisher.trim() || null,
      };
      this.books = this.books.map((item) => (item.bookId === bookId ? optimisticBook : item));
    }

    return this.booksService.update(bookId, formData).pipe(
      tap((book) => {
        this.books = this.books.map((item) => (item.bookId === bookId ? book : item));
      }),
      catchError((error) => {
        this.books = previousBooks;
        return throwError(() => error);
      }),
    );
  }

  deleteBook(bookId: number): Observable<void> {
    const previousBooks = this.books;
    this.books = this.books.filter((item) => item.bookId !== bookId);

    return this.booksService.remove(bookId).pipe(
      tap(() => {
        const newPage = this.books.length === 1 && this.page > 1 ? this.page - 1 : this.page;
        this.loadPage(newPage);
      }),
      catchError((error) => {
        this.books = previousBooks;
        return throwError(() => error);
      }),
    );
  }

  reset(): void {
    this.books = [];
  }

  private buildBookFormData(value: BookFormValue, coverFile: File | null, isUpdate: boolean) {
    const formData = new FormData();
    if (!isUpdate) {
      formData.append('isbn', value.isbn.trim());
    }
    formData.append('title', value.title.trim());
    formData.append('authors', value.authors.trim());
    formData.append('publisher', value.publisher.trim());
    if (coverFile) {
      formData.append('cover', coverFile, coverFile.name);
    }
    return formData;
  }

  private consumeTemporaryId() {
    return this.nextTemporaryId--;
  }
}
