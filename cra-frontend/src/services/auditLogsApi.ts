// src/services/auditLogsApi.ts
import api from './api';
import {
  AuditLog,
  AuditLogListQuery,
  AuditLogListResponse,
  AuditLogStats,
  AuditLogStatsQuery,
} from '../types/auditLog.types';

export const auditLogsApi = {
  /**
   * Récupérer tous les logs d'audit avec filtres et pagination
   */
  getAuditLogs: async (params?: AuditLogListQuery): Promise<AuditLogListResponse> => {
    const response = await api.get<{ success: boolean; data: AuditLog[]; pagination: any }>(
      '/audit-logs',
      { params }
    );
    return {
      logs: response.data.data,
      total: response.data.pagination.total,
      page: response.data.pagination.page,
      totalPages: response.data.pagination.totalPages,
      limit: response.data.pagination.limit,
    };
  },

  /**
   * Récupérer un log d'audit spécifique
   */
  getAuditLogById: async (id: string): Promise<AuditLog> => {
    const response = await api.get<{ success: boolean; data: AuditLog }>(`/audit-logs/${id}`);
    return response.data.data;
  },

  /**
   * Récupérer les statistiques des logs d'audit
   */
  getAuditLogStats: async (params?: AuditLogStatsQuery): Promise<AuditLogStats> => {
    const response = await api.get<{ success: boolean; data: AuditLogStats }>(
      '/audit-logs/stats',
      { params }
    );
    return response.data.data;
  },

  /**
   * Récupérer l'historique d'une entité spécifique
   */
  getEntityHistory: async (entityType: string, entityId: string): Promise<AuditLog[]> => {
    const response = await api.get<{ success: boolean; data: AuditLog[] }>(
      `/audit-logs/entity/${entityType}/${entityId}`
    );
    return response.data.data;
  },

  /**
   * Exporter les logs d'audit au format CSV
   */
  exportAuditLogs: async (params?: AuditLogListQuery): Promise<Blob> => {
    const response = await api.get('/audit-logs/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Nettoyer les anciens logs (réservé aux super admins)
   */
  cleanOldLogs: async (daysToKeep: number = 90): Promise<{ deletedCount: number; cutoffDate: string }> => {
    const response = await api.post<{
      success: boolean;
      data: { deletedCount: number; cutoffDate: string };
    }>('/audit-logs/clean', { daysToKeep });
    return response.data.data;
  },
};

export default auditLogsApi;
