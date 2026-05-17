import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { Loan } from '../../../../models/reader/loan.model';
import { LoansStore } from '../../../../core/state/loans.store';
import { ReadersStore } from '../../../../core/state/readers.store';

@Component({
  selector: 'app-my-loans-page',
  templateUrl: './my-loans-page.component.html',
  styleUrl: './my-loans-page.component.css',
  standalone: false,
})
export class MyLoansPageComponent implements OnInit, OnDestroy {
  readonly store = inject(ReadersStore);
  readonly loans = inject(LoansStore);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroy$ = new Subject<void>();

  ngOnInit() {
    this.loans.loadMyLoans().pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get activeLoans(): Loan[] {
    return this.loans.myLoans.filter((l) => l.isActive && !this.isOverdue(l));
  }

  get overdueLoans(): Loan[] {
    return this.loans.myLoans.filter((l) => l.isActive && this.isOverdue(l));
  }

  get pastLoans(): Loan[] {
    return this.loans.myLoans.filter((l) => !l.isActive && l.copyStatus !== 'Lost');
  }

  get lostLoans(): Loan[] {
    return this.loans.myLoans.filter((l) => l.copyStatus === 'Lost');
  }

  isOverdue(loan: Loan): boolean {
    return new Date(loan.dueDate) < new Date();
  }

  overdueDays(loan: Loan): number {
    const today = new Date();
    const due = new Date(loan.dueDate);
    return Math.max(0, Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));
  }

  renewLoan(loan: Loan) {
    this.loans
      .renewLoan(loan.loanId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.snackBar.open('Loan renewed successfully.', 'OK', { duration: 3000 }),
        error: (err) =>
          this.snackBar.open(err?.error?.message ?? 'Renewal failed.', 'OK', { duration: 4000 }),
      });
  }

}
