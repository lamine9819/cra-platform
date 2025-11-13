// src/types/auditLog.types.ts

export enum AuditLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export const AuditLevelLabels: Record<AuditLevel, string> = {
  [AuditLevel.INFO]: 'Info',
  [AuditLevel.WARNING]: 'Avertissement',
  [AuditLevel.ERROR]: 'Erreur',
  [AuditLevel.CRITICAL]: 'Critique',
};

export const AuditLevelColors: Record<AuditLevel, string> = {
  [AuditLevel.INFO]: 'bg-blue-100 text-blue-800',
  [AuditLevel.WARNING]: 'bg-yellow-100 text-yellow-800',
  [AuditLevel.ERROR]: 'bg-red-100 text-red-800',
  [AuditLevel.CRITICAL]: 'bg-purple-100 text-purple-800',
};

export interface AuditLogUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface AuditLogMetadata {
  ip?: string;
  userAgent?: string;
  method?: string;
  path?: string;
  query?: any;
  source?: string;
  [key: string]: any;
}

export interface AuditLogChanges {
  before?: any;
  after?: any;
  fields?: string[];
}

export interface AuditLogDetails {
  title?: string;
  description?: string;
  [key: string]: any;
}

export interface AuditLog {
  id: string;
  action: string;
  level: AuditLevel;
  userId?: string;
  entityType?: string;
  entityId?: string;
  details?: AuditLogDetails;
  metadata?: AuditLogMetadata;
  changes?: AuditLogChanges;
  createdAt: string;
  user?: AuditLogUser;
}

export interface AuditLogListQuery {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  entityType?: string;
  level?: AuditLevel;
  startDate?: string;
  endDate?: string;
}

export interface AuditLogListResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface AuditLogStats {
  totalLogs: number;
  byLevel: Record<string, number>;
  byAction: Array<{ action: string; count: number }>;
  byEntityType: Array<{ entityType: string; count: number }>;
}

export interface AuditLogStatsQuery {
  userId?: string;
  startDate?: string;
  endDate?: string;
}

// Actions communes
export const CommonActions = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  VIEW: 'VIEW',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  ERROR: 'ERROR',
} as const;

export const ActionLabels: Record<string, string> = {
  CREATE: 'Création',
  UPDATE: 'Modification',
  DELETE: 'Suppression',
  VIEW: 'Consultation',
  LOGIN_SUCCESS: 'Connexion réussie',
  LOGIN_FAILED: 'Échec de connexion',
  LOGOUT: 'Déconnexion',
  ERROR: 'Erreur',
  POST: 'Création',
  PUT: 'Modification',
  PATCH: 'Modification',
  GET: 'Consultation',
};

// Types d'entités communes
export const EntityTypeLabels: Record<string, string> = {
  projects: 'Projet',
  activities: 'Activité',
  users: 'Utilisateur',
  partners: 'Partenaire',
  conventions: 'Convention',
  documents: 'Document',
  tasks: 'Tâche',
  comments: 'Commentaire',
  notifications: 'Notification',
  formes: 'Formation',
  publications: 'Publication',
  events: 'Événement',
  'knowledge-transfers': 'Transfert de connaissances',
  'strategic-planning': 'Planification stratégique',
};
