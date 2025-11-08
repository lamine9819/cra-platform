// src/routes/activity.routes.ts - Version CRA complète
import { Router } from 'express';
import { ActivityController } from '../controllers/activity.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();
const activityController = new ActivityController();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// ================================
// ROUTES SPÉCIALES (à placer AVANT les routes avec :id)
// ================================

// Statistiques CRA
router.get('/stats', activityController.getActivityStats);

// Dashboard CRA personnalisé
router.get('/dashboard', activityController.getCRADashboard);

// Export des activités
router.get('/export', activityController.exportActivities);

// Activités sans projet
router.get('/without-project', activityController.getActivitiesWithoutProject);

// Activités par thème
router.get('/by-theme/:themeId', activityController.getActivitiesByTheme);

// Activités par station
router.get('/by-station/:stationId', activityController.getActivitiesByStation);

// Activités par responsable
router.get('/by-responsible/:responsibleId', activityController.getActivitiesByResponsible);

// ================================
// ROUTES CRUD PRINCIPALES
// ================================

// Créer une activité CRA
router.post('/', activityController.createActivity);

// Lister les activités avec filtres CRA
router.get('/', activityController.listActivities);

// Obtenir une activité spécifique
router.get('/:id', activityController.getActivityById);

// Mettre à jour une activité
router.patch('/:id', activityController.updateActivity);

// Supprimer une activité
router.delete('/:id', activityController.deleteActivity);

// ================================
// ROUTES DE GESTION DES RELATIONS
// ================================

// Gestion des formulaires
router.post('/:id/forms', activityController.linkForm);
router.delete('/:id/forms/:formId', activityController.unlinkForm);

// Gestion des documents
router.post('/:id/documents', activityController.linkDocument);

// ================================
// ROUTES CRA SPÉCIFIQUES
// ================================

// Reconduction d'activité
router.post('/:id/recurrence', activityController.createRecurrence);

// Historique des reconductions
router.get('/:id/recurrence-history', activityController.getActivityRecurrenceHistory);

// Duplication d'activité
router.post('/:id/duplicate', activityController.duplicateActivity);

// Génération de rapport
router.get('/:id/report', activityController.generateReport);

// Gestion des participants (à placer après les routes de documents)
router.post('/:id/participants', activityController.addParticipant);
router.get('/:id/participants', activityController.listParticipants);
router.patch('/:id/participants/:participantUserId', activityController.updateParticipant);
router.delete('/:id/participants/:participantUserId', activityController.removeParticipant);

// Gestion des financements
router.post('/:id/fundings', activityController.addFunding);
router.get('/:id/fundings', activityController.listFundings);
router.patch('/:id/fundings/:fundingId', activityController.updateFunding);
router.delete('/:id/fundings/:fundingId', activityController.removeFunding);

// Gestion des partenaires
router.post('/:id/partnerships', activityController.addPartner);
router.get('/:id/partnerships', activityController.listPartners);
router.patch('/:id/partnerships/:partnershipId', activityController.updatePartner);
router.delete('/:id/partnerships/:partnershipId', activityController.removePartner);

// Gestion des tâches
router.post('/:id/tasks', activityController.createTask);
router.get('/:id/tasks', activityController.listTasks); // Accepte ?filter=all|created|assigned
router.get('/:id/tasks/:taskId', activityController.getTaskById);
router.patch('/:id/tasks/:taskId', activityController.updateTask);
router.patch('/:id/tasks/:taskId/reassign', activityController.reassignTask); // ⬅️ Nouvelle route
router.delete('/:id/tasks/:taskId', activityController.deleteTask);

// Gestion des commentaires (à placer après les routes de tâches)
router.post('/:id/comments', activityController.createComment);
router.get('/:id/comments', activityController.listComments);
router.patch('/:id/comments/:commentId', activityController.updateComment);
router.delete('/:id/comments/:commentId', activityController.deleteComment);
// Gestion des transferts d'acquis (liaison uniquement)
router.get('/:id/knowledge-transfers', activityController.listKnowledgeTransfers);
router.post('/:id/knowledge-transfers/:transferId/link', activityController.linkKnowledgeTransfer);
router.delete('/:id/knowledge-transfers/:transferId', activityController.unlinkKnowledgeTransfer);

export default router;
