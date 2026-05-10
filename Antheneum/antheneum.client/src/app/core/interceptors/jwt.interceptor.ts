import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private refreshing = false;
  /** Emits null while a refresh is in flight, then the new access token once done. */
  private refreshToken$ = new BehaviorSubject<string | null>(null);

  constructor(private auth: AuthService, private router: Router) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip token attachment and 401 handling for auth endpoints to avoid loops.
    if (this.isAuthEndpoint(req.url)) {
      return next.handle(req);
    }

    const token = this.auth.getToken();
    return next.handle(token ? this.attachToken(req, token) : req).pipe(
      catchError((err: HttpErrorResponse) =>
        err.status === 401 ? this.handle401(req, next) : throwError(() => err)
      )
    );
  }

  private handle401(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (!this.auth.getRefreshToken()) {
      this.logout();
      return throwError(() => new Error('No refresh token available.'));
    }

    if (this.refreshing) {
      // Queue the request until the in-flight refresh completes.
      return this.refreshToken$.pipe(
        filter((t): t is string => t !== null),
        take(1),
        switchMap(token => next.handle(this.attachToken(req, token)))
      );
    }

    this.refreshing = true;
    this.refreshToken$.next(null);

    return this.auth.refresh().pipe(
      switchMap(res => {
        this.refreshing = false;
        this.refreshToken$.next(res.token);
        return next.handle(this.attachToken(req, res.token));
      }),
      catchError(err => {
        this.refreshing = false;
        this.logout();
        return throwError(() => err);
      })
    );
  }

  private attachToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  private isAuthEndpoint(url: string): boolean {
    return url.includes('/auth/refresh') || url.includes('/auth/login');
  }

  private logout(): void {
    this.auth.clearToken();
    this.router.navigate(['/auth/login']);
  }
}
