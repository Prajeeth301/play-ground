import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, of } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const accessToken = authService.Token;

  // setting withCredentials: true
  let authReq = req.clone({
    withCredentials: true
  });

  // Add Authorization header if token exists
  if (accessToken) {
    authReq = authReq.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }

  // Continue request and handle 401
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If 401, try to refresh token
      if (error.status === 401) {
        return authService.refreshToken().pipe(
          switchMap((res: any) => {
            // Save new access token
            authService.Token = res.accessToken;

            // Retry the original request with new token
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${res.accessToken}`
              },
              withCredentials: true // including it explictly
            });

            return next(retryReq);
          }),
          catchError(refreshError => {
            // Refresh also failed — logout and throw original error
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
