// src/app/features/auth/auth-callback.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        
        <div *ngIf="processing" class="space-y-4">
          <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <h2 class="text-xl font-semibold text-gray-800">Procesando autenticación...</h2>
          <p class="text-gray-600">Por favor espera mientras validamos tu acceso.</p>
        </div>

        <div *ngIf="error" class="space-y-4">
          <div class="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-red-800">Error de autenticación</h2>
          <p class="text-red-600">{{ errorMessage }}</p>
          <button 
            (click)="goToLogin()"
            class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Volver al inicio de sesión
          </button>
        </div>

        <div *ngIf="success" class="space-y-4">
          <div class="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-green-800">¡Autenticación exitosa!</h2>
          <p class="text-green-600">Redirigiendo al dashboard...</p>
        </div>

      </div>
    </div>
  `
})
export class AuthCallbackComponent implements OnInit {
  processing = true;
  error = false;
  success = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      const state = params['state'];
      const error = params['error'];
      const errorDescription = params['error_description'];

      if (error) {
        console.error('❌ OAuth Error:', error, errorDescription);
        this.handleError(this.getErrorMessage(error, errorDescription));
        return;
      }

      if (code && state) {
        this.exchangeCodeForToken(code, state);
      } else {
        console.error('❌ Parámetros OAuth inválidos');
        this.handleError('Parámetros de autenticación inválidos');
      }
    });
  }

  private exchangeCodeForToken(code: string, state: string): void {
    this.authService.exchangeCodeForToken(code, state).subscribe({
      next: (user) => {
        console.log('✅ Autenticación OAuth completada:', user);
        this.success = true;
        this.processing = false;
        
        // Obtener URL de retorno o ir al dashboard
        const returnUrl = sessionStorage.getItem('returnUrl') || '/dashboard';
        sessionStorage.removeItem('returnUrl');
        
        setTimeout(() => {
          this.router.navigate([returnUrl]);
        }, 2000);
      },
      error: (error) => {
        console.error('❌ Error en exchange de token:', error);
        this.handleError('Error al procesar la autenticación: ' + error.message);
      }
    });
  }

  private getErrorMessage(error: string, description?: string): string {
    switch (error) {
      case 'access_denied':
        return 'Acceso denegado. Has cancelado la autorización.';
      case 'invalid_request':
        return 'Solicitud inválida. Por favor intenta nuevamente.';
      case 'invalid_client':
        return 'Error de configuración del cliente.';
      case 'invalid_grant':
        return 'Código de autorización inválido o expirado.';
      case 'unsupported_response_type':
        return 'Tipo de respuesta no soportado.';
      default:
        return description || `Error de OAuth: ${error}`;
    }
  }

  private handleError(message: string): void {
    this.processing = false;
    this.error = true;
    this.errorMessage = message;
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
