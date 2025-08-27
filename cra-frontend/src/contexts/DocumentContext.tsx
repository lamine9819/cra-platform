// src/contexts/DocumentContext.tsx - Version améliorée
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import DocumentService from '../services/documentService';
import {
  DocumentResponse,
  DocumentListQuery,
  UploadFileRequest,
  ShareDocumentRequest,
  DocumentContextType
} from '../types/document.types';

// =============================================
// TYPES POUR LE REDUCER
// =============================================

interface DocumentState {
  documents: DocumentResponse[];
  loading: boolean;
  error: string | null;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats?: {
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
}

type DocumentAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: { documents: DocumentResponse[]; pagination?: any } }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'UPLOAD_SUCCESS'; payload: DocumentResponse | DocumentResponse[] }
  | { type: 'DELETE_SUCCESS'; payload: string }
  | { type: 'UPDATE_SUCCESS'; payload: DocumentResponse }
  | { type: 'STATS_SUCCESS'; payload: any }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET' };

// =============================================
// REDUCER
// =============================================

const documentReducer = (state: DocumentState, action: DocumentAction): DocumentState => {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        loading: true,
        error: null
      };

    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        documents: action.payload.documents,
        pagination: action.payload.pagination,
        error: null
      };

    case 'FETCH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case 'UPLOAD_SUCCESS':
      const newDocuments = Array.isArray(action.payload) ? action.payload : [action.payload];
      return {
        ...state,
        documents: [...newDocuments, ...state.documents],
        error: null
      };

    case 'DELETE_SUCCESS':
      return {
        ...state,
        documents: state.documents.filter(doc => doc.id !== action.payload),
        error: null
      };

    case 'UPDATE_SUCCESS':
      return {
        ...state,
        documents: state.documents.map(doc => 
          doc.id === action.payload.id ? action.payload : doc
        ),
        error: null
      };

    case 'STATS_SUCCESS':
      return {
        ...state,
        stats: action.payload,
        error: null
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
};

// =============================================
// ÉTAT INITIAL
// =============================================

const initialState: DocumentState = {
  documents: [],
  loading: false,
  error: null
};

// =============================================
// CONTEXTE ÉTENDU
// =============================================

interface ExtendedDocumentContextType extends DocumentContextType {
  stats?: DocumentState['stats'];
  pagination?: DocumentState['pagination'];
  
  // Nouvelles méthodes
  linkToProject: (documentId: string, projectId: string) => Promise<void>;
  linkToActivity: (documentId: string, activityId: string) => Promise<void>;
  unlinkDocument: (documentId: string) => Promise<void>;
  fetchProjectDocuments: (projectId: string, query?: any) => Promise<void>;
  fetchActivityDocuments: (activityId: string, query?: any) => Promise<void>;
  fetchDocumentStats: () => Promise<void>;
  shareWithProjectMembers: (documentId: string, projectId: string, permissions?: any) => Promise<void>;
}

const DocumentContext = createContext<ExtendedDocumentContextType | undefined>(undefined);

// =============================================
// PROVIDER
// =============================================

interface DocumentProviderProps {
  children: React.ReactNode;
}

