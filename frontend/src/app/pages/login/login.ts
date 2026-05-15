import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  email = '';
  password = '';
  error = '';
  loading = false;
  isRegister = false; // toggle between login/register
  name = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  submit() {
    this.loading = true;
    this.error = '';

    const action = this.isRegister
      ? this.authService.register({ name: this.name, email: this.email, password: this.password })
      : this.authService.login(this.email, this.password);

    action.subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err.error?.error || 'Something went wrong';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggle() {
    this.isRegister = !this.isRegister;
    this.error = '';
  }
}