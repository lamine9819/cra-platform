// src/services/formsApi.ts - Version corrigée avec gestion des erreurs
import api from './api';
import { isValidCuid, sanitizeFormData } from '../utils/validation';

// Types et interfaces (identiques)
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

export interface Form {
  id: string;
  title: string;
  description?: string;
  schema: FormSchema;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  responses?: FormResponse[];
  comments?: FormComment[];
  _count?: {
    responses: number;
    comments: number;
  };
}

export interface FormResponse {
  id: string;
  data: Record<string, any>;
  submittedAt: string;
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

export interface FormComment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  formId: string;
}

export interface FormFilters {
  search?: string;
  activityId?: string;
  creatorId?: string;
  isActive?: boolean;
  status?: 'active' | 'inactive' | 'all';
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
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
  activityId?: string;
}

export interface SubmitFormResponseRequest {
  data: Record<string, any>;
}

export interface FormStats {
  total: number;
  active: number;
  inactive: number;
  myForms: number;
  totalResponses: number;
  totalComments: number;
  formsWithResponses: number;
  responseRate: number;
  recentForms: Array<{
    id: string;
    title: string;
    createdAt: string;
    _count: {
      responses: number;
      comments: number;
    };
  }>;
}

// Fonction pour traiter les erreurs de validation du backend
function handleValidationError(error: any): string {
  if (error.response?.data?.message) {
    const message = error.response.data.message;
    
    // Erreurs spécifiques liées à activityId
    if (message.includes('activityId') || message.includes('Invalid cuid')) {
      return 'L\'activité sélectionnée n\'est pas valide. Veuillez en choisir une autre ou laisser le champ vide.';
    }
    
    // Erreurs de validation Zod
    if (message.includes('ZodError') || Array.isArray(error.response.data.errors)) {
      const errors = error.response.data.errors || [];
      const formattedErrors = errors.map((err: any) => {
        if (err.path && err.path.includes('activityId')) {
          return 'L\'ID de l\'activité n\'est pas au bon format.';
        }
        return err.message || 'Erreur de validation';
      });
      return formattedErrors.join(', ');
    }
    
    return message;
  }
  
  return 'Une erreur inattendue s\'est produite';
}

// Service API Forms corrigé
class FormsApiService {
  private baseUrl = '/forms';

  // Créer un nouveau formulaire avec validation côté client
  async createForm(data: CreateFormRequest): Promise<Form> {
    try {
      // Nettoyer les données avant envoi
      const sanitizedData = sanitizeFormData(data);
      
      console.log('Creating form with data:', sanitizedData);
      
      const response = await api.post(this.baseUrl, sanitizedData);
      return response.data.data;
    } catch (error: any) {
      console.error('Error creating form:', error);
      const friendlyMessage = handleValidationError(error);
      throw new Error(friendlyMessage);
    }
  }

  // Lister les formulaires avec filtres
  async listForms(filters: FormFilters = {}): Promise<{
    forms: Form[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Validation spéciale pour activityId
          if (key === 'activityId' && !isValidCuid(value.toString())) {
            console.warn('Skipping invalid activityId in filters:', value);
            return;
          }
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`${this.baseUrl}?${params.toString()}`);
      
      return {
        forms: response.data.data || [],
        pagination: response.data.pagination || {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      };
    } catch (error: any) {
      const friendlyMessage = handleValidationError(error);
      throw new Error(friendlyMessage);
    }
  }

  // Obtenir un formulaire par ID
  async getFormById(id: string, includeComments: boolean = false): Promise<Form> {
    try {
      const params = includeComments ? '?includeComments=true' : '';
      const response = await api.get(`${this.baseUrl}/${id}${params}`);
      return response.data.data;
    } catch (error: any) {
      const friendlyMessage = handleValidationError(error);
      throw new Error(friendlyMessage);
    }
  }

