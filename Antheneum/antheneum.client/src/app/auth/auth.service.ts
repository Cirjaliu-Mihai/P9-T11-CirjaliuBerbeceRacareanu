import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { AuthResponseDto, AuthRole, AuthSession, LoginPayload, RegisterPayload } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private static readonly storageKey = 'antheneum.auth.session';

  private readonly sessionSubject = new BehaviorSubject<AuthSession | null>(this.restoreSession());

  readonly session$ = this.sessionSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  get session() {
    return this.sessionSubject.value;
  }

  isAuthenticated() {
    return !!this.session;
  }

  role(): AuthRole | null {
    return this.session?.role ?? null;
  }

  username() {
    return this.session?.username ?? '';
  }

  defaultRouteFor(role = this.role()) {
    return role === 'Administrator' ? '/overview' : '/loans';
  }

  login(payload: LoginPayload): Observable<AuthSession> {
    return this.http.post<AuthResponseDto>('/auth/login', payload).pipe(
      tap((session) => {
        this.persistSession(session);
      }),
    );
  }

  register(payload: RegisterPayload): Observable<AuthSession> {
    return this.http.post<AuthResponseDto>('/auth/register', payload).pipe(
      tap((session) => {
        this.persistSession(session);
      }),
    );
  }

  logout(): Observable<void> {
    if (!this.session) {
      this.clearSession();
      return of(void 0);
    }

    return this.http.post<void>('/auth/logout', {}).pipe(
      catchError(() => of(void 0)),
      tap(() => {
        this.clearSession();
      }),
    );
  }

  clearSession() {
    this.sessionSubject.next(null);

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(AuthService.storageKey);
    }
  }

  private persistSession(session: AuthSession) {
    this.sessionSubject.next(session);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(AuthService.storageKey, JSON.stringify(session));
    }
  }

  private restoreSession(): AuthSession | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const raw = localStorage.getItem(AuthService.storageKey);

    if (!raw) {
      return null;
    }

    try {
      const session = JSON.parse(raw) as Partial<AuthSession>;

      if (!session.token || !session.refreshToken || !session.username || !session.role) {
        return null;
      }

      return {
        token: session.token,
        refreshToken: session.refreshToken,
        username: session.username,
        role: session.role,
      };
    } catch {
      return null;
    }
  }
}