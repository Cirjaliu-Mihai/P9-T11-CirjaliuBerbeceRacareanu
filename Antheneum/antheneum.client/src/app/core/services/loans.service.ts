import { Injectable } from '@angular/core';
import { Loan } from '../../models/reader/loan.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class LoansService {
  constructor(private readonly api: ApiService) {}

  myLoans() {
    return this.api.get<Loan[]>('loans/my');
  }

  returnLoan(loanId: number) {
    return this.api.post<Loan>(`loans/${loanId}/return`, {});
  }
}
