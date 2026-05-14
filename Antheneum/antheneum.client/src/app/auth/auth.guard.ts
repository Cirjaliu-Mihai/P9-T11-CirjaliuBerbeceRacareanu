import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthRole } from './auth.models';
import { AuthService } from './auth.service';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree([auth.defaultRouteFor()]);
};

export function roleGuard(expectedRole: AuthRole): CanActivateFn {
  return (_route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/auth'], {
        queryParams: { redirectTo: state.url },
      });
    }

    if (auth.role() === expectedRole) {
      return true;
    }

    return router.createUrlTree([auth.defaultRouteFor()]);
  };
}