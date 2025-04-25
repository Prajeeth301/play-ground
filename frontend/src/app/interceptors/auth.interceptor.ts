import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, of, EMPTY } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);
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
    catchError((errorResponse: HttpErrorResponse) => {
      // If 401, try to refresh token
      if (errorResponse.status === 401 || errorResponse.status === 403) {
        if(errorResponse?.error?.MaxRetriesCompleted) {
          authService.removeToken();
          router.navigateByUrl('/login');
          return EMPTY;
        }else {
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
      }

      return throwError(() => errorResponse);
    })
  );
};
