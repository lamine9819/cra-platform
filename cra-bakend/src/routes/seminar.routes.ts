// src/routes/seminar.routes.ts
import { Router } from 'express';
import { SeminarController } from '../controllers/seminar.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/authorization';

const router = Router();
const seminarController = new SeminarController();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes spécialisées par période temporelle - DOIVENT être avant /:id
router.get('/past', seminarController.getPastSeminars);
router.get('/upcoming', seminarController.getUpcomingSeminars);
router.get('/current', seminarController.getCurrentSeminars);

// Obtenir mes inscriptions - DOIT être avant /:id
router.get('/my-registrations', seminarController.getMyRegistrations);

// Obtenir les statistiques des séminaires - DOIT être avant /:id
router.get('/stats', seminarController.getSeminarStats);

// Créer un séminaire (Chercheur ou Admin)
router.post(
  '/',
  authorize(['CHERCHEUR', 'ADMINISTRATEUR']),
  seminarController.createSeminar
);

// Lister tous les séminaires
router.get('/', seminarController.listSeminars);

// Obtenir un séminaire spécifique
router.get('/:id', seminarController.getSeminarById);

// Mettre à jour un séminaire
router.patch('/:id', seminarController.updateSeminar);

// Supprimer un séminaire
router.delete('/:id', seminarController.deleteSeminar);

// S'inscrire à un séminaire
router.post('/:id/register', seminarController.registerToSeminar);

// Se désinscrire d'un séminaire
router.delete('/:id/unregister', seminarController.unregisterFromSeminar);

// Marquer la présence d'un participant (organisateur uniquement)
router.patch('/:id/attendance/:participantId', seminarController.markAttendance);

export default router;