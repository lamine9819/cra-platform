"use strict";
// src/routes/admin/dashboard.admin.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_admin_controller_1 = require("../../controllers/admin/dashboard.admin.controller");
const auth_1 = require("../../middlewares/auth");
const adminAuth_1 = require("../../middlewares/adminAuth");
const router = (0, express_1.Router)();
/**
 * Toutes les routes nécessitent une authentification et le rôle ADMINISTRATEUR
 */
router.use(auth_1.authenticate);
router.use(adminAuth_1.requireAdmin);
/**
 * GET /api/admin/dashboard
 * Récupère toutes les données du dashboard (stats + alertes + activité récente + graphiques)
 *
 * Query params optionnels:
 * - startDate: Date de début pour filtrer les activités (ISO 8601)
 * - endDate: Date de fin pour filtrer les activités (ISO 8601)
 * - themeId: ID du thème pour filtrer les activités
 * - stationId: ID de la station pour filtrer les activités
 *
 * @returns {DashboardData} Données complètes du dashboard
 *
 * @example
 * GET /api/admin/dashboard
 * GET /api/admin/dashboard?startDate=2024-01-01&endDate=2024-12-31
 * GET /api/admin/dashboard?themeId=abc123
 */
router.get('/', dashboard_admin_controller_1.dashboardAdminController.getDashboard.bind(dashboard_admin_controller_1.dashboardAdminController));
/**
 * GET /api/admin/dashboard/stats
 * Récupère uniquement les statistiques globales
 *
 * Query params optionnels: startDate, endDate, themeId, stationId (voir ci-dessus)
 *
 * @returns {DashboardStatsResponse} Statistiques globales
 *
 * @example
 * GET /api/admin/dashboard/stats
 */
router.get('/stats', dashboard_admin_controller_1.dashboardAdminController.getStats.bind(dashboard_admin_controller_1.dashboardAdminController));
/**
 * GET /api/admin/dashboard/alerts
 * Récupère uniquement les alertes système
 *
 * @returns {DashboardAlertsResponse} Liste des alertes
 *
 * @example
 * GET /api/admin/dashboard/alerts
 */
router.get('/alerts', dashboard_admin_controller_1.dashboardAdminController.getAlerts.bind(dashboard_admin_controller_1.dashboardAdminController));
/**
 * GET /api/admin/dashboard/recent
 * Récupère l'activité récente du système depuis les audit logs
 *
 * Query params optionnels:
 * - limit: Nombre d'entrées à retourner (défaut: 20, max: 100)
 *
 * @returns {DashboardRecentActivityResponse} Activité récente
 *
 * @example
 * GET /api/admin/dashboard/recent
 * GET /api/admin/dashboard/recent?limit=50
 */
router.get('/recent', dashboard_admin_controller_1.dashboardAdminController.getRecentActivity.bind(dashboard_admin_controller_1.dashboardAdminController));
/**
 * GET /api/admin/dashboard/charts
 * Récupère les données pour les graphiques
 *
 * @returns {DashboardChartsResponse} Données pour graphiques
 *
 * @example
 * GET /api/admin/dashboard/charts
 */
router.get('/charts', dashboard_admin_controller_1.dashboardAdminController.getCharts.bind(dashboard_admin_controller_1.dashboardAdminController));
exports.default = router;
//# sourceMappingURL=dashboard.admin.routes.js.map