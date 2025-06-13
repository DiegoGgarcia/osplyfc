import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        
        <!-- Logo and Title -->
        <div class="text-center">
          <mat-icon class="text-6xl text-blue-600 mb-4">local_hospital</mat-icon>
          <h2 class="text-3xl font-extrabold text-gray-900">OsplyfC</h2>
          <p class="mt-2 text-sm text-gray-600">Obra Social del Personal de Luz y Fuerza de Córdoba</p>
        </div>

        <!-- Login Form -->
        <mat-card class="p-8">
          <mat-card-header class="text-center mb-6">
            <mat-card-title>Iniciar Sesión</mat-card-title>
            <mat-card-subtitle>Accede a tu dashboard de expedientes</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <div class="space-y-4">
                
                <!-- Username Field -->
                <mat-form-field class="w-full" appearance="outline">
                  <mat-label>Usuario</mat-label>
                  <input 
                    matInput 
                    type="text"
                    formControlName="username"
                    placeholder="Ingrese su usuario"
                    autocomplete="username"
                  >
                  <mat-icon matSuffix>person</mat-icon>
                  <mat-error *ngIf="loginForm.get('username')?.hasError('required')">
                    El usuario es requerido
                  </mat-error>
                </mat-form-field>

                <!-- Password Field -->
                <mat-form-field class="w-full" appearance="outline">
                  <mat-label>Contraseña</mat-label>
                  <input 
                    matInput 
                    [type]="hidePassword() ? 'password' : 'text'"
                    formControlName="password"
                    placeholder="Ingrese su contraseña"
                    autocomplete="current-password"
                  >
                  <button 
                    mat-icon-button 
                    matSuffix 
                    type="button"
                    (click)="togglePasswordVisibility()"
                  >
                    <mat-icon>{{ hidePassword() ? 'visibility' : 'visibility_off' }}</mat-icon>
                  </button>
                  <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                    La contraseña es requerida
                  </mat-error>
                </mat-form-field>

                <!-- Submit Button -->
                <button 
                  mat-raised-button 
                  color="primary" 
                  type="submit"
                  class="w-full h-12"
                  [disabled]="loginForm.invalid || loading()"
                >
                  <span *ngIf="!loading()">Iniciar Sesión</span>
                  <mat-spinner *ngIf="loading()" diameter="20" class="mr-2"></mat-spinner>
                  <span *ngIf="loading()">Iniciando sesión...</span>
                </button>

              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Footer -->
        <div class="text-center text-sm text-gray-600">
          <p>Sistema de Gestión de Expedientes</p>
          <p class="mt-1">ProcessMaker v3.4.9 • OsplyfC Dashboard</p>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .mat-mdc-card {
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      border-radius: 12px;
    }
    
    .mat-mdc-raised-button {
      border-radius: 8px;
      font-weight: 500;
    }
    
    .mat-mdc-form-field {
      width: 100%;
    }
  `]
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  // Signals
  loading = signal<boolean>(false);
  hidePassword = signal<boolean>(true);

  // Form
  loginForm: FormGroup;

constructor() {
  this.loginForm = this.formBuilder.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  // Escuchar cambios del estado de loading y deshabilitar/habilitar el formulario
  effect(() => {
    if (this.loading()) {
      this.loginForm.disable();
    } else {
      this.loginForm.enable();
    }
  });
}

  onSubmit(): void {
    if (this.loginForm.invalid || this.loading()) {
      return;
    }

    const { username, password } = this.loginForm.value;
    this.loading.set(true);

    this.authService.login(username, password)
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (session) => {
          this.snackBar.open(
            `¡Bienvenido!`, 
            'Cerrar', 
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Login error:', error);
          
          let errorMessage = 'Error al iniciar sesión. Verifique sus credenciales.';
          
          if (error.status === 401) {
            errorMessage = 'Usuario o contraseña incorrectos.';
          } else if (error.status === 0) {
            errorMessage = 'No se pudo conectar al servidor. Verifique su conexión.';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }

          this.snackBar.open(
            errorMessage, 
            'Cerrar', 
            { duration: 5000, panelClass: ['error-snackbar'] }
          );
        }
      });
  }

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }
}
