// src/services/api/documentService.NEW_METHODS.ts
// NOUVELLES MÉTHODES À AJOUTER À documentService.ts

import api from '../api';
import { DocumentResponse } from '../../types/document.types';

// =============================================
// PHASE 1 - ENDPOINTS CRITIQUES
// =============================================

/**
 * Mettre à jour les métadonnées d'un document
 */
export async function updateDocumentMetadata(
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
    `/documents/${id}`,
    data
  );
  return response.data.data;
}

/**
 * Lier un document à une entité
 */
export async function linkDocument(
  documentId: string,
  entityType: 'project' | 'activity' | 'task' | 'seminar' | 'training' | 'internship' | 'supervision' | 'knowledgeTransfer' | 'event',
  entityId: string
): Promise<DocumentResponse> {
  const response = await api.post<{ success: boolean; data: DocumentResponse }>(
    `/documents/${documentId}/link`,
    { entityType, entityId }
  );
  return response.data.data;
}

/**
 * Délier un document (de toutes les entités ou d'une spécifique)
 */
export async function unlinkDocument(
  documentId: string,
  entityType?: string,
  entityId?: string
): Promise<DocumentResponse> {
  const response = await api.delete<{ success: boolean; data: DocumentResponse }>(
    `/documents/${documentId}/link`,
    {
      data: entityType ? { entityType, entityId } : undefined
    }
  );
  return response.data.data;
}

// =============================================
// PHASE 2 - CORBEILLE
// =============================================

/**
 * Obtenir les documents dans la corbeille
 */
export async function getTrashDocuments(query?: {
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
  }>('/documents/trash', { params: query });
  return {
    data: response.data.data,
    pagination: response.data.pagination
  };
}

/**
 * Restaurer un document supprimé
 */
export async function restoreDocument(id: string): Promise<DocumentResponse> {
  const response = await api.post<{ success: boolean; data: DocumentResponse }>(
    `/documents/${id}/restore`
  );
  return response.data.data;
}

/**
 * Supprimer définitivement un document
 */
export async function permanentDeleteDocument(id: string): Promise<void> {
  await api.delete(`/documents/${id}/permanent`);
}

/**
 * Vider la corbeille (documents > 30 jours)
 */
export async function emptyTrash(): Promise<{ deletedCount: number }> {
  const response = await api.delete<{
    success: boolean;
    data: { deletedCount: number };
  }>('/documents/trash/empty');
  return response.data.data;
}

// =============================================
// PHASE 3 - GESTION AVANCÉE DES PARTAGES
// =============================================

/**
 * Obtenir la liste des partages d'un document
 */
export async function getDocumentShares(documentId: string): Promise<any[]> {
  const response = await api.get<{ success: boolean; data: any[] }>(
    `/documents/${documentId}/shares`
  );
  return response.data.data;
}

/**
 * Révoquer un partage
 */
export async function revokeShare(documentId: string, shareId: string): Promise<void> {
  await api.delete(`/documents/${documentId}/shares/${shareId}`);
}

/**
 * Mettre à jour les permissions d'un partage
 */
export async function updateSharePermissions(
  documentId: string,
  shareId: string,
  permissions: {
    canEdit?: boolean;
    canDelete?: boolean;
  }
): Promise<any> {
  const response = await api.patch<{ success: boolean; data: any }>(
    `/documents/${documentId}/shares/${shareId}`,
    permissions
  );
  return response.data.data;
}

// =============================================
// PHASE 4 - FAVORIS
// =============================================

/**
 * Ajouter un document aux favoris
 */
export async function addToFavorites(documentId: string): Promise<void> {
  await api.post(`/documents/${documentId}/favorite`);
}

/**
 * Retirer un document des favoris
 */
export async function removeFromFavorites(documentId: string): Promise<void> {
  await api.delete(`/documents/${documentId}/favorite`);
}

/**
 * Obtenir les documents favoris
 */
export async function getFavoriteDocuments(query?: {
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
  }>('/documents/favorites', { params: query });
  return {
    data: response.data.data,
    pagination: response.data.pagination
  };
}

// =============================================
// BONUS - PREVIEW
// =============================================

/**
 * Obtenir l'URL de preview (affichage dans le browser)
 */
export function getPreviewUrl(documentId: string): string {
  return `${api.defaults.baseURL}/documents/${documentId}/preview`;
}

/**
 * Preview un document (ouvre dans nouvel onglet)
 */
export async function previewDocument(documentId: string): Promise<void> {
  const url = getPreviewUrl(documentId);
  window.open(url, '_blank');
}

// =============================================
// EXPORT POUR INTÉGRATION
// =============================================

export const newDocumentMethods = {
  updateDocumentMetadata,
  linkDocument,
  unlinkDocument,
  getTrashDocuments,
  restoreDocument,
  permanentDeleteDocument,
  emptyTrash,
  getDocumentShares,
  revokeShare,
  updateSharePermissions,
  addToFavorites,
  removeFromFavorites,
  getFavoriteDocuments,
  getPreviewUrl,
  previewDocument
};

export default newDocumentMethods;
