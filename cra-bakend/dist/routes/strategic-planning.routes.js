"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/strategic-planning.routes.ts - VERSION COMPLÈTE
const express_1 = require("express");
const strategic_planning_controller_1 = require("../controllers/strategic-planning.controller");
const auth_1 = require("../middlewares/auth");
const authorization_1 = require("../middlewares/authorization");
const router = (0, express_1.Router)();
const strategicPlanningController = new strategic_planning_controller_1.StrategicPlanningController();
// Middleware d'authentification obligatoire pour toutes les routes
router.use(auth_1.authenticate);
// ========================================
// ROUTES POUR LES PLANS STRATÉGIQUES
// ========================================
// GET /api/strategic-planning/plans - Lister tous les plans stratégiques
router.get('/plans', strategicPlanningController.getStrategicPlans);
// GET /api/strategic-planning/plans/:id - Obtenir un plan stratégique par ID
router.get('/plans/:id', strategicPlanningController.getStrategicPlanById);
// POST /api/strategic-planning/plans - Créer un nouveau plan stratégique
router.post('/plans', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'COORDONATEUR_PROJET']), strategicPlanningController.createStrategicPlan);
// PUT /api/strategic-planning/plans/:id - Modifier un plan stratégique
router.put('/plans/:id', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'COORDONATEUR_PROJET']), strategicPlanningController.updateStrategicPlan);
// DELETE /api/strategic-planning/plans/:id - Supprimer un plan stratégique
router.delete('/plans/:id', (0, authorization_1.authorize)(['ADMINISTRATEUR']), strategicPlanningController.deleteStrategicPlan);
// ========================================
// ROUTES POUR LES AXES STRATÉGIQUES
// ========================================
// GET /api/strategic-planning/axes - Lister tous les axes stratégiques
router.get('/axes', strategicPlanningController.getStrategicAxes);
// GET /api/strategic-planning/axes/:id - Obtenir un axe stratégique par ID
router.get('/axes/:id', strategicPlanningController.getStrategicAxisById);
// POST /api/strategic-planning/axes - Créer un nouvel axe stratégique
router.post('/axes', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'COORDONATEUR_PROJET']), strategicPlanningController.createStrategicAxis);
// PUT /api/strategic-planning/axes/:id - Modifier un axe stratégique
router.put('/axes/:id', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'COORDONATEUR_PROJET']), strategicPlanningController.updateStrategicAxis);
// DELETE /api/strategic-planning/axes/:id - Supprimer un axe stratégique
router.delete('/axes/:id', (0, authorization_1.authorize)(['ADMINISTRATEUR']), strategicPlanningController.deleteStrategicAxis);
// ========================================
// ROUTES POUR LES SOUS-AXES STRATÉGIQUES
// ========================================
// GET /api/strategic-planning/sub-axes - Lister tous les sous-axes stratégiques
router.get('/sub-axes', strategicPlanningController.getStrategicSubAxes);
// GET /api/strategic-planning/sub-axes/:id - Obtenir un sous-axe stratégique par ID
router.get('/sub-axes/:id', strategicPlanningController.getStrategicSubAxisById);
// POST /api/strategic-planning/sub-axes - Créer un nouveau sous-axe stratégique
router.post('/sub-axes', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'COORDONATEUR_PROJET']), strategicPlanningController.createStrategicSubAxis);
// PUT /api/strategic-planning/sub-axes/:id - Modifier un sous-axe stratégique
router.put('/sub-axes/:id', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'COORDONATEUR_PROJET']), strategicPlanningController.updateStrategicSubAxis);
// DELETE /api/strategic-planning/sub-axes/:id - Supprimer un sous-axe stratégique
router.delete('/sub-axes/:id', (0, authorization_1.authorize)(['ADMINISTRATEUR']), strategicPlanningController.deleteStrategicSubAxis);
// ========================================
// ROUTES POUR LES PROGRAMMES DE RECHERCHE
// ========================================
// GET /api/strategic-planning/programs - Lister tous les programmes de recherche
router.get('/programs', strategicPlanningController.getResearchPrograms);
// GET /api/strategic-planning/programs/:id - Obtenir un programme de recherche par ID
router.get('/programs/:id', strategicPlanningController.getResearchProgramById);
// POST /api/strategic-planning/programs - Créer un nouveau programme de recherche
router.post('/programs', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'COORDONATEUR_PROJET']), strategicPlanningController.createResearchProgram);
// PUT /api/strategic-planning/programs/:id - Modifier un programme de recherche
router.put('/programs/:id', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'COORDONATEUR_PROJET']), strategicPlanningController.updateResearchProgram);
// DELETE /api/strategic-planning/programs/:id - Supprimer un programme de recherche
router.delete('/programs/:id', (0, authorization_1.authorize)(['ADMINISTRATEUR']), strategicPlanningController.deleteResearchProgram);
// ========================================
// ROUTES POUR LES THÈMES DE RECHERCHE
// ========================================
// GET /api/strategic-planning/themes - Lister tous les thèmes de recherche
router.get('/themes', strategicPlanningController.getResearchThemes);
// GET /api/strategic-planning/themes/:id - Obtenir un thème de recherche par ID
router.get('/themes/:id', strategicPlanningController.getResearchThemeById);
// POST /api/strategic-planning/themes - Créer un nouveau thème de recherche
router.post('/themes', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'COORDONATEUR_PROJET']), strategicPlanningController.createResearchTheme);
// PUT /api/strategic-planning/themes/:id - Modifier un thème de recherche
router.put('/themes/:id', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'COORDONATEUR_PROJET']), strategicPlanningController.updateResearchTheme);
// DELETE /api/strategic-planning/themes/:id - Supprimer un thème de recherche
router.delete('/themes/:id', (0, authorization_1.authorize)(['ADMINISTRATEUR']), strategicPlanningController.deleteResearchTheme);
// ========================================
// ROUTES POUR LES STATIONS DE RECHERCHE
// ========================================
// GET /api/strategic-planning/stations - Lister toutes les stations de recherche
router.get('/stations', strategicPlanningController.getResearchStations);
// POST /api/strategic-planning/stations - Créer une nouvelle station de recherche
router.post('/stations', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'COORDONATEUR_PROJET']), strategicPlanningController.createResearchStation);
// PUT /api/strategic-planning/stations/:id - Modifier une station de recherche
router.put('/stations/:id', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'COORDONATEUR_PROJET']), strategicPlanningController.updateResearchStation);
// DELETE /api/strategic-planning/stations/:id - Supprimer une station de recherche
router.delete('/stations/:id', (0, authorization_1.authorize)(['ADMINISTRATEUR']), strategicPlanningController.deleteResearchStation);
// ========================================
// ROUTES UTILITAIRES
// ========================================
// GET /api/strategic-planning/hierarchy - Obtenir la hiérarchie stratégique complète
router.get('/hierarchy', strategicPlanningController.getStrategicHierarchy);
// GET /api/strategic-planning/stats - Obtenir les statistiques de planification stratégique
router.get('/stats', strategicPlanningController.getStrategicPlanningStats);
// GET /api/strategic-planning/coordinators - Obtenir la liste des coordinateurs éligibles
router.get('/coordinators', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'COORDONATEUR_PROJET']), strategicPlanningController.getEligibleCoordinators);
exports.default = router;
//# sourceMappingURL=strategic-planning.routes.js.map