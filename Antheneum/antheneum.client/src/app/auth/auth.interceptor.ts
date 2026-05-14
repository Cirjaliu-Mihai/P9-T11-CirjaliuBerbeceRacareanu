import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const session = this.auth.session;
    const isAuthRequest = request.url.startsWith('/auth/');

    const authorizedRequest = session && !isAuthRequest
      ? request.clone({
        setHeaders: {
          Authorization: `Bearer ${session.token}`,
        },
      })
      : request;

    return next.handle(authorizedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !isAuthRequest) {
          this.auth.clearSession();
          void this.router.navigateByUrl('/auth');
        }

        return throwError(() => error);
      }),
    );
  }
}