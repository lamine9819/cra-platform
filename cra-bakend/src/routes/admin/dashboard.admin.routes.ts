// src/routes/admin/dashboard.admin.routes.ts

import { Router } from 'express';
import { dashboardAdminController } from '../../controllers/admin/dashboard.admin.controller';
import { authenticate } from '../../middlewares/auth';
import { requireAdmin } from '../../middlewares/adminAuth';

const router = Router();

/**
 * Toutes les routes nécessitent une authentification et le rôle ADMINISTRATEUR
 */
router.use(authenticate as any);
router.use(requireAdmin as any);

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
router.get('/', dashboardAdminController.getDashboard.bind(dashboardAdminController));

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
router.get('/stats', dashboardAdminController.getStats.bind(dashboardAdminController));

/**
 * GET /api/admin/dashboard/alerts
 * Récupère uniquement les alertes système
 *
 * @returns {DashboardAlertsResponse} Liste des alertes
 *
 * @example
 * GET /api/admin/dashboard/alerts
 */
router.get('/alerts', dashboardAdminController.getAlerts.bind(dashboardAdminController));

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
router.get('/recent', dashboardAdminController.getRecentActivity.bind(dashboardAdminController));

/**
 * GET /api/admin/dashboard/charts
 * Récupère les données pour les graphiques
 *
 * @returns {DashboardChartsResponse} Données pour graphiques
 *
 * @example
 * GET /api/admin/dashboard/charts
 */
router.get('/charts', dashboardAdminController.getCharts.bind(dashboardAdminController));

export default router;
