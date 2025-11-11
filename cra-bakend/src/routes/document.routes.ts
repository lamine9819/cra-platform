// src/routes/document.routes.ts - Version complète mise à jour
import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { authenticate } from '../middlewares/auth';
import { uploadSingle, uploadMultiple } from '../config/multer';

const router = Router();
const documentController = new DocumentController();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// =============================================
// ROUTES SPÉCIFIQUES (DOIVENT ÊTRE AVANT /:id)
// =============================================

// Statistiques des documents
router.get('/stats/overview', documentController.getDocumentStats);

// Favoris (AVANT /:id pour éviter conflits)
router.get('/favorites', documentController.getFavoriteDocuments);

// Corbeille (AVANT /:id pour éviter conflits)
router.get('/trash', documentController.getTrashDocuments);
router.delete('/trash/empty', documentController.emptyTrash);

// =============================================
// UPLOAD
// =============================================

// Upload de fichier unique
router.post('/upload', uploadSingle, documentController.uploadFile);

// Upload de fichiers multiples
router.post('/upload/multiple', uploadMultiple, documentController.uploadMultipleFiles);

// =============================================
// LISTE
// =============================================

// Lister les documents (avec filtres)
router.get('/', documentController.listDocuments);

// =============================================
// ROUTES PAR ENTITÉ - RÉCUPÉRATION DES DOCUMENTS
// =============================================

// Documents d'un projet spécifique
router.get('/project/:projectId', documentController.getProjectDocuments);

// Documents d'une activité spécifique
router.get('/activity/:activityId', documentController.getActivityDocuments);

// Documents d'une tâche spécifique
router.get('/task/:taskId', documentController.getTaskDocuments);

// Documents d'un séminaire spécifique
router.get('/seminar/:seminarId', documentController.getSeminarDocuments);

// Documents d'une formation spécifique
router.get('/training/:trainingId', documentController.getTrainingDocuments);

// Documents d'un stage spécifique
router.get('/internship/:internshipId', documentController.getInternshipDocuments);

// Documents d'un encadrement spécifique
router.get('/supervision/:supervisionId', documentController.getSupervisionDocuments);

// Documents d'un transfert d'acquis spécifique
router.get('/knowledge-transfer/:knowledgeTransferId', documentController.getKnowledgeTransferDocuments);

// Documents d'un événement spécifique
router.get('/event/:eventId', documentController.getEventDocuments);

// =============================================
// ROUTES AVEC /:id (DOIVENT ÊTRE À LA FIN)
// =============================================

// Obtenir un document spécifique
router.get('/:id', documentController.getDocumentById);

// Preview document (inline dans le browser)
router.get('/:id/preview', documentController.previewDocument);

// Télécharger un document
router.get('/:id/download', documentController.downloadDocument);

// Partager un document
router.post('/:id/share', documentController.shareDocument);

// Gestion des partages
router.get('/:id/shares', documentController.getDocumentShares);
router.delete('/:id/shares/:shareId', documentController.revokeShare);
router.patch('/:id/shares/:shareId', documentController.updateSharePermissions);

// Liaison/Déliaison
router.post('/:id/link', documentController.linkDocument);
router.delete('/:id/link', documentController.unlinkDocument);

// Favoris
router.post('/:id/favorite', documentController.addToFavorites);
router.delete('/:id/favorite', documentController.removeFromFavorites);

// Corbeille - Restauration et suppression
router.post('/:id/restore', documentController.restoreDocument);
router.delete('/:id/permanent', documentController.permanentDeleteDocument);

// Mise à jour métadonnées
router.patch('/:id', documentController.updateDocumentMetadata);

// Suppression (soft delete par défaut maintenant)
router.delete('/:id', documentController.deleteDocument);

export default router;