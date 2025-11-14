// src/services/api/formationService.ts
import api from '../api';
import type {
  ShortTrainingReceived,
  DiplomaticTrainingReceived,
  TrainingGiven,
  Supervision,
  CreateShortTrainingReceivedRequest,
  CreateDiplomaticTrainingReceivedRequest,
  CreateTrainingGivenRequest,
  CreateSupervisionRequest,
  FormationReport,
} from '../../types/formation.types';

export const formationService = {
  // ============= FORMATIONS COURTES REÇUES =============

  /**
   * Créer une formation courte reçue
   */
  async createShortTrainingReceived(data: CreateShortTrainingReceivedRequest): Promise<ShortTrainingReceived> {
    const response = await api.post('/trainings/short-received', data);
    return response.data.data;
  },

  /**
   * Récupérer toutes les formations courtes reçues de l'utilisateur
   */
  async getUserShortTrainingsReceived(): Promise<ShortTrainingReceived[]> {
    const response = await api.get('/trainings/short-received');
    return response.data.data;
  },

  /**
   * Supprimer une formation courte reçue
   */
  async deleteShortTrainingReceived(trainingId: string): Promise<void> {
    await api.delete(`/trainings/short-received/${trainingId}`);
  },

  // ============= FORMATIONS DIPLÔMANTES REÇUES =============

  /**
   * Créer une formation diplômante reçue
   */
  async createDiplomaticTrainingReceived(
    data: CreateDiplomaticTrainingReceivedRequest
  ): Promise<DiplomaticTrainingReceived> {
    const response = await api.post('/trainings/diplomatic-received', data);
    return response.data.data;
  },

  /**
   * Récupérer toutes les formations diplômantes reçues de l'utilisateur
   */
  async getUserDiplomaticTrainingsReceived(): Promise<DiplomaticTrainingReceived[]> {
    const response = await api.get('/trainings/diplomatic-received');
    return response.data.data;
  },

  /**
   * Supprimer une formation diplômante reçue
   */
  async deleteDiplomaticTrainingReceived(trainingId: string): Promise<void> {
    await api.delete(`/trainings/diplomatic-received/${trainingId}`);
  },

  // ============= FORMATIONS DISPENSÉES =============

  /**
   * Créer une formation dispensée
   */
  async createTrainingGiven(data: CreateTrainingGivenRequest): Promise<TrainingGiven> {
    const response = await api.post('/trainings/given', data);
    return response.data.data;
  },

  /**
   * Récupérer toutes les formations dispensées de l'utilisateur
   */
  async getUserTrainingsGiven(): Promise<TrainingGiven[]> {
    const response = await api.get('/trainings/given');
    return response.data.data;
  },

  /**
   * Supprimer une formation dispensée
   */
  async deleteTrainingGiven(trainingId: string): Promise<void> {
    await api.delete(`/trainings/given/${trainingId}`);
  },

  // ============= ENCADREMENTS =============

  /**
   * Créer un encadrement
   */
  async createSupervision(data: CreateSupervisionRequest): Promise<Supervision> {
    const response = await api.post('/supervisions', data);
    return response.data.data;
  },

  /**
   * Récupérer tous les encadrements de l'utilisateur
   */
  async getUserSupervisions(): Promise<Supervision[]> {
    const response = await api.get('/supervisions');
    return response.data.data;
  },

  /**
   * Supprimer un encadrement
   */
  async deleteSupervision(supervisionId: string): Promise<void> {
    await api.delete(`/supervisions/${supervisionId}`);
  },

  // ============= RAPPORTS =============

  /**
   * Récupérer le rapport de formation d'un utilisateur
   */
  async getUserFormationReport(userId?: string): Promise<FormationReport> {
    const url = userId ? `/reports/user/${userId}` : '/reports/user';
    const response = await api.get(url);
    return response.data.data;
  },

  /**
   * Récupérer le rapport global de toutes les formations (coordinateur/admin)
   */
  async getAllUsersFormationReport(): Promise<FormationReport[]> {
    const response = await api.get('/reports/global');
    return response.data.data;
  },

  /**
   * Télécharger un rapport de formation en PDF
   */
  async downloadFormationReport(userId?: string): Promise<Blob> {
    const url = userId ? `/reports/download?userId=${userId}` : '/reports/download';
    const response = await api.get(url, {
      responseType: 'blob',
    });
    return response.data;
  },

  // ============= HEALTH CHECK =============

  /**
   * Vérifier la santé du service de formation
   */
  async checkHealth(): Promise<{ success: boolean; message: string; timestamp: string; version: string }> {
    const response = await api.get('/health');
    return response.data;
  },
};
