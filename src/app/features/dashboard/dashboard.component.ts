import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Observable, Subscription, timer, combineLatest } from 'rxjs';
import { map, takeUntil, startWith, catchError, switchMap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';

import { DashboardService, DashboardStats, ExpedienteConfig, ActivityItem } from '../../core/services/dashboard.service';
import { ProcessMakerService, ProcessMakerUser } from '../../core/services/processmaker.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatGridListModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Observables - inicializados en el constructor
  dashboardStats$!: Observable<DashboardStats>;
  availableExpedientes$!: Observable<ExpedienteConfig[]>;
  recentActivity$!: Observable<ActivityItem[]>;
  currentUser$!: Observable<ProcessMakerUser | null>;

  // Estado del componente
  isLoading = true;
  private refreshInterval = 5 * 60 * 1000; // 5 minutos

  constructor(
    private dashboardService: DashboardService,
    private processMakerService: ProcessMakerService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.initializeObservables();
    this.availableExpedientes$ = this.processMakerService.getProcesses().pipe(
      map(processes =>
        processes.map(p => ({
          id: p.pro_uid,
          title: p.pro_title,
          description: p.pro_description,
          icon: 'folder', // o algo dinámico
          color: '#3f51b5' // o algo configurable
        }))
      ),
      catchError(err => {
        console.error('Error al obtener expedientes:', err);
        return of([]);
      })
    );
  }

  ngOnInit(): void {
    this.initializeData();
    this.setupAutoRefresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeObservables(): void {
    // Obtener usuario actual
    this.currentUser$ = this.processMakerService.user$.pipe(
      startWith(null),
      catchError(error => {
        console.error('Error obteniendo usuario actual:', error);
        return of(null);
      })
    );

    // Estadísticas del dashboard con auto-refresh
    this.dashboardStats$ = timer(0, this.refreshInterval).pipe(
      takeUntil(this.destroy$),
      switchMap(() => this.dashboardService.getDashboardStats()),
      catchError(error => {
        console.error('Error obteniendo estadísticas:', error);
        this.showError('Error al cargar estadísticas');
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

    // Actividad reciente
    this.recentActivity$ = this.dashboardStats$.pipe(
      map(stats => stats.recentActivity || [])
    );
  }

  private async initializeData(): Promise<void> {
    try {
      this.isLoading = true;

      // Verificar sesión y obtener usuario actual
      const isValidSession = await this.processMakerService.validateSession();
      if (!isValidSession) {
        this.router.navigate(['/login']);
        return;
      }

      // Cargar usuario actual
      this.processMakerService.getCurrentUser().subscribe({
        next: user => {
          console.log('Usuario cargado:', user);
        },
        error: error => {
          console.error('Error cargando usuario:', error);
          this.showError('Error al cargar información del usuario');
        }
      });

    } catch (error) {
      console.error('Error inicializando dashboard:', error);
      this.showError('Error al inicializar el dashboard');
    } finally {
      this.isLoading = false;
    }
  }

  private setupAutoRefresh(): void {
    // Auto-refresh cada 5 minutos
    timer(this.refreshInterval, this.refreshInterval)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.processMakerService.invalidateCasesCache();
      });
  }



  /**
   * Navegación
   */
  navigateToAllCases(): void {
    const pmUrl = this.dashboardService.getProcessMakerUrl('/workflow/cases/main');
    window.open(pmUrl, '_blank');
  }

  navigateToMyCases(): void {
    const pmUrl = this.dashboardService.getProcessMakerUrl('/workflow/cases/todo');
    window.open(pmUrl, '_blank');
  }

  navigateToCompletedCases(): void {
    const pmUrl = this.dashboardService.getProcessMakerUrl('/workflow/cases/sent');
    window.open(pmUrl, '_blank');
  }

  navigateToOverdueCases(): void {
    // Implementar vista de casos vencidos
    this.showInfo('Vista de casos vencidos en desarrollo');
  }

  navigateToReports(): void {
    // Implementar módulo de reportes
    this.showInfo('Módulo de reportes en desarrollo');
  }

  navigateToCase(caseId?: string): void {
    if (!caseId) return;

    const pmUrl = this.dashboardService.getProcessMakerUrl(
      `/workflow/cases/caseFrame?caseId=${caseId}&delIndex=1`
    );
    window.open(pmUrl, '_blank');
  }

  openProcessMaker(): void {
    const pmUrl = this.dashboardService.getProcessMakerUrl('/workflow/main');
    window.open(pmUrl, '_blank');
  }

  /**
   * Acciones del usuario
   */
  refreshData(): void {
    this.processMakerService.invalidateCasesCache();
    this.showSuccess('Datos actualizados');
  }

  logout(): void {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
      this.processMakerService.logout();
      this.router.navigate(['/login']);
    }
  }

  /**
   * Utilidades de UI
   */
  getCategoryColor(category: string): string {
    const colors = {
      medico: '#27ae60',
      administrativo: '#3498db',
      legal: '#c0392b',
      facturacion: '#e67e22'
    };
    return colors[category as keyof typeof colors] || '#95a5a6';
  }

  getCategoryLabel(category: string): string {
    const labels = {
      medico: 'Médico',
      administrativo: 'Administrativo',
      legal: 'Legal',
      facturacion: 'Facturación'
    };
    return labels[category as keyof typeof labels] || 'General';
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`;
    if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    return 'hace un momento';
  }

  trackActivity(index: number, activity: ActivityItem): string {
    return activity.id;
  }

  /**
   * Mensajes al usuario
   */
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private showInfo(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }
}
