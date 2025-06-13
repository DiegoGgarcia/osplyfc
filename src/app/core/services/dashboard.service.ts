import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, forkJoin } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ProcessmakerService } from './processmaker.service';

// Interfaces
export interface DashboardStats {
  totalCases: number;
  pendingCases: number;
  completedToday: number;
  overdueCases: number;
}

export interface ExpedienteStats {
  total: number;
  pendientes: number;
  procesados: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  date: Date;
  status: string;
}

export interface ExpedienteType {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  processUid: string;
  enabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly processmakerService = inject(ProcessmakerService);
  
  private readonly n8nBaseUrl = environment.n8nApiUrl;
  
  private statsSubject = new BehaviorSubject<DashboardStats>({
    totalCases: 0,
    pendingCases: 0,
    completedToday: 0,
    overdueCases: 0
  });
  
  public stats$ = this.statsSubject.asObservable();
  
  /**
   * Obtiene estadísticas del dashboard
   */
  getDashboardStats(): Observable<DashboardStats> {
    // Primero intentar desde N8N (si está disponible)
    return this.getStatsFromN8N().pipe(
      catchError(() => {
        // Si N8N falla, usar ProcessMaker directamente
        return this.getStatsFromProcessMaker();
      }),
      tap(stats => this.statsSubject.next(stats))
    );
  }
  
  /**
   * Obtiene estadísticas desde N8N
   */
  private getStatsFromN8N(): Observable<DashboardStats> {
    return this.http.get<any>(`${this.n8nBaseUrl}/osplyfc/stats`).pipe(
      map(response => {
        const stats = response.data || response;
        return {
          totalCases: stats.total || 0,
          pendingCases: stats.todo || 0,
          completedToday: stats.completed || 0,
          overdueCases: stats.overdue || 0
        };
      })
    );
  }
  
