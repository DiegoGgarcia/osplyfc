import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { AuthService, ProcessMakerUser } from '../../core/services/auth.service';
import { DashboardService, DashboardStats, ExpedienteType, RecentActivity } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatGridListModule,
    MatDividerModule,
    MatListModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule
  ],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <mat-toolbar color="primary" class="shadow-md">
        <span class="flex-1">
          <mat-icon class="mr-2">local_hospital</mat-icon>
          OsplyfC Dashboard
        </span>
        
        <div class="flex items-center space-x-4">
          <span class="text-sm">{{ currentUser()?.USR_FIRSTNAME }} {{ currentUser()?.USR_LASTNAME }}</span>
          
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>
          
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Cerrar Sesión</span>
            </button>
          </mat-menu>
        </div>
      </mat-toolbar>

      <!-- Main Content -->
      <div class="container mx-auto p-6">
        
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <mat-card class="stat-card">
            <mat-card-content class="flex items-center p-6">
              <div class="flex-1">
                <p class="text-sm text-gray-600 mb-1">Total de Casos</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats()?.totalCases || 0 }}</p>
              </div>
              <mat-icon class="text-4xl text-blue-500">folder</mat-icon>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content class="flex items-center p-6">
              <div class="flex-1">
                <p class="text-sm text-gray-600 mb-1">Casos Pendientes</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats()?.pendingCases || 0 }}</p>
              </div>
              <mat-icon class="text-4xl text-orange-500">pending_actions</mat-icon>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content class="flex items-center p-6">
              <div class="flex-1">
                <p class="text-sm text-gray-600 mb-1">Completados Hoy</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats()?.completedToday || 0 }}</p>
              </div>
              <mat-icon class="text-4xl text-green-500">check_circle</mat-icon>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content class="flex items-center p-6">
              <div class="flex-1">
                <p class="text-sm text-gray-600 mb-1">Casos Vencidos</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats()?.overdueCases || 0 }}</p>
              </div>
              <mat-icon class="text-4xl text-red-500">warning</mat-icon>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Expedientes Grid -->
          <div class="lg:col-span-2">
            <mat-card>
              <mat-card-header>
                <mat-card-title class="flex items-center justify-between w-full">
                  <span>Tipos de Expedientes</span>
                  <button mat-icon-button (click)="refreshExpedientes()" [disabled]="loading()">
                    <mat-icon>refresh</mat-icon>
                  </button>
                </mat-card-title>
              </mat-card-header>
              
              <mat-card-content>
                <!-- Search -->
                <mat-form-field class="w-full mb-4" appearance="outline">
                  <mat-label>Buscar expediente</mat-label>
                  <input matInput [(ngModel)]="searchTerm" (input)="onSearch()" placeholder="Escriba para buscar...">
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>

                <!-- Loading -->
                <div *ngIf="loading()" class="flex justify-center p-8">
                  <mat-spinner diameter="40"></mat-spinner>
                </div>

                <!-- Expedientes Grid -->
                <div *ngIf="!loading()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div 
                    *ngFor="let expediente of filteredExpedientes(); trackBy: trackByExpediente"
                    class="expediente-card"
                    [class.disabled]="!expediente.enabled"
                    (click)="startExpediente(expediente)"
                  >
                    <mat-card class="h-full cursor-pointer hover:shadow-lg transition-shadow">
                      <mat-card-content class="p-4">
                        <div class="flex items-start space-x-3">
                          <mat-icon 
                            [class]="'text-3xl text-' + expediente.color + '-500'"
                            [attr.aria-label]="expediente.name"
                          >
                            {{ expediente.icon }}
                          </mat-icon>
                          
                          <div class="flex-1 min-w-0">
                            <h3 class="font-semibold text-gray-900 text-sm mb-1 truncate">
                              {{ expediente.name }}
                            </h3>
                            <p class="text-xs text-gray-600 line-clamp-2">
                              {{ expediente.description }}
                            </p>
                            
                            <div *ngIf="!expediente.enabled" class="mt-2">
                              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                                Próximamente
                              </span>
                            </div>
                          </div>
                        </div>
                      </mat-card-content>
                    </mat-card>
                  </div>
                </div>

                <!-- No results -->
                <div *ngIf="!loading() && filteredExpedientes().length === 0" class="text-center p-8">
                  <mat-icon class="text-6xl text-gray-400 mb-4">search_off</mat-icon>
                  <p class="text-gray-600">No se encontraron expedientes que coincidan con la búsqueda.</p>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            
            <!-- Recent Activity -->
            <mat-card>
              <mat-card-header>
                <mat-card-title>Actividad Reciente</mat-card-title>
              </mat-card-header>
              
              <mat-card-content>
                <div *ngIf="recentActivity().length === 0" class="text-center p-4">
                  <mat-icon class="text-4xl text-gray-400 mb-2">inbox</mat-icon>
                  <p class="text-gray-600 text-sm">No hay actividad reciente</p>
                </div>
                
                <mat-list *ngIf="recentActivity().length > 0">
                  <mat-list-item *ngFor="let activity of recentActivity().slice(0, 5)">
                    <div class="w-full">
                      <div class="flex justify-between items-start">
                        <p class="font-medium text-sm text-gray-900 truncate">{{ activity.description }}</p>
                      </div>
                      <p class="text-xs text-gray-600 mt-1">
                        {{ activity.type }} • {{ activity.date | date:'short' }}
                      </p>
                    </div>
                  </mat-list-item>
                </mat-list>
              </mat-card-content>
            </mat-card>

            <!-- Quick Actions -->
            <mat-card>
              <mat-card-header>
                <mat-card-title>Acciones Rápidas</mat-card-title>
              </mat-card-header>
              
              <mat-card-content class="space-y-2">
                <button 
                  mat-raised-button 
                  color="primary" 
                  class="w-full"
                  (click)="openProcessMaker()"
                >
                  <mat-icon>open_in_new</mat-icon>
                  Abrir ProcessMaker
                </button>
                
                <button 
                  mat-stroked-button 
                  class="w-full"
                  (click)="refreshData()"
                  [disabled]="loading()"
                >
                  <mat-icon>refresh</mat-icon>
                  Actualizar Datos
                </button>
              </mat-card-content>
            </mat-card>

          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      transition: transform 0.2s ease-in-out;
    }
    
    .stat-card:hover {
      transform: translateY(-2px);
    }
    
    .expediente-card:not(.disabled):hover {
      transform: translateY(-2px);
    }
    
    .expediente-card.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .expediente-card.disabled mat-card {
      cursor: not-allowed;
    }
    
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  // Signals
  currentUser = signal<ProcessMakerUser | null>(null);
  stats = signal<DashboardStats | null>(null);
  expedientes = signal<ExpedienteType[]>([]);
  filteredExpedientes = signal<ExpedienteType[]>([]);
  recentActivity = signal<RecentActivity[]>([]);
  loading = signal<boolean>(false);

  // Properties
  searchTerm = '';

  ngOnInit(): void {
    this.loadUserData();
    this.loadDashboardData();
    this.loadExpedientes();
    this.loadRecentActivity();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserData(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser.set(user);
      });
  }

  private loadDashboardData(): void {
    this.loading.set(true);
    
    this.dashboardService.getDashboardStats()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: stats => this.stats.set(stats),
        error: error => {
          console.error('Error loading dashboard stats:', error);
          // Set default stats on error
          this.stats.set({
            totalCases: 0,
            pendingCases: 0,
            completedToday: 0,
            overdueCases: 0
          });
        }
      });
  }

  private loadExpedientes(): void {
    this.dashboardService.getExpedientesTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: expedientes => {
          this.expedientes.set(expedientes);
          this.filteredExpedientes.set(expedientes);
        },
        error: error => {
          console.error('Error loading expedientes:', error);
          this.expedientes.set([]);
          this.filteredExpedientes.set([]);
        }
      });
  }

  private loadRecentActivity(): void {
    this.dashboardService.getRecentActivity()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: activity => this.recentActivity.set(activity),
        error: error => {
          console.error('Error loading recent activity:', error);
          this.recentActivity.set([]);
        }
      });
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    
    if (!term) {
      this.filteredExpedientes.set(this.expedientes());
      return;
    }

    const filtered = this.expedientes().filter(exp =>
      exp.name.toLowerCase().includes(term) ||
      exp.description.toLowerCase().includes(term)
    );
    
    this.filteredExpedientes.set(filtered);
  }

  startExpediente(expediente: ExpedienteType): void {
    if (!expediente.enabled) {
      return;
    }

    console.log('Starting expediente:', expediente);
    
    // Por ahora solo redirigir a ProcessMaker
    // En el futuro aquí se podría abrir un modal o iniciar el proceso
    this.openProcessMaker();
  }

  refreshData(): void {
    this.loadDashboardData();
    this.loadRecentActivity();
  }

  refreshExpedientes(): void {
    this.loadExpedientes();
  }

  openProcessMaker(): void {
    const url = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/sysOsplyfC`;
    window.open(url, '_blank');
  }

  logout(): void {
    this.authService.logout()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/auth/login']);
        },
        error: error => {
          console.error('Error during logout:', error);
          // Even if logout fails, redirect to login
          this.router.navigate(['/auth/login']);
        }
      });
  }

  trackByExpediente(index: number, expediente: ExpedienteType): string {
    return expediente.id;
  }
}
