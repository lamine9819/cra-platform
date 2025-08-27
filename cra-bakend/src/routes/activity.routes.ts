// src/routes/activity.routes.ts
import { Router } from 'express';
import { ActivityController } from '../controllers/activity.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();
const activityController = new ActivityController();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Créer une activité
router.post('/', activityController.createActivity);

// Lister les activités
router.get('/', activityController.listActivities);

// Obtenir une activité spécifique
router.get('/:id', activityController.getActivityById);

// Mettre à jour une activité
router.patch('/:id', activityController.updateActivity);

// Supprimer une activité
router.delete('/:id', activityController.deleteActivity);

// Lier un formulaire à une activité
router.post('/:id/forms', activityController.linkForm);

// Délier un formulaire d'une activité
router.delete('/:id/forms/:formId', activityController.unlinkForm);

// Lier un document à une activité
router.post('/:id/documents', activityController.linkDocument);

// ✅ NOUVELLES ROUTES À AJOUTER
// IMPORTANT: Les routes avec paramètres spécifiques doivent être AVANT les routes avec :id

// Obtenir les statistiques des activités
router.get('/stats', activityController.getActivityStats);

// Dupliquer une activité
router.post('/:id/duplicate', activityController.duplicateActivity);

export default router;