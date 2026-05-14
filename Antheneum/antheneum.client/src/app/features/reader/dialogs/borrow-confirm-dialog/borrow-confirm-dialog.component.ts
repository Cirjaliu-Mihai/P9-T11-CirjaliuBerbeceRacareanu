import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoansStore } from '../../../../core/state/loans.store';

export interface BorrowConfirmDialogData {
  copyId: number;
  bookTitle: string;
  branchName: string;
}

@Component({
  selector: 'app-borrow-confirm-dialog',
  templateUrl: './borrow-confirm-dialog.component.html',
  styleUrl: './borrow-confirm-dialog.component.css',
  standalone: false,
})
export class BorrowConfirmDialogComponent {
  readonly dialogRef = inject<MatDialogRef<BorrowConfirmDialogComponent, boolean>>(MatDialogRef);
  private readonly loansStore = inject(LoansStore);
  private readonly snackBar = inject(MatSnackBar);

  isBorrowing = false;

  constructor(@Inject(MAT_DIALOG_DATA) public readonly data: BorrowConfirmDialogData) {}

  get returnDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  confirm() {
    this.isBorrowing = true;
    this.loansStore.borrowBook(this.data.copyId).subscribe({
      next: () => {
        this.snackBar.open(`Borrowed! Return by ${this.returnDate}`, 'OK', { duration: 5000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        const message = err?.error?.message ?? 'Unable to complete the borrow request.';
        this.snackBar.open(message, 'OK', { duration: 6000 });
        this.isBorrowing = false;
      },
    });
  }
}
