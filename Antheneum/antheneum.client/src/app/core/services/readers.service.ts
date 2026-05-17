import { Injectable } from '@angular/core';
import { Reader } from '../../models/reader/reader.model';
import { ApiService } from './api.service';

export interface UpdateProfilePayload {
  phone: string | null;
  address: string | null;
  currentPassword: string | null;
  newPassword: string | null;
}

export interface CreateStripeCheckoutSessionPayload {
  purchaseType: 'subscription' | 'fines';
  successUrl: string;
  cancelUrl: string;
}

export interface StripeCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface ConfirmStripeCheckoutPayload {
  purchaseType: 'subscription' | 'fines';
  sessionId: string;
}

export interface StripeCheckoutConfirmationResponse {
  purchaseType: string;
  message: string;
  subscriptionExpiry: string | null;
}

@Injectable({ providedIn: 'root' })
export class ReadersService {
  constructor(private readonly api: ApiService) {}

  list(search = '', sortBy = '') {
    const params = new URLSearchParams();
    const term = search.trim();
    if (term) {
      params.set('search', term);
    }
    const sort = sortBy.trim();
    if (sort) {
      params.set('sortBy', sort);
    }
    const query = params.toString();
    return this.api.get<Reader[]>(query ? `readers?${query}` : 'readers');
  }

  changeRole(readerId: number, role: string) {
    return this.api.put<Reader>(`readers/${readerId}/role`, { role });
  }

  updateMyProfile(payload: UpdateProfilePayload) {
    return this.api.put<Reader>('readers/me', payload);
  }

  renewSubscription() {
    return this.api.post<{ subscriptionExpiry: string }>('readers/me/subscribe', {});
  }

  createStripeCheckoutSession(payload: CreateStripeCheckoutSessionPayload) {
    return this.api.post<StripeCheckoutSessionResponse>('readers/me/payments/stripe/session', payload);
  }

  confirmStripeCheckout(payload: ConfirmStripeCheckoutPayload) {
    return this.api.post<StripeCheckoutConfirmationResponse>('readers/me/payments/stripe/confirm', payload);
  }

  getMyProfile() {
    return this.api.get<Reader>('readers/me');
  }
}
