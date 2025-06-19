import { Injectable } from '@angular/core';
import { Observable, combineLatest, map, catchError, of } from 'rxjs';
import { ProcessMakerService, CaseStats, ProcessMakerCase, ProcessMakerProcess } from './processmaker.service';

export interface DashboardStats {
  totalCases: number;
  myCases: number;
  completedToday: number;
  overdueCases: number;
  recentActivity: ActivityItem[];
  expedienteStats: Record<string, number>;
}

export interface ActivityItem {
  id: string;
  type: 'case_started' | 'case_completed' | 'case_assigned' | 'case_overdue';
  title: string;
  description: string;
  timestamp: Date;
  caseId?: string;
  processName?: string;
  userName?: string;
  icon: string;
  color: string;
}

export interface ExpedienteConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  
  constructor(private processMakerService: ProcessMakerService) {}

  /**
   * Obtener estadísticas completas del dashboard
   */
getDashboardStats(): Observable<DashboardStats> {
  return combineLatest([
    this.processMakerService.getCaseStats(),
    this.processMakerService.getAllCases(),
    this.processMakerService.getProcesses()
  ]).pipe(
map(([caseStats, allCases, _processes]) => {
  const recentActivity = this.generateRecentActivity(allCases);

  return {
    totalCases: caseStats.total,
    myCases: caseStats.todo,
    completedToday: caseStats.completed_today,
    overdueCases: caseStats.overdue,
    recentActivity,
    expedienteStats: caseStats.by_process
  };
}),
    catchError(error => {
      console.error('Error obteniendo estadísticas del dashboard:', error);
      return of({
        totalCases: 0,
        myCases: 0,
        completedToday: 0,
        overdueCases: 0,
        recentActivity: [],
        expedienteStats: {}
      });
    })
  );
}


  /**
   * Obtener casos recientes del usuario
   */
  getRecentCases(limit: number = 10): Observable<ProcessMakerCase[]> {
    return this.processMakerService.getAllCases().pipe(
      map(cases => {
        return cases
          .sort((a, b) => new Date(b.app_update_date).getTime() - new Date(a.app_update_date).getTime())
          .slice(0, limit);
      }),
      catchError(error => {
        console.error('Error obteniendo casos recientes:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtener estadísticas por categoría de expediente
   */
  getStatsByCategory(): Observable<Record<string, number>> {
    return this.processMakerService.getAllCases().pipe(
      map(cases => {
        const statsByCategory: Record<string, number> = {
          medico: 0,
          administrativo: 0,
          legal: 0,
          facturacion: 0
        };

        cases.forEach(caso => {
          // Determinar categoría basada en el título del proceso
          const processTitle = caso.app_pro_title.toLowerCase();
          
          if (this.isMedicoProcess(processTitle)) {
            statsByCategory['medico']++;
          } else if (this.isAdministrativoProcess(processTitle)) {
            statsByCategory['administrativo']++;
          } else if (this.isLegalProcess(processTitle)) {
            statsByCategory['legal']++;
          } else if (this.isFacturacionProcess(processTitle)) {
            statsByCategory['facturacion']++;
          }
        });

        return statsByCategory;
      }),
      catchError(error => {
        console.error('Error obteniendo estadísticas por categoría:', error);
        return of({
          medico: 0,
          administrativo: 0,
          legal: 0,
          facturacion: 0
        });
      })
    );
  }

  /**
   * Generar actividad reciente basada en los casos
   */
  private generateRecentActivity(cases: ProcessMakerCase[]): ActivityItem[] {
    const activities: ActivityItem[] = [];
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Casos iniciados recientemente
    const recentCases = cases
      .filter(c => new Date(c.app_create_date) > last24Hours)
      .sort((a, b) => new Date(b.app_create_date).getTime() - new Date(a.app_create_date).getTime())
      .slice(0, 5);

    recentCases.forEach(caso => {
      activities.push({
        id: `started_${caso.app_uid}`,
        type: 'case_started',
        title: 'Nuevo expediente iniciado',
        description: `${caso.app_pro_title} - ${caso.app_title}`,
        timestamp: new Date(caso.app_create_date),
        caseId: caso.app_uid,
        processName: caso.app_pro_title,
        userName: `${caso.usrcr_usr_firstname} ${caso.usrcr_usr_lastname}`,
        icon: 'fas fa-play-circle',
        color: '#27ae60'
      });
    });

    // Casos completados recientemente
    const completedCases = cases
      .filter(c => c.app_finish_date && new Date(c.app_finish_date) > last24Hours)
      .sort((a, b) => new Date(b.app_finish_date!).getTime() - new Date(a.app_finish_date!).getTime())
      .slice(0, 3);

    completedCases.forEach(caso => {
      activities.push({
        id: `completed_${caso.app_uid}`,
        type: 'case_completed',
        title: 'Expediente completado',
        description: `${caso.app_pro_title} - ${caso.app_title}`,
        timestamp: new Date(caso.app_finish_date!),
        caseId: caso.app_uid,
        processName: caso.app_pro_title,
        userName: `${caso.usr_firstname} ${caso.usr_lastname}`,
        icon: 'fas fa-check-circle',
        color: '#8e44ad'
      });
    });

    // Casos vencidos
    const overdueCases = cases
      .filter(c => {
        const dueDate = new Date(c.del_task_due_date);
        return c.app_status === 'TO_DO' && dueDate < now;
      })
      .slice(0, 3);

    overdueCases.forEach(caso => {
      activities.push({
        id: `overdue_${caso.app_uid}`,
        type: 'case_overdue',
        title: 'Expediente vencido',
        description: `${caso.app_pro_title} - ${caso.app_title}`,
        timestamp: new Date(caso.del_task_due_date),
        caseId: caso.app_uid,
        processName: caso.app_pro_title,
        userName: `${caso.usr_firstname} ${caso.usr_lastname}`,
        icon: 'fas fa-exclamation-triangle',
        color: '#e74c3c'
      });
    });

    // Ordenar por timestamp descendente
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
  }




  /**
   * Métodos auxiliares para clasificar procesos por categoría
   */
  private isMedicoProcess(processTitle: string): boolean {
    return ['autorización', 'autorizacion', 'reintegro', 'sur', 'medicación', 
            'presupuesto', 'discapacidad'].some(keyword => processTitle.includes(keyword));
  }

  private isAdministrativoProcess(processTitle: string): boolean {
    return ['legajo', 'correspondencia', 'nota', 'despacho', 'correo'].some(keyword => 
            processTitle.includes(keyword));
  }

  private isLegalProcess(processTitle: string): boolean {
    return ['carta documento', 'legal', 'amparo', 'judicial'].some(keyword => 
            processTitle.includes(keyword));
  }

  private isFacturacionProcess(processTitle: string): boolean {
    return ['factura', 'hospital público', 'facturación'].some(keyword => 
            processTitle.includes(keyword));
  }


  /**
   * Obtener URL de redirección para ProcessMaker
   */
  getProcessMakerUrl(path: string = ''): string {
    const baseUrl = this.processMakerService.buildApiUrl('').replace('/api/1.0/OsplyfC', '');
    return `${baseUrl}${path}`;
  }

  /**
   * Obtener métricas de rendimiento
   */
  getPerformanceMetrics(): Observable<any> {
    return this.processMakerService.getAllCases().pipe(
      map(cases => {
        const now = new Date();
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const casesLast7Days = cases.filter(c => new Date(c.app_create_date) > last7Days);
        const casesLast30Days = cases.filter(c => new Date(c.app_create_date) > last30Days);

        // Calcular tiempo promedio de resolución
        const completedCases = cases.filter(c => c.app_finish_date);
        const avgResolutionTime = completedCases.length > 0 ? 
          completedCases.reduce((sum, c) => {
            const start = new Date(c.app_create_date);
            const end = new Date(c.app_finish_date!);
            return sum + (end.getTime() - start.getTime());
          }, 0) / completedCases.length / (1000 * 60 * 60) // en horas
          : 0;

        return {
          totalCases: cases.length,
          casesLast7Days: casesLast7Days.length,
          casesLast30Days: casesLast30Days.length,
          avgResolutionTimeHours: Math.round(avgResolutionTime * 100) / 100,
          completionRate: cases.length > 0 ? 
            (completedCases.length / cases.length) * 100 : 0,
          currentLoad: cases.filter(c => c.app_status === 'TO_DO').length
        };
      }),
      catchError(error => {
        console.error('Error obteniendo métricas de rendimiento:', error);
        return of({
          totalCases: 0,
          casesLast7Days: 0,
          casesLast30Days: 0,
          avgResolutionTimeHours: 0,
          completionRate: 0,
          currentLoad: 0
        });
      })
    );
  }
}
