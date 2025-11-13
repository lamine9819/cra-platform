// src/hooks/useDocumentsLocal.ts - VERSION COMPLÈTE
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import DocumentService from '../services/documentService';
import { DocumentResponse, DocumentListQuery, ShareDocumentRequest, UploadFileRequest } from '../types/document.types';

interface UseDocumentsLocalReturn {
  documents: DocumentResponse[];
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
  
  // Actions principales
  fetchDocuments: (query?: DocumentListQuery) => Promise<void>;
  uploadDocument: (file: File, data: Omit<UploadFileRequest, 'file'>) => Promise<void>;
  uploadMultipleDocuments: (files: File[], data: Array<Omit<UploadFileRequest, 'file'>>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  shareDocument: (id: string, shareData: ShareDocumentRequest) => Promise<void>;
  downloadDocument: (id: string, filename: string) => Promise<void>;
  
  // Actions de liaison
  linkToProject: (documentId: string, projectId: string) => Promise<void>;
  linkToActivity: (documentId: string, activityId: string) => Promise<void>;
  unlinkDocument: (documentId: string) => Promise<void>;
  
  // Actions utilitaires
  refetch: () => Promise<void>;
  clearError: () => void;
}

export const useDocumentsLocal = (initialQuery?: DocumentListQuery): UseDocumentsLocalReturn => {
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [currentQuery, setCurrentQuery] = useState<DocumentListQuery | undefined>(initialQuery);

  // Fonction pour récupérer les documents
  const fetchDocuments = useCallback(async (query?: DocumentListQuery) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryToUse = query || currentQuery || {};
      setCurrentQuery(queryToUse);
      
      const response = await DocumentService.listDocuments(queryToUse);
      
      setDocuments(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des documents';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentQuery]);

  // Upload d'un fichier unique
  const uploadDocument = useCallback(async (file: File, data: Omit<UploadFileRequest, 'file'>) => {
    try {
      const response = await DocumentService.uploadFile(file, data);
      
      if (response.success) {
        // Ajouter le nouveau document en haut de la liste
        setDocuments(prev => [response.data as DocumentResponse, ...prev]);
        toast.success(response.message);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de l\'upload';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Upload de fichiers multiples
  const uploadMultipleDocuments = useCallback(async (files: File[], data: Array<Omit<UploadFileRequest, 'file'>>) => {
    try {
      const response = await DocumentService.uploadMultipleFiles(files, data);
      
      if (response.success) {
        // Ajouter les nouveaux documents en haut de la liste
        const newDocuments = Array.isArray(response.data) ? response.data : [response.data];
        setDocuments(prev => [...newDocuments, ...prev]);
        toast.success(response.message);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de l\'upload multiple';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Supprimer un document
  const deleteDocument = useCallback(async (id: string) => {
    try {
      const response = await DocumentService.deleteDocument(id);
      
      if (response.success) {
        // Retirer le document de la liste
        setDocuments(prev => prev.filter(doc => doc.id !== id));
        toast.success(response.message);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Partager un document
  const shareDocument = useCallback(async (id: string, shareData: ShareDocumentRequest) => {
    try {
      const response = await DocumentService.shareDocument(id, shareData);
      
      if (response.success) {
        toast.success('Document partagé avec succès');
        // Rafraîchir les documents pour mettre à jour les infos de partage
        await fetchDocuments();
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du partage';
      toast.error(errorMessage);
      throw err;
    }
  }, [fetchDocuments]);

  // Télécharger un document
  const downloadDocument = useCallback(async (id: string, filename: string) => {
    try {
      await DocumentService.downloadDocument(id, filename);
      toast.success('Téléchargement commencé');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du téléchargement';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Lier un document à un projet
  const linkToProject = useCallback(async (documentId: string, projectId: string) => {
    try {
      const response = await DocumentService.linkToProject(documentId, projectId);
      
      if (response.success) {
        // Mettre à jour le document dans la liste
        setDocuments(prev => prev.map(doc => 
          doc.id === documentId ? response.data : doc
        ));
        toast.success(response.message);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la liaison au projet';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Lier un document à une activité
  const linkToActivity = useCallback(async (documentId: string, activityId: string) => {
    try {
      const response = await DocumentService.linkToActivity(documentId, activityId);
      
      if (response.success) {
        // Mettre à jour le document dans la liste
        setDocuments(prev => prev.map(doc => 
          doc.id === documentId ? response.data : doc
        ));
        toast.success(response.message);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la liaison à l\'activité';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Délier un document
  const unlinkDocument = useCallback(async (documentId: string) => {
    try {
      const response = await DocumentService.unlinkDocument(documentId);
      
      if (response.success) {
        // Mettre à jour le document dans la liste
        setDocuments(prev => prev.map(doc => 
          doc.id === documentId ? response.data : doc
        ));
        toast.success(response.message);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du déliage';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Rafraîchir les documents
  const refetch = useCallback(async () => {
    await fetchDocuments(currentQuery);
  }, [fetchDocuments, currentQuery]);

  // Nettoyer les erreurs
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Charger les documents au montage si une requête initiale est fournie
  useEffect(() => {
    if (initialQuery) {
      fetchDocuments(initialQuery);
    }
  }, []); // Volontairement vide pour éviter les re-renders

  return {
    documents,
    loading,
    error,
    pagination,
    fetchDocuments,
    uploadDocument,
    uploadMultipleDocuments,
    deleteDocument,
    shareDocument,
    downloadDocument,
    linkToProject,
    linkToActivity,
    unlinkDocument,
    refetch,
    clearError
  };
};

// Hook spécialisé pour les documents d'un projet
export const useProjectDocuments = (projectId: string) => {
  const {
    documents,
    loading,
    error,
    fetchDocuments,
    uploadDocument,
    ...otherMethods
  } = useDocumentsLocal({ projectId, limit: 50 });

  // Fonction d'upload spécialisée pour le projet
  const addDocumentToProject = useCallback(async (
    file: File,
    documentData: Omit<UploadFileRequest, 'file'>
  ) => {
    const dataWithProject = {
      ...documentData,
      projectId
    };
    return uploadDocument(file, dataWithProject);
  }, [uploadDocument, projectId]);

  // Rafraîchir les documents du projet
  const refetch0 = useCallback(async (query?: any) => {
    return fetchDocuments({ ...query, projectId });
  }, [fetchDocuments, projectId]);

  return {
    documents,
    loading,
    error,
    refetch0,
    addDocument: addDocumentToProject,
    ...otherMethods
  };
};

// Hook spécialisé pour les documents d'une activité
export const useActivityDocuments = (activityId: string) => {
  const {
    documents,
    loading,
    error,
    fetchDocuments,
    uploadDocument,
    ...otherMethods
  } = useDocumentsLocal({ activityId, limit: 50 });

  // Fonction d'upload spécialisée pour l'activité
  const addDocumentToActivity = useCallback(async (
    file: File,
    documentData: Omit<UploadFileRequest, 'file'>
  ) => {
    const dataWithActivity = {
      ...documentData,
      activityId
    };
    return uploadDocument(file, dataWithActivity);
  }, [uploadDocument, activityId]);

  // Rafraîchir les documents de l'activité
  const refetch1 = useCallback(async (query?: any) => {
    return fetchDocuments({ ...query, activityId });
  }, [fetchDocuments, activityId]);

  return {
    documents,
    loading,
    error,
    refetch1,
    addDocument: addDocumentToActivity,
    ...otherMethods
  };
};

// Hook spécialisé pour les documents d'une tâche
export const useTaskDocuments = (taskId: string) => {
  const {
    documents,
    loading,
    error,
    fetchDocuments,
    uploadDocument,
    ...otherMethods
  } = useDocumentsLocal({ taskId, limit: 50 });

  // Fonction d'upload spécialisée pour la tâche
  const addDocumentToTask = useCallback(async (
    file: File,
    documentData: Omit<UploadFileRequest, 'file'>
  ) => {
    const dataWithTask = {
      ...documentData,
      taskId
    };
    return uploadDocument(file, dataWithTask);
  }, [uploadDocument, taskId]);

  // Rafraîchir les documents de la tâche
  const refetch2 = useCallback(async (query?: any) => {
    return fetchDocuments({ ...query, taskId });
  }, [fetchDocuments, taskId]);

  return {
    documents,
    loading,
    error,
    refetch2,
    addDocument: addDocumentToTask,
    ...otherMethods
  };
};

// Hook pour les statistiques des documents
export const useDocumentStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await DocumentService.getDocumentStats();
      setStats(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des statistiques';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

export default useDocumentsLocal;