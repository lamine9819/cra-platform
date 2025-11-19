// src/routes/supervision.routes.ts
import { Router } from 'express';
import { FormationController } from '../controllers/formation.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();
const formationController = new FormationController();

// =============================================
// ENCADREMENTS
// =============================================

router.post('/',
  authenticate,
  formationController.createSupervision.bind(formationController)
);

router.get('/',
  authenticate,
  formationController.getUserSupervisions.bind(formationController)
);

router.delete('/:supervisionId',
  authenticate,
  formationController.deleteSupervision.bind(formationController)
);

export default router;
