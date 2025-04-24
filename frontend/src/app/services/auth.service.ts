import { inject, Injectable } from '@angular/core';
import { catchError, EMPTY, Observable, throwError } from 'rxjs';
import { LoginResponse, RefreshTokenResponse, RegisterResponse } from '../models/auth-response.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { LoginRequest, RegisterRequest } from '../models/auth-request.model';
import { AppConstants } from '../enums/app.constants';
import { Router } from '@angular/router';
import { signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isUserAuthenticated = signal(false);
  private http = inject(HttpClient);
  private router = inject(Router);
  private api = `${environment.apiUrl}/auth`;

  constructor() { }

  validateUser() {
    if (!this.isAuthenticated) {
      this.isUserAuthenticated.set(false);
      this.refreshToken().pipe(
        catchError((err: any) => {
          // console.log(err);
          this.router.navigateByUrl("/unauthorized");
          return EMPTY;
        })
      ).subscribe((data) => {
        this.Token = data.accessToken;
        // old route navigate
      });
    }else {
      // login, unauthorized, not-found
      this.isUserAuthenticated.set(true);
    }
  }

  get isAuthenticated(): boolean {
    return !!localStorage.getItem(AppConstants.ACCESS_TOKEN);
  }

  get Token(): string {
    return localStorage.getItem(AppConstants.ACCESS_TOKEN) || '';
  }

  set Token(token: string) {
    localStorage.setItem(AppConstants.ACCESS_TOKEN, token);
    this.isUserAuthenticated.set(true);
  }

  removeToken() {
    localStorage.removeItem(AppConstants.ACCESS_TOKEN);
    this.isUserAuthenticated.set(false);
  }

  register(registrationCreds: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.api}/register`, registrationCreds).pipe(
      catchError(err => {
        console.error('Registration failed', err);
        return throwError(() => err);
      })
    );
  }

  // {withCredentials: true,}
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.api}/login`, credentials)
      .pipe(
        catchError(err => {
          console.error('Login failed', err);
          return throwError(() => err);
        })
      );
  }

  refreshToken() {
    return this.http.post<{ accessToken: string }>(`${this.api}/refresh-token`, {});
  }

  logout() {
    this.removeToken();
    this.http.post(`${this.api}/logout`, {}).subscribe((data) => {
      console.log(data);
      // navigate to login or home page
    });
  }
}
