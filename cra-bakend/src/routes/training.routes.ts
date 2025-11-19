// src/routes/training.routes.ts
import { Router } from 'express';
import { FormationController } from '../controllers/formation.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();
const formationController = new FormationController();

// =============================================
// FORMATIONS COURTES REÇUES
// =============================================

router.post('/short-received',
  authenticate,
  formationController.createShortTrainingReceived.bind(formationController)
);

router.get('/short-received',
  authenticate,
  formationController.getUserShortTrainingsReceived.bind(formationController)
);

router.delete('/short-received/:trainingId',
  authenticate,
  formationController.deleteShortTrainingReceived.bind(formationController)
);

// =============================================
// FORMATIONS DIPLÔMANTES REÇUES
// =============================================

router.post('/diplomatic-received',
  authenticate,
  formationController.createDiplomaticTrainingReceived.bind(formationController)
);

router.get('/diplomatic-received',
  authenticate,
  formationController.getUserDiplomaticTrainingsReceived.bind(formationController)
);

router.delete('/diplomatic-received/:trainingId',
  authenticate,
  formationController.deleteDiplomaticTrainingReceived.bind(formationController)
);

// =============================================
// FORMATIONS DISPENSÉES
// =============================================

router.post('/given',
  authenticate,
  formationController.createTrainingGiven.bind(formationController)
);

router.get('/given',
  authenticate,
  formationController.getUserTrainingsGiven.bind(formationController)
);

router.delete('/given/:trainingId',
  authenticate,
  formationController.deleteTrainingGiven.bind(formationController)
);

export default router;
