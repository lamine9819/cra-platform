// src/hooks/useComments.ts
import { useState, useEffect, useCallback } from 'react';
import { commentApiService } from '../services/comment.api';
import {
  CommentResponse,
  CommentListQuery,
  CreateCommentRequest,
  UpdateCommentRequest,
  CommentStatsResponse,
} from '../types/comment.types';

interface UseCommentsOptions {
  targetType?: 'project' | 'activity' | 'task';
  targetId?: string;
  autoLoad?: boolean;
  initialParams?: CommentListQuery;
}

interface UseCommentsReturn {
  comments: CommentResponse[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  createComment: (data: CreateCommentRequest) => Promise<CommentResponse>;
  updateComment: (id: string, data: UpdateCommentRequest) => Promise<CommentResponse>;
  deleteComment: (id: string) => Promise<void>;
  loadComments: (params?: CommentListQuery) => Promise<void>;
  refreshComments: () => Promise<void>;
  loadMore: () => Promise<void>;
  stats: CommentStatsResponse | null;
  loadStats: () => Promise<void>;
}

export const useComments = (options: UseCommentsOptions = {}): UseCommentsReturn => {
  const { targetType, targetId, autoLoad = true, initialParams = {} } = options;

  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseCommentsReturn['pagination']>(null);
  const [stats, setStats] = useState<CommentStatsResponse | null>(null);
  const [currentParams, setCurrentParams] = useState<CommentListQuery>({
    page: 1,
    limit: 20,
    targetType,
    targetId,
    ...initialParams,
  });

  // Charger les commentaires
  const loadComments = useCallback(async (params?: CommentListQuery) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = params || currentParams;
      setCurrentParams(queryParams);

      let response;
      
      if (targetType && targetId) {
        // Utiliser les endpoints spécialisés si disponibles
        switch (targetType) {
          case 'project':
            response = await commentApiService.getProjectComments(targetId, queryParams);
            break;
          case 'activity':
            response = await commentApiService.getActivityComments(targetId, queryParams);
            break;
          case 'task':
            response = await commentApiService.getTaskComments(targetId, queryParams);
            break;
          default:
            response = await commentApiService.listComments(queryParams);
        }
      } else {
        response = await commentApiService.listComments(queryParams);
      }

      if (params?.page === 1 || !params?.page) {
        setComments(response.comments);
      } else {
        // Mode "load more" - append aux commentaires existants
        setComments(prev => [...prev, ...response.comments]);
      }
      
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des commentaires');
      console.error('Erreur lors du chargement des commentaires:', err);
    } finally {
      setLoading(false);
    }
  }, [targetType, targetId, currentParams]);

  // Rafraîchir les commentaires
  const refreshComments = useCallback(async () => {
    await loadComments({ ...currentParams, page: 1 });
  }, [loadComments, currentParams]);

  // Charger plus de commentaires (pagination)
  const loadMore = useCallback(async () => {
    if (pagination?.hasNext) {
      await loadComments({ ...currentParams, page: currentParams.page! + 1 });
    }
  }, [loadComments, currentParams, pagination]);

  // Créer un commentaire
  const createComment = useCallback(async (data: CreateCommentRequest): Promise<CommentResponse> => {
    try {
      const newComment = await commentApiService.createComment(data);
      
      // Ajouter le nouveau commentaire au début de la liste
      setComments(prev => [newComment, ...prev]);
      
      // Mettre à jour le count dans la pagination
      if (pagination) {
        setPagination(prev => prev ? { ...prev, total: prev.total + 1 } : null);
      }
      
      return newComment;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la création du commentaire';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [pagination]);

  // Mettre à jour un commentaire
  const updateComment = useCallback(async (id: string, data: UpdateCommentRequest): Promise<CommentResponse> => {
    try {
      const updatedComment = await commentApiService.updateComment(id, data);
      
      // Mettre à jour le commentaire dans la liste
      setComments(prev => 
        prev.map(comment => comment.id === id ? updatedComment : comment)
      );
      
      return updatedComment;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour du commentaire';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Supprimer un commentaire
  const deleteComment = useCallback(async (id: string): Promise<void> => {
    try {
      await commentApiService.deleteComment(id);
      
      // Retirer le commentaire de la liste
      setComments(prev => prev.filter(comment => comment.id !== id));
      
      // Mettre à jour le count dans la pagination
      if (pagination) {
        setPagination(prev => prev ? { ...prev, total: prev.total - 1 } : null);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la suppression du commentaire';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [pagination]);

  // Charger les statistiques
  const loadStats = useCallback(async () => {
    try {
      const statsData = await commentApiService.getCommentStats(targetType, targetId);
      setStats(statsData);
    } catch (err: any) {
      console.error('Erreur lors du chargement des statistiques:', err);
    }
  }, [targetType, targetId]);

  // Chargement automatique au montage
  useEffect(() => {
    if (autoLoad) {
      loadComments();
    }
  }, [autoLoad, loadComments]);

  return {
    comments,
    loading,
    error,
    pagination,
    createComment,
    updateComment,
    deleteComment,
    loadComments,
    refreshComments,
    loadMore,
    stats,
    loadStats,
  };
};