"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentController = void 0;
const comment_service_1 = require("../services/comment.service");
const commentValidation_1 = require("../utils/commentValidation");
const commentService = new comment_service_1.CommentService();
class CommentController {
    constructor() {
        // Créer un commentaire
        this.createComment = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const validatedData = commentValidation_1.createCommentSchema.parse(req.body);
                const authorId = authenticatedReq.user.userId;
                const authorRole = authenticatedReq.user.role;
                const comment = await commentService.createComment(validatedData, authorId, authorRole);
                res.status(201).json({
                    success: true,
                    message: 'Commentaire ajouté avec succès',
                    data: comment,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Lister les commentaires
        this.listComments = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const queryParams = commentValidation_1.commentListQuerySchema.parse(req.query);
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const result = await commentService.listComments(userId, userRole, queryParams);
                res.status(200).json({
                    success: true,
                    data: result.comments,
                    pagination: result.pagination,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Obtenir un commentaire par ID
        this.getCommentById = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const comment = await commentService.getCommentById(id, userId, userRole);
                res.status(200).json({
                    success: true,
                    data: comment,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Mettre à jour un commentaire
        this.updateComment = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const validatedData = commentValidation_1.updateCommentSchema.parse(req.body);
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const comment = await commentService.updateComment(id, validatedData, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: 'Commentaire mis à jour avec succès',
                    data: comment,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Supprimer un commentaire
        this.deleteComment = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                await commentService.deleteComment(id, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: 'Commentaire supprimé avec succès',
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Obtenir les statistiques des commentaires
        this.getCommentStats = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { targetType, targetId } = req.query;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const stats = await commentService.getCommentStats(userId, userRole, targetType, targetId);
                res.status(200).json({
                    success: true,
                    data: stats,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Obtenir les commentaires d'un projet spécifique
        this.getProjectComments = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { projectId } = req.params;
                const queryParams = commentValidation_1.commentListQuerySchema.parse({
                    ...req.query,
                    targetType: 'project',
                    targetId: projectId
                });
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const result = await commentService.listComments(userId, userRole, queryParams);
                res.status(200).json({
                    success: true,
                    data: result.comments,
                    pagination: result.pagination,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Obtenir les commentaires d'une activité spécifique
        this.getActivityComments = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { activityId } = req.params;
                const queryParams = commentValidation_1.commentListQuerySchema.parse({
                    ...req.query,
                    targetType: 'activity',
                    targetId: activityId
                });
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const result = await commentService.listComments(userId, userRole, queryParams);
                res.status(200).json({
                    success: true,
                    data: result.comments,
                    pagination: result.pagination,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Obtenir les commentaires d'une tâche spécifique
        this.getTaskComments = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { taskId } = req.params;
                const queryParams = commentValidation_1.commentListQuerySchema.parse({
                    ...req.query,
                    targetType: 'task',
                    targetId: taskId
                });
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const result = await commentService.listComments(userId, userRole, queryParams);
                res.status(200).json({
                    success: true,
                    data: result.comments,
                    pagination: result.pagination,
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.CommentController = CommentController;
//# sourceMappingURL=comment.controller.js.map