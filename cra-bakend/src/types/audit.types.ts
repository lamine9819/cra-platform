// src/types/audit.types.ts

export type AuditAction = 
  // Actions d'authentification
  | 'AUTH_LOGIN'
  | 'AUTH_LOGOUT'
  | 'AUTH_LOGIN_FAILED'
  | 'AUTH_TOKEN_REFRESH'
  | 'AUTH_PASSWORD_RESET'
  | 'AUTH_PASSWORD_CHANGED'
  
  // Actions utilisateur
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'USER_ACTIVATED'
  | 'USER_DEACTIVATED'
  | 'USER_ROLE_CHANGED'
  
  // Actions projet
  | 'PROJECT_CREATED'
  | 'PROJECT_UPDATED'
  | 'PROJECT_DELETED'
  | 'PROJECT_STATUS_CHANGED'
  | 'PROJECT_PARTICIPANT_ADDED'
  | 'PROJECT_PARTICIPANT_REMOVED'
  | 'PROJECT_ARCHIVED'
  | 'PROJECT_UNARCHIVED'
  
  // Actions activité
  | 'ACTIVITY_CREATED'
  | 'ACTIVITY_UPDATED'
  | 'ACTIVITY_DELETED'
  | 'ACTIVITY_COMPLETED'
  | 'ACTIVITY_RESULTS_ADDED'
  
  // Actions tâche
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'TASK_DELETED'
  | 'TASK_ASSIGNED'
  | 'TASK_UNASSIGNED'
  | 'TASK_STATUS_CHANGED'
  | 'TASK_PRIORITY_CHANGED'
  | 'TASK_COMPLETED'
  
  // Actions document
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_UPDATED'
  | 'DOCUMENT_DELETED'
  | 'DOCUMENT_DOWNLOADED'
  | 'DOCUMENT_SHARED'
  | 'DOCUMENT_UNSHARED'
  | 'DOCUMENT_ACCESS_GRANTED'
  | 'DOCUMENT_ACCESS_REVOKED'
  
  // Actions formulaire
  | 'FORM_CREATED'
  | 'FORM_UPDATED'
  | 'FORM_DELETED'
  | 'FORM_RESPONSE_SUBMITTED'
  | 'FORM_PUBLISHED'
  | 'FORM_UNPUBLISHED'
  
  // Actions séminaire
  | 'SEMINAR_CREATED'
  | 'SEMINAR_UPDATED'
  | 'SEMINAR_DELETED'
  | 'SEMINAR_PUBLISHED'
  | 'SEMINAR_CANCELLED'
  | 'SEMINAR_REGISTERED'
  | 'SEMINAR_UNREGISTERED'
  | 'SEMINAR_ATTENDANCE_MARKED'
  
  // Actions commentaire
  | 'COMMENT_CREATED'
  | 'COMMENT_UPDATED'
  | 'COMMENT_DELETED'
  
  // Actions notification
  | 'NOTIFICATION_SENT'
  | 'NOTIFICATION_READ'
  | 'NOTIFICATION_DELETED'
  
  // Actions système
  | 'SYSTEM_MAINTENANCE_START'
  | 'SYSTEM_MAINTENANCE_END'
  | 'SYSTEM_BACKUP_CREATED'
  | 'SYSTEM_CONFIG_CHANGED'
  | 'SYSTEM_ERROR_OCCURRED';

export type AuditLevel = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export type EntityType =
  | 'user'
  | 'project'
  | 'activity'
  | 'task'
  | 'document'
  | 'form'
  | 'event'
  | 'seminar'
  | 'comment'
  | 'notification'
  | 'system';

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  level: AuditLevel;
  userId?: string | null;
  entityType?: EntityType | null;
  entityId?: string | null;
  details: Record<string, any>;
  metadata: {
    userAgent?: string;
    ip?: string;
    source?: string;
    timestamp: Date;
    requestId?: string;
    sessionId?: string;
  };
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
    fields?: string[];
  };
  createdAt: Date;
}

export interface CreateAuditLogRequest {
  action: AuditAction;
  level?: AuditLevel;
  userId?: string;
  entityType?: EntityType;
  entityId?: string;
  details?: Record<string, any>;
  metadata?: {
    userAgent?: string;
    ip?: string;
    source?: string;
    requestId?: string;
    sessionId?: string;
  };
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
    fields?: string[];
  };
}

export interface AuditLogQuery {
  page?: number;
  limit?: number;
  action?: AuditAction;
  level?: AuditLevel;
  userId?: string;
  entityType?: EntityType;
  entityId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  source?: string;
  ip?: string;
}

export interface AuditLogResponse {
  id: string;
  action: AuditAction;
  level: AuditLevel;
  userId?: string | null;
  entityType?: EntityType | null;
  entityId?: string | null;
  details: Record<string, any>;
  metadata: {
    userAgent?: string;
    ip?: string;
    source?: string;
    timestamp: Date;
    requestId?: string;
    sessionId?: string;
  };
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
    fields?: string[];
  };
  createdAt: Date;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  entity?: {
    type: EntityType;
    id: string;
    title?: string;
  };
}

export interface AuditLogStats {
  totalLogs: number;
  byAction: Record<string, number>;
  byLevel: Record<AuditLevel, number>;
  byEntityType: Record<string, number>;
  byUser: Array<{
    userId: string;
    userName: string;
    count: number;
  }>;
  recentActivity: Array<{
    date: string;
    count: number;
  }>;
  topActions: Array<{
    action: AuditAction;
    count: number;
  }>;
  securityEvents: {
    failedLogins: number;
    suspiciousActivity: number;
    adminActions: number;
  };
}