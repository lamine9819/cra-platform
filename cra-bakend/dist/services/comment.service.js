"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;
// src/services/comment.service.ts
const client_1 = require("@prisma/client");
const errors_1 = require("../utils/errors");
const prisma = new client_1.PrismaClient();
class CommentService {
    // Créer un commentaire
    async createComment(commentData, authorId, authorRole) {
        // Vérifier que la cible existe et que l'utilisateur a accès
        await this.validateTargetAccess(commentData.targetType, commentData.targetId, authorId, authorRole);
        // Nettoyer le contenu
        const cleanContent = commentData.content.trim();
        // Créer le commentaire en base selon le type de cible
        let comment;
        switch (commentData.targetType) {
            case 'project':
                comment = await prisma.comment.create({
                    data: {
                        content: cleanContent,
                        authorId,
                        projectId: commentData.targetId,
                    },
                    include: this.getCommentIncludes()
                });
                break;
            case 'activity':
                comment = await prisma.comment.create({
                    data: {
                        content: cleanContent,
                        authorId,
                        activityId: commentData.targetId,
                    },
                    include: this.getCommentIncludes()
                });
                break;
            case 'task':
                comment = await prisma.comment.create({
                    data: {
                        content: cleanContent,
                        authorId,
                        taskId: commentData.targetId,
                    },
                    include: this.getCommentIncludes()
                });
                break;
            default:
                throw new errors_1.ValidationError('Type de cible non supporté');
        }
        return this.formatCommentResponse(comment, commentData.targetType, commentData.targetId, authorId, authorRole);
    }
    // Lister les commentaires avec filtres
    async listComments(userId, userRole, query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        // Construire les filtres de base
        const where = {};
        // Filtres spécifiques
        if (query.targetType && query.targetId) {
            switch (query.targetType) {
                case 'project':
                    where.projectId = query.targetId;
                    // Vérifier l'accès au projet
                    await this.validateTargetAccess('project', query.targetId, userId, userRole);
                    break;
                case 'activity':
                    where.activityId = query.targetId;
                    await this.validateTargetAccess('activity', query.targetId, userId, userRole);
                    break;
                case 'task':
                    where.taskId = query.targetId;
                    await this.validateTargetAccess('task', query.targetId, userId, userRole);
                    break;
            }
        }
        else if (query.targetType) {
            // Filtrer par type sans ID spécifique - appliquer les filtres d'accès
            where.OR = await this.buildAccessFilters(query.targetType, userId, userRole);
        }
        else {
            // Pas de filtre de type - appliquer les filtres d'accès généraux
            where.OR = [
                ...(await this.buildAccessFilters('project', userId, userRole)),
                ...(await this.buildAccessFilters('activity', userId, userRole)),
                ...(await this.buildAccessFilters('task', userId, userRole)),
            ];
        }
        if (query.authorId) {
            where.authorId = query.authorId;
        }
        if (query.search) {
            where.content = {
                contains: query.search,
                mode: 'insensitive'
            };
        }
        if (query.startDate) {
            where.createdAt = { gte: new Date(query.startDate) };
        }
        if (query.endDate) {
            where.createdAt = {
                ...where.createdAt,
                lte: new Date(query.endDate)
            };
        }
        // Exécuter la requête
        const [comments, total] = await Promise.all([
            prisma.comment.findMany({
                where,
                skip,
                take: limit,
                include: this.getCommentIncludes(),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.comment.count({ where })
        ]);
        // Formater les commentaires avec les informations de cible
        const formattedComments = await Promise.all(comments.map(async (comment) => {
            const targetInfo = this.getTargetTypeAndId(comment);
            return this.formatCommentResponse(comment, targetInfo.type, targetInfo.id, userId, userRole);
        }));
        return {
            comments: formattedComments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1,
            }
        };
    }
    // Obtenir un commentaire par ID
    async getCommentById(commentId, userId, userRole) {
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: this.getCommentIncludes()
        });
        if (!comment) {
            throw new errors_1.ValidationError('Commentaire non trouvé');
        }
        // Déterminer le type et l'ID de la cible
        const targetInfo = this.getTargetTypeAndId(comment);
        // Vérifier l'accès à la cible
        await this.validateTargetAccess(targetInfo.type, targetInfo.id, userId, userRole);
        return this.formatCommentResponse(comment, targetInfo.type, targetInfo.id, userId, userRole);
    }
    // Mettre à jour un commentaire
    async updateComment(commentId, updateData, userId, userRole) {
        const existingComment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: this.getCommentIncludes()
        });
        if (!existingComment) {
            throw new errors_1.ValidationError('Commentaire non trouvé');
        }
        // Vérifier les droits de modification
        if (existingComment.authorId !== userId && userRole !== 'ADMINISTRATEUR') {
            throw new errors_1.AuthError('Seul l\'auteur peut modifier son commentaire');
        }
        // Déterminer le type et l'ID de la cible pour vérifier l'accès
        const targetInfo = this.getTargetTypeAndId(existingComment);
        await this.validateTargetAccess(targetInfo.type, targetInfo.id, userId, userRole);
        // Nettoyer le nouveau contenu
        const cleanContent = updateData.content.trim();
        // Vérifier que le contenu a réellement changé
        if (cleanContent === existingComment.content.trim()) {
            throw new errors_1.ValidationError('Le nouveau contenu est identique au contenu actuel');
        }
        // Mettre à jour le commentaire
        const updatedComment = await prisma.comment.update({
            where: { id: commentId },
            data: {
                content: cleanContent,
                updatedAt: new Date(),
            },
            include: this.getCommentIncludes()
        });
        return this.formatCommentResponse(updatedComment, targetInfo.type, targetInfo.id, userId, userRole);
    }
    // Supprimer un commentaire
    async deleteComment(commentId, userId, userRole) {
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: this.getCommentIncludes()
        });
        if (!comment) {
            throw new errors_1.ValidationError('Commentaire non trouvé');
        }
        // Vérifier les droits de suppression
        const canDelete = this.checkDeletePermissions(comment, userId, userRole);
        if (!canDelete) {
            throw new errors_1.AuthError('Permissions insuffisantes pour supprimer ce commentaire');
        }
        // Supprimer le commentaire
        await prisma.comment.delete({
            where: { id: commentId }
        });
    }
    // Obtenir les statistiques des commentaires
    async getCommentStats(userId, userRole, targetType, targetId) {
        // Construire les filtres selon les permissions
        let whereClause = {};
        if (targetType && targetId) {
            // Vérifier l'accès à la cible spécifique
            await this.validateTargetAccess(targetType, targetId, userId, userRole);
            switch (targetType) {
                case 'project':
                    whereClause.projectId = targetId;
                    break;
                case 'activity':
                    whereClause.activityId = targetId;
                    break;
                case 'task':
                    whereClause.taskId = targetId;
                    break;
            }
        }
        else {
            // Appliquer les filtres d'accès généraux
            whereClause.OR = [
                ...(await this.buildAccessFilters('project', userId, userRole)),
                ...(await this.buildAccessFilters('activity', userId, userRole)),
                ...(await this.buildAccessFilters('task', userId, userRole)),
            ];
        }
        // Récupérer les statistiques
        const [totalComments, projectComments, activityComments, taskComments, commentsByAuthor, recentComments] = await Promise.all([
            prisma.comment.count({ where: whereClause }),
            prisma.comment.count({
                where: {
                    ...whereClause,
                    projectId: { not: null }
                }
            }),
            prisma.comment.count({
                where: {
                    ...whereClause,
                    activityId: { not: null }
                }
            }),
            prisma.comment.count({
                where: {
                    ...whereClause,
                    taskId: { not: null }
                }
            }),
            prisma.comment.groupBy({
                by: ['authorId'],
                where: whereClause,
                _count: true,
                orderBy: { _count: { authorId: 'desc' } },
                take: 10
            }),
            prisma.comment.groupBy({
                by: ['createdAt'],
                where: {
                    ...whereClause,
                    createdAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 derniers jours
                    }
                },
                _count: true,
                orderBy: { createdAt: 'desc' }
            })
        ]);
        // Enrichir les données des auteurs
        const authorIds = commentsByAuthor.map((item) => item.authorId);
        const authors = await prisma.user.findMany({
            where: { id: { in: authorIds } },
            select: {
                id: true,
                firstName: true,
                lastName: true,
            }
        });
        const enrichedByAuthor = commentsByAuthor.map((item) => {
            const author = authors.find((a) => a.id === item.authorId);
            return {
                authorId: item.authorId,
                authorName: author ? `${author.firstName} ${author.lastName}` : 'Utilisateur inconnu',
                count: item._count,
            };
        });
        // Grouper l'activité récente par jour
        const recentActivity = this.groupCommentsByDay(recentComments);
        return {
            totalComments,
            byTargetType: {
                project: projectComments,
                activity: activityComments,
                task: taskComments,
            },
            byAuthor: enrichedByAuthor,
            recentActivity,
        };
    }
    // Valider l'accès à une cible (projet, activité, tâche)
    async validateTargetAccess(targetType, targetId, userId, userRole) {
        switch (targetType) {
            case 'project':
                const project = await prisma.project.findUnique({
                    where: { id: targetId },
                    include: {
                        participants: {
                            where: { userId: userId }
                        }
                    }
                });
                if (!project) {
                    throw new errors_1.ValidationError('Projet non trouvé');
                }
                const hasProjectAccess = userRole === 'ADMINISTRATEUR' ||
                    project.creatorId === userId ||
                    project.participants.some((p) => p.isActive);
                if (!hasProjectAccess) {
                    throw new errors_1.AuthError('Accès refusé à ce projet');
                }
                break;
            case 'activity':
                const activity = await prisma.activity.findUnique({
                    where: { id: targetId },
                    include: {
                        project: {
                            include: {
                                participants: {
                                    where: { userId: userId }
                                }
                            }
                        }
                    }
                });
                if (!activity) {
                    throw new errors_1.ValidationError('Activité non trouvée');
                }
                const hasActivityAccess = userRole === 'ADMINISTRATEUR' ||
                    activity.project.creatorId === userId ||
                    activity.project.participants.some((p) => p.isActive);
                if (!hasActivityAccess) {
                    throw new errors_1.AuthError('Accès refusé à cette activité');
                }
                break;
            case 'task':
                const task = await prisma.task.findUnique({
                    where: { id: targetId },
                    include: {
                        project: {
                            include: {
                                participants: {
                                    where: { userId: userId }
                                }
                            }
                        },
                        activity: {
                            include: {
                                project: {
                                    include: {
                                        participants: {
                                            where: { userId: userId }
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
                if (!task) {
                    throw new errors_1.ValidationError('Tâche non trouvée');
                }
                const hasTaskAccess = userRole === 'ADMINISTRATEUR' ||
                    task.creatorId === userId ||
                    task.assigneeId === userId ||
                    (task.project && (task.project.creatorId === userId ||
                        task.project.participants.some((p) => p.isActive))) ||
                    (task.activity?.project && (task.activity.project.creatorId === userId ||
                        task.activity.project.participants.some((p) => p.isActive)));
                if (!hasTaskAccess) {
                    throw new errors_1.AuthError('Accès refusé à cette tâche');
                }
                break;
            default:
                throw new errors_1.ValidationError('Type de cible non supporté');
        }
    }
    // Construire les filtres d'accès pour un type de cible
    async buildAccessFilters(targetType, userId, userRole) {
        if (userRole === 'ADMINISTRATEUR') {
            // L'admin a accès à tous les commentaires du type spécifié
            switch (targetType) {
                case 'project':
                    return [{ projectId: { not: null } }];
                case 'activity':
                    return [{ activityId: { not: null } }];
                case 'task':
                    return [{ taskId: { not: null } }];
            }
        }
        const filters = [];
        switch (targetType) {
            case 'project':
                filters.push({
                    projectId: { not: null },
                    project: {
                        OR: [
                            { creatorId: userId },
                            {
                                participants: {
                                    some: {
                                        userId: userId,
                                        isActive: true
                                    }
                                }
                            }
                        ]
                    }
                });
                break;
            case 'activity':
                filters.push({
                    activityId: { not: null },
                    activity: {
                        project: {
                            OR: [
                                { creatorId: userId },
                                {
                                    participants: {
                                        some: {
                                            userId: userId,
                                            isActive: true
                                        }
                                    }
                                }
                            ]
                        }
                    }
                });
                break;
            case 'task':
                filters.push({
                    taskId: { not: null },
                    OR: [
                        { task: { creatorId: userId } },
                        { task: { assigneeId: userId } },
                        {
                            task: {
                                project: {
                                    OR: [
                                        { creatorId: userId },
                                        {
                                            participants: {
                                                some: {
                                                    userId: userId,
                                                    isActive: true
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        },
                        {
                            task: {
                                activity: {
                                    project: {
                                        OR: [
                                            { creatorId: userId },
                                            {
                                                participants: {
                                                    some: {
                                                        userId: userId,
                                                        isActive: true
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    ]
                });
                break;
        }
        return filters;
    }
    // Déterminer le type et l'ID de la cible d'un commentaire
    getTargetTypeAndId(comment) {
        if (comment.projectId) {
            return { type: 'project', id: comment.projectId };
        }
        else if (comment.activityId) {
            return { type: 'activity', id: comment.activityId };
        }
        else if (comment.taskId) {
            return { type: 'task', id: comment.taskId };
        }
        else {
            throw new errors_1.ValidationError('Type de cible du commentaire non déterminable');
        }
    }
    // Vérifier les permissions de suppression
    checkDeletePermissions(comment, userId, userRole) {
        // Admin peut tout supprimer
        if (userRole === 'ADMINISTRATEUR')
            return true;
        // Auteur peut supprimer son commentaire
        if (comment.authorId === userId)
            return true;
        // Créateur du projet peut supprimer les commentaires sur son projet
        if (comment.project?.creatorId === userId)
            return true;
        // Créateur du projet peut supprimer les commentaires sur les activités de son projet
        if (comment.activity?.project?.creatorId === userId)
            return true;
        // Créateur de la tâche peut supprimer les commentaires sur sa tâche
        if (comment.task?.creatorId === userId)
            return true;
        return false;
    }
    // Grouper les commentaires par jour
    groupCommentsByDay(recentComments) {
        const grouped = recentComments.reduce((acc, item) => {
            const date = item.createdAt.toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + item._count;
            return acc;
        }, {});
        return Object.entries(grouped)
            .map(([date, count]) => ({ date, count: count }))
            .sort((a, b) => b.date.localeCompare(a.date));
    }
    // Inclusions pour les requêtes
    getCommentIncludes() {
        return {
            author: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true,
                    profileImage: true,
                }
            },
            project: {
                select: {
                    id: true,
                    title: true,
                    creatorId: true,
                }
            },
            activity: {
                select: {
                    id: true,
                    title: true,
                    project: {
                        select: {
                            creatorId: true,
                        }
                    }
                }
            },
            task: {
                select: {
                    id: true,
                    title: true,
                    creatorId: true,
                }
            }
        };
    }
    // Formater la réponse commentaire
    formatCommentResponse(comment, targetType, targetId, userId, userRole) {
        // Déterminer les informations de la cible
        let targetInfo = null;
        if (comment.project) {
            targetInfo = { id: comment.project.id, title: comment.project.title, type: 'project' };
        }
        else if (comment.activity) {
            targetInfo = { id: comment.activity.id, title: comment.activity.title, type: 'activity' };
        }
        else if (comment.task) {
            targetInfo = { id: comment.task.id, title: comment.task.title, type: 'task' };
        }
        // Vérifier les permissions
        const canEdit = comment.authorId === userId || userRole === 'ADMINISTRATEUR';
        const canDelete = this.checkDeletePermissions(comment, userId, userRole);
        return {
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            author: comment.author,
            targetType: targetType,
            targetId: targetId,
            target: targetInfo,
            canEdit,
            canDelete,
            isEdited: comment.createdAt.getTime() !== comment.updatedAt.getTime(),
        };
    }
}
exports.CommentService = CommentService;
//# sourceMappingURL=comment.service.js.map