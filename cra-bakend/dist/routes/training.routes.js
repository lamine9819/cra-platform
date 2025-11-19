"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/training.routes.ts
const express_1 = require("express");
const formation_controller_1 = require("../controllers/formation.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const formationController = new formation_controller_1.FormationController();
// =============================================
// ROUTES SPÉCIFIQUES (DOIVENT ÊTRE AVANT /:id)
// =============================================
// Rapports de formation
router.get('/reports', auth_1.authenticate, formationController.getAllUsersFormationReport);
router.get('/reports/:userId', auth_1.authenticate, formationController.getUserFormationReport);
router.get('/download', auth_1.authenticate, formationController.downloadFormationReport);
// =============================================
// FORMATIONS COURTES REÇUES
// =============================================
router.post('/short-received', auth_1.authenticate, formationController.createShortTrainingReceived);
router.get('/short-received', auth_1.authenticate, formationController.getUserShortTrainingsReceived);
router.delete('/short-received/:trainingId', auth_1.authenticate, formationController.deleteShortTrainingReceived);
// =============================================
// FORMATIONS DIPLÔMANTES REÇUES
// =============================================
router.post('/diplomatic-received', auth_1.authenticate, formationController.createDiplomaticTrainingReceived);
router.get('/diplomatic-received', auth_1.authenticate, formationController.getUserDiplomaticTrainingsReceived);
router.delete('/diplomatic-received/:trainingId', auth_1.authenticate, formationController.deleteDiplomaticTrainingReceived);
// =============================================
// FORMATIONS DISPENSÉES
// =============================================
router.post('/given', auth_1.authenticate, formationController.createTrainingGiven);
router.get('/given', auth_1.authenticate, formationController.getUserTrainingsGiven);
router.delete('/given/:trainingId', auth_1.authenticate, formationController.deleteTrainingGiven);
exports.default = router;
//# sourceMappingURL=training.routes.js.map