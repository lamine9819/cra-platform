// src/controllers/admin/dashboard.admin.controller.ts

import { Request, Response, NextFunction } from 'express';
import { dashboardAdminService } from '../../services/admin/dashboard.admin.service';
import { DashboardFilters } from '../../types/admin.types';

/**
 * Contrôleur pour le dashboard administrateur
 */
export class DashboardAdminController {
  /**
   * GET /api/admin/dashboard
   * Récupère toutes les données du dashboard
   */
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = this.extractFilters(req);
      const dashboardData = await dashboardAdminService.getDashboardData(filters);

      res.status(200).json({
        success: true,
        data: dashboardData,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/dashboard/stats
   * Récupère uniquement les statistiques globales
   */
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = this.extractFilters(req);
      const summary = await dashboardAdminService.getDashboardSummary(filters);

      res.status(200).json({
        success: true,
        data: {
          summary,
          generatedAt: new Date(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/dashboard/alerts
   * Récupère uniquement les alertes système
   */
  async getAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const alerts = await dashboardAdminService.getSystemAlerts();

      res.status(200).json({
        success: true,
        data: {
          alerts,
          generatedAt: new Date(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/dashboard/recent
   * Récupère l'activité récente du système
   */
  async getRecentActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const recentActivity = await dashboardAdminService.getRecentActivity(limit);

      res.status(200).json({
        success: true,
        data: {
          recentActivity,
          generatedAt: new Date(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/dashboard/charts
   * Récupère les données pour les graphiques
   */
  async getCharts(req: Request, res: Response, next: NextFunction) {
    try {
      const charts = await dashboardAdminService.getChartsData();

      res.status(200).json({
        success: true,
        data: {
          charts,
          generatedAt: new Date(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Extrait les filtres depuis les query parameters
   */
  private extractFilters(req: Request): DashboardFilters | undefined {
    const filters: DashboardFilters = {};

    if (req.query.startDate) {
      filters.startDate = new Date(req.query.startDate as string);
    }

    if (req.query.endDate) {
      filters.endDate = new Date(req.query.endDate as string);
    }

    if (req.query.themeId) {
      filters.themeId = req.query.themeId as string;
    }

    if (req.query.stationId) {
      filters.stationId = req.query.stationId as string;
    }

    return Object.keys(filters).length > 0 ? filters : undefined;
  }
}

export const dashboardAdminController = new DashboardAdminController();
