// src/routes/form.routes.ts - Routes complètes pour les formulaires
import { Router } from 'express';
import formController from '../controllers/form.controller';
import { authenticate, optionalAuth } from '../middlewares/auth';
import { authorize } from '../middlewares/authorization';
import { uploadPhoto } from '../middlewares/upload';
import { validateShareToken } from '../middlewares/shareValidation';

const router = Router();

// =============================================
// ROUTES PUBLIQUES (ACCÈS VIA TOKEN DE PARTAGE)
// =============================================

// Accéder à un formulaire via lien public
router.get('/public/:shareToken', 
  validateShareToken,
  formController.getFormByPublicLink
);

// Soumettre une réponse via lien public (sans authentification)
router.post('/public/:shareToken/submit', 
  validateShareToken,
  formController.submitPublicFormResponse
);

// =============================================
// ROUTES PROTÉGÉES (AUTHENTIFICATION REQUISE)
// =============================================

router.use(authenticate);

// =============================================
// GESTION DES FORMULAIRES SELON VOTRE LOGIQUE
// =============================================

// Créer un formulaire (tous les utilisateurs authentifiés)
router.post('/',
  authorize(['CHERCHEUR',  'ADMINISTRATEUR']),
  formController.createForm
);

// Lister MES formulaires et ceux auxquels j'ai accès
router.get('/', formController.listForms);

// Prévisualiser un formulaire
router.post('/preview', formController.previewForm);

// Dashboard du collecteur
router.get('/dashboard/collector', formController.getCollectorDashboard);

// =============================================
// PARTAGE DE FORMULAIRES
// =============================================

// Partager un formulaire avec un utilisateur interne
router.post('/:id/share', formController.shareFormWithUser);

// Créer un lien de partage public
router.post('/:id/public-link', formController.createPublicShareLink);

// Obtenir les partages d'un formulaire
router.get('/:id/shares', formController.getFormShares);

// Supprimer un partage
router.delete('/shares/:shareId', formController.removeFormShare);

// =============================================
// COLLECTE DE DONNÉES MULTIPLE
// =============================================

// Soumettre une réponse (collecte multiple autorisée)
router.post('/:id/responses',
  authorize(['CHERCHEUR', 'ADMINISTRATEUR']),
  formController.submitFormResponse
);

// Obtenir les réponses (créateur + participants au projet)
router.get('/:id/responses', formController.getFormResponses);

// =============================================
// GESTION DES PHOTOS
// =============================================

// Upload d'une photo pour un champ
router.post('/upload-photo',
  uploadPhoto.single('photo'),
  formController.uploadFieldPhoto
);

// Upload multiple de photos
router.post('/upload-photos',
  uploadPhoto.array('photos', 10),
  formController.uploadMultiplePhotos
);

// Obtenir les photos d'une réponse
router.get('/responses/:responseId/photos', formController.getResponsePhotos);

// =============================================
// SYNCHRONISATION OFFLINE
// =============================================

// Stocker des données pour synchronisation offline
router.post('/offline/store', formController.storeOfflineData);

// Synchroniser les données offline
router.post('/offline/sync', formController.syncOfflineData);

// Obtenir le statut de synchronisation
router.get('/offline/status/:deviceId', formController.getOfflineSyncStatus);

// =============================================
// GESTION INDIVIDUELLE DES FORMULAIRES
// =============================================

// Obtenir un formulaire spécifique
router.get('/:id', formController.getFormById);

// Mettre à jour un formulaire (créateur seulement)
router.patch('/:id', formController.updateForm);

// Supprimer un formulaire (créateur seulement)
router.delete('/:id', formController.deleteForm);

// =============================================
// EXPORT DES DONNÉES
// =============================================

// Exporter les réponses avec options avancées
router.get('/:id/export', formController.exportResponses);

// =============================================
// GESTION DES COMMENTAIRES
// =============================================

// Ajouter un commentaire
router.post('/:id/comments',
  authorize(['CHERCHEUR',  'ADMINISTRATEUR']),
  formController.addComment
);

// Obtenir les commentaires
router.get('/:id/comments', formController.getFormComments);

export default router;