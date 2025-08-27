// src/types/form.types.ts - Version complète avec commentaires

// =============================================
// TYPES DE BASE POUR LES FORMULAIRES
// =============================================

export interface FormField {
  id: string;
  type: 'text' | 'number' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'time' | 'file';
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  options?: Array<{
    value: string | number;
    label: string;
  }>;
  defaultValue?: any;
  description?: string;
}

export interface FormSchema {
  title: string;
  description?: string;
  version: string;
  fields: FormField[];
  settings?: {
    allowMultipleSubmissions?: boolean;
    showProgress?: boolean;
    submitButtonText?: string;
    successMessage?: string;
  };
}

export interface CreateFormRequest {
  title: string;
  description?: string;
  schema: FormSchema;
  activityId?: string;
  isActive?: boolean;
}

export interface UpdateFormRequest {
  title?: string;
  description?: string;
  schema?: FormSchema;
  isActive?: boolean;
}

export interface SubmitFormResponseRequest {
  data: Record<string, any>;
}

export interface FormResponseQuery {
  page?: number;
  limit?: number;
  formId?: string;
  respondentId?: string;
  startDate?: string;
  endDate?: string;
}

export interface FormResponse {
  id: string;
  title: string;
  description?: string | null;
  schema: FormSchema;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  activity?: {
    id: string;
    title: string;
    project: {
      id: string;
      title: string;
    };
  } | null;
  responses?: FormResponseData[];
  comments?: FormComment[]; // NOUVEAU: Commentaires inclus
  _count?: {
    responses: number;
    comments: number; // NOUVEAU: Compteur de commentaires
  };
}

export interface FormResponseData {
  id: string;
  data: Record<string, any>;
  submittedAt: Date;
  respondent: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  form?: {
    id: string;
    title: string;
  };
}

// =============================================
// TYPES POUR LES COMMENTAIRES - NOUVEAU/COMPLET
// =============================================

export interface FormComment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  formId: string;
}

export interface AddCommentRequest {
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface CommentQuery {
  page?: number;
  limit?: number;
  orderBy?: 'asc' | 'desc';
  search?: string;
}

export interface CommentStats {
  total: number;
  byAuthor: Array<{
    authorId: string;
    authorName: string;
    count: number;
  }>;
  recent: FormComment[];
}

export interface CommentSearchResult {
  comments: FormComment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// =============================================
// TYPES POUR LES PERMISSIONS ÉLARGIES
// =============================================

export interface UserPermissions {
  canCreateForm: boolean;
  canEditForm: boolean;
  canDeleteForm: boolean;
  canViewResponses: boolean;
  canExportResponses: boolean;
  canComment: boolean;
  canManageComments: boolean;
  canViewAudit: boolean;
}

export interface FormPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canSubmitResponse: boolean;
  canViewResponses: boolean;
  canExportResponses: boolean;
  canComment: boolean;
  canManageComments: boolean;
  canToggleStatus: boolean;
  canDuplicate: boolean;
}

// =============================================
// TYPES POUR LES STATISTIQUES AVANCÉES
// =============================================

export interface FormStats {
  total: number;
  active: number;
  inactive: number;
  myForms: number;
  totalResponses: number;
  totalComments: number; // NOUVEAU
  formsWithResponses: number;
  formsWithComments: number; // NOUVEAU
  responseRate: number;
  commentRate: number; // NOUVEAU
  recentForms: Array<{
    id: string;
    title: string;
    createdAt: Date;
    _count: {
      responses: number;
      comments: number;
    };
  }>;
}

export interface GlobalStats {
  users: {
    total: number;
    active: number;
  };
  forms: {
    total: number;
    active: number;
    createdToday: number;
    createdThisWeek: number;
    createdThisMonth: number;
  };
  responses: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  comments: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  engagement: {
    avgResponsesPerForm: number;
    avgCommentsPerForm: number;
    avgResponsesPerUser: number;
    avgCommentsPerUser: number;
    mostActiveUsers: Array<{
      id: string;
      name: string;
      formsCreated: number;
      responsesSubmitted: number;
      commentsAdded: number;
    }>;
  };
}

// =============================================
// TYPES POUR L'AUDIT ET LE TRACKING
// =============================================

export interface AuditLog {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'SUBMIT_RESPONSE' | 'ADD_COMMENT' | 'UPDATE_COMMENT' | 'DELETE_COMMENT' | 'TOGGLE_STATUS' | 'EXPORT';
  entityType: 'form' | 'response' | 'comment';
  entityId: string;
  userId?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  details?: Record<string, any>;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
    fields?: string[];
  };
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    source?: 'WEB' | 'API' | 'MOBILE';
  };
  createdAt: Date;
}

