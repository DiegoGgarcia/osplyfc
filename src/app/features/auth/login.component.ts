// src/app/features/auth/login.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { AuthService, LoginCredentials } from '../../core/services/auth.service';

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
    <div class="login-container">
      <div class="login-wrapper">
        <!-- Logo OsplyfC -->
        <div class="logo-container">
          <img src="assets/images/osplyfc-logo.png" alt="OsplyfC" class="logo" />
          <h1>Sistema de Gestión de Expedientes</h1>
          <p class="subtitle">ProcessMaker BPM - OsplyfC</p>
        </div>

        <!-- Formulario de Login -->
        <mat-card class="login-card">
          <mat-card-header>
            <mat-card-title>Iniciar Sesión</mat-card-title>
            <mat-card-subtitle>Ingrese sus credenciales de ProcessMaker</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
              <!-- Campo Usuario -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Usuario</mat-label>
                <input 
                  matInput 
                  formControlName="username"
                  autocomplete="username"
                  [class.error]="isFieldInvalid('username')"
                >
                <mat-icon matSuffix>person</mat-icon>
                <mat-error *ngIf="isFieldInvalid('username')">
                  El usuario es requerido
                </mat-error>
              </mat-form-field>

              <!-- Campo Contraseña -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Contraseña</mat-label>
                <input 
                  matInput 
                  [type]="hidePassword ? 'password' : 'text'"
                  formControlName="password"
                  autocomplete="current-password"
                  [class.error]="isFieldInvalid('password')"
                >
                <button 
                  mat-icon-button 
                  matSuffix 
                  type="button"
                  (click)="hidePassword = !hidePassword"
                  [attr.aria-label]="'Hide password'"
                  [attr.aria-pressed]="hidePassword"
                >
                  <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>
                <mat-error *ngIf="isFieldInvalid('password')">
                  La contraseña es requerida
                </mat-error>
              </mat-form-field>

              <!-- Estado de carga -->
              <div *ngIf="loading" class="loading-container">
                <mat-spinner diameter="30"></mat-spinner>
                <span class="loading-text">Autenticando con ProcessMaker...</span>
              </div>

              <!-- Mensaje de error -->
              <div *ngIf="errorMessage" class="error-message">
                <mat-icon class="error-icon">error</mat-icon>
                <span>{{ errorMessage }}</span>
              </div>

              <!-- Botón de Login -->
              <button 
                mat-raised-button 
                color="primary" 
                type="submit"
                class="login-button full-width"
                [disabled]="loading || !loginForm.valid"
              >
                <span *ngIf="!loading">Iniciar Sesión</span>
                <span *ngIf="loading">Conectando...</span>
              </button>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Información del sistema -->
        <div class="system-info">
          <p><strong>Sistema:</strong> ProcessMaker 3.4.9 Community Edition</p>
          <p><strong>Workspace:</strong> OsplyfC</p>
          <p><strong>Versión:</strong> Dashboard v1.0.0</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-wrapper {
      width: 100%;
      max-width: 440px;
      text-align: center;
    }

    .logo-container {
      margin-bottom: 2rem;
      color: white;
    }

    .logo {
      max-width: 120px;
      height: auto;
      margin-bottom: 1rem;
      filter: brightness(0) invert(1);
    }

    .logo-container h1 {
      font-size: 1.5rem;
      font-weight: 300;
      margin: 0 0 0.5rem 0;
    }

    .subtitle {
      font-size: 0.9rem;
      opacity: 0.9;
      margin: 0;
    }

    .login-card {
      padding: 2rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border-radius: 16px;
      backdrop-filter: blur(8px);
      background: rgba(255, 255, 255, 0.95);
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .full-width {
      width: 100%;
    }

    .loading-container {
      display: flex;
      align-items: center;
      gap: 1rem;
      justify-content: center;
      padding: 1rem;
    }

    .loading-text {
      color: #666;
      font-size: 0.9rem;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #f44336;
      background: rgba(244, 67, 54, 0.1);
      padding: 0.75rem;
      border-radius: 8px;
      font-size: 0.9rem;
    }

    .error-icon {
      font-size: 1.2rem;
    }

    .login-button {
      height: 48px;
      font-size: 1rem;
      font-weight: 500;
      margin-top: 1rem;
    }

    .system-info {
      margin-top: 2rem;
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.8rem;
    }

    .system-info p {
      margin: 0.25rem 0;
    }

    .field-error {
      border-color: #f44336 !important;
    }

    @media (max-width: 480px) {
      .login-container {
        padding: 10px;
      }
      
      .login-card {
        padding: 1.5rem;
      }
      
      .logo-container h1 {
        font-size: 1.3rem;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  ngOnInit(): void {
    // Si ya está autenticado, redirigir al dashboard
    if (this.authService.isAuthenticated()) {
      console.log('✅ Usuario ya autenticado, redirigiendo al dashboard');
      this.router.navigate(['/dashboard']);
    }

    // Limpiar mensajes de error al cambiar los campos
    this.loginForm.valueChanges.subscribe(() => {
      this.errorMessage = '';
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.loading) {
      this.loading = true;
      this.errorMessage = '';

      const credentials: LoginCredentials = {
        username: this.loginForm.get('username')?.value?.trim(),
        password: this.loginForm.get('password')?.value
      };

      console.log('🔑 Iniciando proceso de login para usuario:', credentials.username);

      this.authService.login(credentials).subscribe({
        next: (user) => {
          console.log('✅ Login exitoso, usuario autenticado:', user);
          
          this.snackBar.open(
            `¡Bienvenido!`, 
            'Cerrar', 
            {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            }
          );

          // Redirigir al dashboard
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('❌ Error en login:', error);
          this.handleLoginError(error);
        },
        complete: () => {
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private handleLoginError(error: any): void {
    let message = 'Error de conexión con ProcessMaker';

    switch (error.status) {
      case 401:
        message = 'Usuario o contraseña incorrectos';
        break;
      case 403:
        message = 'Acceso denegado. Verifique sus permisos';
        break;
      case 404:
        message = 'Servicio no encontrado. Verifique la configuración del servidor';
        break;
      case 500:
        message = 'Error interno del servidor ProcessMaker';
        break;
      case 0:
        message = 'No se puede conectar con el servidor. Verifique su conexión';
        break;
      default:
        if (error.message) {
          message = error.message;
        }
    }

    this.errorMessage = message;
    this.loading = false;

    // También mostrar en snackbar para mejor UX
    this.snackBar.open(
      message, 
      'Cerrar', 
      {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      }
    );
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}