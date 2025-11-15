"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/document.routes.ts - Version complète mise à jour
const express_1 = require("express");
const document_controller_1 = require("../controllers/document.controller");
const auth_1 = require("../middlewares/auth");
const multer_1 = require("../config/multer");
const router = (0, express_1.Router)();
const documentController = new document_controller_1.DocumentController();
// =============================================
// ROUTES SPÉCIFIQUES (DOIVENT ÊTRE AVANT /:id)
// =============================================
// Statistiques des documents
router.get('/stats/overview', auth_1.authenticate, documentController.getDocumentStats);
// Favoris (AVANT /:id pour éviter conflits)
router.get('/favorites', auth_1.authenticate, documentController.getFavoriteDocuments);
// Corbeille (AVANT /:id pour éviter conflits)
router.get('/trash', auth_1.authenticate, documentController.getTrashDocuments);
router.delete('/trash/empty', auth_1.authenticate, documentController.emptyTrash);
// =============================================
// UPLOAD
// =============================================
// Upload de fichier unique
router.post('/upload', auth_1.authenticate, multer_1.uploadSingle, documentController.uploadFile);
// Upload de fichiers multiples
router.post('/upload/multiple', auth_1.authenticate, multer_1.uploadMultiple, documentController.uploadMultipleFiles);
// =============================================
// LISTE
// =============================================
// Lister les documents (avec filtres)
router.get('/', auth_1.authenticate, documentController.listDocuments);
// =============================================
// ROUTES PAR ENTITÉ - RÉCUPÉRATION DES DOCUMENTS
// =============================================
// Documents d'un projet spécifique
router.get('/project/:projectId', auth_1.authenticate, documentController.getProjectDocuments);
// Documents d'une activité spécifique
router.get('/activity/:activityId', auth_1.authenticate, documentController.getActivityDocuments);
// Documents d'une tâche spécifique
router.get('/task/:taskId', auth_1.authenticate, documentController.getTaskDocuments);
// Documents d'un séminaire spécifique
router.get('/seminar/:seminarId', auth_1.authenticate, documentController.getSeminarDocuments);
// Documents d'une formation spécifique
router.get('/training/:trainingId', auth_1.authenticate, documentController.getTrainingDocuments);
// Documents d'un stage spécifique
router.get('/internship/:internshipId', auth_1.authenticate, documentController.getInternshipDocuments);
// Documents d'un encadrement spécifique
router.get('/supervision/:supervisionId', auth_1.authenticate, documentController.getSupervisionDocuments);
// Documents d'un transfert d'acquis spécifique
router.get('/knowledge-transfer/:knowledgeTransferId', auth_1.authenticate, documentController.getKnowledgeTransferDocuments);
// Documents d'un événement spécifique
router.get('/event/:eventId', auth_1.authenticate, documentController.getEventDocuments);
// =============================================
// ROUTES AVEC /:id (DOIVENT ÊTRE À LA FIN)
// =============================================
// Obtenir un document spécifique
router.get('/:id', auth_1.authenticate, documentController.getDocumentById);
// Preview document (inline dans le browser) - Utilise flexibleAuth pour supporter token en query
router.get('/:id/preview', auth_1.flexibleAuth, documentController.previewDocument);
// Télécharger un document - Utilise flexibleAuth pour supporter token en query
router.get('/:id/download', auth_1.flexibleAuth, documentController.downloadDocument);
// Partager un document
router.post('/:id/share', auth_1.authenticate, documentController.shareDocument);
// Gestion des partages
router.get('/:id/shares', auth_1.authenticate, documentController.getDocumentShares);
router.delete('/:id/shares/:shareId', auth_1.authenticate, documentController.revokeShare);
router.patch('/:id/shares/:shareId', auth_1.authenticate, documentController.updateSharePermissions);
// Liaison/Déliaison
router.post('/:id/link', auth_1.authenticate, documentController.linkDocument);
router.delete('/:id/link', auth_1.authenticate, documentController.unlinkDocument);
// Favoris
router.post('/:id/favorite', auth_1.authenticate, documentController.addToFavorites);
router.delete('/:id/favorite', auth_1.authenticate, documentController.removeFromFavorites);
// Corbeille - Restauration et suppression
router.post('/:id/restore', auth_1.authenticate, documentController.restoreDocument);
router.delete('/:id/permanent', auth_1.authenticate, documentController.permanentDeleteDocument);
// Mise à jour métadonnées
router.patch('/:id', auth_1.authenticate, documentController.updateDocumentMetadata);
// Suppression (soft delete par défaut maintenant)
router.delete('/:id', auth_1.authenticate, documentController.deleteDocument);
exports.default = router;
//# sourceMappingURL=document.routes.js.map