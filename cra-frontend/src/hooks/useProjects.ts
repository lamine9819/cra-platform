// src/hooks/useProjects.ts
import { useState, useEffect, useCallback } from 'react';
import projectsApi, { Project, ProjectFilters, CreateProjectRequest, UpdateProjectRequest } from '../services/projectsApi';

// Hook pour la liste des projets
export const useProjects = (initialFilters?: ProjectFilters) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  const loadProjects = useCallback(async (filters: ProjectFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await projectsApi.listProjects({
        ...initialFilters,
        ...filters
      });
      
      setProjects(response.projects);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [initialFilters]);

  const refetch = useCallback((filters?: ProjectFilters) => {
    return loadProjects(filters);
  }, [loadProjects]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return {
    projects,
    loading,
    error,
    pagination,
    refetch,
    loadProjects
  };
};

// Hook pour un projet spécifique
export const useProject = (projectId: string | undefined) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProject = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const projectData = await projectsApi.getProjectById(projectId);
      setProject(projectData);
    } catch (err: any) {
      setError(err.message);
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const refetch = useCallback(() => {
    return loadProject();
  }, [loadProject]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  return {
    project,
    loading,
    error,
    refetch
  };
};

// Hook pour les actions sur les projets
export const useProjectActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProject = async (data: CreateProjectRequest): Promise<Project | null> => {
    try {
      setLoading(true);
      setError(null);
      const project = await projectsApi.createProject(data);
      return project;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (id: string, data: UpdateProjectRequest): Promise<Project | null> => {
    try {
      setLoading(true);
      setError(null);
      const project = await projectsApi.updateProject(id, data);
      return project;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await projectsApi.deleteProject(id);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const archiveProject = async (id: string): Promise<Project | null> => {
    try {
      setLoading(true);
      setError(null);
      const project = await projectsApi.archiveProject(id);
      return project;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const duplicateProject = async (id: string, newTitle?: string): Promise<Project | null> => {
    try {
      setLoading(true);
      setError(null);
      const project = await projectsApi.duplicateProject(id, { title: newTitle });
      return project;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addParticipant = async (projectId: string, userId: string, role: import('../types/project.types').ParticipantRole) => {
    try {
      setLoading(true);
      setError(null);
      const participant = await projectsApi.addParticipant(projectId, { userId, role });
      return participant;
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
    createProject,
    updateProject,
    deleteProject,
    archiveProject,
    duplicateProject,
    addParticipant,
    clearError: () => setError(null)
  };
};

// Hook pour les statistiques des projets
export const useProjectStats = () => {
  const [stats, setStats] = useState<{
    total: number;
    byStatus: Record<string, number>;
    recent: Project[];
    myProjects: number;
    participatingProjects: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Implémenter getProjectStats dans l'API
      const statsData = {
        total: 0,
        byStatus: {},
        recent: [],
        myProjects: 0,
        participatingProjects: 0
      };
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

// Hook pour la recherche en temps réel
export const useProjectSearch = (debounceMs: number = 300) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Project[]>([]);
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
      const response = await projectsApi.listProjects({
        search: term,
        limit: 10
      });
      setResults(response.projects);
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

// Hook pour la pagination
export const usePagination = (initialPage: number = 1, initialLimit: number = 12) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const nextPage = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage(prev => Math.max(1, prev - 1));
  }, []);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);

  const reset = useCallback(() => {
    setPage(initialPage);
    setLimit(initialLimit);
  }, [initialPage, initialLimit]);

  return {
    page,
    limit,
    goToPage,
    nextPage,
    prevPage,
    changeLimit,
    reset
  };
};

// Hook pour les filtres de projets
export const useProjectFilters = () => {
  const [filters, setFilters] = useState<ProjectFilters>({});

  const updateFilter = useCallback((key: keyof ProjectFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const removeFilter = useCallback((key: keyof ProjectFilters) => {
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
    const value = filters[key as keyof ProjectFilters];
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

export default {
  useProjects,
  useProject,
  useProjectActions,
  useProjectStats,
  useProjectSearch,
  usePagination,
  useProjectFilters
};