"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/formation.routes.ts
const express_1 = require("express");
const formation_controller_1 = require("../controllers/formation.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const formationController = new formation_controller_1.FormationController();
// ============= FORMATIONS COURTES REÇUES =============
// Créer une formation courte reçue
router.post('/trainings/short-received', auth_1.authenticate, formationController.createShortTrainingReceived);
// Récupérer les formations courtes reçues de l'utilisateur connecté
router.get('/trainings/short-received', auth_1.authenticate, formationController.getUserShortTrainingsReceived);
// Supprimer une formation courte reçue
router.delete('/trainings/short-received/:trainingId', auth_1.authenticate, formationController.deleteShortTrainingReceived);
// ============= FORMATIONS DIPLÔMANTES REÇUES =============
// Créer une formation diplômante reçue
router.post('/trainings/diplomatic-received', auth_1.authenticate, formationController.createDiplomaticTrainingReceived);
// Récupérer les formations diplômantes reçues de l'utilisateur connecté
router.get('/trainings/diplomatic-received', auth_1.authenticate, formationController.getUserDiplomaticTrainingsReceived);
// Supprimer une formation diplômante reçue
router.delete('/trainings/diplomatic-received/:trainingId', auth_1.authenticate, formationController.deleteDiplomaticTrainingReceived);
// ============= FORMATIONS DISPENSÉES =============
// Créer une formation dispensée
router.post('/trainings/given', auth_1.authenticate, formationController.createTrainingGiven);
// Récupérer les formations dispensées de l'utilisateur connecté
router.get('/trainings/given', auth_1.authenticate, formationController.getUserTrainingsGiven);
// Supprimer une formation dispensée
router.delete('/trainings/given/:trainingId', auth_1.authenticate, formationController.deleteTrainingGiven);
// ============= ENCADREMENTS =============
// Créer un encadrement
router.post('/supervisions', auth_1.authenticate, formationController.createSupervision);
// Récupérer les encadrements de l'utilisateur connecté
router.get('/supervisions', auth_1.authenticate, formationController.getUserSupervisions);
// Supprimer un encadrement
router.delete('/supervisions/:supervisionId', auth_1.authenticate, formationController.deleteSupervision);
// ============= RAPPORTS (COORDINATEUR/ADMIN) =============
// Récupérer le rapport de formation d'un utilisateur spécifique ou de soi-même
router.get('/reports/user/:userId?', auth_1.authenticate, formationController.getUserFormationReport);
// Récupérer le rapport global de toutes les formations (coordinateur/admin uniquement)
router.get('/reports/global', auth_1.authenticate, formationController.getAllUsersFormationReport);
// Télécharger un rapport de formation en PDF (coordinateur/admin uniquement)
router.get('/reports/download', auth_1.authenticate, formationController.downloadFormationReport);
// ============= ROUTE DE SANITÉ =============
// Vérifier la santé du service de formation
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Service de formation opérationnel',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
exports.default = router;
//# sourceMappingURL=forme.routes.js.map