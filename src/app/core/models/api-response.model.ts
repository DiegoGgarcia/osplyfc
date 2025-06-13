// src/app/core/models/api-response.model.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  details: string;
  field?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProcessMakerResponse<T> {
  status_code: number;
  message: string;
  data: T;
  total?: number;
}

// Respuestas específicas de ProcessMaker API
export interface PMLoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    usr_uid: string;
    usr_username: string;
    usr_firstname: string;
    usr_lastname: string;
    usr_email: string;
  };
}

export interface PMCasesResponse {
  data: {
    app_uid: string;
    app_number: number;
    app_title: string;
    app_status: string;
    app_create_date: string;
    pro_title: string;
    tas_title: string;
    usr_username: string;
  }[];
  total: number;
}

export interface PMProcessResponse {
  data: {
    pro_uid: string;
    pro_title: string;
    pro_description: string;
    pro_status: string;
    pro_create_date: string;
  }[];
}

export interface PMUserResponse {
  usr_uid: string;
  usr_username: string;
  usr_firstname: string;
  usr_lastname: string;
  usr_email: string;
  usr_department: string;
  usr_role: string;
  usr_status: string;
}
