// src/hooks/useForms.ts - Hooks React pour la gestion des formulaires
import { useState, useEffect, useCallback } from 'react';
import formsApi, { 
  Form, 
  FormFilters, 
  CreateFormRequest, 
  UpdateFormRequest, 
  FormResponse, 
  FormComment,
  FormStats,
  SubmitFormResponseRequest 
} from '../services/formsApi';

// Hook pour la liste des formulaires
export const useForms = (initialFilters?: FormFilters) => {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const loadForms = useCallback(async (filters: FormFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await formsApi.listForms({
        ...initialFilters,
        ...filters
      });
      
      setForms(response.forms);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [initialFilters]);

  const refetch = useCallback((filters?: FormFilters) => {
    return loadForms(filters);
  }, [loadForms]);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  return {
    forms,
    loading,
    error,
    pagination,
    refetch,
    loadForms
  };
};

// Hook pour un formulaire spécifique
export const useForm = (formId: string | undefined, includeComments: boolean = false) => {
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadForm = useCallback(async () => {
    if (!formId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const formData = await formsApi.getFormById(formId, includeComments);
      setForm(formData);
    } catch (err: any) {
      setError(err.message);
      setForm(null);
    } finally {
      setLoading(false);
    }
  }, [formId, includeComments]);

  const refetch = useCallback(() => {
    return loadForm();
  }, [loadForm]);

  useEffect(() => {
    loadForm();
  }, [loadForm]);

  return {
    form,
    loading,
    error,
    refetch
  };
};

// Hook pour les actions sur les formulaires
export const useFormActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createForm = async (data: CreateFormRequest): Promise<Form | null> => {
    try {
      setLoading(true);
      setError(null);
      const form = await formsApi.createForm(data);
      return form;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateForm = async (id: string, data: UpdateFormRequest): Promise<Form | null> => {
    try {
      setLoading(true);
      setError(null);
      const form = await formsApi.updateForm(id, data);
      return form;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteForm = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await formsApi.deleteForm(id);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const duplicateForm = async (id: string, title?: string): Promise<Form | null> => {
    try {
      setLoading(true);
      setError(null);
      const form = await formsApi.duplicateForm(id, title);
      return form;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const toggleFormStatus = async (id: string): Promise<Form | null> => {
    try {
      setLoading(true);
      setError(null);
      const form = await formsApi.toggleFormStatus(id);
      return form;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const exportResponses = async (formId: string, format: 'xlsx' | 'csv' = 'xlsx'): Promise<Blob | null> => {
    try {
      setLoading(true);
      setError(null);
      const blob = await formsApi.exportResponses(formId, format);
      return blob;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createForm,
    updateForm,
    deleteForm,
    duplicateForm,
    toggleFormStatus,
    exportResponses,
    clearError: () => setError(null)
  };
};

// Hook pour mes formulaires
export const useMyForms = (initialFilters?: Omit<FormFilters, 'creatorId'>) => {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const loadMyForms = useCallback(async (filters: Omit<FormFilters, 'creatorId'> = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await formsApi.getMyForms({
        ...initialFilters,
        ...filters
      });
      
      setForms(response.forms);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [initialFilters]);

  const refetch = useCallback((filters?: Omit<FormFilters, 'creatorId'>) => {
    return loadMyForms(filters);
  }, [loadMyForms]);

  useEffect(() => {
    loadMyForms();
  }, [loadMyForms]);

  return {
    forms,
    loading,
    error,
    pagination,
    refetch,
    loadMyForms
  };
};

// Hook pour les réponses d'un formulaire
export const useFormResponses = (formId: string | undefined) => {
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const loadResponses = useCallback(async (filters: {
    page?: number;
    limit?: number;
    respondentId?: string;
    startDate?: string;
    endDate?: string;
  } = {}) => {
    if (!formId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await formsApi.getFormResponses(formId, filters);
      setResponses(response.responses);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [formId]);

  const submitResponse = async (data: SubmitFormResponseRequest): Promise<FormResponse | null> => {
    if (!formId) return null;

    try {
      setError(null);
      const response = await formsApi.submitFormResponse(formId, data);
      // Recharger les réponses après soumission
      await loadResponses();
      return response;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const refetch = useCallback((filters?: any) => {
    return loadResponses(filters);
  }, [loadResponses]);

  useEffect(() => {
    loadResponses();
  }, [loadResponses]);

  return {
    responses,
    loading,
    error,
    pagination,
    submitResponse,
    refetch
  };
};

// Hook pour les commentaires d'un formulaire
export const useFormComments = (formId: string | undefined) => {
  const [comments, setComments] = useState<FormComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const loadComments = useCallback(async (filters: {
    page?: number;
    limit?: number;
    orderBy?: 'asc' | 'desc';
  } = {}) => {
    if (!formId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await formsApi.getFormComments(formId, filters);
      setComments(response.comments);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [formId]);

  const addComment = async (content: string): Promise<FormComment | null> => {
    if (!formId) return null;

    try {
      setError(null);
      const comment = await formsApi.addComment(formId, content);
      // Recharger les commentaires après ajout
      await loadComments();
      return comment;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const updateComment = async (commentId: string, content: string): Promise<FormComment | null> => {
    try {
      setError(null);
      const comment = await formsApi.updateComment(commentId, content);
      // Mettre à jour le commentaire dans la liste
      setComments(prev => prev.map(c => c.id === commentId ? comment : c));
      return comment;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const deleteComment = async (commentId: string): Promise<boolean> => {
    try {
      setError(null);
      await formsApi.deleteComment(commentId);
      // Supprimer le commentaire de la liste
      setComments(prev => prev.filter(c => c.id !== commentId));
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const searchComments = async (search: string): Promise<FormComment[]> => {
    if (!formId || !search.trim()) return [];

    try {
      setError(null);
      const response = await formsApi.searchFormComments(formId, search);
      return response.comments;
    } catch (err: any) {
      setError(err.message);
      return [];
    }
  };

  const refetch = useCallback((filters?: any) => {
    return loadComments(filters);
  }, [loadComments]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  return {
    comments,
    loading,
    error,
    pagination,
    addComment,
    updateComment,
    deleteComment,
    searchComments,
    refetch
  };
};

// Hook pour les statistiques des formulaires
export const useFormStats = () => {
  const [stats, setStats] = useState<FormStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const statsData = await formsApi.getFormStats();
      setStats(statsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    refetch: loadStats
  };
};

// Hook pour les templates de formulaires
export const useFormTemplates = () => {
  const [templates, setTemplates] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const templatesData = await formsApi.getTemplates();
      setTemplates(templatesData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTemplate = async (name: string, description: string, schema: any, category?: string): Promise<Form | null> => {
    try {
      setError(null);
      const template = await formsApi.createTemplate(name, description, schema, category);
      // Recharger les templates après création
      await loadTemplates();
      return template;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return {
    templates,
    loading,
    error,
    createTemplate,
    refetch: loadTemplates
  };
};

// Hook pour la recherche de formulaires en temps réel
export const useFormSearch = (debounceMs: number = 300) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Form[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const forms = await formsApi.searchForms(term, 10);
      setResults(forms);
    } catch (err: any) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      search(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs, search]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    loading,
    error,
    clearResults: () => setResults([])
  };
};

// Hook pour les filtres de formulaires
export const useFormFilters = () => {
  const [filters, setFilters] = useState<FormFilters>({});

  const updateFilter = useCallback((key: keyof FormFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const removeFilter = useCallback((key: keyof FormFilters) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof FormFilters];
    return value !== undefined && value !== null && value !== '';
  });

  return {
    filters,
    updateFilter,
    removeFilter,
    clearFilters,
    hasActiveFilters
  };
};

// Hook pour les formulaires d'une activité spécifique
export const useActivityForms = (activityId: string | undefined) => {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadActivityForms = useCallback(async () => {
    if (!activityId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const formsData = await formsApi.getFormsByActivity(activityId);
      setForms(formsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activityId]);

  useEffect(() => {
    loadActivityForms();
  }, [loadActivityForms]);

  return {
    forms,
    loading,
    error,
    refetch: loadActivityForms
  };
};

// Hook pour la validation des schémas de formulaire
export const useFormValidation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateSchema = async (schema: any): Promise<{ isValid: boolean; schema?: any } | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await formsApi.validateFormSchema(schema);
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const previewForm = async (schema: any): Promise<{ preview: any; isValid: boolean } | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await formsApi.previewForm(schema);
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    validateSchema,
    previewForm,
    clearError: () => setError(null)
  };
};

export default {
  useForms,
  useForm,
  useFormActions,
  useMyForms,
  useFormResponses,
  useFormComments,
  useFormStats,
  useFormTemplates,
  useFormSearch,
  useFormFilters,
  useActivityForms,
  useFormValidation
};