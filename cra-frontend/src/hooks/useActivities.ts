// src/hooks/useActivities.ts - Version optimisée
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import activitiesApi, { Activity, ActivityFilters, CreateActivityRequest, UpdateActivityRequest } from '../services/activitiesApi';

// Cache global pour les activités
const activitiesCacheRef = {
  current: new Map<string, {
    data: {
      activities: Activity[];
      pagination: any;
    };
    timestamp: number;
    filters: ActivityFilters;
  }>()
};

const CACHE_DURATION = 30000; // 30 secondes

function filtersEqual(a: ActivityFilters, b: ActivityFilters): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// Hook principal pour la liste des activités - optimisé
export const useActivities = (initialFilters?: ActivityFilters) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  const prevFiltersRef = useRef<ActivityFilters>({});
  const requestIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Mémoriser les filtres pour éviter les changements inutiles
  const memoizedFilters = useMemo(() => {
    return {
      search: initialFilters?.search || undefined,
      projectId: initialFilters?.projectId || undefined,
      location: initialFilters?.location || undefined,
      startDate: initialFilters?.startDate || undefined,
      endDate: initialFilters?.endDate || undefined,
      hasResults: initialFilters?.hasResults,
      page: initialFilters?.page || 1,
      limit: initialFilters?.limit || 100, // Par défaut 100 pour les select
      sortBy: initialFilters?.sortBy || 'updatedAt',
      sortOrder: initialFilters?.sortOrder || 'desc'
    };
  }, [initialFilters]);

  const loadActivities = useCallback(async (filters: ActivityFilters = {}) => {
    const finalFilters = { ...memoizedFilters, ...filters };
    
    // Éviter les requêtes identiques
    if (filtersEqual(finalFilters, prevFiltersRef.current)) {
      return;
    }

    // Vérifier le cache
    const cacheKey = JSON.stringify(finalFilters);
    const cached = activitiesCacheRef.current.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log('📦 Using cached activities data');
      setActivities(cached.data.activities);
      setPagination(cached.data.pagination);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      // Annuler la requête précédente
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const currentRequestId = ++requestIdRef.current;
      
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading activities with filters:', finalFilters);
      
      const response = await activitiesApi.listActivities(finalFilters);
      
      // Vérifier si c'est toujours la requête actuelle
      if (currentRequestId !== requestIdRef.current) {
        console.log('⏭️ Ignoring outdated activities request');
        return;
      }

      setActivities(response.activities);
      setPagination(response.pagination);
      prevFiltersRef.current = finalFilters;

      // Mettre en cache
      activitiesCacheRef.current.set(cacheKey, {
        data: response,
        timestamp: now,
        filters: finalFilters
      });

      console.log('✅ Activities loaded successfully:', response.activities.length);
      
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('🚫 Activities request was aborted');
        return;
      }
      
      console.error('❌ Error loading activities:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [memoizedFilters]);

  const refetch = useCallback((filters?: ActivityFilters) => {
    // Forcer le rechargement en vidant le cache
    if (filters) {
      const cacheKey = JSON.stringify({ ...memoizedFilters, ...filters });
      activitiesCacheRef.current.delete(cacheKey);
    } else {
      activitiesCacheRef.current.clear();
    }
    return loadActivities(filters);
  }, [loadActivities, memoizedFilters]);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Délai pour éviter les appels trop fréquents
    const timeoutId = setTimeout(() => {
      if (mounted) {
        loadActivities();
      }
    }, 50); // Délai plus court pour les activités car souvent moins nombreuses

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [loadActivities]);

  return {
    activities,
    loading,
    error,
    pagination,
    refetch,
    loadActivities
  };
};

// Hook pour une activité spécifique - optimisé
export const useActivity = (activityId: string | undefined) => {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadActivity = useCallback(async () => {
    if (!activityId) {
      setLoading(false);
      return;
    }

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      
      setLoading(true);
      setError(null);
      const activityData = await activitiesApi.getActivityById(activityId);
      setActivity(activityData);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        setActivity(null);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [activityId]);

  const refetch = useCallback(() => {
    return loadActivity();
  }, [loadActivity]);

  useEffect(() => {
    loadActivity();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadActivity]);

  return {
    activity,
    loading,
    error,
    refetch
  };
};

// Hook pour les actions sur les activités - optimisé
export const useActivityActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createActivity = async (data: CreateActivityRequest): Promise<Activity | null> => {
    try {
      setLoading(true);
      setError(null);
      const activity = await activitiesApi.createActivity(data);
      
      // Vider le cache après création
      activitiesCacheRef.current.clear();
      
      return activity;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateActivity = async (id: string, data: UpdateActivityRequest): Promise<Activity | null> => {
    try {
      setLoading(true);
      setError(null);
      const activity = await activitiesApi.updateActivity(id, data);
      
      // Vider le cache après mise à jour
      activitiesCacheRef.current.clear();
      
      return activity;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteActivity = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await activitiesApi.deleteActivity(id);
      
      // Vider le cache après suppression
      activitiesCacheRef.current.clear();
      
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const duplicateActivity = async (id: string, newTitle?: string): Promise<Activity | null> => {
    try {
      setLoading(true);
      setError(null);
      const activity = await activitiesApi.duplicateActivity(id, { title: newTitle });

      // Vider le cache après duplication
      activitiesCacheRef.current.clear();

      return activity;
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
    createActivity,
    updateActivity,
    deleteActivity,
    duplicateActivity,
    clearError: () => setError(null)
  };
};

// Hook pour les activités d'un projet spécifique - optimisé
export const useProjectActivities = (projectId: string | undefined) => {
  return useActivities(projectId ? { projectId } : undefined);
};

// Hook pour les statistiques des activités - optimisé avec cache
const activityStatsCache = {
  data: null as any,
  timestamp: 0
};

export const useActivityStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    const now = Date.now();
    
    // Utiliser le cache si disponible et récent (5 minutes)
    if (activityStatsCache.data && (now - activityStatsCache.timestamp) < 300000) {
      setStats(activityStatsCache.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // TODO: Implémenter getActivityStats dans l'API
      const statsData = { total: 0, byType: {}, byStatus: {} };
      setStats(statsData);

      // Mettre en cache
      activityStatsCache.data = statsData;
      activityStatsCache.timestamp = now;
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

// Hook pour la recherche d'activités en temps réel - optimisé
export const useActivitySearch = (debounceMs: number = 500) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const search = useCallback(async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      
      setLoading(true);
      setError(null);
      // TODO: Implémenter searchActivities dans l'API
      const activities: Activity[] = [];
      setResults(activities);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        setResults([]);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      search(searchTerm);
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
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

// Hook pour les filtres d'activités
export const useActivityFilters = () => {
  const [filters, setFilters] = useState<ActivityFilters>({});

  const updateFilter = useCallback((key: keyof ActivityFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const removeFilter = useCallback((key: keyof ActivityFilters) => {
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
    const value = filters[key as keyof ActivityFilters];
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
  useActivities,
  useActivity,
  useActivityActions,
  useProjectActivities,
  useActivityStats,
  useActivitySearch,
  useActivityFilters
};