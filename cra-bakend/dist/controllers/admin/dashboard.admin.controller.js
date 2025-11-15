"use strict";
// src/controllers/admin/dashboard.admin.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardAdminController = exports.DashboardAdminController = void 0;
const dashboard_admin_service_1 = require("../../services/admin/dashboard.admin.service");
/**
 * Contrôleur pour le dashboard administrateur
 */
class DashboardAdminController {
    /**
     * GET /api/admin/dashboard
     * Récupère toutes les données du dashboard
     */
    async getDashboard(req, res, next) {
        try {
            const filters = this.extractFilters(req);
            const dashboardData = await dashboard_admin_service_1.dashboardAdminService.getDashboardData(filters);
            res.status(200).json({
                success: true,
                data: dashboardData,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/admin/dashboard/stats
     * Récupère uniquement les statistiques globales
     */
    async getStats(req, res, next) {
        try {
            const filters = this.extractFilters(req);
            const summary = await dashboard_admin_service_1.dashboardAdminService.getDashboardSummary(filters);
            res.status(200).json({
                success: true,
                data: {
                    summary,
                    generatedAt: new Date(),
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/admin/dashboard/alerts
     * Récupère uniquement les alertes système
     */
    async getAlerts(req, res, next) {
        try {
            const alerts = await dashboard_admin_service_1.dashboardAdminService.getSystemAlerts();
            res.status(200).json({
                success: true,
                data: {
                    alerts,
                    generatedAt: new Date(),
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/admin/dashboard/recent
     * Récupère l'activité récente du système
     */
    async getRecentActivity(req, res, next) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 20;
            const recentActivity = await dashboard_admin_service_1.dashboardAdminService.getRecentActivity(limit);
            res.status(200).json({
                success: true,
                data: {
                    recentActivity,
                    generatedAt: new Date(),
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/admin/dashboard/charts
     * Récupère les données pour les graphiques
     */
    async getCharts(req, res, next) {
        try {
            const charts = await dashboard_admin_service_1.dashboardAdminService.getChartsData();
            res.status(200).json({
                success: true,
                data: {
                    charts,
                    generatedAt: new Date(),
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Extrait les filtres depuis les query parameters
     */
    extractFilters(req) {
        const filters = {};
        if (req.query.startDate) {
            filters.startDate = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
            filters.endDate = new Date(req.query.endDate);
        }
        if (req.query.themeId) {
            filters.themeId = req.query.themeId;
        }
        if (req.query.stationId) {
            filters.stationId = req.query.stationId;
        }
        return Object.keys(filters).length > 0 ? filters : undefined;
    }
}
exports.DashboardAdminController = DashboardAdminController;
exports.dashboardAdminController = new DashboardAdminController();
//# sourceMappingURL=dashboard.admin.controller.js.map