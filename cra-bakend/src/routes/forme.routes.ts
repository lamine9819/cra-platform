// routes/formation.routes.ts
import { Router } from 'express';
import { FormationController } from '../controllers/formation.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();
const formationController = new FormationController();

// ============= FORMATIONS COURTES REÇUES =============

// Créer une formation courte reçue
router.post('/trainings/short-received', 
  authenticate,
  formationController.createShortTrainingReceived
);

// Récupérer les formations courtes reçues de l'utilisateur connecté
router.get('/trainings/short-received', 
  authenticate,
  formationController.getUserShortTrainingsReceived
);

// Supprimer une formation courte reçue
router.delete('/trainings/short-received/:trainingId', 
  authenticate,
  formationController.deleteShortTrainingReceived
);

// ============= FORMATIONS DIPLÔMANTES REÇUES =============

// Créer une formation diplômante reçue
router.post('/trainings/diplomatic-received', 
  authenticate,
  formationController.createDiplomaticTrainingReceived
);

// Récupérer les formations diplômantes reçues de l'utilisateur connecté
router.get('/trainings/diplomatic-received', 
  authenticate,
  formationController.getUserDiplomaticTrainingsReceived
);

// Supprimer une formation diplômante reçue
router.delete('/trainings/diplomatic-received/:trainingId', 
  authenticate,
  formationController.deleteDiplomaticTrainingReceived
);

// ============= FORMATIONS DISPENSÉES =============

// Créer une formation dispensée
router.post('/trainings/given', 
  authenticate,
  formationController.createTrainingGiven
);

// Récupérer les formations dispensées de l'utilisateur connecté
router.get('/trainings/given', 
  authenticate,
  formationController.getUserTrainingsGiven
);

// Supprimer une formation dispensée
router.delete('/trainings/given/:trainingId', 
  authenticate,
  formationController.deleteTrainingGiven
);

// ============= ENCADREMENTS =============

// Créer un encadrement
router.post('/supervisions', 
  authenticate,
  formationController.createSupervision
);

// Récupérer les encadrements de l'utilisateur connecté
router.get('/supervisions', 
  authenticate,
  formationController.getUserSupervisions
);

// Supprimer un encadrement
router.delete('/supervisions/:supervisionId', 
  authenticate,
  formationController.deleteSupervision
);

// ============= RAPPORTS (COORDINATEUR/ADMIN) =============

// Récupérer le rapport de formation d'un utilisateur spécifique ou de soi-même
router.get('/reports/user/:userId?', 
  authenticate,
  formationController.getUserFormationReport
);

// Récupérer le rapport global de toutes les formations (coordinateur/admin uniquement)
router.get('/reports/global', 
  authenticate,
  formationController.getAllUsersFormationReport
);

// Télécharger un rapport de formation en PDF (coordinateur/admin uniquement)
router.get('/reports/download', 
  authenticate,
  formationController.downloadFormationReport
);

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

export default router;