  /**
   * Obtiene estadísticas directamente desde ProcessMaker
   */
  private getStatsFromProcessMaker(): Observable<DashboardStats> {
    return forkJoin({
      todos: this.processmakerService.getCasesTodo(),
      sent: this.processmakerService.getCasesSent()
    }).pipe(
      map(({ todos, sent }) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const completedToday = sent.filter(case_ => {
          if (case_.app_finish_date) {
            const finishDate = new Date(case_.app_finish_date);
            finishDate.setHours(0, 0, 0, 0);
            return finishDate.getTime() === today.getTime();
          }
          return false;
        }).length;
        
        const overdueCases = todos.filter(case_ => {
          if (case_.del_task_due_date) {
            const dueDate = new Date(case_.del_task_due_date);
            return dueDate < new Date();
          }
          return false;
        }).length;
        
        return {
          totalCases: todos.length + sent.length,
          pendingCases: todos.length,
          completedToday: completedToday,
          overdueCases: overdueCases
        };
      })
    );
  }
  
  /**
   * Obtiene actividad reciente
   */
  getRecentActivity(): Observable<RecentActivity[]> {
    return this.processmakerService.getCasesTodo().pipe(
      map(cases => cases.slice(0, 10).map(pmCase => ({
        id: pmCase.app_uid,
        type: 'Caso asignado',
        description: `${pmCase.app_pro_title} - ${pmCase.app_tas_title}`,
        date: new Date(pmCase.del_delegate_date),
        status: pmCase.app_status
      })))
    );
  }
  
  /**
   * Obtiene estadísticas de un expediente específico
   */
  getExpedienteStats(tipo: string): Observable<ExpedienteStats> {
    const processUid = this.getProcessUidByType(tipo);
    if (!processUid) {
      return of({ total: 0, pendientes: 0, procesados: 0 });
    }
    
    return this.processmakerService.getCasesByProcess(processUid).pipe(
      map(cases => ({
        total: cases.length,
        pendientes: cases.filter(c => c.app_status === 'TO_DO').length,
        procesados: cases.filter(c => c.app_status === 'COMPLETED').length
      }))
    );
  }
  
  /**
   * Inicia un nuevo caso de un tipo específico
   */
  startExpediente(tipo: string, data?: any): Observable<any> {
    const processUid = this.getProcessUidByType(tipo);
    if (!processUid) {
      throw new Error(`Proceso no encontrado para tipo: ${tipo}`);
    }
    
    return this.processmakerService.getProcessTasks(processUid).pipe(
      switchMap(tasks => {
        const firstTask = tasks.find(task => task.tas_type === 'NORMAL') || tasks[0];
        if (!firstTask) {
          throw new Error('No se encontró tarea inicial');
        }
        
        return this.processmakerService.startCase({
          processUid: processUid,
          taskUid: firstTask.tas_uid,
          variables: data || {}
        });
      })
    );
  }
  
  /**
   * Obtiene los tipos de expedientes disponibles
   */
  getExpedientesTypes(): Observable<ExpedienteType[]> {
    // Por ahora devolvemos los tipos estáticos
    return of(this.getStaticExpedientesTypes());
  }
  
  /**
   * Filtra expedientes por término de búsqueda
   */
  filterExpedientes(searchTerm: string): Observable<ExpedienteType[]> {
    return this.getExpedientesTypes().pipe(
      map(expedientes => 
        expedientes.filter(exp => 
          exp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exp.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
  }
  
  /**
   * Obtiene el UID del proceso según el tipo de expediente
   */
  private getProcessUidByType(tipo: string): string | null {
    const expediente = this.getStaticExpedientesTypes().find(
      exp => exp.id === tipo
    );
    return expediente?.processUid || null;
  }
  
  /**
   * Obtiene los tipos de expedientes estáticos
   */
  private getStaticExpedientesTypes(): ExpedienteType[] {
    return [
      {
        id: 'autorizacion',
        name: 'Autorización',
        description: 'Pedido de medicamentos, materiales de osteosíntesis, sondas, alimentación enteral',
        icon: 'medical_services',
        color: 'green',
        processUid: '889460391684499d86eaac1030656952', // UID real del proceso de autorización
        enabled: true
      },
      {
        id: 'correspondencia',
        name: 'Correspondencia Varios',
        description: 'Pedidos de recetarios, órdenes médicas, insumos para enfermería',
        icon: 'mail',
        color: 'blue',
        processUid: '', // Pendiente de implementar
        enabled: false
      },
      {
        id: 'legajo',
        name: 'Legajo',
        description: 'Documentación para empleados: certificados médicos, embarazo, ausencias',
        icon: 'folder_shared',
        color: 'amber',
        processUid: '', // Pendiente de implementar
        enabled: false
      },
      {
        id: 'factura_medica',
        name: 'Factura Médica',
        description: 'Clínicas, sanatorios, hospitales públicos, prestaciones no SUR',
        icon: 'receipt',
        color: 'orange',
        processUid: '', // Pendiente de implementar
        enabled: false
      },
      {
        id: 'factura_proveedores',
        name: 'Factura Proveedores',
        description: 'Servicios e insumos generales: limpieza, librería, electrónica',
        icon: 'business',
        color: 'red',
        processUid: '', // Pendiente de implementar
        enabled: false
      },
      {
        id: 'reintegros',
        name: 'Reintegros',
        description: 'Prestaciones médicas, odontológicas, medicamentos fuera de red',
        icon: 'account_balance',
        color: 'purple',
        processUid: '', // Pendiente de implementar
        enabled: false
      },
      {
        id: 'sur_medicacion',
        name: 'SUR Medicación',
        description: 'Medicamentos gestionados bajo el Sistema Único de Reintegros',
        icon: 'medication',
        color: 'indigo',
        processUid: '', // Pendiente de implementar
        enabled: false
      },
      {
        id: 'carta_documento',
        name: 'Carta Documento',
        description: 'Documentación legal urgente: avisos judiciales, cartas documento',
        icon: 'gavel',
        color: 'red',
        processUid: '', // Pendiente de implementar
        enabled: false
      },
      {
        id: 'nota',
        name: 'Nota',
        description: 'Coberturas, afiliaciones, oficios judiciales, cédulas, amparos',
        icon: 'note',
        color: 'brown',
        processUid: '', // Pendiente de implementar
        enabled: false
      },
      {
        id: 'presupuestos',
        name: 'Presupuestos',
        description: 'Prestaciones médicas no convenidas previamente',
        icon: 'calculate',
        color: 'deep_orange',
        processUid: '', // Pendiente de implementar
        enabled: false
      },
      {
        id: 'hospitales_publicos',
        name: 'Hospitales Públicos',
        description: 'Facturación de prestaciones realizadas en hospitales públicos',
        icon: 'local_hospital',
        color: 'teal',
        processUid: '', // Pendiente de implementar
        enabled: false
      },
      {
        id: 'despachos',
        name: 'Despachos',
        description: 'Envío de órdenes médicas, documentación general a delegaciones',
        icon: 'local_shipping',
        color: 'cyan',
        processUid: '', // Pendiente de implementar
        enabled: false
      },
      {
        id: 'carpeta_discapacidad',
        name: 'Carpeta de Discapacidad',
        description: 'Facturas descargadas y renombradas para revisión de Junta de Discapacidad',
        icon: 'accessibility',
        color: 'deep_purple',
        processUid: '', // Pendiente de implementar
        enabled: false
      },
      {
        id: 'correo_argentino',
        name: 'Solicitudes de Correo Argentino',
        description: 'Complementa el flujo de Cartas Documento y otros envíos físicos',
        icon: 'local_post_office',
        color: 'blue_grey',
        processUid: '', // Pendiente de implementar
        enabled: false
      }
    ];
  }
}
