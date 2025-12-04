// src/services/formApi.ts - Service API pour les formulaires

import apiClient from './api';
import {
  Form,
  CreateFormRequest,
  UpdateFormRequest,
  SubmitFormResponseRequest,
  FormResponseData,
  ShareFormRequest,
  PublicShareInfo,
  FormShare,
  FormComment,
  AddCommentRequest,
  ExportOptions,
  SyncStatus,
  SyncSummary,
  FormPreview,
  ApiResponse,
  ResponsePhoto,
} from '../types/form.types';

const API_BASE = '/forms';

// =============================================
// GESTION DES FORMULAIRES
// =============================================

export const formApi = {
  /**
   * Créer un nouveau formulaire
   */
  createForm: async (data: CreateFormRequest): Promise<Form> => {
    const response = await apiClient.post<ApiResponse<Form>>(API_BASE, data);
    return response.data.data!;
  },

  /**
   * Lister mes formulaires et ceux auxquels j'ai accès
   */
  listForms: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ forms: Form[]; pagination: any }> => {
    const response = await apiClient.get<ApiResponse<Form[]>>(API_BASE, { params });
    return {
      forms: response.data.data!,
      pagination: response.data.pagination,
    };
  },

  /**
   * Obtenir un formulaire par ID
   */
  getFormById: async (id: string, includeComments: boolean = false): Promise<Form> => {
    const response = await apiClient.get<ApiResponse<Form>>(
      `${API_BASE}/${id}`,
      { params: { includeComments } }
    );
    return response.data.data!;
  },

  /**
   * Mettre à jour un formulaire
   */
  updateForm: async (id: string, data: UpdateFormRequest): Promise<Form> => {
    const response = await apiClient.patch<ApiResponse<Form>>(
      `${API_BASE}/${id}`,
      data
    );
    return response.data.data!;
  },

  /**
   * Supprimer un formulaire
   */
  deleteForm: async (id: string): Promise<void> => {
    await apiClient.delete(`${API_BASE}/${id}`);
  },

  /**
   * Dupliquer un formulaire
   */
  duplicateForm: async (id: string): Promise<Form> => {
    const original = await formApi.getFormById(id);
    const duplicateData: CreateFormRequest = {
      title: `${original.title} (Copie)`,
      description: original.description || undefined,
      schema: original.schema,
      activityId: original.activity?.id,
      isActive: true,
    };
    return formApi.createForm(duplicateData);
  },

  /**
   * Prévisualiser un formulaire
   */
  previewForm: async (schema: any): Promise<FormPreview> => {
    const response = await apiClient.post<ApiResponse<FormPreview>>(
      `${API_BASE}/preview`,
      { schema }
    );
    return response.data.data!;
  },

  // =============================================
  // PARTAGE DE FORMULAIRES
  // =============================================

  /**
   * Partager un formulaire avec un utilisateur
   */
  shareFormWithUser: async (formId: string, data: ShareFormRequest): Promise<FormShare> => {
    const response = await apiClient.post<ApiResponse<FormShare>>(
      `${API_BASE}/${formId}/share`,
      data
    );
    return response.data.data!;
  },

  /**
   * Créer un lien de partage public
   */
  createPublicShareLink: async (
    formId: string,
    options?: { maxSubmissions?: number; expiresAt?: string }
  ): Promise<PublicShareInfo> => {
    const response = await apiClient.post<ApiResponse<PublicShareInfo>>(
      `${API_BASE}/${formId}/public-link`,
      options
    );
    return response.data.data!;
  },

  /**
   * Obtenir les partages d'un formulaire
   */
  getFormShares: async (formId: string): Promise<FormShare[]> => {
    const response = await apiClient.get<ApiResponse<FormShare[]>>(
      `${API_BASE}/${formId}/shares`
    );
    return response.data.data!;
  },

  /**
   * Supprimer un partage
   */
  removeFormShare: async (shareId: string): Promise<void> => {
    await apiClient.delete(`${API_BASE}/shares/${shareId}`);
  },

  /**
   * Obtenir un formulaire via lien public
   */
  getFormByPublicLink: async (shareToken: string): Promise<{
    form: Form;
    canCollect: boolean;
    remainingSubmissions: number | null;
  }> => {
    const response = await apiClient.get<ApiResponse>(
      `${API_BASE}/public/${shareToken}`
    );
    return response.data.data!;
  },

  // =============================================
  // COLLECTE DE DONNÉES
  // =============================================

  /**
   * Soumettre une réponse à un formulaire
   */
  submitFormResponse: async (
    formId: string,
    data: SubmitFormResponseRequest
  ): Promise<FormResponseData> => {
    const response = await apiClient.post<ApiResponse<FormResponseData>>(
      `${API_BASE}/${formId}/responses`,
      data
    );
    return response.data.data!;
  },

  /**
   * Soumettre une réponse via lien public
   */
  submitPublicFormResponse: async (
    shareToken: string,
    data: SubmitFormResponseRequest
  ): Promise<FormResponseData> => {
    const response = await apiClient.post<ApiResponse<FormResponseData>>(
      `${API_BASE}/public/${shareToken}/submit`,
      data
    );
    return response.data.data!;
  },

  /**
   * Obtenir les réponses d'un formulaire
   */
  getFormResponses: async (
    formId: string,
    params?: {
      page?: number;
      limit?: number;
      collectorType?: 'USER' | 'SHARED_USER' | 'PUBLIC' | 'ALL';
    }
  ): Promise<{ responses: FormResponseData[]; pagination: any }> => {
    const response = await apiClient.get<ApiResponse<FormResponseData[]>>(
      `${API_BASE}/${formId}/responses`,
      { params }
    );
    return {
      responses: response.data.data!,
      pagination: response.data.pagination,
    };
  },

  // =============================================
  // GESTION DES PHOTOS
  // =============================================

  /**
   * Upload une photo pour un champ
   */
  uploadPhoto: async (file: File): Promise<{
    filename: string;
    url: string;
    size: number;
  }> => {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await apiClient.post<ApiResponse>(
      `${API_BASE}/upload-photo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data!;
  },

  /**
   * Upload plusieurs photos
   */
  uploadMultiplePhotos: async (files: File[]): Promise<Array<{
    filename: string;
    url: string;
    size: number;
  }>> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('photos', file);
    });

    const response = await apiClient.post<ApiResponse>(
      `${API_BASE}/upload-photos`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data!;
  },

  /**
   * Obtenir les photos d'une réponse
   */
  getResponsePhotos: async (responseId: string): Promise<ResponsePhoto[]> => {
    const response = await apiClient.get<ApiResponse<ResponsePhoto[]>>(
      `${API_BASE}/responses/${responseId}/photos`
    );
    return response.data.data!;
  },

  // =============================================
  // SYNCHRONISATION OFFLINE
  // =============================================

  /**
   * Stocker des données pour synchronisation offline
   */
  storeOfflineData: async (data: {
    formId: string;
    deviceId: string;
    data: any;
  }): Promise<void> => {
    await apiClient.post(`${API_BASE}/offline/store`, data);
  },

  /**
   * Synchroniser les données offline
   */
  syncOfflineData: async (deviceId: string): Promise<SyncSummary> => {
    const response = await apiClient.post<ApiResponse<SyncSummary>>(
      `${API_BASE}/offline/sync`,
      { deviceId }
    );
    return response.data.data!;
  },

  /**
   * Obtenir le statut de synchronisation
   */
  getOfflineSyncStatus: async (deviceId: string): Promise<SyncStatus> => {
    const response = await apiClient.get<ApiResponse<SyncStatus>>(
      `${API_BASE}/offline/status/${deviceId}`
    );
    return response.data.data!;
  },

  // =============================================
  // EXPORT DES DONNÉES
  // =============================================

  /**
   * Exporter les réponses d'un formulaire
   */
  exportResponses: async (
    formId: string,
    options: ExportOptions
  ): Promise<Blob> => {
    const response = await apiClient.get(
      `${API_BASE}/${formId}/export`,
      {
        params: options,
        responseType: 'blob',
      }
    );
    return response.data;
  },

  /**
   * Télécharger l'export
   */
  downloadExport: async (
    formId: string,
    options: ExportOptions,
    filename?: string
  ): Promise<void> => {
    const blob = await formApi.exportResponses(formId, options);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `export_${formId}.${options.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // =============================================
  // COMMENTAIRES
  // =============================================

  /**
   * Ajouter un commentaire
   */
  addComment: async (formId: string, data: AddCommentRequest): Promise<FormComment> => {
    const response = await apiClient.post<ApiResponse<FormComment>>(
      `${API_BASE}/${formId}/comments`,
      data
    );
    return response.data.data!;
  },

  /**
   * Obtenir les commentaires d'un formulaire
   */
  getFormComments: async (
    formId: string,
    params?: { page?: number; limit?: number; orderBy?: 'asc' | 'desc' }
  ): Promise<{ comments: FormComment[]; pagination: any }> => {
    const response = await apiClient.get<ApiResponse<FormComment[]>>(
      `${API_BASE}/${formId}/comments`,
      { params }
    );
    return {
      comments: response.data.data!,
      pagination: response.data.pagination,
    };
  },

  // =============================================
  // DASHBOARD ET STATISTIQUES
  // =============================================

  /**
   * Obtenir le dashboard du collecteur
   */
  getCollectorDashboard: async (): Promise<{
    myForms: Form[];
    sharedForms: Form[];
    statistics: {
      myResponses: number;
      totalPhotos: number;
    };
  }> => {
    const response = await apiClient.get<ApiResponse>(
      `${API_BASE}/dashboard/collector`
    );
    return response.data.data!;
  },
};

export default formApi;