  // Mettre à jour un formulaire avec validation
  async updateForm(id: string, data: UpdateFormRequest): Promise<Form> {
    try {
      // Nettoyer les données avant envoi
      const sanitizedData = sanitizeFormData(data);
      
      console.log('Updating form with data:', sanitizedData);
      
      const response = await api.patch(`${this.baseUrl}/${id}`, sanitizedData);
      return response.data.data;
    } catch (error: any) {
      console.error('Error updating form:', error);
      const friendlyMessage = handleValidationError(error);
      throw new Error(friendlyMessage);
    }
  }

  // Supprimer un formulaire
  async deleteForm(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      const friendlyMessage = handleValidationError(error);
      throw new Error(friendlyMessage);
    }
  }

  // Mes formulaires
  async getMyForms(filters: Omit<FormFilters, 'creatorId'> = {}): Promise<{
    forms: Form[];
    pagination: any;
  }> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Validation spéciale pour activityId
          if (key === 'activityId' && !isValidCuid(value.toString())) {
            console.warn('Skipping invalid activityId in my-forms filters:', value);
            return;
          }
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`${this.baseUrl}/my-forms?${params.toString()}`);
      
      return {
        forms: response.data.data || [],
        pagination: response.data.pagination
      };
    } catch (error: any) {
      const friendlyMessage = handleValidationError(error);
      throw new Error(friendlyMessage);
    }
  }

  // Soumettre une réponse au formulaire
  async submitFormResponse(formId: string, data: SubmitFormResponseRequest): Promise<FormResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/${formId}/responses`, data);
      return response.data.data;
    } catch (error: any) {
      const friendlyMessage = handleValidationError(error);
      throw new Error(friendlyMessage);
    }
  }

  // Obtenir les réponses d'un formulaire
  async getFormResponses(formId: string, filters: {
    page?: number;
    limit?: number;
    respondentId?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    responses: FormResponse[];
    pagination: any;
  }> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`${this.baseUrl}/${formId}/responses?${params.toString()}`);
      
      return {
        responses: response.data.data || [],
        pagination: response.data.pagination
      };
    } catch (error: any) {
      const friendlyMessage = handleValidationError(error);
      throw new Error(friendlyMessage);
    }
  }

  // Activer/désactiver un formulaire
  async toggleFormStatus(id: string): Promise<Form> {
    try {
      const response = await api.patch(`${this.baseUrl}/${id}/toggle-status`);
      return response.data.data;
    } catch (error: any) {
      const friendlyMessage = handleValidationError(error);
      throw new Error(friendlyMessage);
    }
  }

  // Dupliquer un formulaire
  async duplicateForm(id: string, title?: string): Promise<Form> {
    try {
      const response = await api.post(`${this.baseUrl}/${id}/duplicate`, { title });
      return response.data.data;
    } catch (error: any) {
      const friendlyMessage = handleValidationError(error);
      throw new Error(friendlyMessage);
    }
  }

  // Exporter les réponses
  async exportResponses(formId: string, format: 'xlsx' | 'csv' = 'xlsx'): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/${formId}/export?format=${format}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      const friendlyMessage = handleValidationError(error);
      throw new Error(friendlyMessage);
    }
  }

  // Obtenir les statistiques des formulaires
  async getFormStats(): Promise<FormStats> {
    try {
      const response = await api.get(`${this.baseUrl}/stats`);
      return response.data.data;
    } catch (error: any) {
      const friendlyMessage = handleValidationError(error);
      throw new Error(friendlyMessage);
    }
  }

  // Gestion des commentaires
  async addComment(formId: string, content: string): Promise<FormComment> {
    try {
      const response = await api.post(`${this.baseUrl}/${formId}/comments`, { content });
      return response.data.data;
    } catch (error: any) {
      const friendlyMessage = handleValidationError(error);
      throw new Error(friendlyMessage);
    }
  }

  async getFormComments(formId: string, filters: {
    page?: number;
    limit?: number;
    orderBy?: 'asc' | 'desc';
  } = {}): Promise<{
    comments: FormComment[];
    pagination: any;
  }> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null ) {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`${this.baseUrl}/${formId}/comments?${params.toString()}`);
      
      return {
        comments: response.data.data || [],
        pagination: response.data.pagination
      };
    } catch (error: any) {
      const friendlyMessage = handleValidationError(error);
      throw new Error(friendlyMessage);
    }
  }

  async updateComment(commentId: string, content: string): Promise<FormComment> {
    try {
      const response = await api.patch(`${this.baseUrl}/comments/${commentId}`, { content });
      return response.data.data;
    } catch (error: any) {
      const friendlyMessage = handleValidationError(error);
      throw new Error(friendlyMessage);
    }
  }

  async deleteComment(commentId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/comments/${commentId}`);
    } catch (error: any) {
      const friendlyMessage = handleValidationError(error);
      throw new Error(friendlyMessage);
    }
  }

  // Validation du schéma avec gestion d'erreur améliorée
  async validateFormSchema(schema: FormSchema): Promise<{ isValid: boolean; schema: FormSchema }> {
    try {
      const response = await api.post(`${this.baseUrl}/validate-schema`, { schema });
      return response.data.data;
    } catch (error: any) {
      console.error('Schema validation error:', error);
      const friendlyMessage = handleValidationError(error);
      throw new Error(friendlyMessage);
    }
  }

  // Prévisualiser un formulaire
  async previewForm(schema: FormSchema): Promise<{ preview: FormSchema; isValid: boolean }> {
    try {
      const response = await api.post(`${this.baseUrl}/preview`, { schema });
      return response.data.data;
    } catch (error: any) {
      const friendlyMessage = handleValidationError(error);
      throw new Error(friendlyMessage);
    }
  }

  // Obtenir les templates
  async getTemplates(): Promise<Form[]> {
    try {
      const response = await api.get(`${this.baseUrl}/templates`);
      return response.data.data || [];
    } catch (error: any) {
      const friendlyMessage = handleValidationError(error);
      throw new Error(friendlyMessage);
    }
  }

  // Créer un template
  async createTemplate(name: string, description: string, schema: FormSchema, category?: string): Promise<Form> {
    try {
      const response = await api.post(`${this.baseUrl}/templates`, {
        name,
        description,
        schema,
        category
      });
      return response.data.data;
    } catch (error: any) {
      const friendlyMessage = handleValidationError(error);
      throw new Error(friendlyMessage);
    }
  }

  // Rechercher des formulaires
  async searchForms(query: string, limit: number = 10): Promise<Form[]> {
    try {
      const response = await this.listForms({
        search: query,
        limit,
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      });
      return response.forms;
    } catch (error: any) {
      const friendlyMessage = handleValidationError(error);
      throw new Error(friendlyMessage);
    }
  }

  // Obtenir les formulaires récents
  async getRecentForms(limit: number = 10): Promise<Form[]> {
    try {
      const response = await this.listForms({
        limit,
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      });
      return response.forms;
    } catch (error: any) {
      const friendlyMessage = handleValidationError(error);
      throw new Error(friendlyMessage);
    }
  }

  // Obtenir les formulaires d'une activité
  async getFormsByActivity(activityId: string): Promise<Form[]> {
    try {
      // Valider l'activityId avant d'envoyer la requête
      if (!isValidCuid(activityId)) {
        throw new Error('L\'ID de l\'activité n\'est pas valide');
      }
      
      const response = await this.listForms({
        activityId,
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      return response.forms;
    } catch (error: any) {
      const friendlyMessage = handleValidationError(error);
      throw new Error(friendlyMessage);
    }
  }

  // Rechercher dans les commentaires
  async searchFormComments(formId: string, search: string, filters: {
    page?: number;
    limit?: number;
  } = {}): Promise<{
    comments: FormComment[];
    pagination: any;
  }> {
    try {
      const params = new URLSearchParams({
        search,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => 
            value !== undefined && value !== null 
          ).map(([key, value]) => [key, value.toString()])
        )
      });

      const response = await api.get(`${this.baseUrl}/${formId}/comments/search?${params.toString()}`);
      
      return {
        comments: response.data.data || [],
        pagination: response.data.pagination
      };
    } catch (error: any) {
      const friendlyMessage = handleValidationError(error);
      throw new Error(friendlyMessage);
    }
  }
}

// Export singleton
export const formsApi = new FormsApiService();
export default formsApi;