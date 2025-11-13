// src/types/document.types.ts - Version améliorée

// =============================================
// ÉNUMÉRATIONS
// =============================================

export enum DocumentType {
  RAPPORT = 'RAPPORT',
  FICHE_ACTIVITE = 'FICHE_ACTIVITE',
  FICHE_TECHNIQUE = 'FICHE_TECHNIQUE',
  DONNEES_EXPERIMENTALES = 'DONNEES_EXPERIMENTALES',
  FORMULAIRE = 'FORMULAIRE',
  IMAGE = 'IMAGE',
  AUTRE = 'AUTRE'
}

// =============================================
// INTERFACES DE BASE
// =============================================

export interface DocumentOwner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface DocumentProject {
  id: string;
  title: string;
  description?: string;
  creatorId: string;
  participants?: Array<{
    id: string;
    userId: string;
    isActive: boolean;
    role: string;
  }>;
}

export interface DocumentActivity {
  id: string;
  title: string;
  projectId: string;
  project: {
    id: string;
    title: string;
    creatorId: string;
    participants?: Array<{
      userId: string;
      isActive: boolean;
    }>;
  };
}

export interface DocumentTask {
  id: string;
  title: string;
  creatorId: string;
  assigneeId?: string;
  projectId?: string;
  project?: {
    id: string;
    title: string;
    creatorId: string;
    participants?: Array<{
      userId: string;
      isActive: boolean;
    }>;
  };
}

