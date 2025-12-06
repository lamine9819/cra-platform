"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const tslib_1 = require("tslib");
// src/services/document.service.ts - Version mise à jour conforme au schéma Prisma
const fs_1 = tslib_1.__importDefault(require("fs"));
const client_1 = require("@prisma/client");
const errors_1 = require("../utils/errors");
const fileHelpers_1 = require("../utils/fileHelpers");
const notification_service_1 = require("./notification.service");
const prisma = new client_1.PrismaClient();
class DocumentService {
    // Créer un document après upload
    async createDocument(file, documentData, ownerId, userRole) {
        // Vérifier les permissions d'accès aux entités liées
        await this.validateEntityAccess(documentData, ownerId, userRole);
        // Auto-déterminer le type si pas fourni et le caster en DocumentType
        const documentType = (documentData.type || (0, fileHelpers_1.getFileTypeFromMime)(file.mimetype));
        // Créer le document en base
        const document = await prisma.document.create({
            data: {
                title: documentData.title,
                filename: file.originalname,
                filepath: file.path,
                mimeType: file.mimetype,
                size: BigInt(file.size),
                type: documentType,
                description: documentData.description || null,
                tags: documentData.tags || [],
                isPublic: documentData.isPublic || false,
                ownerId,
                projectId: documentData.projectId || null,
                activityId: documentData.activityId || null,
                taskId: documentData.taskId || null,
                seminarId: documentData.seminarId || null,
                trainingId: documentData.trainingId || null,
                internshipId: documentData.internshipId || null,
                supervisionId: documentData.supervisionId || null,
                knowledgeTransferId: documentData.knowledgeTransferId || null,
                eventId: documentData.eventId || null,
            },
            include: this.getDocumentIncludes()
        });
        return this.formatDocumentResponse(document);
    }
    // Lister les documents accessibles avec filtres améliorés
    async listDocuments(userId, userRole, query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        // Construire les filtres
        const where = {
            deletedAt: null // Exclure les documents supprimés (soft delete)
        };
        if (query.type)
            where.type = query.type;
        if (query.ownerId)
            where.ownerId = query.ownerId;
        if (query.projectId)
            where.projectId = query.projectId;
        if (query.activityId)
            where.activityId = query.activityId;
        if (query.taskId)
            where.taskId = query.taskId;
        if (query.seminarId)
            where.seminarId = query.seminarId;
        if (query.trainingId)
            where.trainingId = query.trainingId;
        if (query.internshipId)
            where.internshipId = query.internshipId;
        if (query.supervisionId)
            where.supervisionId = query.supervisionId;
        if (query.knowledgeTransferId)
            where.knowledgeTransferId = query.knowledgeTransferId;
        if (query.eventId)
            where.eventId = query.eventId;
        if (query.mimeType)
            where.mimeType = query.mimeType;
        if (query.isPublic !== undefined)
            where.isPublic = query.isPublic;
        if (query.tags && query.tags.length > 0) {
            where.tags = { hasSome: query.tags };
        }
        if (query.search) {
            where.OR = [
                { title: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } },
                { filename: { contains: query.search, mode: 'insensitive' } },
                { tags: { has: query.search } },
            ];
        }
        // Filtrer selon les droits d'accès
        if (userRole !== 'ADMINISTRATEUR') {
            where.OR = [
                { ownerId: userId },
                { isPublic: true },
                { shares: { some: { sharedWithId: userId } } },
                {
                    project: {
                        OR: [
                            { creatorId: userId },
                            { participants: { some: { userId: userId, isActive: true } } }
                        ]
                    }
                },
                {
                    activity: {
                        OR: [
                            { responsibleId: userId },
                            { participants: { some: { userId: userId, isActive: true } } },
                            {
                                project: {
                                    OR: [
                                        { creatorId: userId },
                                        { participants: { some: { userId: userId, isActive: true } } }
                                    ]
                                }
                            }
                        ]
                    }
                },
                { task: { OR: [{ creatorId: userId }, { assigneeId: userId }] } },
                { seminar: { organizerId: userId } },
                { training: { participants: { some: { userId: userId } } } },
                { internship: { OR: [{ supervisorId: userId }, { internId: userId }] } },
                { supervision: { OR: [{ supervisorId: userId }, { studentId: userId }] } },
                { knowledgeTransfer: { organizerId: userId } },
                { event: { OR: [{ creatorId: userId }, { participants: { some: { participantId: userId } } }] } }
            ];
        }
        // Exécuter la requête
        const [documents, total] = await Promise.all([
            prisma.document.findMany({
                where,
                skip,
                take: limit,
                include: this.getDocumentIncludes(),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.document.count({ where })
        ]);
        return {
            documents: documents.map((doc) => this.formatDocumentResponse(doc)),
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
    // Obtenir un document par ID
    async getDocumentById(documentId, userId, userRole) {
        const document = await prisma.document.findUnique({
            where: { id: documentId },
            include: this.getDocumentIncludes()
        });
        if (!document) {
            throw new errors_1.ValidationError('Document non trouvé');
        }
        // Vérifier les droits d'accès
        const hasAccess = await this.checkDocumentAccess(document, userId, userRole);
        if (!hasAccess) {
            throw new errors_1.AuthError('Accès refusé à ce document');
        }
        return this.formatDocumentResponse(document);
    }
    // Partager un document
    async shareDocument(documentId, shareData, userId, userRole) {
        const document = await prisma.document.findUnique({
            where: { id: documentId },
            include: this.getDocumentIncludes()
        });
        if (!document) {
            throw new errors_1.ValidationError('Document non trouvé');
        }
        // Vérifier les droits de partage
        const canShare = await this.canShareDocument(document, userId, userRole);
        if (!canShare) {
            throw new errors_1.AuthError('Permissions insuffisantes pour partager ce document');
        }
        // Vérifier que tous les utilisateurs existent
        const users = await prisma.user.findMany({
            where: {
                id: { in: shareData.userIds },
                isActive: true
            }
        });
        if (users.length !== shareData.userIds.length) {
            throw new errors_1.ValidationError('Un ou plusieurs utilisateurs sont introuvables ou inactifs');
        }
        // Créer les partages
        const shares = await Promise.all(shareData.userIds.map(async (userToShareId) => {
            return prisma.documentShare.upsert({
                where: {
                    documentId_sharedWithId: {
                        documentId,
                        sharedWithId: userToShareId
                    }
                },
                update: {
                    canEdit: shareData.canEdit || false,
                    canDelete: shareData.canDelete || false,
                },
                create: {
                    documentId,
                    sharedWithId: userToShareId,
                    canEdit: shareData.canEdit || false,
                    canDelete: shareData.canDelete || false,
                },
                include: {
                    sharedWith: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        }
                    }
                }
            });
        }));
        // Envoyer des notifications pour chaque partage
        try {
            const notificationService = (0, notification_service_1.getNotificationService)();
            await Promise.allSettled(shareData.userIds.map(userToShareId => notificationService.notifyDocumentShare(documentId, document.title, userToShareId, userId, shareData.canEdit || false)));
        }
        catch (error) {
            console.error('Erreur lors de l\'envoi des notifications de partage:', error);
            // Ne pas faire échouer le partage si les notifications échouent
        }
        return {
            message: 'Document partagé avec succès',
            shares: shares.map((share) => ({
                id: share.id,
                canEdit: share.canEdit,
                canDelete: share.canDelete,
                sharedAt: share.sharedAt,
                sharedWith: share.sharedWith,
            }))
        };
    }
    // Supprimer un document (soft delete par défaut)
    async deleteDocument(documentId, userId, userRole) {
        const document = await prisma.document.findUnique({
            where: { id: documentId },
            include: {
                shares: { where: { sharedWithId: userId } }
            }
        });
        if (!document) {
            throw new errors_1.ValidationError('Document non trouvé');
        }
        // Vérifier les droits de suppression
        const canDelete = await this.canDeleteDocument(document, userId, userRole);
        if (!canDelete) {
            throw new errors_1.AuthError('Permissions insuffisantes pour supprimer ce document');
        }
        // Soft delete: marquer comme supprimé sans supprimer physiquement
        await prisma.document.update({
            where: { id: documentId },
            data: {
                deletedAt: new Date(),
                deletedBy: userId
            }
        });
    }
    // Obtenir le chemin du fichier pour téléchargement
    async getDocumentFilePath(documentId, userId, userRole) {
        const document = await this.getDocumentById(documentId, userId, userRole);
        if (!fs_1.default.existsSync(document.filepath)) {
            throw new errors_1.ValidationError('Fichier physique non trouvé');
        }
        return {
            filepath: document.filepath,
            filename: document.filename,
            mimeType: document.mimeType,
        };
    }
    // MÉTHODES PRIVÉES
    // Valider l'accès aux entités liées
    async validateEntityAccess(documentData, userId, userRole) {
        // Validation pour chaque type d'entité
        const validations = [
            { id: documentData.projectId, type: 'project' },
            { id: documentData.activityId, type: 'activity' },
            { id: documentData.taskId, type: 'task' },
            { id: documentData.seminarId, type: 'seminar' },
            { id: documentData.trainingId, type: 'training' },
            { id: documentData.internshipId, type: 'internship' },
            { id: documentData.supervisionId, type: 'supervision' },
            { id: documentData.knowledgeTransferId, type: 'knowledgeTransfer' },
            { id: documentData.eventId, type: 'event' }
        ];
        for (const { id, type } of validations) {
            if (id) {
                const hasAccess = await this.validateSpecificEntityAccess(id, type, userId, userRole);
                if (!hasAccess) {
                    throw new errors_1.AuthError(`Accès refusé à ce(tte) ${type}`);
                }
            }
        }
    }
    // Valider l'accès à une entité spécifique
    async validateSpecificEntityAccess(entityId, entityType, userId, userRole) {
        if (userRole === 'ADMINISTRATEUR')
            return true;
        switch (entityType) {
            case 'project':
                const project = await prisma.project.findUnique({
                    where: { id: entityId },
                    include: { participants: { where: { userId } } }
                });
                return !!project && (project.creatorId === userId || project.participants.some(p => p.isActive));
            case 'activity':
                const activity = await prisma.activity.findUnique({
                    where: { id: entityId },
                    include: { participants: { where: { userId } } }
                });
                return !!activity && (activity.responsibleId === userId || activity.participants.some(p => p.isActive));
            case 'task':
                const task = await prisma.task.findUnique({ where: { id: entityId } });
                return !!task && (task.creatorId === userId || task.assigneeId === userId);
            case 'training':
                const training = await prisma.training.findUnique({
                    where: { id: entityId },
                    include: { participants: { where: { userId } } }
                });
                return !!training && training.participants.length > 0;
            case 'internship':
                const internship = await prisma.internship.findUnique({ where: { id: entityId } });
                return !!internship && (internship.supervisorId === userId || internship.internId === userId);
            case 'supervision':
                const supervision = await prisma.supervision.findUnique({ where: { id: entityId } });
                return !!supervision && (supervision.supervisorId === userId || supervision.studentId === userId);
            default:
                return true;
        }
    }
    // Vérifier l'accès à un document
    async checkDocumentAccess(document, userId, userRole) {
        if (userRole === 'ADMINISTRATEUR')
            return true;
        if (document.ownerId === userId)
            return true;
        if (document.isPublic)
            return true;
        if (document.shares?.some(share => share.sharedWithId === userId))
            return true;
        // Vérifier l'accès via les entités liées
        if (document.projectId) {
            const project = await prisma.project.findUnique({
                where: { id: document.projectId },
                include: { participants: { where: { userId, isActive: true } } }
            });
            if (project && (project.creatorId === userId || project.participants.length > 0))
                return true;
        }
        if (document.activityId) {
            const activity = await prisma.activity.findUnique({
                where: { id: document.activityId },
                include: { participants: { where: { userId, isActive: true } } }
            });
            if (activity && (activity.responsibleId === userId || activity.participants.length > 0))
                return true;
        }
        return false;
    }
    // Vérifier si l'utilisateur peut partager le document
    async canShareDocument(document, userId, userRole) {
        if (userRole === 'ADMINISTRATEUR')
            return true;
        if (document.ownerId === userId)
            return true;
        return false;
    }
    // Vérifier si l'utilisateur peut supprimer le document
    async canDeleteDocument(document, userId, userRole) {
        if (userRole === 'ADMINISTRATEUR')
            return true;
        if (document.ownerId === userId)
            return true;
        if (document.shares?.some((s) => s.sharedWithId === userId && s.canDelete))
            return true;
        return false;
    }
    // Inclusions pour les requêtes
    getDocumentIncludes() {
        return {
            owner: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true,
                }
            },
            project: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                    creatorId: true,
                    participants: { select: { userId: true, isActive: true } }
                }
            },
            activity: {
                select: {
                    id: true,
                    title: true,
                    projectId: true,
                    project: {
                        select: {
                            id: true,
                            title: true,
                            creatorId: true,
                            participants: { select: { userId: true, isActive: true } }
                        }
                    }
                }
            },
            task: {
                select: {
                    id: true,
                    title: true,
                    creatorId: true,
                    assigneeId: true,
                }
            },
            seminar: {
                select: {
                    id: true,
                    title: true,
                    organizerId: true,
                    organizer: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        }
                    }
                }
            },
            training: {
                select: {
                    id: true,
                    title: true,
                    type: true,
                }
            },
            internship: {
                select: {
                    id: true,
                    title: true,
                    supervisorId: true,
                    internId: true,
                }
            },
            supervision: {
                select: {
                    id: true,
                    title: true,
                    type: true,
                    supervisorId: true,
                    studentId: true,
                }
            },
            knowledgeTransfer: {
                select: {
                    id: true,
                    title: true,
                    type: true,
                    organizerId: true,
                }
            },
            event: {
                select: {
                    id: true,
                    title: true,
                    type: true,
                    creatorId: true,
                }
            },
            shares: {
                include: {
                    sharedWith: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        }
                    }
                }
            }
        };
    }
    // Formater la réponse document
    formatDocumentResponse(document) {
        return {
            id: document.id,
            title: document.title,
            filename: document.filename,
            filepath: document.filepath,
            mimeType: document.mimeType,
            size: Number(document.size),
            type: document.type,
            description: document.description ?? undefined,
            tags: document.tags,
            isPublic: document.isPublic,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
            owner: document.owner,
            project: document.project ? {
                id: document.project.id,
                title: document.project.title,
                description: document.project.description ?? undefined,
                creatorId: document.project.creatorId,
                participants: document.project.participants
            } : undefined,
            activity: document.activity ? {
                id: document.activity.id,
                title: document.activity.title,
                projectId: document.activity.projectId,
                project: document.activity.project ?? null
            } : undefined,
            task: document.task ? {
                id: document.task.id,
                title: document.task.title,
                creatorId: document.task.creatorId,
                assigneeId: document.task.assigneeId ?? undefined
            } : undefined,
            seminar: document.seminar || undefined,
            training: document.training || undefined,
            internship: document.internship || undefined,
            supervision: document.supervision || undefined,
            knowledgeTransfer: document.knowledgeTransfer || undefined,
            event: document.event || undefined,
            shares: document.shares?.map((share) => ({
                id: share.id,
                canEdit: share.canEdit,
                canDelete: share.canDelete,
                sharedAt: share.sharedAt,
                sharedWith: share.sharedWith,
            })),
        };
    }
    // =============================================
    // NOUVELLES MÉTHODES - GESTION AVANCÉE DOCUMENTS
    // =============================================
    // HELPER: Vérifier les permissions d'édition
    async canEditDocument(documentId, userId, userRole) {
        const document = await prisma.document.findUnique({
            where: { id: documentId },
            include: {
                shares: {
                    where: { sharedWithId: userId }
                }
            }
        });
        if (!document)
            return false;
        // Propriétaire
        if (document.ownerId === userId)
            return true;
        // Administrateur
        if (userRole === 'ADMINISTRATEUR')
            return true;
        // Partagé avec permission d'édition
        const share = document.shares.find(s => s.sharedWithId === userId);
        if (share && share.canEdit)
            return true;
        return false;
    }
    /**
     * Mettre à jour les métadonnées d'un document
     */
    async updateDocumentMetadata(documentId, updateData, userId, userRole) {
        // Vérifier les permissions
        const canEdit = await this.canEditDocument(documentId, userId, userRole);
        if (!canEdit) {
            throw new errors_1.AuthError('Vous n\'avez pas la permission de modifier ce document');
        }
        // Vérifier que le document existe et n'est pas supprimé
        const existingDocument = await prisma.document.findUnique({
            where: { id: documentId }
        });
        if (!existingDocument) {
            throw new errors_1.ValidationError('Document non trouvé');
        }
        if (existingDocument.deletedAt) {
            throw new errors_1.ValidationError('Impossible de modifier un document supprimé');
        }
        // Mettre à jour le document
        const document = await prisma.document.update({
            where: { id: documentId },
            data: {
                ...updateData,
                type: updateData.type ? updateData.type : undefined,
                updatedAt: new Date()
            },
            include: this.getDocumentIncludes()
        });
        // Logger l'activité
        await this.logActivity(documentId, userId, 'edit', {
            updatedFields: Object.keys(updateData)
        });
        return this.formatDocumentResponse(document);
    }
    /**
     * Lier un document à une entité
     */
    async linkDocument(documentId, linkData, userId, userRole) {
        // Vérifier les permissions
        const canEdit = await this.canEditDocument(documentId, userId, userRole);
        if (!canEdit) {
            throw new errors_1.AuthError('Vous n\'avez pas la permission de lier ce document');
        }
        // Vérifier que le document existe
        const existingDocument = await prisma.document.findUnique({
            where: { id: documentId }
        });
        if (!existingDocument || existingDocument.deletedAt) {
            throw new errors_1.ValidationError('Document non trouvé');
        }
        // Vérifier que l'entité existe
        const entityModel = this.getEntityModel(linkData.entityType);
        const entity = await prisma[entityModel].findUnique({
            where: { id: linkData.entityId }
        });
        if (!entity) {
            throw new errors_1.ValidationError(`${linkData.entityType} non trouvé(e)`);
        }
        // Lier le document
        const entityIdField = `${linkData.entityType}Id`;
        const document = await prisma.document.update({
            where: { id: documentId },
            data: {
                [entityIdField]: linkData.entityId
            },
            include: this.getDocumentIncludes()
        });
        // Logger l'activité
        await this.logActivity(documentId, userId, 'link', {
            entityType: linkData.entityType,
            entityId: linkData.entityId
        });
        return this.formatDocumentResponse(document);
    }
    /**
     * Délier un document d'une ou plusieurs entités
     */
    async unlinkDocument(documentId, unlinkData, userId, userRole) {
        // Vérifier les permissions
        const canEdit = await this.canEditDocument(documentId, userId, userRole);
        if (!canEdit) {
            throw new errors_1.AuthError('Vous n\'avez pas la permission de délier ce document');
        }
        // Préparer les données de mise à jour
        const updateData = {};
        if (unlinkData.entityType) {
            // Délier d'une entité spécifique
            const entityIdField = `${unlinkData.entityType}Id`;
            updateData[entityIdField] = null;
        }
        else {
            // Délier de toutes les entités
            updateData.projectId = null;
            updateData.activityId = null;
            updateData.taskId = null;
            updateData.seminarId = null;
            updateData.trainingId = null;
            updateData.internshipId = null;
            updateData.supervisionId = null;
            updateData.knowledgeTransferId = null;
            updateData.eventId = null;
        }
        const document = await prisma.document.update({
            where: { id: documentId },
            data: updateData,
            include: this.getDocumentIncludes()
        });
        // Logger l'activité
        await this.logActivity(documentId, userId, 'unlink', unlinkData);
        return this.formatDocumentResponse(document);
    }
    // =============================================
    // CORBEILLE (SOFT DELETE)
    // =============================================
    /**
     * Obtenir les documents supprimés (corbeille)
     */
    async getTrashDocuments(userId, userRole, query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: { not: null }
        };
        // Seuls les documents de l'utilisateur ou tous pour les admins
        if (userRole !== 'ADMINISTRATEUR') {
            where.OR = [
                { ownerId: userId },
                { deletedBy: userId }
            ];
        }
        const [documents, total] = await Promise.all([
            prisma.document.findMany({
                where,
                skip,
                take: limit,
                orderBy: { deletedAt: 'desc' },
                include: this.getDocumentIncludes()
            }),
            prisma.document.count({ where })
        ]);
        return {
            documents: documents.map(doc => this.formatDocumentResponse(doc)),
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
    /**
     * Restaurer un document supprimé
     */
    async restoreDocument(documentId, userId, userRole) {
        // Vérifier que le document existe et est supprimé
        const document = await prisma.document.findUnique({
            where: { id: documentId }
        });
        if (!document) {
            throw new errors_1.ValidationError('Document non trouvé');
        }
        if (!document.deletedAt) {
            throw new errors_1.ValidationError('Ce document n\'est pas supprimé');
        }
        // Vérifier les permissions
        const isOwner = document.ownerId === userId;
        const isDeleter = document.deletedBy === userId;
        const isAdmin = userRole === 'ADMINISTRATEUR';
        if (!isOwner && !isDeleter && !isAdmin) {
            throw new errors_1.AuthError('Vous n\'avez pas la permission de restaurer ce document');
        }
        // Restaurer
        const restoredDocument = await prisma.document.update({
            where: { id: documentId },
            data: {
                deletedAt: null,
                deletedBy: null
            },
            include: this.getDocumentIncludes()
        });
        // Logger l'activité
        await this.logActivity(documentId, userId, 'restore', {});
        return this.formatDocumentResponse(restoredDocument);
    }
    /**
     * Suppression définitive d'un document
     */
    async permanentDeleteDocument(documentId, userId, userRole) {
        const document = await prisma.document.findUnique({
            where: { id: documentId }
        });
        if (!document) {
            throw new errors_1.ValidationError('Document non trouvé');
        }
        // Vérifier les permissions
        const canDelete = await this.canDeleteDocument(document, userId, userRole);
        if (!canDelete) {
            throw new errors_1.AuthError('Vous n\'avez pas la permission de supprimer définitivement ce document');
        }
        // Supprimer le fichier physique
        try {
            await (0, fileHelpers_1.deleteFile)(document.filepath);
        }
        catch (error) {
            console.error('Erreur lors de la suppression du fichier:', error);
        }
        // Supprimer de la base de données
        await prisma.document.delete({
            where: { id: documentId }
        });
    }
    /**
     * Vider la corbeille (supprimer les documents > 30 jours)
     */
    async emptyTrash(userId, userRole) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const where = {
            deletedAt: {
                not: null,
                lt: thirtyDaysAgo
            }
        };
        // Seuls les documents de l'utilisateur ou tous pour les admins
        if (userRole !== 'ADMINISTRATEUR') {
            where.OR = [
                { ownerId: userId },
                { deletedBy: userId }
            ];
        }
        // Récupérer les documents à supprimer
        const documents = await prisma.document.findMany({
            where,
            select: { id: true, filepath: true }
        });
        // Supprimer les fichiers physiques
        for (const doc of documents) {
            try {
                await (0, fileHelpers_1.deleteFile)(doc.filepath);
            }
            catch (error) {
                console.error(`Erreur suppression fichier ${doc.filepath}:`, error);
            }
        }
        // Supprimer de la base de données
        const result = await prisma.document.deleteMany({ where });
        return result.count;
    }
    // =============================================
    // GESTION AVANCÉE DES PARTAGES
    // =============================================
    /**
     * Obtenir la liste des partages d'un document
     */
    async getDocumentShares(documentId, userId, userRole) {
        const document = await prisma.document.findUnique({
            where: { id: documentId },
            select: { ownerId: true }
        });
        if (!document) {
            throw new errors_1.ValidationError('Document non trouvé');
        }
        // Seul le propriétaire ou l'admin peut voir les partages
        if (document.ownerId !== userId && userRole !== 'ADMINISTRATEUR') {
            throw new errors_1.AuthError('Vous n\'avez pas la permission de voir les partages');
        }
        const shares = await prisma.documentShare.findMany({
            where: {
                documentId,
                revokedAt: null // Seulement les partages actifs
            },
            include: {
                sharedWith: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            },
            orderBy: { sharedAt: 'desc' }
        });
        return shares;
    }
    /**
     * Révoquer un partage
     */
    async revokeShare(documentId, shareId, userId, userRole) {
        const document = await prisma.document.findUnique({
            where: { id: documentId },
            select: { ownerId: true }
        });
        if (!document) {
            throw new errors_1.ValidationError('Document non trouvé');
        }
        // Seul le propriétaire ou l'admin peut révoquer
        if (document.ownerId !== userId && userRole !== 'ADMINISTRATEUR') {
            throw new errors_1.AuthError('Vous n\'avez pas la permission de révoquer ce partage');
        }
        await prisma.documentShare.update({
            where: { id: shareId },
            data: {
                revokedAt: new Date(),
                revokedBy: userId
            }
        });
    }
    /**
     * Mettre à jour les permissions d'un partage
     */
    async updateSharePermissions(documentId, shareId, permissions, userId, userRole) {
        const document = await prisma.document.findUnique({
            where: { id: documentId },
            select: { ownerId: true }
        });
        if (!document) {
            throw new errors_1.ValidationError('Document non trouvé');
        }
        // Seul le propriétaire ou l'admin peut modifier les permissions
        if (document.ownerId !== userId && userRole !== 'ADMINISTRATEUR') {
            throw new errors_1.AuthError('Vous n\'avez pas la permission de modifier ce partage');
        }
        const share = await prisma.documentShare.update({
            where: { id: shareId },
            data: permissions,
            include: {
                sharedWith: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });
        return share;
    }
    // =============================================
    // FAVORIS
    // =============================================
    /**
     * Ajouter aux favoris
     */
    async addToFavorites(documentId, userId) {
        const document = await prisma.document.findUnique({
            where: { id: documentId },
            select: { favoritedBy: true }
        });
        if (!document) {
            throw new errors_1.ValidationError('Document non trouvé');
        }
        // Vérifier si déjà en favoris
        if (document.favoritedBy && document.favoritedBy.includes(userId)) {
            return; // Déjà en favoris
        }
        await prisma.document.update({
            where: { id: documentId },
            data: {
                favoritedBy: {
                    push: userId
                }
            }
        });
    }
    /**
     * Retirer des favoris
     */
    async removeFromFavorites(documentId, userId) {
        const document = await prisma.document.findUnique({
            where: { id: documentId },
            select: { favoritedBy: true }
        });
        if (!document) {
            throw new errors_1.ValidationError('Document non trouvé');
        }
        const favoritedBy = document.favoritedBy || [];
        await prisma.document.update({
            where: { id: documentId },
            data: {
                favoritedBy: favoritedBy.filter((id) => id !== userId)
            }
        });
    }
    /**
     * Obtenir les documents favoris
     */
    async getFavoriteDocuments(userId, userRole, query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
            favoritedBy: {
                has: userId
            }
        };
        const [documents, total] = await Promise.all([
            prisma.document.findMany({
                where,
                skip,
                take: limit,
                orderBy: { updatedAt: 'desc' },
                include: this.getDocumentIncludes()
            }),
            prisma.document.count({ where })
        ]);
        return {
            documents: documents.map(doc => this.formatDocumentResponse(doc)),
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
    // =============================================
    // TRACKING
    // =============================================
    /**
     * Incrémenter le compteur de vues
     */
    async incrementViewCount(documentId) {
        await prisma.document.update({
            where: { id: documentId },
            data: {
                viewCount: { increment: 1 },
                lastViewedAt: new Date()
            }
        });
    }
    /**
     * Logger une activité
     */
    async logActivity(documentId, userId, action, metadata) {
        try {
            await prisma.documentActivity.create({
                data: {
                    documentId,
                    userId,
                    action,
                    metadata: metadata || {}
                }
            });
        }
        catch (error) {
            console.error('Erreur lors du logging de l\'activité:', error);
        }
    }
    /**
     * Helper pour obtenir le nom du modèle Prisma à partir du type d'entité
     */
    getEntityModel(entityType) {
        const mapping = {
            project: 'project',
            activity: 'activity',
            task: 'task',
            seminar: 'seminar',
            training: 'training',
            internship: 'internship',
            supervision: 'supervision',
            knowledgeTransfer: 'knowledgeTransfer',
            event: 'calendarEvent'
        };
        return mapping[entityType] || entityType;
    }
}
exports.DocumentService = DocumentService;
//# sourceMappingURL=document.service.js.map