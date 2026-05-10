import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AuthResponse {
  token: string;
  refreshToken: string;
  username: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_KEY = 'refresh_token';

  constructor(private http: HttpClient) {}

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  /** Store both the access token and the refresh token after login or token refresh. */
  setAuth(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.REFRESH_KEY, response.refreshToken);
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = this.decodePayload(token);
      const exp = payload['exp'] as number | undefined;
      return exp ? Date.now() / 1000 < exp : true;
    } catch {
      return false;
    }
  }

  getRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = this.decodePayload(token);
      return (
        (payload['role'] as string | undefined) ??
        (payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] as string | undefined) ??
        null
      );
    } catch {
      return null;
    }
  }

  isAdministrator(): boolean {
    return this.getRole() === 'Administrator';
  }

  /** Exchange the stored refresh token for a new access + refresh token pair. */
  refresh(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http
      .post<AuthResponse>('/auth/refresh', { refreshToken })
      .pipe(tap(res => this.setAuth(res)));
  }

  private decodePayload(token: string): Record<string, unknown> {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  }
}
