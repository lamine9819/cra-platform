// src/hooks/documents/useDocuments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../../services/api/documentService';
import {
  DocumentListQuery,
  UploadFileRequest,
  ShareDocumentRequest,
} from '../../types/document.types';
import toast from 'react-hot-toast';

// Query keys
export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (filters: DocumentListQuery) => [...documentKeys.lists(), filters] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
  stats: () => [...documentKeys.all, 'stats'] as const,
  activity: (activityId: string) => [...documentKeys.all, 'activity', activityId] as const,
  project: (projectId: string) => [...documentKeys.all, 'project', projectId] as const,
  task: (taskId: string) => [...documentKeys.all, 'task', taskId] as const,
  // Nouveaux query keys
  trash: () => [...documentKeys.all, 'trash'] as const,
  favorites: () => [...documentKeys.all, 'favorites'] as const,
  shares: (id: string) => [...documentKeys.all, 'shares', id] as const,
};

/**
 * Hook principal pour la liste des documents
 */
export function useDocuments(query?: DocumentListQuery) {
  return useQuery({
    queryKey: documentKeys.list(query || {}),
    queryFn: () => documentService.listDocuments(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook pour un document spécifique
 */
export function useDocument(id: string) {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => documentService.getDocumentById(id),
    enabled: !!id,
  });
}

/**
 * Hook pour les statistiques
 */
export function useDocumentStats() {
  return useQuery({
    queryKey: documentKeys.stats(),
    queryFn: () => documentService.getStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook pour upload de document
 */
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      data,
      onProgress,
    }: {
      file: File;
      data: UploadFileRequest;
      onProgress?: (progress: number) => void;
    }) => documentService.uploadDocument(file, data, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentKeys.stats() });
      toast.success('Document uploadé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'upload');
    },
  });
}

/**
 * Hook pour upload multiple
 */
export function useUploadMultipleDocuments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      files,
      dataArray,
      onProgress,
    }: {
      files: File[];
      dataArray: UploadFileRequest[];
      onProgress?: (progress: number) => void;
    }) => documentService.uploadMultipleDocuments(files, dataArray, onProgress),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentKeys.stats() });
      toast.success(`${data.length} document(s) uploadé(s) avec succès`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'upload');
    },
  });
}

/**
 * Hook pour supprimer un document
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentService.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentKeys.stats() });
      queryClient.invalidateQueries({ queryKey: documentKeys.trash() });
      toast.success('Document déplacé dans la corbeille');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression');
    },
  });
}

/**
 * Hook pour partager un document
 */
export function useShareDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ShareDocumentRequest }) =>
      documentService.shareDocument(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(variables.id) });
      toast.success('Document partagé');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors du partage');
    },
  });
}

/**
 * Hook pour télécharger un document
 */
export function useDownloadDocument() {
  return useMutation({
    mutationFn: ({ id, filename }: { id: string; filename: string }) =>
      documentService.downloadDocument(id, filename),
    onSuccess: () => {
      toast.success('Téléchargement démarré');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors du téléchargement');
    },
  });
}

// =============================================
// HOOKS CONTEXTUELS
// =============================================

/**
 * Hook pour les documents d'une activité
 */
export function useActivityDocuments(activityId: string, query?: DocumentListQuery) {
  return useQuery({
    queryKey: documentKeys.activity(activityId),
    queryFn: () => documentService.getActivityDocuments(activityId, query),
    enabled: !!activityId,
  });
}

/**
 * Hook pour les documents d'un projet
 */
export function useProjectDocuments(projectId: string, query?: DocumentListQuery) {
  return useQuery({
    queryKey: documentKeys.project(projectId),
    queryFn: () => documentService.getProjectDocuments(projectId, query),
    enabled: !!projectId,
  });
}

/**
 * Hook pour les documents d'une tâche
 */
export function useTaskDocuments(taskId: string, query?: DocumentListQuery) {
  return useQuery({
    queryKey: documentKeys.task(taskId),
    queryFn: () => documentService.getTaskDocuments(taskId, query),
    enabled: !!taskId,
  });
}
