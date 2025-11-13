// src/routes/report.routes.ts

import express from 'express';
import { reportController } from '../controllers/report.controller';
import { checkReportAccess } from '../middlewares/report.middleware';
import { authenticate } from '../middlewares/auth'; // Votre middleware existant

const router = express.Router();

/**
 * @route   POST /api/reports/generate
 * @desc    Génère un rapport trimestriel
 * @access  Coordinateur de projet, Administrateur
 */
router.post(
  '/generate',
  authenticate,
  checkReportAccess,
  reportController.generateReport.bind(reportController)
);

/**
 * @route   POST /api/reports/generate-annual
 * @desc    Génère un rapport annuel (tous les trimestres)
 * @access  Coordinateur de projet, Administrateur
 */
router.post(
  '/generate-annual',
  authenticate,
  checkReportAccess,
  reportController.generateAnnualReport.bind(reportController)
);

/**
 * @route   GET /api/reports/available
 * @desc    Récupère la liste des rapports disponibles
 * @access  Coordinateur de projet, Administrateur
 */
router.get(
  '/available',
  authenticate,
  checkReportAccess,
  reportController.getAvailableReports.bind(reportController)
);

/**
 * @route   GET /api/reports/quarters
 * @desc    Récupère les trimestres disponibles pour une année
 * @access  Coordinateur de projet, Administrateur
 */
router.get(
  '/quarters',
  authenticate,
  checkReportAccess,
  reportController.getAvailableQuarters.bind(reportController)
);

/**
 * @route   GET /api/reports/stats/quarterly
 * @desc    Récupère les statistiques trimestrielles
 * @access  Coordinateur de projet, Administrateur
 */
router.get(
  '/stats/quarterly',
  authenticate,
  checkReportAccess,
  reportController.getQuarterlyStats.bind(reportController)
);

/**
 * @route   GET /api/reports/stats/annual
 * @desc    Récupère les statistiques annuelles
 * @access  Coordinateur de projet, Administrateur
 */
router.get(
  '/stats/annual',
  authenticate,
  checkReportAccess,
  reportController.getAnnualStats.bind(reportController)
);

/**
 * @route   GET /api/reports/compare
 * @desc    Compare les statistiques entre deux trimestres
 * @access  Coordinateur de projet, Administrateur
 */
router.get(
  '/compare',
  authenticate,
  checkReportAccess,
  reportController.compareQuarters.bind(reportController)
);

/**
 * @route   DELETE /api/reports/clean
 * @desc    Nettoie les anciens rapports
 * @access  Administrateur
 */
router.delete(
  '/clean',
  authenticate,
  checkReportAccess,
  reportController.cleanOldReports.bind(reportController)
);

export default router;