"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/comment.routes.ts
const express_1 = require("express");
const comment_controller_1 = require("../controllers/comment.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const commentController = new comment_controller_1.CommentController();
// Toutes les routes nécessitent une authentification
router.use(auth_1.authenticate);
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
exports.default = router;
//# sourceMappingURL=comment.routes.js.map