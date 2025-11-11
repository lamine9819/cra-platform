// src/hooks/documents/useDocumentsAdvanced.ts
// Hooks React Query pour les fonctionnalités avancées de gestion de documents

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../../services/api/documentService';
import toast from 'react-hot-toast';
import { documentKeys } from './useDocuments';

// =============================================
// HOOKS MÉTADONNÉES
// =============================================

/**
 * Hook pour mettre à jour les métadonnées d'un document
 */
export function useUpdateDocumentMetadata() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        title?: string;
        description?: string;
        type?: string;
        tags?: string[];
        isPublic?: boolean;
      };
    }) => documentService.updateDocumentMetadata(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      toast.success('Document mis à jour');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    },
  });
}

// =============================================
// HOOKS LIAISON/DÉLIAISON
// =============================================

/**
 * Hook pour lier un document à une entité
 */
export function useLinkDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentId,
      entityType,
      entityId,
    }: {
      documentId: string;
      entityType: 'project' | 'activity' | 'task' | 'seminar' | 'training' | 'internship' | 'supervision' | 'knowledgeTransfer' | 'event';
      entityId: string;
    }) => documentService.linkDocument(documentId, entityType, entityId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(variables.documentId) });
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      // Invalider aussi les listes contextuelles
      if (variables.entityType === 'activity') {
        queryClient.invalidateQueries({ queryKey: documentKeys.activity(variables.entityId) });
      } else if (variables.entityType === 'project') {
        queryClient.invalidateQueries({ queryKey: documentKeys.project(variables.entityId) });
      } else if (variables.entityType === 'task') {
        queryClient.invalidateQueries({ queryKey: documentKeys.task(variables.entityId) });
      }
      toast.success('Document lié avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la liaison');
    },
  });
}

/**
 * Hook pour délier un document
 */
export function useUnlinkDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentId,
      entityType,
      entityId,
    }: {
      documentId: string;
      entityType?: string;
      entityId?: string;
    }) => documentService.unlinkDocument(documentId, entityType, entityId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(variables.documentId) });
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
      toast.success('Document délié');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la déliaison');
    },
  });
}

// =============================================
// HOOKS CORBEILLE (TRASH)
// =============================================

/**
 * Hook pour obtenir les documents dans la corbeille
 */
export function useTrashDocuments(query?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: documentKeys.trash(),
    queryFn: () => documentService.getTrashDocuments(query),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook pour restaurer un document supprimé
 */
export function useRestoreDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentService.restoreDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.trash() });
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentKeys.stats() });
      toast.success('Document restauré');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la restauration');
    },
  });
}

/**
 * Hook pour supprimer définitivement un document
 */
export function usePermanentDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentService.permanentDeleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.trash() });
      queryClient.invalidateQueries({ queryKey: documentKeys.stats() });
      toast.success('Document supprimé définitivement');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression');
    },
  });
}

/**
 * Hook pour vider la corbeille
 */
export function useEmptyTrash() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => documentService.emptyTrash(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.trash() });
      queryClient.invalidateQueries({ queryKey: documentKeys.stats() });
      toast.success(`${data.deletedCount} document(s) supprimé(s) définitivement`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors du vidage de la corbeille');
    },
  });
}

// =============================================
// HOOKS FAVORIS
// =============================================

/**
 * Hook pour obtenir les documents favoris
 */
export function useFavoriteDocuments(query?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: documentKeys.favorites(),
    queryFn: () => documentService.getFavoriteDocuments(query),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

/**
 * Hook pour ajouter un document aux favoris
 */
export function useAddToFavorites() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => documentService.addToFavorites(documentId),
    onSuccess: (_, documentId) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(documentId) });
      queryClient.invalidateQueries({ queryKey: documentKeys.favorites() });
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      toast.success('Ajouté aux favoris');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'ajout aux favoris');
    },
  });
}

/**
 * Hook pour retirer un document des favoris
 */
export function useRemoveFromFavorites() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => documentService.removeFromFavorites(documentId),
    onSuccess: (_, documentId) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(documentId) });
      queryClient.invalidateQueries({ queryKey: documentKeys.favorites() });
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      toast.success('Retiré des favoris');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors du retrait des favoris');
    },
  });
}

// =============================================
// HOOKS PARTAGES AVANCÉS
// =============================================

/**
 * Hook pour obtenir les partages d'un document
 */
export function useDocumentShares(documentId: string) {
  return useQuery({
    queryKey: documentKeys.shares(documentId),
    queryFn: () => documentService.getDocumentShares(documentId),
    enabled: !!documentId,
  });
}

/**
 * Hook pour révoquer un partage
 */
export function useRevokeShare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, shareId }: { documentId: string; shareId: string }) =>
      documentService.revokeShare(documentId, shareId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.shares(variables.documentId) });
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(variables.documentId) });
      toast.success('Partage révoqué');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la révocation');
    },
  });
}

/**
 * Hook pour mettre à jour les permissions d'un partage
 */
export function useUpdateSharePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentId,
      shareId,
      permissions,
    }: {
      documentId: string;
      shareId: string;
      permissions: { canEdit?: boolean; canDelete?: boolean };
    }) => documentService.updateSharePermissions(documentId, shareId, permissions),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.shares(variables.documentId) });
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(variables.documentId) });
      toast.success('Permissions mises à jour');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    },
  });
}

// =============================================
// HOOK PREVIEW
// =============================================

/**
 * Hook pour prévisualiser un document
 */
export function usePreviewDocument() {
  return useMutation({
    mutationFn: (documentId: string) => documentService.previewDocument(documentId),
    onSuccess: () => {
      // Pas de toast, le document s'ouvre dans un nouvel onglet
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'ouverture du document');
    },
  });
}
