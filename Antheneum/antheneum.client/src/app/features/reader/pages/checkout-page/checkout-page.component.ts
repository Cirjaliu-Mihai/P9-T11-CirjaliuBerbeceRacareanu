import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoansService } from '../../../../core/services/loans.service';
import { ReadersService } from '../../../../core/services/readers.service';
import { ReadersStore } from '../../../../core/state/readers.store';
import { ReaderPenalty } from '../../../../models/reader/reader-penalty.model';
import { take } from 'rxjs';

@Component({
  selector: 'app-checkout-page',
  templateUrl: './checkout-page.component.html',
  styleUrl: './checkout-page.component.css',
  standalone: false,
})
export class CheckoutPageComponent implements OnInit {
  readonly readersStore = inject(ReadersStore);
  private readonly loansService = inject(LoansService);
  private readonly readersService = inject(ReadersService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly monthlyPrice = 39.99;
  fines: ReaderPenalty[] = [];
  isLoadingFines = true;
  isRedirectingToStripe = false;

  ngOnInit() {
    this.handleStripeReturn();
    this.loadFines();
  }

  get profile() {
    return this.readersStore.currentProfile;
  }

  get totalFines(): number {
    return this.fines.reduce((sum, f) => sum + f.amount, 0);
  }

  onSubscribeWithStripeClick() {
    this.startStripeCheckout('subscription');
  }

  onPayFinesWithStripeClick() {
    this.startStripeCheckout('fines');
  }

  private loadFines() {
    this.isLoadingFines = true;
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

  private startStripeCheckout(purchaseType: 'subscription' | 'fines') {
    this.isRedirectingToStripe = true;

    const successUrl = `${window.location.origin}/reader/checkout?stripe=success&kind=${purchaseType}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${window.location.origin}/reader/checkout?stripe=cancel&kind=${purchaseType}`;

    this.readersService.createStripeCheckoutSession({
      purchaseType,
      successUrl,
      cancelUrl,
    }).subscribe({
      next: ({ url }) => {
        if (!url) {
          this.isRedirectingToStripe = false;
          this.snackBar.open('Could not start Stripe checkout.', 'OK', { duration: 5000 });
          return;
        }
        window.location.href = url;
      },
      error: () => {
        this.isRedirectingToStripe = false;
        this.snackBar.open('Unable to start Stripe checkout right now.', 'OK', { duration: 5000 });
      },
    });
  }

  private handleStripeReturn() {
    this.route.queryParamMap.pipe(take(1)).subscribe((params) => {
      const stripeState = params.get('stripe');
      const sessionId = params.get('session_id');
      const kind = params.get('kind');

      if (!stripeState) {
        return;
      }

      if (stripeState === 'cancel') {
        this.snackBar.open('Stripe payment was canceled.', 'OK', { duration: 3500 });
        this.clearStripeParams();
        return;
      }

      if (stripeState !== 'success' || !sessionId || (kind !== 'subscription' && kind !== 'fines')) {
        this.snackBar.open('Invalid Stripe checkout return payload.', 'OK', { duration: 5000 });
        this.clearStripeParams();
        return;
      }

      this.readersService.confirmStripeCheckout({
        purchaseType: kind,
        sessionId,
      }).subscribe({
        next: (result) => {
          if (kind === 'subscription') {
            if (result.subscriptionExpiry) {
              this.readersStore.applySubscriptionExpiry(result.subscriptionExpiry);
            }

            this.readersStore.refreshMyProfile().subscribe({
              next: () => {
                this.snackBar.open(result.message, 'OK', { duration: 5000 });
                this.clearStripeParams();
              },
              error: () => {
                this.snackBar.open(
                  `${result.message} (profile refresh pending, reload if needed)`,
                  'OK',
                  { duration: 6000 },
                );
                this.clearStripeParams();
              },
            });
            return;
          }

          if (kind === 'fines') {
            this.loadFines();
          }

          this.snackBar.open(result.message, 'OK', { duration: 5000 });
          this.clearStripeParams();
        },
        error: () => {
          this.snackBar.open('Could not confirm Stripe payment.', 'OK', { duration: 5000 });
          this.clearStripeParams();
        },
      });
    });
  }

  private clearStripeParams() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true,
    });
  }
}
