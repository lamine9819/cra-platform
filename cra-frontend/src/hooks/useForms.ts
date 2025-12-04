// src/hooks/useForms.ts - Hook pour gérer les formulaires

import { useState, useEffect, useCallback } from 'react';
import { Form, FormFilters } from '../types/form.types';
import formApi from '../services/formApi';
import { toast } from 'react-hot-toast';

interface UseFormsResult {
  forms: Form[];
  loading: boolean;
  error: string | null;
  pagination: any;
  refreshForms: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export function useForms(filters?: FormFilters): UseFormsResult {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [page, setPage] = useState(1);

  // Extract search from filters to avoid object reference issues
  const searchQuery = filters?.search;

  const loadForms = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      try {
        setLoading(true);
        setError(null);

        const response = await formApi.listForms({
          page: pageNum,
          limit: 10,
          search: searchQuery,
        });

        if (append) {
          setForms((prev) => [...prev, ...response.forms]);
        } else {
          setForms(response.forms);
        }

        setPagination(response.pagination);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur lors du chargement des formulaires';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [searchQuery]
  );

  useEffect(() => {
    loadForms(1, false);
  }, [searchQuery]);

  const refreshForms = useCallback(async () => {
    setPage(1);
    try {
      setLoading(true);
      setError(null);

      const response = await formApi.listForms({
        page: 1,
        limit: 10,
        search: searchQuery,
      });

      setForms(response.forms);
      setPagination(response.pagination);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des formulaires';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const loadMore = useCallback(async () => {
    if (pagination?.hasNext) {
      const nextPage = page + 1;
      setPage(nextPage);

      try {
        setLoading(true);

        const response = await formApi.listForms({
          page: nextPage,
          limit: 10,
          search: searchQuery,
        });

        setForms((prev) => [...prev, ...response.forms]);
        setPagination(response.pagination);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur lors du chargement des formulaires';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
  }, [page, pagination, searchQuery]);

  return {
    forms,
    loading,
    error,
    pagination,
    refreshForms,
    loadMore,
    hasMore: pagination?.hasNext || false,
  };
}
