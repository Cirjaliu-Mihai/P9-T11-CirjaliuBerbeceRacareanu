import { Injectable } from '@angular/core';
import { Book } from '../../models/library/book.model';
import { BookAvailability } from '../../models/library/book-availability.model';
import { PagedResult } from '../../models/common/paged-result.model';
import { ApiService } from './api.service';

export interface BookFilterOptions {
  authors: string[];
  publishers: string[];
}

@Injectable({ providedIn: 'root' })
export class BooksService {
  constructor(private readonly api: ApiService) {}

  list(search = '', page = 1, pageSize = 6, author = '', publisher = '') {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('pageSize', pageSize.toString());
    const term = search.trim();
    if (term) params.set('search', term);
    if (author.trim()) params.set('author', author.trim());
    if (publisher.trim()) params.set('publisher', publisher.trim());
    return this.api.get<PagedResult<Book>>(`books?${params.toString()}`);
  }

  getAvailability(bookId: number) {
    return this.api.get<BookAvailability[]>(`books/${bookId}/availability`);
  }

  getFilterOptions() {
    return this.api.get<BookFilterOptions>('books/filter-options');
  }

  create(payload: FormData) {
    return this.api.post<Book>('books', payload);
  }

  update(bookId: number, payload: FormData) {
    return this.api.put<Book>(`books/${bookId}`, payload);
  }

  remove(bookId: number) {
    return this.api.delete<void>(`books/${bookId}`);
  }
}
