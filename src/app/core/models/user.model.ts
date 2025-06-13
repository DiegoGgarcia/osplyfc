// src/app/core/models/user.model.ts
export interface User {
  usr_uid: string;
  usr_username: string;
  usr_firstname: string;
  usr_lastname: string;
  usr_email: string;
  usr_department: string;
  usr_role: string;
  usr_status: 'ACTIVE' | 'INACTIVE';
  usr_create_date: string;
  usr_update_date: string;
}

export interface UserSession {
  user: User;
  token?: string;
  sessionId: string;
  permissions: string[];
  groups: UserGroup[];
  loginTime: string;
  lastActivity: string;
}

export interface UserGroup {
  grp_uid: string;
  grp_title: string;
  grp_status: 'ACTIVE' | 'INACTIVE';
}

export interface UserPermissions {
  PM_LOGIN: boolean;
  PM_CASES: boolean;
  PM_EDITPERSONALINFO: boolean;
  PM_FOLDERS_OWNER: boolean;
  PM_FOLDERS_ALL: boolean;
  PM_REASSIGNCASE: boolean;
  PM_CANCELCASE: boolean;
  PM_SUPERVISOR: boolean;
  PM_ALLCASES: boolean;
  PM_REASSIGNCASE_SUPERVISOR: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
  workspace?: string;
}

export interface LoginResponse {
  success: boolean;
  user: User;
  access_token: string;      // OAuth 2.0 access token
  token_type: string;        // Bearer
  expires_in: number;        // Token expiration in seconds
  refresh_token?: string;    // Optional refresh token
  sessionId: string;
  permissions: UserPermissions;
  groups: UserGroup[];
  message?: string;
}
