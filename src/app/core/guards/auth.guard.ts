import { Injectable, inject } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuth(state.url);
  }
  
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuth(state.url);
  }
  
  private checkAuth(url: string): Observable<boolean> {
    if (this.authService.isAuthenticated()) {
      return of(true);
    }
    
    // Redirigir al login si no está autenticado
    this.router.navigate(['/auth/login']);
    return of(false);
  }
}

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  
  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.isAuthenticated()) {
      // Si ya está autenticado, redirigir al dashboard
      this.router.navigate(['/dashboard']);
      return of(false);
    }
    
    return of(true);
  }
}

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  
  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const requiredGroups = route.data['groups'] as string[];
    
    if (!requiredGroups || requiredGroups.length === 0) {
      return of(true);
    }
    
    // Verificar si el usuario pertenece a alguno de los grupos requeridos
    const hasAccess = requiredGroups.some(group => 
      this.authService.userBelongsToGroup(group)
    );
    
    if (!hasAccess) {
      this.router.navigate(['/dashboard']); // Redirigir a dashboard si no tiene acceso
      return of(false);
    }
    
    return of(true);
  }
}
