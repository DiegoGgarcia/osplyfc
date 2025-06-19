import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of, timer, forkJoin } from 'rxjs';
import { map, catchError, retry, shareReplay, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Interfaces según la API real de ProcessMaker 3.4
export interface ProcessMakerUser {
  usr_uid: string;
  usr_username: string;
  usr_firstname: string;
  usr_lastname: string;
  usr_email: string;
  dep_uid?: string;
  dep_title?: string;
  usr_department?: string;
  usr_position?: string;
}

export interface ProcessMakerCase {
  app_uid: string;
  del_index: string;
  del_last_index: string;
  app_number: string;
  app_status: 'TO_DO' | 'DRAFT' | 'CANCELLED' | 'COMPLETED' | 'PAUSED';
  usr_uid: string;
  previous_usr_uid: string;
  tas_uid: string;
  pro_uid: string;
  del_delegate_date: string;
  del_init_date: string;
  del_finish_date?: string;
  del_task_due_date: string;
  del_risk_date: string;
  del_thread_status: 'OPEN' | 'CLOSED';
  app_thread_status: 'OPEN' | 'CLOSED';
  app_title: string;
  app_pro_title: string;
  app_tas_title: string;
  app_current_user: string;
  app_del_previous_user: string;
  del_priority: 'VERY_LOW' | 'LOW' | 'NORMAL' | 'HIGH' | 'VERY_HIGH';
  del_duration: string;
  del_queue_duration: string;
  del_delay_duration: string;
  del_started: string;
  del_finished: string;
  del_delayed: string;
  app_create_date: string;
  app_finish_date?: string;
  app_update_date: string;
  app_overdue_percentage: string;
  usr_firstname: string;
  usr_lastname: string;
  usr_username: string;
  appdelcr_app_tas_title: string;
  usrcr_usr_uid: string;
  usrcr_usr_firstname: string;
  usrcr_usr_lastname: string;
  usrcr_usr_username: string;
  previous_usr_firstname: string;
  previous_usr_lastname: string;
  previous_usr_username: string;
  app_status_label: string;
}

export interface ProcessMakerProcess {
  pro_uid: string;
  pro_title: string;
  pro_description: string;
  tas_uid: string;
}
export interface CaseStats {
  total: number;
  todo: number;
  completed_today: number;
  overdue: number;
  by_status: Record<string, number>;
  by_process: Record<string, number>;
}

export interface LoginResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token: string;
}

