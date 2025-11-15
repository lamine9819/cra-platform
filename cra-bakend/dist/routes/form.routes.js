"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// src/routes/form.routes.ts - Routes complètes pour les formulaires
const express_1 = require("express");
const form_controller_1 = tslib_1.__importDefault(require("../controllers/form.controller"));
const auth_1 = require("../middlewares/auth");
const authorization_1 = require("../middlewares/authorization");
const upload_1 = require("../middlewares/upload");
const shareValidation_1 = require("../middlewares/shareValidation");
const router = (0, express_1.Router)();
// =============================================
// ROUTES PUBLIQUES (ACCÈS VIA TOKEN DE PARTAGE)
// =============================================
// Accéder à un formulaire via lien public
router.get('/public/:shareToken', shareValidation_1.validateShareToken, form_controller_1.default.getFormByPublicLink);
// Soumettre une réponse via lien public (sans authentification)
router.post('/public/:shareToken/submit', shareValidation_1.validateShareToken, form_controller_1.default.submitPublicFormResponse);
// =============================================
// ROUTES PROTÉGÉES (AUTHENTIFICATION REQUISE)
// =============================================
router.use(auth_1.authenticate);
// =============================================
// GESTION DES FORMULAIRES SELON VOTRE LOGIQUE
// =============================================
// Créer un formulaire (tous les utilisateurs authentifiés)
router.post('/', (0, authorization_1.authorize)(['CHERCHEUR', 'ADMINISTRATEUR']), form_controller_1.default.createForm);
// Lister MES formulaires et ceux auxquels j'ai accès
router.get('/', form_controller_1.default.listForms);
// Prévisualiser un formulaire
router.post('/preview', form_controller_1.default.previewForm);
// Dashboard du collecteur
router.get('/dashboard/collector', form_controller_1.default.getCollectorDashboard);
// =============================================
// PARTAGE DE FORMULAIRES
// =============================================
// Partager un formulaire avec un utilisateur interne
router.post('/:id/share', form_controller_1.default.shareFormWithUser);
// Créer un lien de partage public
router.post('/:id/public-link', form_controller_1.default.createPublicShareLink);
// Obtenir les partages d'un formulaire
router.get('/:id/shares', form_controller_1.default.getFormShares);
// Supprimer un partage
router.delete('/shares/:shareId', form_controller_1.default.removeFormShare);
// =============================================
// COLLECTE DE DONNÉES MULTIPLE
// =============================================
// Soumettre une réponse (collecte multiple autorisée)
router.post('/:id/responses', (0, authorization_1.authorize)(['CHERCHEUR', 'ADMINISTRATEUR']), form_controller_1.default.submitFormResponse);
// Obtenir les réponses (créateur + participants au projet)
router.get('/:id/responses', form_controller_1.default.getFormResponses);
// =============================================
// GESTION DES PHOTOS
// =============================================
// Upload d'une photo pour un champ
router.post('/upload-photo', upload_1.uploadPhoto.single('photo'), form_controller_1.default.uploadFieldPhoto);
// Upload multiple de photos
router.post('/upload-photos', upload_1.uploadPhoto.array('photos', 10), form_controller_1.default.uploadMultiplePhotos);
// Obtenir les photos d'une réponse
router.get('/responses/:responseId/photos', form_controller_1.default.getResponsePhotos);
// =============================================
// SYNCHRONISATION OFFLINE
// =============================================
// Stocker des données pour synchronisation offline
router.post('/offline/store', form_controller_1.default.storeOfflineData);
// Synchroniser les données offline
router.post('/offline/sync', form_controller_1.default.syncOfflineData);
// Obtenir le statut de synchronisation
router.get('/offline/status/:deviceId', form_controller_1.default.getOfflineSyncStatus);
// =============================================
// GESTION INDIVIDUELLE DES FORMULAIRES
// =============================================
// Obtenir un formulaire spécifique
router.get('/:id', form_controller_1.default.getFormById);
// Mettre à jour un formulaire (créateur seulement)
router.patch('/:id', form_controller_1.default.updateForm);
// Supprimer un formulaire (créateur seulement)
router.delete('/:id', form_controller_1.default.deleteForm);
// =============================================
// EXPORT DES DONNÉES
// =============================================
// Exporter les réponses avec options avancées
router.get('/:id/export', form_controller_1.default.exportResponses);
// =============================================
// GESTION DES COMMENTAIRES
// =============================================
// Ajouter un commentaire
router.post('/:id/comments', (0, authorization_1.authorize)(['CHERCHEUR', 'ADMINISTRATEUR']), form_controller_1.default.addComment);
// Obtenir les commentaires
router.get('/:id/comments', form_controller_1.default.getFormComments);
exports.default = router;
//# sourceMappingURL=form.routes.js.map