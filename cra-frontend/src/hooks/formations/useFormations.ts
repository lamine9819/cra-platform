// src/hooks/formations/useFormations.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formationService } from '../../services/api/formationService';
import type {
  CreateShortTrainingReceivedRequest,
  CreateDiplomaticTrainingReceivedRequest,
  CreateTrainingGivenRequest,
  CreateSupervisionRequest,
} from '../../types/formation.types';
import toast from 'react-hot-toast';

// Query keys
export const formationKeys = {
  all: ['formations'] as const,
  shortReceived: () => [...formationKeys.all, 'short-received'] as const,
  diplomaticReceived: () => [...formationKeys.all, 'diplomatic-received'] as const,
  given: () => [...formationKeys.all, 'given'] as const,
  supervisions: () => [...formationKeys.all, 'supervisions'] as const,
  reports: () => [...formationKeys.all, 'reports'] as const,
  userReport: (userId?: string) => [...formationKeys.reports(), 'user', userId] as const,
  globalReport: () => [...formationKeys.reports(), 'global'] as const,
};

// ============= FORMATIONS COURTES REÇUES =============

/**
 * Hook pour récupérer les formations courtes reçues
 */
export function useShortTrainingsReceived() {
  return useQuery({
    queryKey: formationKeys.shortReceived(),
    queryFn: () => formationService.getUserShortTrainingsReceived(),
  });
}

/**
 * Hook pour créer une formation courte reçue
 */
export function useCreateShortTrainingReceived() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShortTrainingReceivedRequest) =>
      formationService.createShortTrainingReceived(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: formationKeys.shortReceived() });
      queryClient.invalidateQueries({ queryKey: formationKeys.reports() });
      toast.success('Formation courte reçue créée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création');
    },
  });
}

/**
 * Hook pour supprimer une formation courte reçue
 */
export function useDeleteShortTrainingReceived() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trainingId: string) => formationService.deleteShortTrainingReceived(trainingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: formationKeys.shortReceived() });
      queryClient.invalidateQueries({ queryKey: formationKeys.reports() });
      toast.success('Formation courte reçue supprimée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression');
    },
  });
}

// ============= FORMATIONS DIPLÔMANTES REÇUES =============

/**
 * Hook pour récupérer les formations diplômantes reçues
 */
export function useDiplomaticTrainingsReceived() {
  return useQuery({
    queryKey: formationKeys.diplomaticReceived(),
    queryFn: () => formationService.getUserDiplomaticTrainingsReceived(),
  });
}

/**
 * Hook pour créer une formation diplômante reçue
 */
export function useCreateDiplomaticTrainingReceived() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDiplomaticTrainingReceivedRequest) =>
      formationService.createDiplomaticTrainingReceived(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: formationKeys.diplomaticReceived() });
      queryClient.invalidateQueries({ queryKey: formationKeys.reports() });
      toast.success('Formation diplômante reçue créée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création');
    },
  });
}

/**
 * Hook pour supprimer une formation diplômante reçue
 */
export function useDeleteDiplomaticTrainingReceived() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trainingId: string) => formationService.deleteDiplomaticTrainingReceived(trainingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: formationKeys.diplomaticReceived() });
      queryClient.invalidateQueries({ queryKey: formationKeys.reports() });
      toast.success('Formation diplômante reçue supprimée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression');
    },
  });
}

// ============= FORMATIONS DISPENSÉES =============

/**
 * Hook pour récupérer les formations dispensées
 */
export function useTrainingsGiven() {
  return useQuery({
    queryKey: formationKeys.given(),
    queryFn: () => formationService.getUserTrainingsGiven(),
  });
}

/**
 * Hook pour créer une formation dispensée
 */
export function useCreateTrainingGiven() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTrainingGivenRequest) => formationService.createTrainingGiven(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: formationKeys.given() });
      queryClient.invalidateQueries({ queryKey: formationKeys.reports() });
      toast.success('Formation dispensée créée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création');
    },
  });
}

/**
 * Hook pour supprimer une formation dispensée
 */
export function useDeleteTrainingGiven() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trainingId: string) => formationService.deleteTrainingGiven(trainingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: formationKeys.given() });
      queryClient.invalidateQueries({ queryKey: formationKeys.reports() });
      toast.success('Formation dispensée supprimée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression');
    },
  });
}

// ============= ENCADREMENTS =============

/**
 * Hook pour récupérer les encadrements
 */
export function useSupervisions() {
  return useQuery({
    queryKey: formationKeys.supervisions(),
    queryFn: () => formationService.getUserSupervisions(),
  });
}

/**
 * Hook pour créer un encadrement
 */
export function useCreateSupervision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSupervisionRequest) => formationService.createSupervision(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: formationKeys.supervisions() });
      queryClient.invalidateQueries({ queryKey: formationKeys.reports() });
      toast.success('Encadrement créé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création');
    },
  });
}

/**
 * Hook pour supprimer un encadrement
 */
export function useDeleteSupervision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (supervisionId: string) => formationService.deleteSupervision(supervisionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: formationKeys.supervisions() });
      queryClient.invalidateQueries({ queryKey: formationKeys.reports() });
      toast.success('Encadrement supprimé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression');
    },
  });
}

// ============= RAPPORTS =============

/**
 * Hook pour récupérer le rapport de formation d'un utilisateur
 */
export function useUserFormationReport(userId?: string) {
  return useQuery({
    queryKey: formationKeys.userReport(userId),
    queryFn: () => formationService.getUserFormationReport(userId),
  });
}

/**
 * Hook pour récupérer le rapport global
 */
export function useGlobalFormationReport() {
  return useQuery({
    queryKey: formationKeys.globalReport(),
    queryFn: () => formationService.getAllUsersFormationReport(),
  });
}

/**
 * Hook pour télécharger un rapport de formation
 */
export function useDownloadFormationReport() {
  return useMutation({
    mutationFn: async (userId?: string) => {
      const blob = await formationService.downloadFormationReport(userId);

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport-formation-${userId || 'personnel'}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast.success('Rapport téléchargé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors du téléchargement');
    },
  });
}
