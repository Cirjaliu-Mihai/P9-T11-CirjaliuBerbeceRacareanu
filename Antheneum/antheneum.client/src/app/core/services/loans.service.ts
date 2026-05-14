import { Injectable } from '@angular/core';
import { ActiveLoanSummary } from '../../models/loans/active-loan-summary.model';
import { Loan } from '../../models/reader/loan.model';
import { ReaderPenalty } from '../../models/reader/reader-penalty.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class LoansService {
  constructor(private readonly api: ApiService) {}

  myLoans() {
    return this.api.get<Loan[]>('loans/my');
  }

  createLoan(copyId: number) {
    return this.api.post<Loan>('loans', { copyId });
  }

  renewLoan(loanId: number) {
    return this.api.post<Loan>(`loans/${loanId}/renew`, {});
  }

  getMyFines() {
    return this.api.get<ReaderPenalty[]>('loans/my-fines');
  }

  returnLoan(loanId: number) {
    return this.api.post<Loan>(`loans/${loanId}/return`, {});
  }

  searchActive(username: string) {
    return this.api.get<ActiveLoanSummary[]>(
      `loans/active?username=${encodeURIComponent(username)}`,
    );
  }
}