export interface ApiError {
  error: {
    type: string;
    message: string;
    code: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProcessMakerService {
  private readonly baseUrl = `${environment.processMakerUrl}/api/1.0/${environment.workspace}`;
  private readonly retryAttempts = 3;
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutos

  // Observables con cache
  private userSubject = new BehaviorSubject<ProcessMakerUser | null>(null);
  public user$ = this.userSubject.asObservable();

  private authTokenSubject = new BehaviorSubject<string | null>(null);
  public authToken$ = this.authTokenSubject.asObservable();

  // Cache para procesos y casos
  private processesCache$ = timer(0, this.cacheTimeout).pipe(
    switchMap(() => this.loadProcesses()),
    shareReplay(1)
  );

  private casesCache$ = timer(0, this.cacheTimeout).pipe(
    switchMap(() => this.loadCases()),
    shareReplay(1)
  );

  constructor(private http: HttpClient) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = localStorage.getItem('pm_token');
    if (token) {
      this.authTokenSubject.next(token);
    }
  }

  private get defaultHeaders(): HttpHeaders {
    const token = this.authTokenSubject.value;
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('ProcessMaker API Error:', error);
    
    if (error.status === 401) {
      this.logout();
      return throwError(() => new Error('Sesión expirada. Por favor, inicie sesión nuevamente.'));
    }
    
    if (error.status === 404) {
      return throwError(() => new Error('Endpoint no encontrado. Verificar configuración de API.'));
    }
    
    if (error.status === 0) {
      return throwError(() => new Error('Error de conexión. Verificar servidor ProcessMaker.'));
    }
    
    const errorMessage = error.error?.error?.message || error.message || 'Error desconocido';
    return throwError(() => new Error(errorMessage));
  };

  /**
   * Autenticación usando /login (PM 3.4 compatible)
   */
  login(username: string, password: string): Observable<LoginResponse> {
    const body = {
      username,
      password,
      grant_type: 'password'
    };

    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, body, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    }).pipe(
      tap(response => {
        this.authTokenSubject.next(response.access_token);
        localStorage.setItem('pm_token', response.access_token);
      }),
      retry(this.retryAttempts),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener información del usuario actual usando /cases para extraer datos del usuario
   * Ya que /light no existe en PM 3.4
   */
  getCurrentUser(): Observable<ProcessMakerUser> {
    return this.getAllCases().pipe(
      map(cases => {
        if (cases.length > 0) {
          const firstCase = cases[0];
          return {
            usr_uid: firstCase.usr_uid,
            usr_username: firstCase.usr_username,
            usr_firstname: firstCase.usr_firstname,
            usr_lastname: firstCase.usr_lastname,
            usr_email: '', // No disponible en /cases
            dep_title: firstCase.app_current_user.split(' ')[0] || 'Usuario',
            usr_department: this.extractDepartmentFromUser(firstCase.usr_username)
          };
        } else {
          // Usuario por defecto si no hay casos
          return {
            usr_uid: 'current_user',
            usr_username: 'usuario_sistema',
            usr_firstname: 'Usuario',
            usr_lastname: 'Sistema',
            usr_email: '',
            dep_title: 'OsplyfC',
            usr_department: 'Sistema'
          };
        }
      }),
      tap(user => this.userSubject.next(user)),
      retry(this.retryAttempts),
      catchError(error => {
        console.warn('No se pudo obtener usuario actual:', error);
        // Usuario por defecto en caso de error
        const defaultUser: ProcessMakerUser = {
          usr_uid: 'default_user',
          usr_username: 'usuario_osplyfc',
          usr_firstname: 'Usuario',
          usr_lastname: 'OsplyfC',
          usr_email: '',
          dep_title: 'Mesa de Entrada',
          usr_department: 'Mesa de Entrada'
        };
        this.userSubject.next(defaultUser);
        return of(defaultUser);
      })
    );
  }

  private extractDepartmentFromUser(username: string): string {
    if (username.includes('mesa_entrada')) return 'Mesa de Entrada';
    if (username.includes('cab')) return 'CAB';
    if (username.includes('auditor_medico')) return 'Auditoría Médica';
    if (username.includes('auditor_odonto')) return 'Auditoría Odontológica';
    if (username.includes('auditor_salud')) return 'Auditoría Salud Mental';
    if (username.includes('facturacion')) return 'Facturación';
    if (username.includes('legales')) return 'Legales';
    return 'Sistema';
  }

  /**
   * Verificar estado de la sesión
   */
  async validateSession(): Promise<boolean> {
    try {
      // Intentar obtener casos para validar sesión
      await this.http.get(`${this.baseUrl}/cases`, {
        headers: this.defaultHeaders
      }).toPromise();
      return true;
    } catch (error) {
      console.warn('Sesión inválida:', error);
      this.logout();
      return false;
    }
  }

  /**
   * Obtener todos los casos del usuario (único endpoint disponible en PM 3.4)
   */
  getAllCases(): Observable<ProcessMakerCase[]> {
    return this.http.get<ProcessMakerCase[]>(`${this.baseUrl}/cases`, {
      headers: this.defaultHeaders
    }).pipe(
      retry(this.retryAttempts),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener casos pendientes (filtrados desde todos los casos)
   */
  getTodoCases(): Observable<ProcessMakerCase[]> {
    return this.getAllCases().pipe(
      map(cases => cases.filter(c => c.app_status === 'TO_DO'))
    );
  }

  /**
   * Obtener casos completados/enviados (filtrados desde todos los casos)
   */
  getSentCases(): Observable<ProcessMakerCase[]> {
    return this.getAllCases().pipe(
      map(cases => cases.filter(c => c.app_status === 'COMPLETED'))
    );
  }

  /**
   * Obtener estadísticas de casos procesando todos los casos
   */
  getCaseStats(): Observable<CaseStats> {
    return this.getAllCases().pipe(
      map(cases => {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();

        const stats: CaseStats = {
          total: cases.length,
          todo: cases.filter(c => c.app_status === 'TO_DO').length,
          completed_today: cases.filter(c => 
            c.app_finish_date && c.app_finish_date.startsWith(today)
          ).length,
          overdue: cases.filter(c => {
            const dueDate = new Date(c.del_task_due_date);
            return c.app_status === 'TO_DO' && dueDate < now;
          }).length,
          by_status: {},
          by_process: {}
        };

        // Estadísticas por estado
        cases.forEach(c => {
          stats.by_status[c.app_status] = (stats.by_status[c.app_status] || 0) + 1;
          stats.by_process[c.app_pro_title] = (stats.by_process[c.app_pro_title] || 0) + 1;
        });

        return stats;
      })
    );
  }

  /**
   * Obtener procesos disponibles
   */
  getProcesses(): Observable<ProcessMakerProcess[]> {
    return this.processesCache$;
  }

private loadProcesses(): Observable<ProcessMakerProcess[]> {
  const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authTokenSubject.value}`);
  
  return this.http.get<any[]>(`${this.baseUrl}/case/start-cases`, { headers }).pipe(
    switchMap((cases) => {
      const enriched$ = cases.map(item => {
        return this.http.get<any>(`${this.baseUrl}/project/${item.pro_uid}`, { headers }).pipe(
          map(project => ({
            pro_uid: item.pro_uid,
            pro_title: item.pro_title,
            pro_description: project.prj_description,
            tas_uid: item.tas_uid
          }))
        );
      });
      return enriched$.length > 0 ? forkJoin(enriched$) : of([]);
    }),
    catchError(error => {
      console.error('Error loading processes:', error);
      return of([]);
    })
  );
}

  private loadCases(): Observable<ProcessMakerCase[]> {
    return this.getAllCases();
  }

  /**
   * Iniciar un nuevo caso
   */
  startCase(processId: string, variables?: Record<string, any>): Observable<any> {
    const body = variables || {};
    
    return this.http.post(`${this.baseUrl}/processes/${processId}/cases`, body, {
      headers: this.defaultHeaders
    }).pipe(
      retry(this.retryAttempts),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener detalles de un caso específico
   */
  getCase(caseId: string): Observable<ProcessMakerCase> {
    return this.http.get<ProcessMakerCase>(`${this.baseUrl}/cases/${caseId}`, {
      headers: this.defaultHeaders
    }).pipe(
      retry(this.retryAttempts),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener variables de un caso
   */
  getCaseVariables(caseId: string): Observable<Record<string, any>> {
    return this.http.get<Record<string, any>>(`${this.baseUrl}/cases/${caseId}/variables`, {
      headers: this.defaultHeaders
    }).pipe(
      retry(this.retryAttempts),
      catchError(this.handleError)
    );
  }

  /**
   * Actualizar variables de un caso
   */
  updateCaseVariables(caseId: string, variables: Record<string, any>): Observable<any> {
    return this.http.put(`${this.baseUrl}/cases/${caseId}/variables`, variables, {
      headers: this.defaultHeaders
    }).pipe(
      retry(this.retryAttempts),
      catchError(this.handleError)
    );
  }

  /**
   * Derivar un caso
   */
  routeCase(caseId: string, taskId: string, userId?: string): Observable<any> {
    const body: any = {};
    if (userId) {
      body.usr_uid = userId;
    }

    return this.http.post(`${this.baseUrl}/cases/${caseId}/route`, body, {
      headers: this.defaultHeaders
    }).pipe(
      retry(this.retryAttempts),
      catchError(this.handleError)
    );
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    this.authTokenSubject.next(null);
    this.userSubject.next(null);
    localStorage.removeItem('pm_token');
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.authTokenSubject.value;
  }

  /**
   * Obtener el token actual
   */
  getAuthToken(): string | null {
    return this.authTokenSubject.value;
  }

  /**
   * Utilidad para construir URLs de API
   */
  buildApiUrl(endpoint: string, workspace?: string): string {
    const ws = workspace || environment.workspace;
    return `${environment.processMakerUrl}/api/1.0/${ws}${endpoint}`;
  }

  /**
   * Obtener casos con cache
   */
  getCasesFromCache(): Observable<ProcessMakerCase[]> {
    return this.casesCache$;
  }

  /**
   * Invalidar cache de casos
   */
  invalidateCasesCache(): void {
    this.casesCache$ = timer(0, this.cacheTimeout).pipe(
      switchMap(() => this.loadCases()),
      shareReplay(1)
    );
  }

  /**
   * Método para testing y debugging
   */
  testConnection(): Observable<any> {
    return this.http.get(`${this.baseUrl}/cases`, {
      headers: this.defaultHeaders
    }).pipe(
      map(response => ({
        success: true,
        message: 'Conexión exitosa con ProcessMaker',
        endpoint: `${this.baseUrl}/cases`,
        timestamp: new Date().toISOString(),
        data: response
      })),
      catchError(error => of({
        success: false,
        message: 'Error de conexión con ProcessMaker',
        endpoint: `${this.baseUrl}/cases`,
        timestamp: new Date().toISOString(),
        error: error.message
      }))
    );
  }
}
