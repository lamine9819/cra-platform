// src/routes/document.routes.ts - Version améliorée
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

// Lister les documents
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
// NOUVELLES ROUTES - LIAISON ET STATISTIQUES
// =============================================

// Lier un document à un projet
router.post('/:id/link/project', documentController.linkToProject);

// Lier un document à une activité
router.post('/:id/link/activity', documentController.linkToActivity);

// Délier un document (retirer du projet/activité)
router.post('/:id/unlink', documentController.unlinkDocument);

// Obtenir les documents d'un projet spécifique
router.get('/project/:projectId', documentController.getProjectDocuments);

// Obtenir les documents d'une activité spécifique
router.get('/activity/:activityId', documentController.getActivityDocuments);

// Obtenir les statistiques des documents
router.get('/stats/overview', documentController.getDocumentStats);

export default router;