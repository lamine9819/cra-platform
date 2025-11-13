// src/services/documentService.ts - Version améliorée
import api from './api';
import { 
  DocumentResponse, 
  UploadFileRequest, 
  ShareDocumentRequest, 
  DocumentListQuery,
  DocumentListResponse,
  UploadResponse,
  DocumentType 
} from '../types/document.types';

export class DocumentService {
  
  // =============================================
  // UPLOAD DE DOCUMENTS
  // =============================================
  
  /**
   * Upload d'un fichier unique
   */
  static async uploadFile(
    file: File,
    documentData: Omit<UploadFileRequest, 'file'>
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Ajouter les métadonnées
    Object.entries(documentData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Upload de fichiers multiples
   */
  static async uploadMultipleFiles(
    files: File[],
    documentsData: Array<Omit<UploadFileRequest, 'file'>>
  ): Promise<UploadResponse> {
    const formData = new FormData();
    
    // Ajouter les fichiers
    files.forEach((file) => {
      formData.append('files', file);
    });

    // Ajouter les métadonnées pour chaque fichier
    documentsData.forEach((data, index) => {
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          const fieldName = `${key}[${index}]`;
          if (Array.isArray(value)) {
            formData.append(fieldName, JSON.stringify(value));
          } else {
            formData.append(fieldName, String(value));
          }
        }
      });
    });

    const response = await api.post('/documents/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  // =============================================
  // GESTION DES DOCUMENTS
  // =============================================

  /**
   * Lister les documents avec filtres
   */
  static async listDocuments(query?: DocumentListQuery): Promise<DocumentListResponse> {
    const params = new URLSearchParams();
    
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, String(v)));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    const response = await api.get(`/documents?${params.toString()}`);
    return response.data;
  }

  /**
   * Obtenir un document par ID
   */
  static async getDocumentById(id: string): Promise<{ success: boolean; data: DocumentResponse }> {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  }

  // =============================================
  // TÉLÉCHARGEMENT ET PARTAGE
  // =============================================

  /**
   * Télécharger un document
   */
  static async downloadDocument(id: string, filename: string): Promise<void> {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });

    // Créer un lien de téléchargement
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Partager un document
   */
  static async shareDocument(
    id: string, 
    shareData: ShareDocumentRequest
  ): Promise<{ success: boolean; message: string; data: any }> {
    const response = await api.post(`/documents/${id}/share`, shareData);
    return response.data;
  }

  /**
   * Supprimer un document
   */
  static async deleteDocument(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  }

  // =============================================
  // NOUVELLES FONCTIONNALITÉS - LIAISON
  // =============================================

  /**
   * Lier un document à un projet
   */
  static async linkToProject(
    documentId: string, 
    projectId: string
  ): Promise<{ success: boolean; message: string; data: DocumentResponse }> {
    const response = await api.post(`/documents/${documentId}/link/project`, { projectId });
    return response.data;
  }

  /**
   * Lier un document à une activité
   */
  static async linkToActivity(
    documentId: string, 
    activityId: string
  ): Promise<{ success: boolean; message: string; data: DocumentResponse }> {
    const response = await api.post(`/documents/${documentId}/link/activity`, { activityId });
    return response.data;
  }

  /**
   * Délier un document
   */
  static async unlinkDocument(
    documentId: string
  ): Promise<{ success: boolean; message: string; data: DocumentResponse }> {
    const response = await api.post(`/documents/${documentId}/unlink`);
    return response.data;
  }

  // =============================================
  // UTILITAIRES
  // =============================================

  /**
   * Obtenir les documents d'un projet
   */
  static async getProjectDocuments(projectId: string, query?: Omit<DocumentListQuery, 'projectId'>): Promise<DocumentListResponse> {
    const params = new URLSearchParams();
    
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, String(v)));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    const response = await api.get(`/documents/project/${projectId}?${params.toString()}`);
    return response.data;
  }

  /**
   * Obtenir les documents d'une activité
   */
  static async getActivityDocuments(activityId: string, query?: Omit<DocumentListQuery, 'activityId'>): Promise<DocumentListResponse> {
    const params = new URLSearchParams();
    
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, String(v)));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    const response = await api.get(`/documents/activity/${activityId}?${params.toString()}`);
    return response.data;
  }

  /**
   * Obtenir les documents d'une tâche
   */
  static async getTaskDocuments(taskId: string): Promise<DocumentListResponse> {
    return this.listDocuments({ taskId });
  }

  /**
   * Obtenir les documents publics
   */
  static async getPublicDocuments(): Promise<DocumentListResponse> {
    return this.listDocuments({ isPublic: true });
  }

  /**
   * Obtenir mes documents
   */
  static async getMyDocuments(): Promise<DocumentListResponse> {
    const userData = JSON.parse(localStorage.getItem('cra_user_data') || '{}');
    return this.listDocuments({ ownerId: userData.id });
  }

  /**
   * Rechercher des documents
   */
  static async searchDocuments(searchTerm: string): Promise<DocumentListResponse> {
    return this.listDocuments({ search: searchTerm });
  }

  /**
   * Filtrer par type de document
   */
  static async getDocumentsByType(type: DocumentType): Promise<DocumentListResponse> {
    return this.listDocuments({ type });
  }

  /**
   * Filtrer par tags
   */
  static async getDocumentsByTags(tags: string[]): Promise<DocumentListResponse> {
    return this.listDocuments({ tags });
  }

  /**
   * Obtenir les statistiques des documents
   */
  static async getDocumentStats(): Promise<{
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
  }> {
    const response = await api.get('/documents/stats/overview');
    return response.data;
  }

  // =============================================
  // MÉTHODES HELPER POUR LES COMPOSANTS
  // =============================================

  /**
   * Obtenir les documents liés à un contexte (projet/activité/tâche)
   */
  static async getContextDocuments(context: {
    type: 'project' | 'activity' | 'task';
    id: string;
  }): Promise<DocumentListResponse> {
    switch (context.type) {
      case 'project':
        return this.getProjectDocuments(context.id);
      case 'activity':
        return this.getActivityDocuments(context.id);
      case 'task':
        return this.getTaskDocuments(context.id);
      default:
        throw new Error('Type de contexte non supporté');
    }
  }

  /**
   * Upload d'un document avec liaison automatique à un contexte
   */
  static async uploadDocumentToContext(
    file: File,
    documentData: Omit<UploadFileRequest, 'file'>,
    context: {
      type: 'project' | 'activity' | 'task';
      id: string;
    }
  ): Promise<UploadResponse> {
    // Ajouter le contexte aux données du document
    const contextData = {
      ...documentData,
      [`${context.type}Id`]: context.id
    };

    return this.uploadFile(file, contextData);
  }

  /**
   * Partager un document avec tous les membres d'un projet
   */
  static async shareWithProjectMembers(
    documentId: string,
    projectId: string,
    permissions: { canEdit?: boolean; canDelete?: boolean } = {}
  ): Promise<{ success: boolean; message: string; data: any }> {
    // D'abord, récupérer les participants du projet
    const projectResponse = await api.get(`/projects/${projectId}`);
    const project = projectResponse.data.data;
    
    // Extraire les IDs des participants actifs
    const participantIds = project.participants
      ?.filter((p: any) => p.isActive && p.user.id !== project.creatorId)
      .map((p: any) => p.user.id) || [];
    
    // Ajouter le créateur du projet
    const userIds = [project.creatorId, ...participantIds];
    
    return this.shareDocument(documentId, {
      userIds,
      canEdit: permissions.canEdit || false,
      canDelete: permissions.canDelete || false
    });
  }
}

export default DocumentService;