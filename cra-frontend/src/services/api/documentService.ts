// src/services/api/documentService.ts
import api from '../api';
import {
  DocumentResponse,
  DocumentListQuery,
  DocumentListResponse,
  UploadFileRequest,
  ShareDocumentRequest,
  DocumentStatsResponse,
  UploadResponse,
} from '../../types/document.types';

const BASE_URL = '/documents';

export const documentService = {
  // =============================================
  // LISTE ET RECHERCHE
  // =============================================

  /**
   * Liste les documents avec filtres
   */
  async listDocuments(query?: DocumentListQuery): Promise<DocumentListResponse> {
    const response = await api.get<DocumentListResponse>(BASE_URL, { params: query });
    return response.data;
  },

  /**
   * Obtenir un document par ID
   */
  async getDocumentById(id: string): Promise<DocumentResponse> {
    const response = await api.get<{ success: boolean; data: DocumentResponse }>(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  /**
   * Obtenir les statistiques des documents
   */
  async getStats(): Promise<DocumentStatsResponse['data']> {
    const response = await api.get<DocumentStatsResponse>(`${BASE_URL}/stats/overview`);
    return response.data.data;
  },

  // =============================================
  // UPLOAD
  // =============================================

  /**
   * Upload un fichier unique
   */
  async uploadDocument(
    file: File,
    data: UploadFileRequest,
    onProgress?: (progress: number) => void
  ): Promise<DocumentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', data.title);
    formData.append('type', data.type || 'AUTRE');

    if (data.description) formData.append('description', data.description);
    if (data.tags) formData.append('tags', JSON.stringify(data.tags));
    if (data.isPublic !== undefined) formData.append('isPublic', String(data.isPublic));
    if (data.projectId) formData.append('projectId', data.projectId);
    if (data.activityId) formData.append('activityId', data.activityId);
    if (data.taskId) formData.append('taskId', data.taskId);
    if (data.seminarId) formData.append('seminarId', data.seminarId);

    const response = await api.post<UploadResponse>(`${BASE_URL}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data.data as DocumentResponse;
  },

  /**
   * Upload multiple files
   */
  async uploadMultipleDocuments(
    files: File[],
    dataArray: UploadFileRequest[],
    onProgress?: (progress: number) => void
  ): Promise<DocumentResponse[]> {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append('files', file);
    });

    dataArray.forEach((data, index) => {
      formData.append(`title[${index}]`, data.title);
      formData.append(`type[${index}]`, data.type || 'AUTRE');
      if (data.description) formData.append(`description[${index}]`, data.description);
      if (data.tags) formData.append(`tags[${index}]`, JSON.stringify(data.tags));
      if (data.isPublic !== undefined) formData.append(`isPublic[${index}]`, String(data.isPublic));
    });

    // Liens communs pour tous les fichiers
    if (dataArray[0]?.projectId) formData.append('projectId', dataArray[0].projectId);
    if (dataArray[0]?.activityId) formData.append('activityId', dataArray[0].activityId);
    if (dataArray[0]?.taskId) formData.append('taskId', dataArray[0].taskId);

    const response = await api.post<UploadResponse>(`${BASE_URL}/upload/multiple`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data.data as DocumentResponse[];
  },

  // =============================================
  // T�L�CHARGEMENT
  // =============================================

  /**
   * T�l�charger un document
   */
  async downloadDocument(id: string, filename: string): Promise<void> {
    // Construire l'URL relative pour passer par le proxy Vite
    const downloadUrl = `/api${BASE_URL}/${id}/download`;

    try {
      // Utiliser fetch pour télécharger le fichier
      // Le cookie HttpOnly sera automatiquement envoyé
      const response = await fetch(downloadUrl, {
        credentials: 'include' // Important pour envoyer les cookies
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      // Récupérer le blob
      const blob = await response.blob();

      // Créer un lien temporaire et déclencher le téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      throw error;
    }
  },

  // =============================================
  // PARTAGE
  // =============================================

  /**
   * Partager un document avec des utilisateurs
   */
  async shareDocument(id: string, data: ShareDocumentRequest): Promise<any> {
    const response = await api.post(`${BASE_URL}/${id}/share`, data);
    return response.data;
  },

  // =============================================
  // SUPPRESSION
  // =============================================

  /**
   * Supprimer un document
   */
  async deleteDocument(id: string): Promise<void> {
    await api.delete(`${BASE_URL}/${id}`);
  },

  // =============================================
  // DOCUMENTS PAR ENTIT�
  // =============================================

  /**
   * Obtenir les documents d'un projet
   */
  async getProjectDocuments(projectId: string, query?: DocumentListQuery): Promise<DocumentResponse[]> {
    const response = await api.get<{ success: boolean; data: DocumentResponse[] }>(
      `${BASE_URL}/project/${projectId}`,
      { params: query }
    );
    return response.data.data;
  },

  /**
   * Obtenir les documents d'une activit�
   */
  async getActivityDocuments(activityId: string, query?: DocumentListQuery): Promise<DocumentResponse[]> {
    const response = await api.get<{ success: boolean; data: DocumentResponse[] }>(
      `${BASE_URL}/activity/${activityId}`,
      { params: query }
    );
    return response.data.data;
  },

  /**
   * Obtenir les documents d'une t�che
   */
  async getTaskDocuments(taskId: string, query?: DocumentListQuery): Promise<DocumentResponse[]> {
    const response = await api.get<{ success: boolean; data: DocumentResponse[] }>(
      `${BASE_URL}/task/${taskId}`,
      { params: query }
    );
    return response.data.data;
  },

  /**
   * Obtenir les documents d'un s�minaire
   */
  async getSeminarDocuments(seminarId: string, query?: DocumentListQuery): Promise<DocumentResponse[]> {
    const response = await api.get<{ success: boolean; data: DocumentResponse[] }>(
      `${BASE_URL}/seminar/${seminarId}`,
      { params: query }
    );
    return response.data.data;
  },

  // =============================================
  // NOUVELLES MÉTHODES - GESTION AVANCÉE
  // =============================================

  /**
   * Mettre à jour les métadonnées d'un document
   */
  async updateDocumentMetadata(
    id: string,
    data: {
      title?: string;
      description?: string;
      type?: string;
      tags?: string[];
      isPublic?: boolean;
    }
  ): Promise<DocumentResponse> {
    const response = await api.patch<{ success: boolean; data: DocumentResponse }>(
      `${BASE_URL}/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Lier un document à une entité
   */
  async linkDocument(
    documentId: string,
    entityType: 'project' | 'activity' | 'task' | 'seminar' | 'training' | 'internship' | 'supervision' | 'knowledgeTransfer' | 'event',
    entityId: string
  ): Promise<DocumentResponse> {
    const response = await api.post<{ success: boolean; data: DocumentResponse }>(
      `${BASE_URL}/${documentId}/link`,
      { entityType, entityId }
    );
    return response.data.data;
  },

  /**
   * Délier un document (de toutes les entités ou d'une spécifique)
   */
  async unlinkDocument(
    documentId: string,
    entityType?: string,
    entityId?: string
  ): Promise<DocumentResponse> {
    const response = await api.delete<{ success: boolean; data: DocumentResponse }>(
      `${BASE_URL}/${documentId}/link`,
      {
        data: entityType ? { entityType, entityId } : undefined
      }
    );
    return response.data.data;
  },

  /**
   * Obtenir les documents dans la corbeille
   */
  async getTrashDocuments(query?: {
    page?: number;
    limit?: number;
  }): Promise<{
    data: DocumentResponse[];
    pagination: any;
  }> {
    const response = await api.get<{
      success: boolean;
      data: DocumentResponse[];
      pagination: any;
    }>(`${BASE_URL}/trash`, { params: query });
    return {
      data: response.data.data,
      pagination: response.data.pagination
    };
  },

  /**
   * Restaurer un document supprimé
   */
  async restoreDocument(id: string): Promise<DocumentResponse> {
    const response = await api.post<{ success: boolean; data: DocumentResponse }>(
      `${BASE_URL}/${id}/restore`
    );
    return response.data.data;
  },

  /**
   * Supprimer définitivement un document
   */
  async permanentDeleteDocument(id: string): Promise<void> {
    await api.delete(`${BASE_URL}/${id}/permanent`);
  },

  /**
   * Vider la corbeille (documents > 30 jours)
   */
  async emptyTrash(): Promise<{ deletedCount: number }> {
    const response = await api.delete<{
      success: boolean;
      data: { deletedCount: number };
    }>(`${BASE_URL}/trash/empty`);
    return response.data.data;
  },

  /**
   * Obtenir la liste des partages d'un document
   */
  async getDocumentShares(documentId: string): Promise<any[]> {
    const response = await api.get<{ success: boolean; data: any[] }>(
      `${BASE_URL}/${documentId}/shares`
    );
    return response.data.data;
  },

  /**
   * Révoquer un partage
   */
  async revokeShare(documentId: string, shareId: string): Promise<void> {
    await api.delete(`${BASE_URL}/${documentId}/shares/${shareId}`);
  },

  /**
   * Mettre à jour les permissions d'un partage
   */
  async updateSharePermissions(
    documentId: string,
    shareId: string,
    permissions: {
      canEdit?: boolean;
      canDelete?: boolean;
    }
  ): Promise<any> {
    const response = await api.patch<{ success: boolean; data: any }>(
      `${BASE_URL}/${documentId}/shares/${shareId}`,
      permissions
    );
    return response.data.data;
  },

  /**
   * Ajouter un document aux favoris
   */
  async addToFavorites(documentId: string): Promise<void> {
    await api.post(`${BASE_URL}/${documentId}/favorite`);
  },

  /**
   * Retirer un document des favoris
   */
  async removeFromFavorites(documentId: string): Promise<void> {
    await api.delete(`${BASE_URL}/${documentId}/favorite`);
  },

  /**
   * Obtenir les documents favoris
   */
  async getFavoriteDocuments(query?: {
    page?: number;
    limit?: number;
  }): Promise<{
    data: DocumentResponse[];
    pagination: any;
  }> {
    const response = await api.get<{
      success: boolean;
      data: DocumentResponse[];
      pagination: any;
    }>(`${BASE_URL}/favorites`, { params: query });
    return {
      data: response.data.data,
      pagination: response.data.pagination
    };
  },

  /**
   * Obtenir l'URL de preview (affichage dans le browser)
   */
  getPreviewUrl(documentId: string): string {
    // Utiliser une URL relative pour passer par le proxy Vite
    // Le cookie HttpOnly sera automatiquement envoyé par le navigateur
    return `/api${BASE_URL}/${documentId}/preview`;
  },

  /**
   * Preview un document (ouvre dans nouvel onglet)
   */
  async previewDocument(documentId: string): Promise<void> {
    const url = this.getPreviewUrl(documentId);
    window.open(url, '_blank');
  },
};

export default documentService;
