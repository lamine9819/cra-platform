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
// ROUTES CRUD DE BASE
// =============================================

// Upload de fichier unique
router.post('/upload', uploadSingle, documentController.uploadFile);

// Upload de fichiers multiples
router.post('/upload/multiple', uploadMultiple, documentController.uploadMultipleFiles);

// Statistiques des documents (DOIT ÊTRE AVANT /:id)
router.get('/stats/overview', documentController.getDocumentStats);

// Lister les documents (avec filtres)
router.get('/', documentController.listDocuments);

// Obtenir un document spécifique
router.get('/:id', documentController.getDocumentById);

// Télécharger un document
router.get('/:id/download', documentController.downloadDocument);

// Partager un document
router.post('/:id/share', documentController.shareDocument);

// Supprimer un document
router.delete('/:id', documentController.deleteDocument);

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

export default router;