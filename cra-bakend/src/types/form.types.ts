// src/types/form.types.ts - Version corrigée sans doublons

// =============================================
// TYPES DE BASE ADAPTÉS
// =============================================

export interface FormField {
  id: string;
  type: 'text' | 'number' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'time' | 'file' | 'photo';
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
    maxFileSize?: number;
    acceptedTypes?: string[];
  };
  options?: Array<{
    value: string | number;
    label: string;
  }>;
  defaultValue?: any;
  description?: string;
  photoConfig?: {
    maxSize?: number;
    quality?: number;
    enableGPS?: boolean;
    enableCaption?: boolean;
    maxPhotos?: number;
  };
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
    enableOfflineMode?: boolean;
    maxSubmissionsPerUser?: number;
  };
}

// =============================================
// TYPES POUR LE PARTAGE
// =============================================

export interface FormShare {
  id: string;
  shareType: 'INTERNAL' | 'EXTERNAL';
  shareToken?: string;
  canCollect: boolean;
  canExport: boolean;
  maxSubmissions?: number;
  expiresAt?: Date;
  createdAt: Date;
  lastAccessed?: Date;
  sharedWith?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface ShareFormRequest {
  targetUserId?: string;
  canCollect?: boolean;
  canExport?: boolean;
  maxSubmissions?: number;
  expiresAt?: string;
  shareType: 'INTERNAL' | 'EXTERNAL';
}

export interface PublicShareInfo {
  shareToken: string;
  shareUrl: string;
  expiresAt?: Date;
  maxSubmissions?: number;
  remainingSubmissions?: number;
}

// =============================================
// TYPES POUR LES PHOTOS
// =============================================

export interface PhotoData {
  type: 'photo';
  base64: string;
  filename?: string;
  mimeType?: string;
  caption?: string;
  latitude?: number;
  longitude?: number;
  takenAt?: Date;
}

export interface ResponsePhoto {
  id: string;
  filename: string;
  originalName?: string;
  url: string;
  fieldId: string;
  caption?: string;
  latitude?: number;
  longitude?: number;
  takenAt: Date;
  uploadedAt: Date;
  size: number;
  width?: number;
  height?: number;
}

// =============================================
// TYPES POUR LA COLLECTE MULTIPLE
// =============================================

export interface CollectorInfo {
  type: 'USER' | 'SHARED_USER' | 'PUBLIC';
  name?: string;
  email?: string;
  userId?: string;
}

export interface FormResponseData {
  id: string;
  data: Record<string, any>;
  submittedAt: Date;
  collectorType: 'USER' | 'SHARED_USER' | 'PUBLIC';
  collectorInfo?: CollectorInfo;
  isOffline?: boolean;
  syncedAt?: Date;
  respondent?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  } | null;
  form?: {
    id: string;
    title: string;
  };
  photos?: ResponsePhoto[];
  photosCount?: number;
}

// =============================================
// TYPES POUR LA SYNCHRONISATION OFFLINE
// =============================================

export interface OfflineData {
  formId: string;
  deviceId: string;
  responses: Array<{
    data: Record<string, any>;
    submittedAt: Date;
    collectorInfo?: CollectorInfo;
    photos?: PhotoData[];
  }>;
}

export interface SyncResult {
  syncId: string;
  success: boolean;
  responseId?: string;
  error?: string;
}

export interface SyncSummary {
  totalProcessed: number;
  successful: number;
  failed: number;
  results: SyncResult[];
}

// =============================================
// TYPES POUR LES RÉPONSES ADAPTÉES
// =============================================

export interface FormResponse {
  id: string;
  title: string;
  description?: string | null;
  schema: FormSchema;
  isActive: boolean;
  isPublic?: boolean;
  shareToken?: string;
  allowMultipleSubmissions: boolean;
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
  shares?: FormShare[];
  responses?: FormResponseData[];
  comments?: FormComment[];
  _count?: {
    responses: number;
    comments: number;
    shares: number;
  };
  collectionStats?: {
    totalResponses: number;
    userResponses: number;
    sharedUserResponses: number;
    publicResponses: number;
    totalPhotos: number;
  };
}

// =============================================
// TYPES POUR LES REQUÊTES ADAPTÉES
// =============================================

export interface CreateFormRequest {
  title: string;
  description?: string;
  schema: FormSchema;
  activityId?: string;
  isActive?: boolean;
  enablePublicAccess?: boolean;
}

export interface UpdateFormRequest {
  title?: string;
  description?: string;
  schema?: FormSchema;
  isActive?: boolean;
  enablePublicAccess?: boolean;
}

export interface SubmitFormResponseRequest {
  data: Record<string, any>;
  collectorName?: string;
  collectorEmail?: string;
  photos?: PhotoData[];
  isOffline?: boolean;
  deviceId?: string;
}

// =============================================
// TYPES POUR L'EXPORT ADAPTÉ
// =============================================

export interface ExportOptions {
  format: 'xlsx' | 'csv' | 'json';
  includePhotos?: boolean;
  includeMetadata?: boolean;
  includeCollectorInfo?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  collectorTypes?: Array<'USER' | 'SHARED_USER' | 'PUBLIC'>;
}

// =============================================
// TYPES POUR LES STATISTIQUES ADAPTÉES
// =============================================

