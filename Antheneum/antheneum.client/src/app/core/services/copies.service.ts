import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BookCopy } from '../../models/library/book-copy.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CopiesService {
  constructor(
    private readonly api: ApiService,
    private readonly http: HttpClient,
  ) {}

  getByBook(bookId: number) {
    return this.api.get<BookCopy[]>(`books/${bookId}/availability`);
  }

  add(bookId: number, branchId: number, count: number) {
    return this.api.post<void>(`books/${bookId}/copies`, { branchId, count });
  }

  updateStatus(copyId: number, status: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.patch<void>(`/copies/${copyId}/status`, JSON.stringify(status), { headers });
  }
}
