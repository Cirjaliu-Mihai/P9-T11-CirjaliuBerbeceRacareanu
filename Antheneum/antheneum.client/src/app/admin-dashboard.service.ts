import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BlacklistReport,
  Branch,
  InventoryReport,
  Loan,
  OverdueReport,
  PagedResult,
  Reader,
  TransactionReport,
  Book,
} from './admin-dashboard.models';

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  constructor(private readonly http: HttpClient) {}

  getBooks(search = '', page = 1, pageSize = 6) {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<PagedResult<Book>>('/books', { params });
  }

  getBranches() {
    return this.http.get<Branch[]>('/branches');
  }

  createBranch(payload: { name: string; address: string | null }) {
    return this.http.post<Branch>('/branches', payload);
  }

  updateBranch(branchId: number, payload: { name: string; address: string | null }) {
    return this.http.put<Branch>(`/branches/${branchId}`, payload);
  }

  deleteBranch(branchId: number) {
    return this.http.delete<void>(`/branches/${branchId}`);
  }

  getReaders(search = '', sortBy = '') {
    let params = new HttpParams();

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    if (sortBy.trim()) {
      params = params.set('sortBy', sortBy.trim());
    }

    return this.http.get<Reader[]>('/readers', { params });
  }

  changeReaderRole(readerId: number, role: string) {
    return this.http.patch<Reader>(`/readers/${readerId}/role`, { role });
  }

  updateMyProfile(payload: { phone: string | null; address: string | null; currentPassword: string | null; newPassword: string | null }) {
    return this.http.put<Reader>('/readers/me', payload);
  }

  getMyLoans() {
    return this.http.get<Loan[]>('/loans/my');
  }

  returnLoan(loanId: number) {
    return this.http.post<Loan>(`/loans/${loanId}/return`, {});
  }

  createBook(payload: FormData) {
    return this.http.post<Book>('/books', payload);
  }

  updateBook(bookId: number, payload: FormData) {
    return this.http.put<Book>(`/books/${bookId}`, payload);
  }

  deleteBook(bookId: number) {
    return this.http.delete<void>(`/books/${bookId}`);
  }

  resolvePenalty(readerId: number) {
    return this.http.delete<void>(`/blacklist/${readerId}`);
  }

  getInventoryReport(branchId: number | null, page = 1, pageSize = 8) {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (branchId !== null) {
      params = params.set('branchId', branchId);
    }

    return this.http.get<PagedResult<InventoryReport>>('/reports/inventory', { params });
  }

  getOverdueReport(branchId: number | null, page = 1, pageSize = 8) {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (branchId !== null) {
      params = params.set('branchId', branchId);
    }

    return this.http.get<PagedResult<OverdueReport>>('/reports/overdue', { params });
  }

  getBlacklistReport(branchId: number | null, page = 1, pageSize = 8) {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (branchId !== null) {
      params = params.set('branchId', branchId);
    }

    return this.http.get<PagedResult<BlacklistReport>>('/reports/blacklist', { params });
  }

  getTransactionsReport(from: string, to: string, branchId: number | null, page = 1, pageSize = 8) {
    let params = new HttpParams()
      .set('from', from)
      .set('to', to)
      .set('page', page)
      .set('pageSize', pageSize);

    if (branchId !== null) {
      params = params.set('branchId', branchId);
    }

    return this.http.get<PagedResult<TransactionReport>>('/reports/transactions', { params });
  }
}