export const DocumentProvider: React.FC<DocumentProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(documentReducer, initialState);

  // =============================================
  // ACTIONS EXISTANTES
  // =============================================

  const fetchDocuments = useCallback(async (query?: DocumentListQuery) => {
    try {
      dispatch({ type: 'FETCH_START' });
      const response = await DocumentService.listDocuments(query);
      
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: {
          documents: response.data,
          pagination: response.pagination
        }
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors du chargement des documents';
      dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    }
  }, []);

  const uploadDocument = useCallback(async (
    file: File,
    data: Omit<UploadFileRequest, 'file'>
  ) => {
    try {
      const response = await DocumentService.uploadFile(file, data);
      
      if (response.success) {
        dispatch({ type: 'UPLOAD_SUCCESS', payload: response.data as DocumentResponse });
        toast.success(response.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'upload';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const uploadMultipleDocuments = useCallback(async (
    files: File[],
    data: Array<Omit<UploadFileRequest, 'file'>>
  ) => {
    try {
      const response = await DocumentService.uploadMultipleFiles(files, data);
      
      if (response.success) {
        dispatch({ type: 'UPLOAD_SUCCESS', payload: response.data as DocumentResponse[] });
        toast.success(response.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'upload multiple';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const deleteDocument = useCallback(async (id: string) => {
    try {
      const response = await DocumentService.deleteDocument(id);
      
      if (response.success) {
        dispatch({ type: 'DELETE_SUCCESS', payload: id });
        toast.success(response.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const shareDocument = useCallback(async (
    id: string,
    shareData: ShareDocumentRequest
  ) => {
    try {
      const response = await DocumentService.shareDocument(id, shareData);
      
      if (response.success) {
        toast.success('Document partagé avec succès');
        // Recharger les documents pour mettre à jour les infos de partage
        await fetchDocuments();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors du partage';
      toast.error(errorMessage);
      throw error;
    }
  }, [fetchDocuments]);

  const downloadDocument = useCallback(async (id: string, filename: string) => {
    try {
      await DocumentService.downloadDocument(id, filename);
      toast.success('Téléchargement commencé');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors du téléchargement';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // =============================================
  // NOUVELLES ACTIONS
  // =============================================

  const linkToProject = useCallback(async (documentId: string, projectId: string) => {
    try {
      const response = await DocumentService.linkToProject(documentId, projectId);
      
      if (response.success) {
        dispatch({ type: 'UPDATE_SUCCESS', payload: response.data });
        toast.success(response.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la liaison au projet';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const linkToActivity = useCallback(async (documentId: string, activityId: string) => {
    try {
      const response = await DocumentService.linkToActivity(documentId, activityId);
      
      if (response.success) {
        dispatch({ type: 'UPDATE_SUCCESS', payload: response.data });
        toast.success(response.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la liaison à l\'activité';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const unlinkDocument = useCallback(async (documentId: string) => {
    try {
      const response = await DocumentService.unlinkDocument(documentId);
      
      if (response.success) {
        dispatch({ type: 'UPDATE_SUCCESS', payload: response.data });
        toast.success(response.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors du déliage';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const fetchProjectDocuments = useCallback(async (projectId: string, query?: any) => {
    try {
      dispatch({ type: 'FETCH_START' });
      const response = await DocumentService.getProjectDocuments(projectId, query);
      
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: {
          documents: response.data,
          pagination: response.pagination
        }
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors du chargement des documents du projet';
      dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    }
  }, []);

  const fetchActivityDocuments = useCallback(async (activityId: string, query?: any) => {
    try {
      dispatch({ type: 'FETCH_START' });
      const response = await DocumentService.getActivityDocuments(activityId, query);
      
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: {
          documents: response.data,
          pagination: response.pagination
        }
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors du chargement des documents de l\'activité';
      dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    }
  }, []);

  const fetchDocumentStats = useCallback(async () => {
    try {
      const response = await DocumentService.getDocumentStats();
      
      if (response.success) {
        dispatch({ type: 'STATS_SUCCESS', payload: response.data });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors du chargement des statistiques';
      toast.error(errorMessage);
    }
  }, []);

  const shareWithProjectMembers = useCallback(async (
    documentId: string, 
    projectId: string, 
    permissions: { canEdit?: boolean; canDelete?: boolean } = {}
  ) => {
    try {
      const response = await DocumentService.shareWithProjectMembers(documentId, projectId, permissions);
      
      if (response.success) {
        toast.success('Document partagé avec tous les membres du projet');
        await fetchDocuments();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors du partage avec les membres';
      toast.error(errorMessage);
      throw error;
    }
  }, [fetchDocuments]);

  // =============================================
  // VALEUR DU CONTEXTE
  // =============================================

  const contextValue: ExtendedDocumentContextType = {
    documents: state.documents,
    loading: state.loading,
    error: state.error,
    stats: state.stats,
    pagination: state.pagination,
    
    // Actions existantes
    uploadDocument,
    uploadMultipleDocuments,
    fetchDocuments,
    deleteDocument,
    shareDocument,
    downloadDocument,
    
    // Nouvelles actions
    linkToProject,
    linkToActivity,
    unlinkDocument,
    fetchProjectDocuments,
    fetchActivityDocuments,
    fetchDocumentStats,
    shareWithProjectMembers
  };

  return (
    <DocumentContext.Provider value={contextValue}>
      {children}
    </DocumentContext.Provider>
  );
};

// =============================================
// HOOK PERSONNALISÉ
// =============================================

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments doit être utilisé dans un DocumentProvider');
  }
  return context;
};

// =============================================
// HOOKS SPÉCIALISÉS AMÉLIORÉS
// =============================================

// Hook pour les documents d'un projet avec actions
export const useProjectDocuments = (projectId: string) => {
  const [documents, setDocuments] = React.useState<DocumentResponse[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchProjectDocuments = useCallback(async (query?: any) => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await DocumentService.getProjectDocuments(projectId, query);
      setDocuments(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const addDocumentToProject = useCallback(async (
    file: File,
    documentData: Omit<UploadFileRequest, 'file'>
  ) => {
    try {
      const response = await DocumentService.uploadDocumentToContext(
        file,
        documentData,
        { type: 'project', id: projectId }
      );
      
      if (response.success) {
        toast.success('Document ajouté au projet');
        await fetchProjectDocuments();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout');
      throw error;
    }
  }, [projectId, fetchProjectDocuments]);

  React.useEffect(() => {
    fetchProjectDocuments();
  }, [fetchProjectDocuments]);

  return { 
    documents, 
    loading, 
    error, 
    refetch: fetchProjectDocuments,
    addDocument: addDocumentToProject
  };
};

// Hook pour les documents d'une activité avec actions
export const useActivityDocuments = (activityId: string) => {
  const [documents, setDocuments] = React.useState<DocumentResponse[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchActivityDocuments = useCallback(async (query?: any) => {
    if (!activityId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await DocumentService.getActivityDocuments(activityId, query);
      setDocuments(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [activityId]);

  const addDocumentToActivity = useCallback(async (
    file: File,
    documentData: Omit<UploadFileRequest, 'file'>
  ) => {
    try {
      const response = await DocumentService.uploadDocumentToContext(
        file,
        documentData,
        { type: 'activity', id: activityId }
      );
      
      if (response.success) {
        toast.success('Document ajouté à l\'activité');
        await fetchActivityDocuments();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout');
      throw error;
    }
  }, [activityId, fetchActivityDocuments]);

  React.useEffect(() => {
    fetchActivityDocuments();
  }, [fetchActivityDocuments]);

  return { 
    documents, 
    loading, 
    error, 
    refetch: fetchActivityDocuments,
    addDocument: addDocumentToActivity
  };
};

// Hook pour les documents d'une tâche
export const useTaskDocuments = (taskId: string) => {
  const [documents, setDocuments] = React.useState<DocumentResponse[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchTaskDocuments = useCallback(async () => {
    if (!taskId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await DocumentService.getTaskDocuments(taskId);
      setDocuments(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const addDocumentToTask = useCallback(async (
    file: File,
    documentData: Omit<UploadFileRequest, 'file'>
  ) => {
    try {
      const response = await DocumentService.uploadDocumentToContext(
        file,
        documentData,
        { type: 'task', id: taskId }
      );
      
      if (response.success) {
        toast.success('Document ajouté à la tâche');
        await fetchTaskDocuments();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout');
      throw error;
    }
  }, [taskId, fetchTaskDocuments]);

  React.useEffect(() => {
    fetchTaskDocuments();
  }, [fetchTaskDocuments]);

  return { 
    documents, 
    loading, 
    error, 
    refetch: fetchTaskDocuments,
    addDocument: addDocumentToTask
  };
};

// Hook pour les statistiques des documents
export const useDocumentStats = () => {
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await DocumentService.getDocumentStats();
      setStats(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

export default DocumentContext;