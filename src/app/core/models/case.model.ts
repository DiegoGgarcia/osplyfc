// src/app/core/models/case.model.ts
export interface Case {
  app_uid: string;
  app_number: number;
  app_title: string;
  app_description: string;
  app_status: 'DRAFT' | 'TO_DO' | 'COMPLETED' | 'CANCELLED';
  app_create_date: string;
  app_update_date: string;
  app_finish_date?: string;
  pro_uid: string;
  pro_title: string;
  tas_uid: string;
  tas_title: string;
  usr_uid: string;
  usr_username: string;
  del_index: number;
  del_thread_status: 'OPEN' | 'CLOSED';
}

export interface CaseStats {
  total: number;
  pending: number;
  completed: number;
  overdue: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
}

export interface ProcessStats {
  pro_uid: string;
  pro_title: string;
  total_cases: number;
  pending_cases: number;
  completed_cases: number;
  avg_duration_hours: number;
}

export interface ExpedienteType {
  id: number;
  code: string;
  name: string;
  description: string;
  sector_destino: string;
  icon: string;
  color: string;
  status: 'ACTIVE' | 'INACTIVE';
  documentacion_requerida: string[];
  pro_uid?: string; // ProcessMaker process UID
}

export interface ExpedienteStats {
  type: ExpedienteType;
  count_today: number;
  count_week: number;
  count_month: number;
  pending: number;
  completed: number;
  avg_resolution_hours: number;
}

export interface DashboardStats {
  user_cases: CaseStats;
  expedientes: ExpedienteStats[];
  recent_activity: RecentActivity[];
  alerts: Alert[];
}

export interface RecentActivity {
  id: string;
  type: 'CASE_STARTED' | 'CASE_COMPLETED' | 'CASE_ASSIGNED' | 'DOCUMENT_UPLOADED';
  description: string;
  user: string;
  timestamp: string;
  case_number?: string;
  expediente_type?: string;
}

export interface Alert {
  id: string;
  type: 'WARNING' | 'ERROR' | 'INFO';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action_url?: string;
}
