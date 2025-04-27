import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { catchError, throwError, EMPTY } from 'rxjs';
import { Router } from '@angular/router';
import { TokenRefreshService } from '../services/token-refresh.service'; // <-- Import

export const authInterceptor: HttpInterceptorFn = (req, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const tokenRefreshService = inject(TokenRefreshService); // <-- Inject service
  const accessToken = authService.Token;

  let authReq = req.clone({ withCredentials: true });

  if (accessToken) {
    authReq = authReq.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((errorResponse: HttpErrorResponse) => {
      if (errorResponse.status === 401 || errorResponse.status === 403) {
        if (errorResponse?.error?.MaxRetriesCompleted) {
          authService.removeToken();
          router.navigateByUrl('/login');
          return EMPTY;
        } else {
          return tokenRefreshService.handleError(authReq, next);
        }
      }
      return throwError(() => errorResponse);
    })
  );
};
