import { Injectable } from '@angular/core';
import { Book } from '../../models/library/book.model';
import { PagedResult } from '../../models/common/paged-result.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class BooksService {
  constructor(private readonly api: ApiService) {}

  list(search = '', page = 1, pageSize = 6) {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('pageSize', pageSize.toString());
    const term = search.trim();
    if (term) {
      params.set('search', term);
    }
    return this.api.get<PagedResult<Book>>(`books?${params.toString()}`);
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