// =============================================
// TYPES POUR L'EXPORT AVANCÉ
// =============================================

export interface ExportOptions {
  format: 'xlsx' | 'csv' | 'json' | 'pdf';
  includeMetadata?: boolean;
  includeComments?: boolean;
  includeStatistics?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  fields?: string[];
  groupBy?: 'user' | 'date' | 'field';
  anonymize?: boolean;
}

export interface ExportData {
  [key: string]: any;
}

export interface ExportResult {
  filename: string;
  data: Buffer | string;
  contentType: string;
  summary: {
    totalRecords: number;
    exportedAt: Date;
    format: string;
    filters?: Record<string, any>;
  };
}

// =============================================
// TYPES POUR LES TEMPLATES
// =============================================

export interface TemplateRequest {
  name: string;
  description?: string;
  schema: FormSchema;
  category?: string;
}

export interface Template extends FormResponse {
  category?: string;
  isTemplate: true;
  usage: number; // Nombre de fois utilisé
}

// =============================================
// TYPES POUR LA DUPLICATION/CLONAGE
// =============================================

export interface DuplicateFormRequest {
  title: string;
  includeResponses?: boolean;
}

export interface CloneFormRequest {
  title: string;
  includeResponses?: boolean;
  includeComments?: boolean;
}

// =============================================
// TYPES POUR LA RECHERCHE AVANCÉE
// =============================================

export interface AdvancedSearchParams {
  query: string;
  searchIn: ('title' | 'description' | 'content' | 'comments')[];
  filters?: {
    createdAfter?: Date;
    createdBefore?: Date;
    hasResponses?: boolean;
    hasComments?: boolean;
    isActive?: boolean;
    creatorIds?: string[];
    activityIds?: string[];
    responseCountMin?: number;
    responseCountMax?: number;
  };
  sortBy: 'created' | 'updated' | 'title' | 'responses' | 'comments';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

export interface SearchResult {
  forms: FormResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  facets?: {
    creators: Array<{ id: string; name: string; count: number }>;
    activities: Array<{ id: string; title: string; count: number }>;
    responseRanges: Array<{ range: string; count: number }>;
  };
}

// =============================================
// TYPES POUR LES PARAMÈTRES ET REQUÊTES
// =============================================

export interface FormSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  activityId?: string;
  creatorId?: string;
  isActive?: boolean;
  status?: 'active' | 'inactive' | 'all';
  publicOnly?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  metadata?: Record<string, any>;
}

// =============================================
// TYPES POUR LES NOTIFICATIONS
// =============================================

