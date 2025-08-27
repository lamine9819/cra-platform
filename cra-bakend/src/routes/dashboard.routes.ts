// src/routes/dashboard.routes.ts - Version améliorée
import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();
const dashboardController = new DashboardController();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// =============================================
// ROUTES SPÉCIALISÉES (DOIVENT ÊTRE AVANT /)
// =============================================

// Statistiques rapides (améliorées avec formulaires)
router.get('/quick-stats', dashboardController.getQuickStats);

// Métriques de performance (améliorées avec formulaires)
router.get('/performance', dashboardController.getPerformanceMetrics);

// ========== NOUVELLES ROUTES FORMULAIRES ==========

// Statistiques spécifiques aux formulaires
router.get('/forms/stats', dashboardController.getFormStats);

// Statistiques de collecte de données
router.get('/data-collection/stats', dashboardController.getDataCollectionStats);

// =============================================
// ROUTE PRINCIPALE
// =============================================

// Dashboard principal (endpoint principal avec formulaires intégrés)
router.get('/', dashboardController.getDashboard);

export default router;