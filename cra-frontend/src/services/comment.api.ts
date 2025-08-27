// src/services/comment.api.ts
import api from './api';
import {
  CreateCommentRequest,
  UpdateCommentRequest,
  CommentListQuery,
  CommentResponse,
  CommentListResponse,
  CommentStatsResponse,
} from '../types/comment.types';

export class CommentApiService {
  private baseUrl = '/comments';

  // Créer un commentaire
  async createComment(data: CreateCommentRequest): Promise<CommentResponse> {
    const response = await api.post(this.baseUrl, data);
    return response.data.data;
  }

  // Lister les commentaires avec filtres
  async listComments(params?: CommentListQuery): Promise<CommentListResponse> {
    const response = await api.get(this.baseUrl, { params });
    return {
      comments: response.data.data,
      pagination: response.data.pagination,
    };
  }

  // Obtenir un commentaire par ID
  async getCommentById(id: string): Promise<CommentResponse> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data.data;
  }

  // Mettre à jour un commentaire
  async updateComment(id: string, data: UpdateCommentRequest): Promise<CommentResponse> {
    const response = await api.patch(`${this.baseUrl}/${id}`, data);
    return response.data.data;
  }

  // Supprimer un commentaire
  async deleteComment(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  // Obtenir les statistiques des commentaires
  async getCommentStats(targetType?: string, targetId?: string): Promise<CommentStatsResponse> {
    const params: any = {};
    if (targetType) params.targetType = targetType;
    if (targetId) params.targetId = targetId;
    
    const response = await api.get(`${this.baseUrl}/stats`, { params });
    return response.data.data;
  }

  // Obtenir les commentaires d'un projet
  async getProjectComments(
    projectId: string,
    params?: Omit<CommentListQuery, 'targetType' | 'targetId'>
  ): Promise<CommentListResponse> {
    const response = await api.get(`${this.baseUrl}/projects/${projectId}`, { params });
    return {
      comments: response.data.data,
      pagination: response.data.pagination,
    };
  }

  // Obtenir les commentaires d'une activité
  async getActivityComments(
    activityId: string,
    params?: Omit<CommentListQuery, 'targetType' | 'targetId'>
  ): Promise<CommentListResponse> {
    const response = await api.get(`${this.baseUrl}/activities/${activityId}`, { params });
    return {
      comments: response.data.data,
      pagination: response.data.pagination,
    };
  }

  // Obtenir les commentaires d'une tâche
  async getTaskComments(
    taskId: string,
    params?: Omit<CommentListQuery, 'targetType' | 'targetId'>
  ): Promise<CommentListResponse> {
    const response = await api.get(`${this.baseUrl}/tasks/${taskId}`, { params });
    return {
      comments: response.data.data,
      pagination: response.data.pagination,
    };
  }
}

// Instance singleton
export const commentApiService = new CommentApiService();