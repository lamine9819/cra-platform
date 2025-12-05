"use strict";
// src/routes/report.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const report_controller_1 = require("../controllers/report.controller");
const formation_controller_1 = require("../controllers/formation.controller");
const report_middleware_1 = require("../middlewares/report.middleware");
const auth_1 = require("../middlewares/auth"); // Votre middleware existant
const router = express_1.default.Router();
const formationController = new formation_controller_1.FormationController();
// =============================================
// RAPPORTS DE FORMATION (doivent être avant les autres routes)
// =============================================
/**
 * @route   GET /api/reports/global
 * @desc    Récupère le rapport global de toutes les formations
 * @access  Coordinateur de projet, Administrateur
 */
router.get('/global', auth_1.authenticate, formationController.getAllUsersFormationReport);
/**
 * @route   GET /api/reports/download
 * @desc    Télécharge un rapport de formation en PDF
 * @access  Coordinateur de projet, Administrateur, Chercheur (pour son propre rapport)
 */
router.get('/download', auth_1.authenticate, formationController.downloadFormationReport);
/**
 * @route   GET /api/reports/user/:userId?
 * @desc    Récupère le rapport de formation d'un utilisateur ou de soi-même
 * @access  Tous les utilisateurs authentifiés
 */
router.get('/user/:userId?', auth_1.authenticate, formationController.getUserFormationReport);
// =============================================
// RAPPORTS TRIMESTRIELS/ANNUELS
// =============================================
/**
 * @route   POST /api/reports/generate
 * @desc    Génère un rapport trimestriel
 * @access  Coordinateur de projet, Administrateur
 */
router.post('/generate', auth_1.authenticate, report_middleware_1.checkReportAccess, report_controller_1.reportController.generateReport.bind(report_controller_1.reportController));
/**
 * @route   POST /api/reports/generate-annual
 * @desc    Génère un rapport annuel (tous les trimestres)
 * @access  Coordinateur de projet, Administrateur
 */
router.post('/generate-annual', auth_1.authenticate, report_middleware_1.checkReportAccess, report_controller_1.reportController.generateAnnualReport.bind(report_controller_1.reportController));
/**
 * @route   GET /api/reports/available
 * @desc    Récupère la liste des rapports disponibles
 * @access  Coordinateur de projet, Administrateur
 */
router.get('/available', auth_1.authenticate, report_middleware_1.checkReportAccess, report_controller_1.reportController.getAvailableReports.bind(report_controller_1.reportController));
/**
 * @route   GET /api/reports/quarters
 * @desc    Récupère les trimestres disponibles pour une année
 * @access  Coordinateur de projet, Administrateur
 */
router.get('/quarters', auth_1.authenticate, report_middleware_1.checkReportAccess, report_controller_1.reportController.getAvailableQuarters.bind(report_controller_1.reportController));
/**
 * @route   GET /api/reports/stats/quarterly
 * @desc    Récupère les statistiques trimestrielles
 * @access  Coordinateur de projet, Administrateur
 */
router.get('/stats/quarterly', auth_1.authenticate, report_middleware_1.checkReportAccess, report_controller_1.reportController.getQuarterlyStats.bind(report_controller_1.reportController));
/**
 * @route   GET /api/reports/stats/annual
 * @desc    Récupère les statistiques annuelles
 * @access  Coordinateur de projet, Administrateur
 */
router.get('/stats/annual', auth_1.authenticate, report_middleware_1.checkReportAccess, report_controller_1.reportController.getAnnualStats.bind(report_controller_1.reportController));
/**
 * @route   GET /api/reports/compare
 * @desc    Compare les statistiques entre deux trimestres
 * @access  Coordinateur de projet, Administrateur
 */
router.get('/compare', auth_1.authenticate, report_middleware_1.checkReportAccess, report_controller_1.reportController.compareQuarters.bind(report_controller_1.reportController));
/**
 * @route   DELETE /api/reports/clean
 * @desc    Nettoie les anciens rapports
 * @access  Administrateur
 */
router.delete('/clean', auth_1.authenticate, report_middleware_1.checkReportAccess, report_controller_1.reportController.cleanOldReports.bind(report_controller_1.reportController));
exports.default = router;
//# sourceMappingURL=report.routes.js.map