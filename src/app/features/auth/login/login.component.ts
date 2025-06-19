import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        
        <!-- Header del Login -->
        <div class="login-header">
          <div class="login-logo">O</div>
          <h1 class="login-title">OsplyfC</h1>
          <p class="login-subtitle">Sistema de Gestión de Expedientes</p>
        </div>

        <!-- Formulario de Login -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          
          <!-- Campo Usuario -->
          <div class="form-group">
            <label for="username">Usuario</label>
            <input 
              type="text" 
              id="username"
              formControlName="username"
              placeholder="Ingrese su usuario"
              [class.error]="loginForm.get('username')?.invalid && loginForm.get('username')?.touched"
            >
            <div 
              *ngIf="loginForm.get('username')?.invalid && loginForm.get('username')?.touched"
              class="error-message"
            >
              <span *ngIf="loginForm.get('username')?.hasError('required')">
                El usuario es obligatorio
              </span>
            </div>
          </div>

          <!-- Campo Contraseña -->
          <div class="form-group">
            <label for="password">Contraseña</label>
            <input 
              type="password" 
              id="password"
              formControlName="password"
              placeholder="Ingrese su contraseña"
              [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
            >
            <div 
              *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
              class="error-message"
            >
              <span *ngIf="loginForm.get('password')?.hasError('required')">
                La contraseña es obligatoria
              </span>
            </div>
          </div>

          <!-- Botón de Login -->
          <button 
            type="submit" 
            class="login-btn"
            [disabled]="loginForm.invalid || isLoading"
          >
            <span *ngIf="!isLoading" class="btn-content">
              <i class="fas fa-sign-in-alt"></i>
              Iniciar Sesión
            </span>
            <span *ngIf="isLoading" class="btn-content">
              <div class="loading"></div>
              Verificando...
            </span>
          </button>

          <!-- Mensaje de Error -->
          <div *ngIf="errorMessage" class="alert error">
            <i class="fas fa-exclamation-triangle"></i>
            {{ errorMessage }}
          </div>

        </form>

        <!-- Footer del Login -->
        <div class="login-footer">
          <p class="version-info">
            <i class="fas fa-info-circle"></i>
            ProcessMaker 3.4.9 - OsplyfC v1.0
          </p>
        </div>

      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Si ya está autenticado, redirigir al dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }

    // Limpiar cualquier error al cambiar los campos
    this.loginForm.valueChanges.subscribe(() => {
      this.errorMessage = '';
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';

      const { username, password } = this.loginForm.value;

      try {
        // Intentar login con ProcessMaker
        const userSession = await this.authService.login(username, password).toPromise();
        
        if (userSession) {
          // Login exitoso
          this.snackBar.open('¡Bienvenido a OsplyfC!', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });

          // Redirigir al dashboard
          this.router.navigate(['/dashboard']);
        } else {
          this.showError('Credenciales inválidas');
        }

      } catch (error: any) {
        console.error('Error en login:', error);
        
        // Manejar diferentes tipos de errores
        if (error.status === 401) {
          this.showError('Usuario o contraseña incorrectos');
        } else if (error.status === 403) {
          this.showError('No tiene permisos para acceder al sistema');
        } else if (error.status === 0) {
          this.showError('Error de conexión. Verifique su red.');
        } else {
          this.showError('Error del servidor. Intente nuevamente.');
        }

      } finally {
        this.isLoading = false;
      }
    } else {
      // Marcar todos los campos como touched para mostrar errores
      this.markFormGroupTouched();
    }
  }

  private showError(message: string): void {
    this.errorMessage = message;
    
    // También mostrar en snackbar
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  // Método para testing y desarrollo
  fillTestCredentials(): void {
    this.loginForm.patchValue({
      username: 'admin',
      password: 'admin'
    });
  }

  // Navegar a ayuda
  goToHelp(): void {
    window.open('/workflow/help', '_blank');
  }
}
