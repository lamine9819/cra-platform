// src/routes/comment.routes.ts
import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();
const commentController = new CommentController();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Obtenir les statistiques des commentaires - DOIT être avant /:id
router.get('/stats', commentController.getCommentStats);

// Routes spécialisées pour chaque type de cible - DOIVENT être avant /:id
router.get('/projects/:projectId', commentController.getProjectComments);
router.get('/activities/:activityId', commentController.getActivityComments);
router.get('/tasks/:taskId', commentController.getTaskComments);

// Créer un commentaire
router.post('/', commentController.createComment);

// Lister les commentaires avec filtres (endpoint principal demandé)
router.get('/', commentController.listComments);

// Obtenir un commentaire spécifique
router.get('/:id', commentController.getCommentById);

// Mettre à jour un commentaire
router.patch('/:id', commentController.updateComment);

// Supprimer un commentaire
router.delete('/:id', commentController.deleteComment);

export default router;