import { Injectable } from '@angular/core';
import { BookCopy } from '../../models/library/book-copy.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CopiesService {
  constructor(private readonly api: ApiService) {}

  getByBook(bookId: number) {
    return this.api.get<BookCopy[]>(`books/${bookId}/availability`);
  }

  add(bookId: number, branchId: number, count: number) {
    return this.api.post<void>(`books/${bookId}/copies`, { branchId, count });
  }

  updateStatus(copyId: number, status: string) {
    return this.api.patch<void>(`copies/${copyId}/status`, status);
  }

  delete(copyId: number) {
    return this.api.delete<void>(`copies/${copyId}`);
  }
}
