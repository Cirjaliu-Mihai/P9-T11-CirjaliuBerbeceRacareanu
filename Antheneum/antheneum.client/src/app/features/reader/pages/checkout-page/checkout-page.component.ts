import { Component, OnInit, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoansService } from '../../../../core/services/loans.service';
import { ReadersStore } from '../../../../core/state/readers.store';
import { ReaderPenalty } from '../../../../models/reader/reader-penalty.model';

@Component({
  selector: 'app-checkout-page',
  templateUrl: './checkout-page.component.html',
  styleUrl: './checkout-page.component.css',
  standalone: false,
})
export class CheckoutPageComponent implements OnInit {
  readonly readersStore = inject(ReadersStore);
  private readonly loansService = inject(LoansService);
  private readonly snackBar = inject(MatSnackBar);

  readonly monthlyPrice = 39.99;
  fines: ReaderPenalty[] = [];
  isLoadingFines = true;

  ngOnInit() {
    this.loansService.getMyFines().subscribe({
      next: (fines) => {
        this.fines = fines;
        this.isLoadingFines = false;
      },
      error: () => {
        this.isLoadingFines = false;
      },
    });
  }

  get profile() {
    return this.readersStore.currentProfile;
  }

  get totalFines(): number {
    return this.fines.reduce((sum, f) => sum + f.amount, 0);
  }

  onSubscribeClick() {
    this.snackBar.open('Stripe payment integration coming soon!', 'OK', { duration: 4000 });
  }

  onPayFinesClick() {
    this.snackBar.open('Stripe payment integration coming soon!', 'OK', { duration: 4000 });
  }
}