export interface FormNotification {
  id: string;
  type: 'NEW_RESPONSE' | 'FORM_UPDATED' | 'FORM_SHARED' | 'NEW_COMMENT' | 'COMMENT_REPLY' | 'DEADLINE_REMINDER' | 'EXPORT_READY';
  title: string;
  message: string;
  formId: string;
  userId: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

// =============================================
// TYPES POUR LES RAPPORTS PERSONNALISÉS
// =============================================

export interface CustomReport {
  id: string;
  name: string;
  description?: string;
  type: 'summary' | 'detailed' | 'comparison' | 'trend';
  parameters: {
    formIds?: string[];
    dateRange: {
      start: Date;
      end: Date;
    };
    includeCharts: boolean;
    includeRawData: boolean;
    grouping: 'daily' | 'weekly' | 'monthly';
  };
  schedule?: {
    enabled: boolean;
    frequency?: 'daily' | 'weekly' | 'monthly';
    recipients?: string[];
    lastRun?: Date;
    nextRun?: Date;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportData {
  report: CustomReport;
  data: {
    summary: Record<string, any>;
    charts?: Array<{
      type: string;
      title: string;
      data: any[];
      config: Record<string, any>;
    }>;
    tables?: Array<{
      title: string;
      headers: string[];
      rows: any[][];
    }>;
    rawData?: any[];
  };
  generatedAt: Date;
  generatedBy: string;
}

// =============================================
// TYPES POUR LES PRÉFÉRENCES UTILISATEUR
// =============================================

export interface UserPreferences {
  defaultPageSize: number;
  autoSave: boolean;
  showPreview: boolean;
  exportFormat: 'xlsx' | 'csv';
  emailNotifications: boolean;
  language: 'fr' | 'en';
  theme?: 'light' | 'dark' | 'auto';
  timezone?: string;
}

// =============================================
// ÉNUMÉRATIONS
// =============================================

export enum FormAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  ACTIVATE = 'ACTIVATE',
  DEACTIVATE = 'DEACTIVATE',
  DUPLICATE = 'DUPLICATE',
  CLONE = 'CLONE',
  EXPORT = 'EXPORT',
  SUBMIT_RESPONSE = 'SUBMIT_RESPONSE',
  VIEW_RESPONSES = 'VIEW_RESPONSES',
  ADD_COMMENT = 'ADD_COMMENT',
  UPDATE_COMMENT = 'UPDATE_COMMENT',
  DELETE_COMMENT = 'DELETE_COMMENT',
  SHARE = 'SHARE'
}

export enum CommentAction {
  ADD = 'ADD',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  MODERATE = 'MODERATE'
}

export enum FormNotificationType {
  NEW_RESPONSE = 'NEW_RESPONSE',
  FORM_UPDATED = 'FORM_UPDATED',
  FORM_SHARED = 'FORM_SHARED',
  NEW_COMMENT = 'NEW_COMMENT',
  COMMENT_REPLY = 'COMMENT_REPLY',
  DEADLINE_REMINDER = 'DEADLINE_REMINDER',
  EXPORT_READY = 'EXPORT_READY',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  QUOTA_WARNING = 'QUOTA_WARNING'
}

export enum FormStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
  TEMPLATE = 'TEMPLATE'
}

export enum UserRole {
  CHERCHEUR = 'CHERCHEUR',
  ASSISTANT_CHERCHEUR = 'ASSISTANT_CHERCHEUR',
  TECHNICIEN_SUPERIEUR = 'TECHNICIEN_SUPERIEUR',
  ADMINISTRATEUR = 'ADMINISTRATEUR'
}

// =============================================
// TYPES POUR LES ERREURS
// =============================================

export interface FormError {
  code: string;
  message: string;
  field?: string;
  value?: any;
  context?: Record<string, any>;
}

// =============================================
// TYPES POUR LA VALIDATION
// =============================================

export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue?: any;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData: Record<string, any>;
  warnings?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormError[];
  warnings?: FormError[];
  sanitizedData?: Record<string, any>;
}

// =============================================
// TYPES POUR LES MÉTRIQUES DE PERFORMANCE
// =============================================

export interface PerformanceMetrics {
  averageCompletionTime: number;
  abandonmentRate: number;
  fieldCompletionRates: Record<string, number>;
  userEngagement: {
    totalViews: number;
    uniqueUsers: number;
    returningUsers: number;
  };
  responseQuality: {
    completeResponses: number;
    partialResponses: number;
    invalidResponses: number;
  };
  commentMetrics: {
    averageCommentsPerForm: number;
    averageCommentLength: number;
    commentEngagementRate: number;
  };
}