export interface DocumentSeminar {
  id: string;
  title: string;
  organizerId: string;
  organizer: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface DocumentShare {
  id: string;
  canEdit: boolean;
  canDelete: boolean;
  sharedAt: Date;
  sharedWith: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// =============================================
// INTERFACE PRINCIPALE DOCUMENT
// =============================================

export interface DocumentResponse {
  id: string;
  title: string;
  filename: string;
  filepath: string;
  mimeType: string;
  size: number;
  type: DocumentType;
  description?: string;
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  owner: DocumentOwner;
  project?: DocumentProject;
  activity?: DocumentActivity;
  task?: DocumentTask;
  seminar?: DocumentSeminar;
  shares?: DocumentShare[];
}

// =============================================
// INTERFACES DE REQUÊTE
// =============================================

export interface UploadFileRequest {
  title: string;
  description?: string;
  type?: DocumentType;
  tags?: string[];
  isPublic?: boolean;
  projectId?: string;
  activityId?: string;
  taskId?: string;
  seminarId?: string;
}

export interface ShareDocumentRequest {
  userIds: string[];
  canEdit?: boolean;
  canDelete?: boolean;
}

export interface DocumentListQuery {
  page?: number;
  limit?: number;
  type?: DocumentType;
  ownerId?: string;
  projectId?: string;
  activityId?: string;
  taskId?: string;
  seminarId?: string;
  mimeType?: string;
  isPublic?: boolean;
  tags?: string[];
  search?: string;
}

// =============================================
// NOUVELLES INTERFACES POUR LES LIAISONS
// =============================================

export interface LinkDocumentRequest {
  projectId?: string;
  activityId?: string;
  taskId?: string;
}

export interface DocumentContext {
  type: 'project' | 'activity' | 'task' | 'seminar';
  id: string;
  title: string;
}

export interface DocumentPermissions {
  canView: boolean;
  canDownload: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  canLink: boolean;
}

// =============================================
// INTERFACES DE RÉPONSE
// =============================================

export interface UploadResponse {
  success: boolean;
  message: string;
  data: DocumentResponse | DocumentResponse[];
}

export interface DocumentListResponse {
  success: boolean;
  data: DocumentResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface DocumentStatsResponse {
  success: boolean;
  data: {
    total: number;
    byType: Record<string, number>;
    byOwnership: {
      owned: number;
      shared: number;
      public: number;
    };
    byContext: {
      projects: number;
      activities: number;
      tasks: number;
      standalone: number;
    };
    totalSize: number;
    recent: DocumentResponse[];
  };
}

// =============================================
// INTERFACES POUR LES COMPOSANTS
// =============================================

export interface DocumentCardProps {
  document: DocumentResponse;
  onView?: (document: DocumentResponse) => void;
  onDownload?: (document: DocumentResponse) => void;
  onShare?: (document: DocumentResponse) => void;
  onEdit?: (document: DocumentResponse) => void;
  onDelete?: (document: DocumentResponse) => void;
  onLink?: (document: DocumentResponse) => void;
  onUnlink?: (document: DocumentResponse) => void;
  showActions?: boolean;
  compact?: boolean;
  showContext?: boolean;
  permissions?: DocumentPermissions;
}

export interface DocumentUploadProps {
  onUploadSuccess?: (documents: DocumentResponse | DocumentResponse[]) => void;
  onUploadError?: (error: string) => void;
  multiple?: boolean;
  projectId?: string;
  activityId?: string;
  taskId?: string;
  seminarId?: string;
  acceptedTypes?: string;
  maxSize?: number;
  autoLink?: boolean; // Liaison automatique au contexte
  showContextSelector?: boolean; // Permettre la sélection du contexte
}

export interface DocumentListProps {
  documents: DocumentResponse[];
  loading?: boolean;
  error?: string;
  onDocumentAction?: (action: DocumentAction, document: DocumentResponse) => void;
  showFilters?: boolean;
  showPagination?: boolean;
  emptyMessage?: string;
  compact?: boolean;
  context?: DocumentContext;
  allowLinking?: boolean;
}

export interface DocumentFiltersProps {
  onFilterChange: (filters: DocumentListQuery) => void;
  initialFilters?: DocumentListQuery;
  showProjectFilter?: boolean;
  showActivityFilter?: boolean;
  showTaskFilter?: boolean;
  showTypeFilter?: boolean;
  showOwnerFilter?: boolean;
  showContextFilter?: boolean;
}

export interface DocumentShareModalProps {
  document: DocumentResponse;
  isOpen: boolean;
  onClose: () => void;
  onShare: (shareData: ShareDocumentRequest) => Promise<void>;
}

export interface DocumentLinkModalProps {
  document: DocumentResponse;
  isOpen: boolean;
  onClose: () => void;
  onLink: (context: DocumentContext) => Promise<void>;
  onUnlink: () => Promise<void>;
}

// =============================================
// TYPES UTILITAIRES
// =============================================

export type DocumentAction = 
  | 'view' 
  | 'download' 
  | 'share' 
  | 'edit' 
  | 'delete' 
  | 'link' 
  | 'unlink'
  | 'duplicate';

export interface DocumentContextType {
  documents: DocumentResponse[];
  loading: boolean;
  error: string | null;
  stats?: DocumentStatsResponse['data'];
  pagination?: DocumentListResponse['pagination'];
  
  // Actions de base
  uploadDocument: (file: File, data: Omit<UploadFileRequest, 'file'>) => Promise<void>;
  uploadMultipleDocuments: (files: File[], data: Array<Omit<UploadFileRequest, 'file'>>) => Promise<void>;
  fetchDocuments: (query?: DocumentListQuery) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  shareDocument: (id: string, shareData: ShareDocumentRequest) => Promise<void>;
  downloadDocument: (id: string, filename: string) => Promise<void>;
  
  // Nouvelles actions
  linkToProject?: (documentId: string, projectId: string) => Promise<void>;
  linkToActivity?: (documentId: string, activityId: string) => Promise<void>;
  unlinkDocument?: (documentId: string) => Promise<void>;
  fetchProjectDocuments?: (projectId: string, query?: any) => Promise<void>;
  fetchActivityDocuments?: (activityId: string, query?: any) => Promise<void>;
  fetchDocumentStats?: () => Promise<void>;
  shareWithProjectMembers?: (documentId: string, projectId: string, permissions?: any) => Promise<void>;
}

// =============================================
// INTERFACES POUR LES HOOKS SPÉCIALISÉS
// =============================================

export interface ProjectDocumentsHook {
  documents: DocumentResponse[];
  loading: boolean;
  error: string | null;
  refetch: (query?: any) => Promise<void>;
  addDocument: (file: File, data: Omit<UploadFileRequest, 'file'>) => Promise<void>;
}

export interface ActivityDocumentsHook {
  documents: DocumentResponse[];
  loading: boolean;
  error: string | null;
  refetch: (query?: any) => Promise<void>;
  addDocument: (file: File, data: Omit<UploadFileRequest, 'file'>) => Promise<void>;
}

export interface TaskDocumentsHook {
  documents: DocumentResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addDocument: (file: File, data: Omit<UploadFileRequest, 'file'>) => Promise<void>;
}

export interface DocumentStatsHook {
  stats: DocumentStatsResponse['data'] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// =============================================
// CONSTANTES ET UTILITAIRES
// =============================================

export const DOCUMENT_TYPES = [
  { value: DocumentType.RAPPORT, label: 'Rapport' },
  { value: DocumentType.FICHE_ACTIVITE, label: 'Fiche d\'activité' },
  { value: DocumentType.FICHE_TECHNIQUE, label: 'Fiche technique' },
  { value: DocumentType.DONNEES_EXPERIMENTALES, label: 'Données expérimentales' },
  { value: DocumentType.FORMULAIRE, label: 'Formulaire' },
  { value: DocumentType.IMAGE, label: 'Image' },
  { value: DocumentType.AUTRE, label: 'Autre' }
];

export const DOCUMENT_CONTEXTS = [
  { value: 'project', label: 'Projet' },
  { value: 'activity', label: 'Activité' },
  { value: 'task', label: 'Tâche' },
  { value: 'seminar', label: 'Séminaire' }
];

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_FILES_PER_UPLOAD = 10;
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/gif',
  'text/plain',
  'text/csv'
];

// =============================================
// FONCTIONS UTILITAIRES
// =============================================

export const getDocumentPermissions = (
  document: DocumentResponse, 
  currentUserId: string, 
  userRole: string
): DocumentPermissions => {
  const isOwner = document.owner.id === currentUserId;
  const isAdmin = userRole === 'ADMINISTRATEUR';
  const sharePermissions = document.shares?.find(share => share.sharedWith.id === currentUserId);
  
  return {
    canView: true, // Si on peut voir le document, on peut le consulter
    canDownload: true,
    canEdit: isOwner || isAdmin || (sharePermissions?.canEdit ?? false),
    canDelete: isOwner || isAdmin || (sharePermissions?.canDelete ?? false),
    canShare: isOwner || isAdmin,
    canLink: isOwner || isAdmin || (sharePermissions?.canEdit ?? false)
  };
};

export const getDocumentContext = (document: DocumentResponse): DocumentContext | null => {
  if (document.project) {
    return {
      type: 'project',
      id: document.project.id,
      title: document.project.title
    };
  }
  if (document.activity) {
    return {
      type: 'activity',
      id: document.activity.id,
      title: document.activity.title
    };
  }
  if (document.task) {
    return {
      type: 'task',
      id: document.task.id,
      title: document.task.title
    };
  }
  if (document.seminar) {
    return {
      type: 'seminar',
      id: document.seminar.id,
      title: document.seminar.title
    };
  }
  return null;
};

export const formatDocumentSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getDocumentTypeIcon = (type: DocumentType): string => {
  const icons = {
    [DocumentType.RAPPORT]: '📄',
    [DocumentType.FICHE_ACTIVITE]: '📋',
    [DocumentType.FICHE_TECHNIQUE]: '🔧',
    [DocumentType.DONNEES_EXPERIMENTALES]: '📊',
    [DocumentType.FORMULAIRE]: '📝',
    [DocumentType.IMAGE]: '🖼️',
    [DocumentType.AUTRE]: '📎'
  };
  return icons[type] || '📎';
};

export const getMimeTypeIcon = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.includes('word')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️';
  if (mimeType === 'text/plain') return '📄';
  if (mimeType === 'text/csv') return '📊';
  return '📎';
};

export const isDocumentEditable = (document: DocumentResponse, userId: string, userRole: string): boolean => {
  const permissions = getDocumentPermissions(document, userId, userRole);
  return permissions.canEdit;
};

export const isDocumentDeletable = (document: DocumentResponse, userId: string, userRole: string): boolean => {
  const permissions = getDocumentPermissions(document, userId, userRole);
  return permissions.canDelete;
};

export const canShareDocument = (document: DocumentResponse, userId: string, userRole: string): boolean => {
  const permissions = getDocumentPermissions(document, userId, userRole);
  return permissions.canShare;
};

export const validateDocumentUpload = (file: File): string | null => {
  // Vérifier la taille
  if (file.size > MAX_FILE_SIZE) {
    return `Le fichier est trop volumineux. Taille maximale: ${formatDocumentSize(MAX_FILE_SIZE)}`;
  }
  
  // Vérifier le type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return `Type de fichier non autorisé: ${file.type}`;
  }
  
  // Vérifier l'extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'gif', 'txt', 'csv'];
  
  if (!extension || !allowedExtensions.includes(extension)) {
    return `Extension de fichier non autorisée: .${extension}`;
  }
  
  return null;
};

export default {
  DocumentType,
  DOCUMENT_TYPES,
  DOCUMENT_CONTEXTS,
  MAX_FILE_SIZE,
  MAX_FILES_PER_UPLOAD,
  ALLOWED_FILE_TYPES,
  getDocumentPermissions,
  getDocumentContext,
  formatDocumentSize,
  getDocumentTypeIcon,
  getMimeTypeIcon,
  isDocumentEditable,
  isDocumentDeletable,
  canShareDocument,
  validateDocumentUpload
};