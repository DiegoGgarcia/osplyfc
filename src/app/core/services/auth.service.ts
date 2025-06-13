import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Interfaces
export interface OAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token: string;
}

export interface ProcessMakerUser {
  USR_UID: string;
  USR_USERNAME: string;
  USR_FIRSTNAME: string;
  USR_LASTNAME: string;
  USR_EMAIL: string;
  USR_STATUS: string;
  USR_COUNTRY: string;
  USR_CITY: string;
  USR_LOCATION: string;
  USR_ADDRESS: string;
  USR_PHONE: string;
  USR_POSITION: string;
  USR_RESUME: string;
  DEP_UID: string;
  DEP_TITLE: string;
  USR_REPORTS_TO: string;
  USR_REPLACED_BY: string;
  USR_DUE_DATE: string;
  USR_CREATE_DATE: string;
  USR_UPDATE_DATE: string;
  USR_BUDDY: string;
  USR_CALENDAR: string;
  USR_TIMEZONE: string;
  USR_DECORATIONS: string;
  USR_HIDDEN_PREFERENCES: string;
  USR_LAST_UPDATE_DATE: string;
  USR_LOGGED_NEXT_TIME: number;
  USR_PASSWORD_HISTORY: string;
  USR_TOTAL_INBOX: number;
  USR_TOTAL_DRAFT: number;
  USR_TOTAL_CANCELLED: number;
  USR_TOTAL_PARTICIPATED: number;
  USR_TOTAL_PAUSED: number;
  USR_TOTAL_COMPLETED: number;
  USR_TOTAL_UNASSIGNED: number;
  USR_LAST_LOGIN: string;
}

export interface UserPermissions {
  [key: string]: boolean;
}

export interface UserSession {
  user: ProcessMakerUser;
  permissions: UserPermissions;
  token: string;
  expiresAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  
  private readonly tokenKey = 'osplyfc_token';
  private readonly userKey = 'osplyfc_user';
  private readonly permissionsKey = 'osplyfc_permissions';
  
  private currentUserSubject = new BehaviorSubject<ProcessMakerUser | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  
  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();
  
  constructor() {
    this.loadStoredSession();
  }
  
  /**
   * Realiza login con OAuth 2.0
   */
  login(username: string, password: string): Observable<UserSession> {
    const tokenUrl = `${environment.processMakerUrl}/${environment.workspace}/oauth2/token`;
    
    const body = {
      grant_type: environment.oauth.grantType,
      scope: environment.oauth.scope,
      client_id: environment.oauth.clientId,
      client_secret: environment.oauth.clientSecret,
      username: username,
      password: password
    };
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    return this.http.post<OAuthResponse>(tokenUrl, body, { headers }).pipe(
      tap(response => {
        const expiresAt = Date.now() + (response.expires_in * 1000);
        this.storeToken(response.access_token, expiresAt);
        this.tokenSubject.next(response.access_token);
      }),
      map(response => {
        // Para OAuth 2.0, necesitamos obtener los datos del usuario por separado
        return this.getCurrentUser().pipe(
          map(userData => {
            const session: UserSession = {
              user: userData.user,
              permissions: userData.permissions,
              token: response.access_token,
              expiresAt: Date.now() + (response.expires_in * 1000)
            };
            
            this.storeUserSession(session);
            this.currentUserSubject.next(userData.user);
            
            return session;
          })
        );
      }),
      catchError(error => {
        console.error('Error en login:', error);
        return throwError(() => error);
      })
    ) as any;
  }
  
  /**
   * Obtiene información del usuario actual
   */
  getCurrentUser(): Observable<{user: ProcessMakerUser, permissions: UserPermissions}> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No token available'));
    }
    
    const userUrl = `${environment.processMakerUrl}/api/1.0/${environment.workspace}/user`;
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    
    return this.http.get<any>(userUrl, { headers }).pipe(
      map(response => ({
        user: response,
        permissions: this.extractPermissions(response)
      })),
      catchError(error => {
        console.error('Error obteniendo usuario:', error);
        return throwError(() => error);
      })
    );
  }
  
  /**
   * Cierra sesión
   */
  logout(): Observable<boolean> {
    const token = this.getToken();
    
    // Limpiar almacenamiento local
    this.clearSession();
    
    if (!token) {
      return of(true);
    }
    
    const revokeUrl = `${environment.processMakerUrl}/${environment.workspace}/oauth2/revoke`;
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    
    return this.http.post(revokeUrl, { token }, { headers }).pipe(
      map(() => true),
      catchError(() => of(true)) // Siempre consideramos exitoso el logout local
    );
  }
  
  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const expiresAt = localStorage.getItem('osplyfc_expires_at');
    
    if (!token || !expiresAt) {
      return false;
    }
    
    return Date.now() < parseInt(expiresAt);
  }
  
  /**
   * Obtiene el token actual
   */
  getToken(): string | null {
    return this.tokenSubject.value || localStorage.getItem(this.tokenKey);
  }
  
  /**
   * Verifica si el usuario pertenece a un grupo específico
   */
  userBelongsToGroup(groupName: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    
    // Esta lógica necesita ser implementada según la estructura de ProcessMaker
    // Por ahora, devolvemos true para permitir acceso
    return true;
  }
  
  /**
   * Obtiene el usuario actual
   */
  getCurrentUserValue(): ProcessMakerUser | null {
    return this.currentUserSubject.value;
  }
  
  // Métodos privados
  private loadStoredSession(): void {
    const token = localStorage.getItem(this.tokenKey);
    const userStr = localStorage.getItem(this.userKey);
    const expiresAt = localStorage.getItem('osplyfc_expires_at');
    
    if (token && userStr && expiresAt && Date.now() < parseInt(expiresAt)) {
      try {
        const user = JSON.parse(userStr);
        this.tokenSubject.next(token);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        this.clearSession();
      }
    } else {
      this.clearSession();
    }
  }
  
  private storeToken(token: string, expiresAt: number): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem('osplyfc_expires_at', expiresAt.toString());
  }
  
  private storeUserSession(session: UserSession): void {
    localStorage.setItem(this.userKey, JSON.stringify(session.user));
    localStorage.setItem(this.permissionsKey, JSON.stringify(session.permissions));
  }
  
  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.permissionsKey);
    localStorage.removeItem('osplyfc_expires_at');
    
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
  }
  
  private extractPermissions(user: any): UserPermissions {
    // Implementar lógica para extraer permisos del usuario
    // Por ahora retornamos permisos básicos
    return {
      'PM_LOGIN': true,
      'PM_CASES': true,
      'PM_EDITPERSONALINFO': true,
      'PM_FOLDERS_OWNER': true
    };
  }
}
