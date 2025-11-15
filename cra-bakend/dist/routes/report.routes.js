"use strict";
// src/routes/report.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const report_controller_1 = require("../controllers/report.controller");
const report_middleware_1 = require("../middlewares/report.middleware");
const auth_1 = require("../middlewares/auth"); // Votre middleware existant
const router = express_1.default.Router();
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