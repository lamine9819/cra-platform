"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormCommentService = void 0;
// src/services/formComment.service.ts - Version complète
const client_1 = require("@prisma/client");
const form_service_1 = require("./form.service");
const errors_1 = require("../utils/errors");
const prisma = new client_1.PrismaClient();
class FormCommentService {
    constructor() {
        this.formService = new form_service_1.FormService();
    }
    /**
     * Ajouter un commentaire sur un formulaire
     */
    async addComment(formId, content, authorId, authorRole) {
        try {
            // Vérifier que le formulaire existe et que l'utilisateur a accès
            await this.formService.getFormById(formId, authorId, authorRole);
            // Valider le contenu du commentaire
            if (!content || content.trim().length === 0) {
                throw new errors_1.ValidationError('Le contenu du commentaire est requis');
            }
            if (content.trim().length > 2000) {
                throw new errors_1.ValidationError('Le commentaire ne peut pas dépasser 2000 caractères');
            }
            // Créer le commentaire
            const comment = await prisma.comment.create({
                data: {
                    content: content.trim(),
                    authorId,
                    formId
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            role: true
                        }
                    }
                }
            });
            return {
                id: comment.id,
                content: comment.content,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt,
                author: comment.author,
                formId: formId
            };
        }
        catch (error) {
            if (error instanceof errors_1.ValidationError || error instanceof errors_1.AuthError) {
                throw error;
            }
            throw new Error(`Erreur lors de l'ajout du commentaire: ${error}`);
        }
    }
    /**
     * Lister les commentaires d'un formulaire
     */
    async getFormComments(formId, userId, userRole, options = {}) {
        try {
            // Vérifier l'accès au formulaire
            await this.formService.getFormById(formId, userId, userRole);
            const { page = 1, limit = 20, orderBy = 'desc' } = options;
            const skip = (page - 1) * limit;
            // Compter le total des commentaires
            const total = await prisma.comment.count({
                where: { formId }
            });
            // Récupérer les commentaires avec pagination
            const comments = await prisma.comment.findMany({
                where: { formId },
                include: {
                    author: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            role: true
                        }
                    }
                },
                orderBy: {
                    createdAt: orderBy
                },
                skip: limit ? skip : undefined,
                take: limit || undefined
            });
            const formattedComments = comments.map(comment => ({
                id: comment.id,
                content: comment.content,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt,
                author: comment.author,
                formId: formId
            }));
            // Si pas de pagination demandée, retourner juste les commentaires
            if (!limit) {
                return { comments: formattedComments };
            }
            // Retourner avec pagination
            return {
                comments: formattedComments,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasNext: page * limit < total,
                    hasPrev: page > 1
                }
            };
        }
        catch (error) {
            if (error instanceof errors_1.ValidationError || error instanceof errors_1.AuthError) {
                throw error;
            }
            throw new Error(`Erreur lors de la récupération des commentaires: ${error}`);
        }
    }
    /**
     * Obtenir un commentaire spécifique
     */
    async getCommentById(commentId, userId, userRole) {
        try {
            const comment = await prisma.comment.findUnique({
                where: { id: commentId },
                include: {
                    author: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            role: true
                        }
                    }
                }
            });
            if (!comment || !comment.formId) {
                throw new errors_1.NotFoundError('Commentaire non trouvé');
            }
            // Vérifier l'accès au formulaire
            await this.formService.getFormById(comment.formId, userId, userRole);
            return {
                id: comment.id,
                content: comment.content,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt,
                author: comment.author,
                formId: comment.formId
            };
        }
        catch (error) {
            if (error instanceof errors_1.NotFoundError || error instanceof errors_1.AuthError) {
                throw error;
            }
            throw new Error(`Erreur lors de la récupération du commentaire: ${error}`);
        }
    }
    /**
     * Modifier un commentaire
     */
    async updateComment(commentId, newContent, userId, userRole) {
        try {
            // Récupérer le commentaire existant
            const existingComment = await prisma.comment.findUnique({
                where: { id: commentId },
                include: {
                    author: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            role: true
                        }
                    }
                }
            });
            if (!existingComment || !existingComment.formId) {
                throw new errors_1.NotFoundError('Commentaire non trouvé');
            }
            // Vérifier l'accès au formulaire
            await this.formService.getFormById(existingComment.formId, userId, userRole);
            // Vérifier les droits de modification (auteur ou admin)
            if (existingComment.authorId !== userId && userRole !== 'ADMINISTRATEUR') {
                throw new errors_1.AuthError('Seul l\'auteur du commentaire peut le modifier');
            }
            // Valider le nouveau contenu
            if (!newContent || newContent.trim().length === 0) {
                throw new errors_1.ValidationError('Le contenu du commentaire est requis');
            }
            if (newContent.trim().length > 2000) {
                throw new errors_1.ValidationError('Le commentaire ne peut pas dépasser 2000 caractères');
            }
            // Mettre à jour le commentaire
            const updatedComment = await prisma.comment.update({
                where: { id: commentId },
                data: {
                    content: newContent.trim(),
                    updatedAt: new Date()
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            role: true
                        }
                    }
                }
            });
            return {
                id: updatedComment.id,
                content: updatedComment.content,
                createdAt: updatedComment.createdAt,
                updatedAt: updatedComment.updatedAt,
                author: updatedComment.author,
                formId: existingComment.formId
            };
        }
        catch (error) {
            if (error instanceof errors_1.ValidationError || error instanceof errors_1.AuthError || error instanceof errors_1.NotFoundError) {
                throw error;
            }
            throw new Error(`Erreur lors de la modification du commentaire: ${error}`);
        }
    }
    /**
     * Supprimer un commentaire
     */
    async deleteComment(commentId, userId, userRole) {
        try {
            // Récupérer le commentaire existant
            const existingComment = await prisma.comment.findUnique({
                where: { id: commentId }
            });
            if (!existingComment || !existingComment.formId) {
                throw new errors_1.NotFoundError('Commentaire non trouvé');
            }
            // Vérifier l'accès au formulaire
            await this.formService.getFormById(existingComment.formId, userId, userRole);
            // Vérifier les droits de suppression (auteur ou admin)
            if (existingComment.authorId !== userId && userRole !== 'ADMINISTRATEUR') {
                throw new errors_1.AuthError('Seul l\'auteur du commentaire peut le supprimer');
            }
            // Supprimer le commentaire
            await prisma.comment.delete({
                where: { id: commentId }
            });
        }
        catch (error) {
            if (error instanceof errors_1.NotFoundError || error instanceof errors_1.AuthError) {
                throw error;
            }
            throw new Error(`Erreur lors de la suppression du commentaire: ${error}`);
        }
    }
    /**
     * Obtenir les statistiques des commentaires pour un formulaire
     */
    async getFormCommentStats(formId, userId, userRole) {
        try {
            // Vérifier l'accès au formulaire
            await this.formService.getFormById(formId, userId, userRole);
            // Compter le total
            const total = await prisma.comment.count({
                where: { formId }
            });
            // Statistiques par auteur
            const commentsByAuthor = await prisma.comment.groupBy({
                by: ['authorId'],
                where: { formId },
                _count: {
                    id: true
                },
                orderBy: {
                    _count: {
                        id: 'desc'
                    }
                }
            });
            // Récupérer les informations des auteurs
            const authorStats = await Promise.all(commentsByAuthor.map(async (stat) => {
                const author = await prisma.user.findUnique({
                    where: { id: stat.authorId },
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                });
                return {
                    authorId: stat.authorId,
                    authorName: author ? `${author.firstName} ${author.lastName}` : 'Utilisateur supprimé',
                    count: stat._count.id
                };
            }));
            // Commentaires récents
            const recentComments = await prisma.comment.findMany({
                where: { formId },
                include: {
                    author: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            role: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 5
            });
            const recentFormatted = recentComments.map(comment => ({
                id: comment.id,
                content: comment.content,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt,
                author: comment.author,
                formId: formId
            }));
            return {
                total,
                byAuthor: authorStats,
                recent: recentFormatted
            };
        }
        catch (error) {
            if (error instanceof errors_1.AuthError) {
                throw error;
            }
            throw new Error(`Erreur lors de la récupération des statistiques: ${error}`);
        }
    }
    /**
     * Rechercher dans les commentaires d'un formulaire
     */
    async searchFormComments(formId, searchTerm, userId, userRole, options = {}) {
        try {
            // Vérifier l'accès au formulaire
            await this.formService.getFormById(formId, userId, userRole);
            if (!searchTerm || searchTerm.trim().length === 0) {
                throw new errors_1.ValidationError('Terme de recherche requis');
            }
            const { page = 1, limit = 10 } = options;
            const skip = (page - 1) * limit;
            const where = {
                formId,
                content: {
                    contains: searchTerm.trim(),
                    mode: 'insensitive'
                }
            };
            // Compter le total
            const total = await prisma.comment.count({ where });
            // Récupérer les commentaires
            const comments = await prisma.comment.findMany({
                where,
                include: {
                    author: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            role: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit
            });
            const formattedComments = comments.map(comment => ({
                id: comment.id,
                content: comment.content,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt,
                author: comment.author,
                formId: formId
            }));
            return {
                comments: formattedComments,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasNext: page * limit < total,
                    hasPrev: page > 1
                }
            };
        }
        catch (error) {
            if (error instanceof errors_1.ValidationError || error instanceof errors_1.AuthError) {
                throw error;
            }
            throw new Error(`Erreur lors de la recherche des commentaires: ${error}`);
        }
    }
}
exports.FormCommentService = FormCommentService;
//# sourceMappingURL=formComment.service.js.map