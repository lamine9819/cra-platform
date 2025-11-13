// src/routes/document.routes.ts - Version complète mise à jour
import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { authenticate, flexibleAuth } from '../middlewares/auth';
import { uploadSingle, uploadMultiple } from '../config/multer';

const router = Router();
const documentController = new DocumentController();

// =============================================
// ROUTES SPÉCIFIQUES (DOIVENT ÊTRE AVANT /:id)
// =============================================

// Statistiques des documents
router.get('/stats/overview', authenticate, documentController.getDocumentStats);

// Favoris (AVANT /:id pour éviter conflits)
router.get('/favorites', authenticate, documentController.getFavoriteDocuments);

// Corbeille (AVANT /:id pour éviter conflits)
router.get('/trash', authenticate, documentController.getTrashDocuments);
router.delete('/trash/empty', authenticate, documentController.emptyTrash);

// =============================================
// UPLOAD
// =============================================

// Upload de fichier unique
router.post('/upload', authenticate, uploadSingle, documentController.uploadFile);

// Upload de fichiers multiples
router.post('/upload/multiple', authenticate, uploadMultiple, documentController.uploadMultipleFiles);

// =============================================
// LISTE
// =============================================

// Lister les documents (avec filtres)
router.get('/', authenticate, documentController.listDocuments);

// =============================================
// ROUTES PAR ENTITÉ - RÉCUPÉRATION DES DOCUMENTS
// =============================================

// Documents d'un projet spécifique
router.get('/project/:projectId', authenticate, documentController.getProjectDocuments);

// Documents d'une activité spécifique
router.get('/activity/:activityId', authenticate, documentController.getActivityDocuments);

// Documents d'une tâche spécifique
router.get('/task/:taskId', authenticate, documentController.getTaskDocuments);

// Documents d'un séminaire spécifique
router.get('/seminar/:seminarId', authenticate, documentController.getSeminarDocuments);

// Documents d'une formation spécifique
router.get('/training/:trainingId', authenticate, documentController.getTrainingDocuments);

// Documents d'un stage spécifique
router.get('/internship/:internshipId', authenticate, documentController.getInternshipDocuments);

// Documents d'un encadrement spécifique
router.get('/supervision/:supervisionId', authenticate, documentController.getSupervisionDocuments);

// Documents d'un transfert d'acquis spécifique
router.get('/knowledge-transfer/:knowledgeTransferId', authenticate, documentController.getKnowledgeTransferDocuments);

// Documents d'un événement spécifique
router.get('/event/:eventId', authenticate, documentController.getEventDocuments);

// =============================================
// ROUTES AVEC /:id (DOIVENT ÊTRE À LA FIN)
// =============================================

// Obtenir un document spécifique
router.get('/:id', authenticate, documentController.getDocumentById);

// Preview document (inline dans le browser) - Utilise flexibleAuth pour supporter token en query
router.get('/:id/preview', flexibleAuth, documentController.previewDocument);

// Télécharger un document - Utilise flexibleAuth pour supporter token en query
router.get('/:id/download', flexibleAuth, documentController.downloadDocument);

// Partager un document
router.post('/:id/share', authenticate, documentController.shareDocument);

// Gestion des partages
router.get('/:id/shares', authenticate, documentController.getDocumentShares);
router.delete('/:id/shares/:shareId', authenticate, documentController.revokeShare);
router.patch('/:id/shares/:shareId', authenticate, documentController.updateSharePermissions);

// Liaison/Déliaison
router.post('/:id/link', authenticate, documentController.linkDocument);
router.delete('/:id/link', authenticate, documentController.unlinkDocument);

// Favoris
router.post('/:id/favorite', authenticate, documentController.addToFavorites);
router.delete('/:id/favorite', authenticate, documentController.removeFromFavorites);

// Corbeille - Restauration et suppression
router.post('/:id/restore', authenticate, documentController.restoreDocument);
router.delete('/:id/permanent', authenticate, documentController.permanentDeleteDocument);

// Mise à jour métadonnées
router.patch('/:id', authenticate, documentController.updateDocumentMetadata);

// Suppression (soft delete par défaut maintenant)
router.delete('/:id', authenticate, documentController.deleteDocument);

export default router;