export interface FormStats {
  total: number;
  active: number;
  inactive: number;
  myForms: number;
  sharedWithMe: number;
  publicForms: number;
  totalResponses: number;
  myResponses: number;
  collectedResponses: number;
  totalPhotos: number;
  offlineResponses: number;
  recentActivity: Array<{
    type: 'form_created' | 'response_submitted' | 'form_shared' | 'photo_uploaded';
    formId: string;
    formTitle: string;
    date: Date;
    details?: Record<string, any>;
  }>;
}

export interface CollectionStats {
  totalSubmissions: number;
  submissionsByType: {
    user: number;
    sharedUser: number;
    public: number;
  };
  submissionsByDay: Array<{
    date: string;
    count: number;
    photoCount: number;
  }>;
  averageSubmissionsPerDay: number;
  mostActiveCollectors: Array<{
    name: string;
    email?: string;
    submissionCount: number;
    photoCount: number;
  }>;
  photoStatistics: {
    totalPhotos: number;
    averagePhotosPerSubmission: number;
    totalStorageUsed: number;
    photosByField: Record<string, number>;
  };
}

// =============================================
// TYPES POUR LES PERMISSIONS ADAPTÉES
// =============================================

export interface FormPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canSubmitResponse: boolean;
  canSubmitMultiple: boolean;
  canViewResponses: boolean;
  canExportResponses: boolean;
  canComment: boolean;
  canShare: boolean;
  canCreatePublicLink: boolean;
  canViewPhotos: boolean;
  canCollectOffline: boolean;
}

// =============================================
// TYPES POUR L'INTERFACE UTILISATEUR
// =============================================

export interface FormPreview {
  schema: FormSchema;
  previewData: Record<string, any>;
  isValid: boolean;
  validationWarnings?: string[];
}

export interface FormDashboard {
  myForms: FormResponse[];
  sharedForms: FormResponse[];
  recentActivity: Array<{
    type: string;
    description: string;
    date: Date;
    formId?: string;
    formTitle?: string;
  }>;
  collectionSummary: {
    totalResponses: number;
    totalPhotos: number;
    pendingOfflineSync: number;
  };
  quickActions: Array<{
    label: string;
    action: string;
    icon: string;
    enabled: boolean;
  }>;
}

// =============================================
// TYPES POUR LES COMMENTAIRES
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
  processedPhotos?: PhotoData[];
}

export interface PhotoValidationResult {
  isValid: boolean;
  error?: string;
  processedPhoto?: PhotoData;
  sizeReduced?: boolean;
  originalSize?: number;
  finalSize?: number;
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

export interface ValidationError extends FormError {
  type: 'VALIDATION_ERROR';
  fieldErrors?: Record<string, string>;
}

export interface PhotoUploadError extends FormError {
  type: 'PHOTO_UPLOAD_ERROR';
  filename?: string;
  reason: 'SIZE_TOO_LARGE' | 'INVALID_FORMAT' | 'COMPRESSION_FAILED' | 'UPLOAD_FAILED';
}

// =============================================
// TYPES POUR LES NOTIFICATIONS
// =============================================

export interface FormNotification {
  id: string;
  type: 'NEW_RESPONSE' | 'FORM_SHARED' | 'EXPORT_READY' | 'OFFLINE_SYNC_COMPLETE' | 'PHOTO_PROCESSED';
  title: string;
  message: string;
  formId: string;
  userId: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
  metadata?: {
    responseCount?: number;
    photoCount?: number;
    collectorType?: string;
    shareToken?: string;
  };
}

// =============================================
// ÉNUMÉRATIONS
// =============================================

export enum FormAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  SHARE = 'SHARE',
  UNSHARE = 'UNSHARE',
  CREATE_PUBLIC_LINK = 'CREATE_PUBLIC_LINK',
  SUBMIT_RESPONSE = 'SUBMIT_RESPONSE',
  UPLOAD_PHOTO = 'UPLOAD_PHOTO',
  EXPORT = 'EXPORT',
  SYNC_OFFLINE = 'SYNC_OFFLINE',
  VIEW = 'VIEW',
  PREVIEW = 'PREVIEW',
  DUPLICATE = 'DUPLICATE'
}

export enum CollectorType {
  USER = 'USER',
  SHARED_USER = 'SHARED_USER',
  PUBLIC = 'PUBLIC'
}

export enum SyncStatus {
  PENDING = 'PENDING',
  SYNCING = 'SYNCING',
  SYNCED = 'SYNCED',
  ERROR = 'ERROR',
  RETRY = 'RETRY'
}

export enum PhotoProcessingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

// =============================================
// TYPES POUR LES UTILITAIRES
// =============================================

export interface DeviceInfo {
  id: string;
  name: string;
  platform: string;
  version: string;
  lastSync?: Date;
  pendingSync: number;
}

export interface StorageInfo {
  totalSpace: number;
  usedSpace: number;
  photoStorage: number;
  offlineStorage: number;
  availableSpace: number;
  isNearLimit: boolean;
}

// =============================================
// TYPES POUR LES API
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

export interface FormSystemConfig {
  maxFileSize: number;
  allowedPhotoTypes: string[];
  photoCompressionQuality: number;
  offlineStorageLimit: number;
  maxOfflineResponses: number;
  syncRetryAttempts: number;
  shareTokenExpiration: number;
  enableGPSCapture: boolean;
  enablePhotoCompression: boolean;
  exportFormats: Array<'xlsx' | 'csv' | 'json' | 'pdf'>;
}