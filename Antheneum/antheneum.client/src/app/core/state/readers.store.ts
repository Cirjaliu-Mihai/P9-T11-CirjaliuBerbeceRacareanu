import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { ProfileFormValue } from '../../models/reader/profile-form-value.model';
import { Reader } from '../../models/reader/reader.model';
import { ReadersService } from '../services/readers.service';

@Injectable({ providedIn: 'root' })
export class ReadersStore {
  private readonly readersSubject = new BehaviorSubject<Reader[]>([]);
  private readonly filteredReadersSubject = new BehaviorSubject<Reader[]>([]);
  private readonly currentProfileSubject = new BehaviorSubject<Reader | null>(null);

  readonly readers$ = this.readersSubject.asObservable();
  readonly filteredReaders$ = this.filteredReadersSubject.asObservable();
  readonly currentProfile$ = this.currentProfileSubject.asObservable();

  readerSearch = '';
  readerSort = 'username';

  constructor(private readonly readersService: ReadersService) {}

  get readers(): Reader[] {
    return this.readersSubject.value;
  }

  set readers(value: Reader[]) {
    this.readersSubject.next(value);
  }

  get filteredReaders(): Reader[] {
    return this.filteredReadersSubject.value;
  }

  private set filteredReaders(value: Reader[]) {
    this.filteredReadersSubject.next(value);
  }

  get currentProfile(): Reader | null {
    return this.currentProfileSubject.value;
  }

  set currentProfile(value: Reader | null) {
    this.currentProfileSubject.next(value);
  }

  applyReaderFilters(): void {
    const term = this.readerSearch.trim().toLowerCase();
    const filtered = this.readers.filter((reader) => {
      if (!term) {
        return true;
      }
      return [reader.username, reader.email, reader.phone ?? '', reader.libraryCardNumber].some(
        (value) => value.toLowerCase().includes(term),
      );
    });

    filtered.sort((left, right) => {
      switch (this.readerSort) {
        case 'cardnumber':
          return left.libraryCardNumber.localeCompare(right.libraryCardNumber);
        case 'role':
          return left.role.localeCompare(right.role) || left.username.localeCompare(right.username);
        default:
          return left.username.localeCompare(right.username);
      }
    });

    this.filteredReaders = filtered;
  }

  syncCurrentProfile(): void {
    if (this.currentProfile) {
      const updated = this.readers.find(
        (reader) => reader.readerId === this.currentProfile?.readerId,
      );
      this.currentProfile = updated ?? this.currentProfile;
      return;
    }
    this.currentProfile = this.readers.find((reader) => reader.role === 'Reader') ?? null;
  }

  updateBlacklistStatus(readerId: number, isBlacklisted: boolean): void {
    const reader = this.readers.find((item) => item.readerId === readerId);
    if (reader) {
      reader.isBlacklisted = isBlacklisted;
    }
    if (this.currentProfile?.readerId === readerId) {
      this.currentProfile = { ...this.currentProfile, isBlacklisted };
    }
    this.applyReaderFilters();
  }

  updateReaderRole(reader: Reader, nextRole: string): Observable<Reader> {
    if (reader.role === nextRole) {
      return of(reader);
    }

    const previousReaders = this.readers;
    const previousCurrentProfile = this.currentProfile;

    this.readers = this.readers.map((item) =>
      item.readerId === reader.readerId ? { ...item, role: nextRole } : item,
    );

    if (this.currentProfile?.readerId === reader.readerId) {
      this.currentProfile = { ...this.currentProfile, role: nextRole };
    }

    this.applyReaderFilters();

    return this.readersService.changeRole(reader.readerId, nextRole).pipe(
      tap((updated) => {
        const target = this.readers.find((item) => item.readerId === reader.readerId);
        if (target) {
          target.role = updated.role;
        }
        if (this.currentProfile?.readerId === reader.readerId) {
          this.currentProfile = { ...this.currentProfile, role: updated.role };
        }
        this.applyReaderFilters();
      }),
      catchError((error) => {
        this.readers = previousReaders;
        this.currentProfile = previousCurrentProfile;
        this.applyReaderFilters();
        return throwError(() => error);
      }),
    );
  }

  updateMyProfile(value: ProfileFormValue): Observable<Reader> {
    const payload = {
      phone: value.phone.trim() || null,
      address: value.address.trim() || null,
      currentPassword: value.currentPassword.trim() || null,
      newPassword: value.newPassword.trim() || null,
    };

    return this.readersService.updateMyProfile(payload).pipe(
      tap((reader) => {
        this.currentProfile = reader;
        this.readers = this.readers.map((item) =>
          item.readerId === reader.readerId ? reader : item,
        );
        this.applyReaderFilters();
      }),
    );
  }

  renewSubscription(): Observable<Reader> {
    return this.readersService.renewSubscription().pipe(
      switchMap(() => this.readersService.getMyProfile()),
      tap((reader) => {
        this.currentProfile = reader;
        this.readers = this.readers.map((item) =>
          item.readerId === reader.readerId ? reader : item,
        );
        this.applyReaderFilters();
      }),
    );
  }

  refreshMyProfile(): Observable<Reader> {
    return this.readersService.getMyProfile().pipe(
      tap((reader) => {
        this.currentProfile = reader;
        this.readers = this.readers.map((item) =>
          item.readerId === reader.readerId ? reader : item,
        );
        this.applyReaderFilters();
      }),
    );
  }

  applySubscriptionExpiry(subscriptionExpiry: string): void {
    const profile = this.currentProfile;
    if (!profile) {
      return;
    }

    const expiryDate = new Date(subscriptionExpiry);
    const hasActiveSubscription = !Number.isNaN(expiryDate.getTime()) && expiryDate >= new Date();

    const updatedProfile: Reader = {
      ...profile,
      subscriptionExpiry,
      hasActiveSubscription,
    };

    this.currentProfile = updatedProfile;
    this.readers = this.readers.map((item) =>
      item.readerId === updatedProfile.readerId ? updatedProfile : item,
    );
    this.applyReaderFilters();
  }

  reset(): void {
    this.readers = [];
    this.filteredReaders = [];
    this.currentProfile = null;
  }
}
