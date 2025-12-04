// src/types/form.types.ts - Types pour le système de formulaire frontend

// =============================================
// TYPES DE BASE POUR LES CHAMPS
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
// TYPES POUR LE FORMULAIRE
// =============================================

export interface Form {
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
  fieldId?: string; // ID du champ du formulaire auquel appartient cette photo
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
// TYPES POUR LES RÉPONSES
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
// TYPES POUR LES REQUÊTES
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
// TYPES POUR L'EXPORT
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

export interface SyncStatus {
  deviceId: string;
  pendingCount: number;
  failedCount: number;
  lastSyncAt: Date | null;
  pendingItems: any[];
  failedItems: any[];
}

// =============================================
// TYPES POUR LES PERMISSIONS
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
  myForms: Form[];
  sharedForms: Form[];
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
// TYPES POUR LES API RÉPONSES
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

// =============================================
// TYPES POUR LE STOCKAGE LOCAL
// =============================================

export interface LocalFormData {
  formId: string;
  schema: FormSchema;
  responses: SubmitFormResponseRequest[];
  lastSync?: Date;
  isSyncing?: boolean;
}

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
// TYPES POUR LES FILTRES
// =============================================

export interface FormFilters {
  search?: string;
  status?: 'all' | 'active' | 'inactive';
  createdBy?: 'me' | 'others' | 'all';
  hasActivity?: boolean;
  activityId?: string;
  hasResponses?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
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

export enum SyncStatusType {
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
