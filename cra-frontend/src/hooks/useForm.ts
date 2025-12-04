// src/hooks/useForm.ts - Hook pour gérer un formulaire individuel

import { useState, useEffect, useCallback } from 'react';
import {
  Form,
  UpdateFormRequest,
  FormShare,
  ShareFormRequest,
  PublicShareInfo,
  FormComment,
  FormResponseData,
} from '../types/form.types';
import formApi from '../services/formApi';
import { toast } from 'react-hot-toast';

interface UseFormResult {
  form: Form | null;
  loading: boolean;
  error: string | null;
  shares: FormShare[];
  comments: FormComment[];
  responses: FormResponseData[];
  refreshForm: () => Promise<void>;
  updateForm: (data: UpdateFormRequest) => Promise<void>;
  deleteForm: () => Promise<void>;
  duplicateForm: () => Promise<Form>;
  shareWithUser: (data: ShareFormRequest) => Promise<void>;
  createPublicLink: (options?: { maxSubmissions?: number; expiresAt?: string }) => Promise<PublicShareInfo>;
  removeShare: (shareId: string) => Promise<void>;
  loadShares: () => Promise<void>;
  loadComments: () => Promise<void>;
  loadResponses: (params?: { page?: number; limit?: number }) => Promise<void>;
  addComment: (content: string) => Promise<void>;
}

export function useForm(formId: string | null): UseFormResult {
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shares, setShares] = useState<FormShare[]>([]);
  const [comments, setComments] = useState<FormComment[]>([]);
  const [responses, setResponses] = useState<FormResponseData[]>([]);

  const loadForm = useCallback(async () => {
    if (!formId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await formApi.getFormById(formId, true);
      setForm(data);

      if (data.shares) {
        setShares(data.shares);
      }

      if (data.comments) {
        setComments(data.comments);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement du formulaire';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    loadForm();
  }, [loadForm]);

  const refreshForm = useCallback(async () => {
    await loadForm();
  }, [loadForm]);

  const updateForm = useCallback(
    async (data: UpdateFormRequest) => {
      if (!formId) return;

      try {
        const updated = await formApi.updateForm(formId, data);
        setForm(updated);
        toast.success('Formulaire mis à jour avec succès');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
        toast.error(message);
        throw err;
      }
    },
    [formId]
  );

  const deleteForm = useCallback(async () => {
    if (!formId) return;

    try {
      await formApi.deleteForm(formId);
      toast.success('Formulaire supprimé avec succès');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      toast.error(message);
      throw err;
    }
  }, [formId]);

  const duplicateForm = useCallback(async (): Promise<Form> => {
    if (!formId) throw new Error('ID du formulaire requis');

    try {
      const duplicated = await formApi.duplicateForm(formId);
      toast.success('Formulaire dupliqué avec succès');
      return duplicated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la duplication';
      toast.error(message);
      throw err;
    }
  }, [formId]);

  const shareWithUser = useCallback(
    async (data: ShareFormRequest) => {
      if (!formId) return;

      try {
        await formApi.shareFormWithUser(formId, data);
        toast.success('Formulaire partagé avec succès');
        await loadShares();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur lors du partage';
        toast.error(message);
        throw err;
      }
    },
    [formId]
  );

  const loadShares = useCallback(async () => {
    if (!formId) return;

    try {
      const data = await formApi.getFormShares(formId);
      setShares(data);
    } catch (err) {
      console.error('Erreur chargement partages:', err);
    }
  }, [formId]);

  const createPublicLink = useCallback(
    async (options?: { maxSubmissions?: number; expiresAt?: string }): Promise<PublicShareInfo> => {
      if (!formId) throw new Error('ID du formulaire requis');

      try {
        const linkInfo = await formApi.createPublicShareLink(formId, options);
        toast.success('Lien public créé avec succès');
        await loadShares();
        return linkInfo;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur lors de la création du lien';
        toast.error(message);
        throw err;
      }
    },
    [formId, loadShares]
  );

  const removeShare = useCallback(async (shareId: string) => {
    try {
      await formApi.removeFormShare(shareId);
      toast.success('Partage supprimé avec succès');
      await loadShares();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression du partage';
      toast.error(message);
      throw err;
    }
  }, [loadShares]);

  const loadComments = useCallback(async () => {
    if (!formId) return;

    try {
      const data = await formApi.getFormComments(formId);
      setComments(data.comments);
    } catch (err) {
      console.error('Erreur chargement commentaires:', err);
    }
  }, [formId]);

  const loadResponses = useCallback(
    async (params?: { page?: number; limit?: number }) => {
      if (!formId) return;

      try {
        const data = await formApi.getFormResponses(formId, params);
        setResponses(data.responses);
      } catch (err) {
        console.error('Erreur chargement réponses:', err);
      }
    },
    [formId]
  );

  const addComment = useCallback(
    async (content: string) => {
      if (!formId) return;

      try {
        await formApi.addComment(formId, { content });
        toast.success('Commentaire ajouté avec succès');
        await loadComments();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur lors de l\'ajout du commentaire';
        toast.error(message);
        throw err;
      }
    },
    [formId, loadComments]
  );

  return {
    form,
    loading,
    error,
    shares,
    comments,
    responses,
    refreshForm,
    updateForm,
    deleteForm,
    duplicateForm,
    shareWithUser,
    createPublicLink,
    removeShare,
    loadShares,
    loadComments,
    loadResponses,
    addComment,
  };
}
