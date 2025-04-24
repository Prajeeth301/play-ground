import { Component, effect, inject } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import {MatSidenavModule} from '@angular/material/sidenav';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatSidenavModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend';
  isAuthenticated = false;

  authService = inject(AuthService);

  constructor() {
    this.authService.validateUser();

    effect(() => {
      this.isAuthenticated = this.authService.isUserAuthenticated();
    });
    
  }
}
