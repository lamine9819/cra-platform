"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/dashboard.routes.ts - Version améliorée
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const dashboardController = new dashboard_controller_1.DashboardController();
// Toutes les routes nécessitent une authentification
router.use(auth_1.authenticate);
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
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map