// =============================================
// TYPES POUR LES INTÉGRATIONS
// =============================================

export interface FormIntegration {
  id: string;
  name: string;
  type: 'EMAIL' | 'WEBHOOK' | 'API' | 'ZAPIER' | 'SLACK' | 'TEAMS';
  formId: string;
  config: {
    url?: string;
    headers?: Record<string, string>;
    method?: 'POST' | 'PUT' | 'PATCH';
    authentication?: {
      type: 'BEARER' | 'BASIC' | 'API_KEY';
      credentials: Record<string, string>;
    };
    events?: FormAction[];
    template?: string;
  };
  isActive: boolean;
  lastSync?: Date;
  errorCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================
// TYPES POUR LES WEBHOOKS
// =============================================

export interface WebhookPayload {
  event: FormAction;
  formId: string;
  form: {
    id: string;
    title: string;
    description?: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  data?: Record<string, any>;
  timestamp: Date;
  signature?: string;
}

// =============================================
// TYPES POUR LES FILTRES AVANCÉS
// =============================================

export interface AdvancedFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  creators?: string[];
  activities?: string[];
  projects?: string[];
  hasResponses?: boolean;
  hasComments?: boolean;
  responseCount?: {
    min?: number;
    max?: number;
  };
  commentCount?: {
    min?: number;
    max?: number;
  };
  tags?: string[];
  categories?: string[];
  status?: FormStatus[];
  lastActivity?: {
    days: number;
  };
}

// =============================================
// TYPES POUR L'ANALYSE PRÉDICTIVE
// =============================================

export interface FormPrediction {
  formId: string;
  predictions: {
    expectedResponses: {
      next7Days: number;
      next30Days: number;
      confidence: number;
    };
    completionRate: {
      predicted: number;
      confidence: number;
      factors: string[];
    };
    engagement: {
      expectedComments: number;
      expectedViews: number;
      confidence: number;
    };
  };
  recommendations: Array<{
    type: 'OPTIMIZATION' | 'PROMOTION' | 'TIMING' | 'CONTENT';
    title: string;
    description: string;
    impact: 'LOW' | 'MEDIUM' | 'HIGH';
    effort: 'LOW' | 'MEDIUM' | 'HIGH';
    actionable: boolean;
  }>;
  insights: Array<{
    category: 'PERFORMANCE' | 'ENGAGEMENT' | 'QUALITY' | 'TIMING';
    message: string;
    confidence: number;
    data?: Record<string, any>;
  }>;
  generatedAt: Date;
  validUntil: Date;
}

// =============================================
// TYPES POUR LES WORKFLOWS
// =============================================

export interface FormWorkflow {
  id: string;
  name: string;
  description?: string;
  formId: string;
  isActive: boolean;
  triggers: Array<{
    event: FormAction;
    conditions?: Record<string, any>;
  }>;
  steps: Array<{
    id: string;
    name: string;
    type: 'APPROVAL' | 'NOTIFICATION' | 'INTEGRATION' | 'VALIDATION' | 'DELAY';
    config: Record<string, any>;
    order: number;
    onSuccess?: string; // ID du step suivant
    onFailure?: string; // ID du step en cas d'échec
  }>;
  variables?: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  formId: string;
  triggeredBy: FormAction;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  currentStep?: string;
  variables: Record<string, any>;
  log: Array<{
    stepId: string;
    status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
    message?: string;
    timestamp: Date;
    data?: Record<string, any>;
  }>;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

// =============================================
// TYPES POUR LA COLLABORATION
// =============================================

export interface FormCollaborator {
  id: string;
  formId: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  permissions: Array<'VIEW' | 'EDIT' | 'DELETE' | 'COMMENT' | 'EXPORT' | 'MANAGE_COMMENTS'>;
  addedBy: string;
  addedAt: Date;
  isActive: boolean;
}

export interface FormShare {
  id: string;
  formId: string;
  shareType: 'PUBLIC' | 'RESTRICTED' | 'PRIVATE';
  shareToken?: string;
  expiresAt?: Date;
  password?: string;
  allowedEmails?: string[];
  permissions: Array<'VIEW' | 'SUBMIT' | 'COMMENT'>;
  viewCount: number;
  submissionCount: number;
  createdBy: string;
  createdAt: Date;
  lastAccessed?: Date;
}

// =============================================
// TYPES POUR LA MODÉRATION
// =============================================

export interface CommentModeration {
  id: string;
  commentId: string;
  action: 'APPROVE' | 'REJECT' | 'FLAG' | 'HIDE';
  reason?: string;
  moderatorId: string;
  moderator: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  createdAt: Date;
  note?: string;
}

export interface ModerationQueue {
  pendingComments: Array<FormComment & {
    moderation?: CommentModeration;
    flagCount: number;
    autoFlag: boolean;
  }>;
  statistics: {
    totalPending: number;
    totalApproved: number;
    totalRejected: number;
    averageProcessingTime: number;
  };
}

// =============================================
// TYPES POUR LES SAUVEGARDES
// =============================================

export interface FormBackup {
  id: string;
  formId: string;
  version: string;
  data: {
    form: FormResponse;
    responses?: FormResponseData[];
    comments?: FormComment[];
    metadata: Record<string, any>;
  };
  type: 'MANUAL' | 'AUTOMATIC' | 'SCHEDULED';
  createdBy?: string;
  createdAt: Date;
  size: number;
  checksum: string;
  compression: 'NONE' | 'GZIP' | 'ZIP';
  location: string;
  retentionUntil?: Date;
}

export interface BackupPolicy {
  id: string;
  name: string;
  schedule: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    time: string; // HH:MM format
    daysOfWeek?: number[]; // 0-6, for weekly
    dayOfMonth?: number; // 1-31, for monthly
  };
  retention: {
    count?: number; // Keep last N backups
    days?: number; // Keep backups for N days
  };
  includeResponses: boolean;
  includeComments: boolean;
  compression: 'NONE' | 'GZIP' | 'ZIP';
  isActive: boolean;
  formIds?: string[]; // If empty, applies to all forms
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================
// TYPES POUR LES QUOTAS ET LIMITES
// =============================================

export interface UserQuota {
  userId: string;
  limits: {
    maxForms: number;
    maxResponses: number;
    maxStorage: number; // en bytes
    maxCollaborators: number;
    maxIntegrations: number;
    maxBackups: number;
  };
  current: {
    forms: number;
    responses: number;
    storage: number;
    collaborators: number;
    integrations: number;
    backups: number;
  };
  resetDate: Date;
  warnings: Array<{
    type: 'APPROACHING_LIMIT' | 'LIMIT_EXCEEDED';
    resource: string;
    percentage: number;
    message: string;
  }>;
}

export interface SystemLimits {
  global: {
    maxFormsPerUser: number;
    maxResponsesPerForm: number;
    maxFileSize: number;
    maxCommentLength: number;
    maxCollaboratorsPerForm: number;
  };
  byRole: Record<UserRole, Partial<UserQuota['limits']>>;
}

// =============================================
// TYPES POUR L'INTELLIGENCE ARTIFICIELLE
// =============================================

export interface AIAnalysis {
  formId: string;
  analysis: {
    sentiment: {
      overall: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
      score: number; // -1 to 1
      breakdown: {
        positive: number;
        neutral: number;
        negative: number;
      };
    };
    topics: Array<{
      name: string;
      frequency: number;
      relevance: number;
      keywords: string[];
    }>;
    quality: {
      score: number; // 0 to 100
      factors: Array<{
        name: string;
        score: number;
        impact: 'HIGH' | 'MEDIUM' | 'LOW';
        recommendation: string;
      }>;
    };
    insights: Array<{
      type: 'OPTIMIZATION' | 'TREND' | 'ANOMALY' | 'OPPORTUNITY';
      title: string;
      description: string;
      confidence: number;
      actionable: boolean;
      recommendation?: string;
    }>;
  };
  metadata: {
    model: string;
    version: string;
    processedAt: Date;
    processingTime: number;
    dataPoints: number;
  };
}

// =============================================
// TYPES POUR LA LOCALISATION
// =============================================

export interface FormLocalization {
  formId: string;
  language: string;
  translations: {
    title?: string;
    description?: string;
    fields: Record<string, {
      label?: string;
      placeholder?: string;
      description?: string;
      options?: Array<{ value: string | number; label: string }>;
      validation?: { message?: string };
    }>;
    settings?: {
      submitButtonText?: string;
      successMessage?: string;
    };
  };
  isDefault: boolean;
  completeness: number; // 0 to 100
  lastUpdated: Date;
  updatedBy: string;
}

// =============================================
// TYPES POUR LES ÉVÉNEMENTS EN TEMPS RÉEL
// =============================================

export interface RealTimeEvent {
  id: string;
  type: FormAction | CommentAction;
  formId: string;
  userId: string;
  data: Record<string, any>;
  timestamp: Date;
  recipients?: string[]; // User IDs who should receive this event
}

export interface EventSubscription {
  userId: string;
  formIds?: string[]; // If empty, subscribe to all forms user has access to
  events: Array<FormAction | CommentAction>;
  delivery: {
    realTime: boolean;
    email: boolean;
    push: boolean;
  };
  filters?: {
    roles?: UserRole[];
    keywords?: string[];
  };
}

// =============================================
// TYPES POUR L'API ET LES RÉPONSES
// =============================================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  warnings?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  metadata?: Record<string, any>;
}

export interface BulkOperation<T = any> {
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  items: T[];
  options?: {
    continueOnError?: boolean;
    validateOnly?: boolean;
    batchSize?: number;
  };
}

export interface BulkResult<T = any> {
  success: boolean;
  totalItems: number;
  successCount: number;
  errorCount: number;
  results: Array<{
    item: T;
    success: boolean;
    error?: string;
    result?: any;
  }>;
  summary: {
    created?: number;
    updated?: number;
    deleted?: number;
    skipped?: number;
  };
}

// =============================================
// TYPES POUR LA CONFIGURATION
// =============================================

export interface FormConfiguration {
  features: {
    enableComments: boolean;
    enableCollaboration: boolean;
    enableIntegrations: boolean;
    enableAI: boolean;
    enableRealTime: boolean;
    enableBackups: boolean;
    enableModeration: boolean;
  };
  limits: SystemLimits;
  security: {
    requireAuth: boolean;
    allowPublicForms: boolean;
    maxLoginAttempts: number;
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
    };
  };
  notifications: {
    email: {
      enabled: boolean;
      fromAddress: string;
      templates: Record<string, string>;
    };
    push: {
      enabled: boolean;
      vapidKeys?: {
        publicKey: string;
        privateKey: string;
      };
    };
  };
}

// =============================================
// EXPORT DE TOUS LES TYPES
// =============================================

// Interface principale pour les options du service
export interface FormServiceOptions {
  includeResponses?: boolean;
  includeComments?: boolean;
  includeMetadata?: boolean;
  includeStatistics?: boolean;
  includeCollaborators?: boolean;
  language?: string;
  maxResponses?: number;
  maxComments?: number;
}

// Types pour les résultats d'API standardisés
export type FormApiResponse<T = any> = ApiResponse<T>;
export type FormBulkOperation<T = any> = BulkOperation<T>;
export type FormBulkResult<T = any> = BulkResult<T>;