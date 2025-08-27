// src/routes/form.routes.ts - Version complète avec commentaires
import { Router } from 'express';
import { FormController } from '../controllers/form.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/authorization';

const router = Router();
const formController = new FormController();

// =============================================
// ROUTES PUBLIQUES (SANS AUTHENTIFICATION)
// =============================================

// Formulaires publics accessibles sans authentification
router.get('/public', formController.getPublicForms);

// =============================================
// ROUTES PROTÉGÉES (AUTHENTIFICATION REQUISE)
// =============================================

// Toutes les routes suivantes nécessitent une authentification
router.use(authenticate);

// =============================================
// ROUTES SPÉCIALISÉES (DOIVENT ÊTRE AVANT /:id)
// =============================================

// Mes formulaires
router.get('/my-forms', formController.getMyForms);

// Templates de formulaires - MODIFIÉ: Chercheurs peuvent créer des templates
router.get('/templates', formController.getTemplates);
router.post('/templates', 
  authorize(['CHERCHEUR', 'TECHNICIEN_SUPERIEUR', 'ADMINISTRATEUR']),
  formController.createTemplate
);

// Statistiques des formulaires
router.get('/stats', formController.getFormStats);

// Statistiques globales (admin seulement)
router.get('/global-stats', 
  authorize(['ADMINISTRATEUR']),
  formController.getGlobalStats
);

// Prévisualiser un formulaire
router.post('/preview', formController.previewForm);

// Valider un schéma de formulaire
router.post('/validate-schema', formController.validateFormSchema);

// =============================================
// ROUTES PAR FORMULAIRE SPÉCIFIQUE
// =============================================

// Export des réponses (Excel/CSV)
router.get('/:id/export', formController.exportResponses);

// Dupliquer un formulaire - MODIFIÉ: Tous les utilisateurs authentifiés
router.post('/:id/duplicate', 
  authorize(['CHERCHEUR', 'ASSISTANT_CHERCHEUR', 'TECHNICIEN_SUPERIEUR', 'ADMINISTRATEUR']),
  formController.duplicateForm
);

// Cloner avec réponses (admin seulement)
router.post('/:id/clone', 
  authorize(['ADMINISTRATEUR']),
  formController.cloneFormWithResponses
);

// Activer/désactiver un formulaire
router.patch('/:id/toggle-status', formController.toggleFormStatus);

// Audit d'un formulaire
router.get('/:id/audit', formController.getFormAudit);

// =============================================
// GESTION DES COMMENTAIRES - NOUVEAU/COMPLET
// =============================================

// Ajouter un commentaire - MODIFIÉ: Tous les utilisateurs authentifiés
router.post('/:id/comments', 
  authorize(['CHERCHEUR', 'ASSISTANT_CHERCHEUR', 'TECHNICIEN_SUPERIEUR', 'ADMINISTRATEUR']),
  formController.addComment
);

// Obtenir les commentaires d'un formulaire
router.get('/:id/comments', formController.getFormComments);

// Rechercher dans les commentaires
router.get('/:id/comments/search', formController.searchFormComments);

// Statistiques des commentaires
router.get('/:id/comments/stats', formController.getFormCommentStats);

// NOUVELLES ROUTES POUR GESTION INDIVIDUELLE DES COMMENTAIRES

// Obtenir un commentaire spécifique
router.get('/comments/:commentId', formController.getCommentById);

// Modifier un commentaire
router.patch('/comments/:commentId', formController.updateComment);

// Supprimer un commentaire
router.delete('/comments/:commentId', formController.deleteComment);

// =============================================
// ROUTES PRINCIPALES DES FORMULAIRES
// =============================================

// Créer un formulaire - MODIFIÉ: Tous les utilisateurs authentifiés
router.post('/', 
  authorize(['CHERCHEUR', 'ASSISTANT_CHERCHEUR', 'TECHNICIEN_SUPERIEUR', 'ADMINISTRATEUR']),
  formController.createForm
);

// Lister les formulaires accessibles
router.get('/', formController.listForms);

// Obtenir un formulaire spécifique
router.get('/:id', formController.getFormById);

// Mettre à jour un formulaire
router.patch('/:id', formController.updateForm);

// Supprimer un formulaire
router.delete('/:id', formController.deleteForm);

// =============================================
// GESTION DES RÉPONSES
// =============================================

// Soumettre une réponse - MODIFIÉ: Tous les utilisateurs authentifiés
router.post('/:id/responses', 
  authorize(['CHERCHEUR', 'ASSISTANT_CHERCHEUR', 'TECHNICIEN_SUPERIEUR', 'ADMINISTRATEUR']),
  formController.submitFormResponse
);

// Obtenir les réponses d'un formulaire
router.get('/:id/responses', formController.getFormResponses);

export default router;