import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Interfaces
export interface ProcessMakerCase {
  app_uid: string;
  del_index: string;
  del_last_index: string;
  app_number: string;
  app_status: string;
  usr_uid: string;
  previous_usr_uid: string;
  tas_uid: string;
  pro_uid: string;
  del_delegate_date: string;
  del_init_date: string;
  del_finish_date: string | null;
  del_task_due_date: string;
  del_risk_date: string;
  del_thread_status: string;
  app_thread_status: string;
  app_title: string;
  app_pro_title: string;
  app_tas_title: string;
  app_current_user: string;
  app_del_previous_user: string;
  del_priority: string;
  del_duration: string;
  del_queue_duration: string;
  del_delay_duration: string;
  del_started: string;
  del_finished: string;
  del_delayed: string;
  app_create_date: string;
  app_finish_date: string | null;
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
  app_status_label: string;
}

export interface ProcessMakerProcess {
  pro_uid: string;
  pro_title: string;
  pro_description: string;
  pro_parent: string;
  pro_time: string;
  pro_timeunit: string;
  pro_status: string;
  pro_type_day: string;
  pro_type: string;
  pro_assignment: string;
  pro_show_map: number;
  pro_show_message: number;
  pro_subprocess: number;
  pro_tri_deleted: string;
  pro_tri_canceled: string;
  pro_tri_paused: string;
  pro_tri_reassigned: string;
  pro_tri_unpaused: string;
  pro_type_process: string;
  pro_show_delegate: number;
  pro_show_dynaform: number;
  pro_category: string;
  pro_sub_application: number;
  pro_tri_open: string;
  pro_tri_deleted2: string;
  pro_tri_canceled2: string;
  pro_tri_paused2: string;
  pro_tri_reassigned2: string;
  pro_tri_unpaused2: string;
  pro_debug: number;
  pro_dynaforms: any;
  pro_derivation_screen_tpl: string;
  pro_cost: number;
  pro_unit_cost: string;
  cat_uid: string;
  pro_create_date: string;
  pro_update_date: string;
  pro_create_user: string;
  pro_height: number;
  pro_width: number;
  pro_title_x: number;
  pro_title_y: number;
}

export interface ProcessMakerTask {
  tas_uid: string;
  pro_uid: string;
  tas_type: string;
  tas_duration: number;
  tas_delay_type: string;
  tas_temporizer: number;
  tas_type_day: string;
  tas_timeunit: string;
  tas_alert: string;
  tas_priority_variable: string;
  tas_assign_type: string;
  tas_assign_variable: string;
  tas_group_variable: string;
  tas_mi_instance_variable: string;
  tas_mi_complete_variable: string;
  tas_assign_location: string;
  tas_assign_location_adhoc: string;
  tas_transfer_fly: string;
  tas_last_assigned: string;
  tas_user: string;
  tas_can_upload: string;
  tas_view_upload: string;
  tas_view_additional_documentation: string;
  tas_start: string;
  tas_to_last_user: string;
  tas_send_last_email: string;
  tas_derivation: string;
  tas_posx: number;
  tas_posy: number;
  tas_width: number;
  tas_height: number;
  tas_color: string;
  tas_evn_uid: string;
  tas_boundary: string;
  tas_routing_screen_tpl: string;
  tas_selfservice_timeout: number;
  tas_selfservice_time: number;
  tas_selfservice_time_unit: string;
  tas_selfservice_trigger_uid: string;
  tas_selfservice_execution: string;
  tas_not_email_from_format: number;
  tas_offline: string;
  tas_email_server_uid: string;
  tas_auto_root: string;
  tas_receive_server_uid: string;
  tas_receive_last_email: string;
  tas_receive_email_from_format: number;
  tas_receive_message_type: string;
  tas_receive_subject_message: string;
  tas_receive_message: string;
  tas_email_server_uid_execute_task: string;
  tas_parent: string;
  tas_block_routing: string;
  tas_factory_method: string;
  tas_interfaces_folder: string;
  tas_pocket_book: string;
  tas_generate_historical_dynaform: string;
  tas_title: string;
  tas_description: string;
  tas_def_title: string;
  tas_def_subject_message: string;
  tas_def_proc_code: string;
  tas_def_message: string;
  tas_def_description: string;
}

export interface StartCaseRequest {
  processUid: string;
  taskUid: string;
  variables?: { [key: string]: any };
}

@Injectable({
  providedIn: 'root'
})
export class ProcessmakerService {
  private readonly http = inject(HttpClient);
  
  private get baseUrl(): string {
    return environment.processMakerUrl;
  }
  
  private get workspace(): string {
    return environment.workspace;
  }
  
  private buildApiUrl(endpoint: string): string {
    return `${this.baseUrl}/api/1.0/${this.workspace}${endpoint}`;
  }
  
