"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/training.routes.ts
const express_1 = require("express");
const formation_controller_1 = require("../controllers/formation.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const formationController = new formation_controller_1.FormationController();
// =============================================
// FORMATIONS COURTES REÇUES
// =============================================
router.post('/short-received', auth_1.authenticate, formationController.createShortTrainingReceived.bind(formationController));
router.get('/short-received', auth_1.authenticate, formationController.getUserShortTrainingsReceived.bind(formationController));
router.put('/short-received/:trainingId', auth_1.authenticate, formationController.updateShortTrainingReceived.bind(formationController));
router.delete('/short-received/:trainingId', auth_1.authenticate, formationController.deleteShortTrainingReceived.bind(formationController));
// =============================================
// FORMATIONS DIPLÔMANTES REÇUES
// =============================================
router.post('/diplomatic-received', auth_1.authenticate, formationController.createDiplomaticTrainingReceived.bind(formationController));
router.get('/diplomatic-received', auth_1.authenticate, formationController.getUserDiplomaticTrainingsReceived.bind(formationController));
router.put('/diplomatic-received/:trainingId', auth_1.authenticate, formationController.updateDiplomaticTrainingReceived.bind(formationController));
router.delete('/diplomatic-received/:trainingId', auth_1.authenticate, formationController.deleteDiplomaticTrainingReceived.bind(formationController));
// =============================================
// FORMATIONS DISPENSÉES
// =============================================
router.post('/given', auth_1.authenticate, formationController.createTrainingGiven.bind(formationController));
router.get('/given', auth_1.authenticate, formationController.getUserTrainingsGiven.bind(formationController));
router.put('/given/:trainingId', auth_1.authenticate, formationController.updateTrainingGiven.bind(formationController));
router.delete('/given/:trainingId', auth_1.authenticate, formationController.deleteTrainingGiven.bind(formationController));
exports.default = router;
//# sourceMappingURL=training.routes.js.map