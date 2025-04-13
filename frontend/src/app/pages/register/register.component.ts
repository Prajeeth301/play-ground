import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private regristrationFB = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  registrationForm: FormGroup;

  constructor() {
    this.registrationForm = this.regristrationFB.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      console.log('Form Submitted', this.registrationForm.value);
      this.authService.register(this.registrationForm.value).subscribe(data => {
        console.log(data.message);
        this.router.navigateByUrl("/login");
      });
    } else {
      console.log('Form Invalid');
      this.registrationForm.markAllAsTouched();
    }
  }

  get f() {
    return this.registrationForm.controls;
  }

}