  private getHttpHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }
  
  /**
   * Obtiene casos pendientes (TO DO)
   */
  getCasesTodo(): Observable<ProcessMakerCase[]> {
    const url = this.buildApiUrl('/cases/todo');
    return this.http.get<any>(url, { headers: this.getHttpHeaders() }).pipe(
      map(response => response.data || response),
      catchError(this.handleError)
    );
  }
  
  /**
   * Obtiene casos enviados/completados
   */
  getCasesSent(): Observable<ProcessMakerCase[]> {
    const url = this.buildApiUrl('/cases/sent');
    return this.http.get<any>(url, { headers: this.getHttpHeaders() }).pipe(
      map(response => response.data || response),
      catchError(this.handleError)
    );
  }
  
  /**
   * Obtiene todos los casos
   */
  getCases(): Observable<ProcessMakerCase[]> {
    const url = this.buildApiUrl('/cases');
    return this.http.get<any>(url, { headers: this.getHttpHeaders() }).pipe(
      map(response => response.data || response),
      catchError(this.handleError)
    );
  }
  
  /**
   * Obtiene casos por proceso específico
   */
  getCasesByProcess(processUid: string): Observable<ProcessMakerCase[]> {
    const url = this.buildApiUrl('/cases/advanced-search/paged');
    const params = new HttpParams()
      .set('pro_uid', processUid)
      .set('start', '0')
      .set('limit', '200');
    
    return this.http.get<any>(url, { 
      headers: this.getHttpHeaders(),
      params: params 
    }).pipe(
      map(response => response.data || response),
      catchError(this.handleError)
    );
  }
  
  /**
   * Obtiene información de un caso específico
   */
  getCase(caseUid: string): Observable<ProcessMakerCase> {
    const url = this.buildApiUrl(`/cases/${caseUid}`);
    return this.http.get<ProcessMakerCase>(url, { headers: this.getHttpHeaders() }).pipe(
      catchError(this.handleError)
    );
  }
  
  /**
   * Obtiene todos los procesos disponibles
   */
  getProcesses(): Observable<ProcessMakerProcess[]> {
    const url = this.buildApiUrl('/processes');
    return this.http.get<any>(url, { headers: this.getHttpHeaders() }).pipe(
      map(response => response.data || response),
      catchError(this.handleError)
    );
  }
  
  /**
   * Obtiene información de un proceso específico
   */
  getProcess(processUid: string): Observable<ProcessMakerProcess> {
    const url = this.buildApiUrl(`/processes/${processUid}`);
    return this.http.get<ProcessMakerProcess>(url, { headers: this.getHttpHeaders() }).pipe(
      catchError(this.handleError)
    );
  }
  
  /**
   * Obtiene tareas de un proceso
   */
  getProcessTasks(processUid: string): Observable<ProcessMakerTask[]> {
    const url = this.buildApiUrl(`/processes/${processUid}/tasks`);
    return this.http.get<any>(url, { headers: this.getHttpHeaders() }).pipe(
      map(response => response.data || response),
      catchError(this.handleError)
    );
  }
  
  /**
   * Inicia un nuevo caso
   */
  startCase(request: StartCaseRequest): Observable<any> {
    const url = this.buildApiUrl(`/processes/${request.processUid}/cases`);
    const body = {
      variables: request.variables || {}
    };
    
    return this.http.post<any>(url, body, { headers: this.getHttpHeaders() }).pipe(
      catchError(this.handleError)
    );
  }
  
  /**
   * Rutea un caso a la siguiente tarea
   */
  routeCase(caseUid: string, delIndex: string): Observable<any> {
    const url = this.buildApiUrl(`/cases/${caseUid}/route-case`);
    const body = {
      del_index: delIndex
    };
    
    return this.http.put<any>(url, body, { headers: this.getHttpHeaders() }).pipe(
      catchError(this.handleError)
    );
  }
  
  /**
   * Actualiza variables de un caso
   */
  updateCaseVariables(caseUid: string, variables: { [key: string]: any }): Observable<any> {
    const url = this.buildApiUrl(`/cases/${caseUid}/variables`);
    
    return this.http.put<any>(url, variables, { headers: this.getHttpHeaders() }).pipe(
      catchError(this.handleError)
    );
  }
  
  /**
   * Obtiene variables de un caso
   */
  getCaseVariables(caseUid: string): Observable<{ [key: string]: any }> {
    const url = this.buildApiUrl(`/cases/${caseUid}/variables`);
    
    return this.http.get<{ [key: string]: any }>(url, { headers: this.getHttpHeaders() }).pipe(
      catchError(this.handleError)
    );
  }
  
  /**
   * Obtiene usuarios del sistema
   */
  getUsers(): Observable<any[]> {
    const url = this.buildApiUrl('/users');
    return this.http.get<any>(url, { headers: this.getHttpHeaders() }).pipe(
      map(response => response.data || response),
      catchError(this.handleError)
    );
  }
  
  /**
   * Obtiene información de un usuario específico
   */
  getUser(userUid: string): Observable<any> {
    const url = this.buildApiUrl(`/users/${userUid}`);
    return this.http.get<any>(url, { headers: this.getHttpHeaders() }).pipe(
      catchError(this.handleError)
    );
  }
  
  /**
   * Obtiene departamentos
   */
  getDepartments(): Observable<any[]> {
    const url = this.buildApiUrl('/departments');
    return this.http.get<any>(url, { headers: this.getHttpHeaders() }).pipe(
      map(response => response.data || response),
      catchError(this.handleError)
    );
  }
  
  /**
   * Obtiene grupos
   */
  getGroups(): Observable<any[]> {
    const url = this.buildApiUrl('/groups');
    return this.http.get<any>(url, { headers: this.getHttpHeaders() }).pipe(
      map(response => response.data || response),
      catchError(this.handleError)
    );
  }
  
  /**
   * Manejo de errores
   */
  private handleError(error: any): Observable<never> {
    console.error('Error en ProcessMaker Service:', error);
    let errorMessage = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Código de error: ${error.status}\nMensaje: ${error.message}`;
      if (error.error && error.error.message) {
        errorMessage += `\nDetalle: ${error.error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
