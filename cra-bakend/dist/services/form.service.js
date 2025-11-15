"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormService = void 0;
// src/services/form.service.ts - Version complète et fonctionnelle
const client_1 = require("@prisma/client");
const errors_1 = require("../utils/errors");
const formValidation_service_1 = require("./formValidation.service");
const fileStorage_service_1 = require("./fileStorage.service");
const shareUtils_1 = require("../utils/shareUtils");
const prisma = new client_1.PrismaClient();
class FormService {
    // =============================================
    // CRÉATION ET GESTION DES FORMULAIRES
    // =============================================
    async createForm(formData, creatorId, creatorRole) {
        const allowedRoles = ['CHERCHEUR', 'ASSISTANT_CHERCHEUR', 'TECHNICIEN_SUPERIEUR', 'ADMINISTRATEUR'];
        if (!allowedRoles.includes(creatorRole)) {
            throw new errors_1.AuthError('Permissions insuffisantes pour créer un formulaire');
        }
        // Vérifier l'accès à l'activité si fournie
        if (formData.activityId) {
            const activity = await prisma.activity.findUnique({
                where: { id: formData.activityId },
                include: {
                    project: {
                        include: {
                            participants: {
                                where: { userId: creatorId }
                            }
                        }
                    }
                }
            });
            if (!activity) {
                throw new errors_1.ValidationError('Activité non trouvée');
            }
            const hasAccess = this.checkProjectAccess(activity.project, creatorId, creatorRole);
            if (!hasAccess) {
                throw new errors_1.AuthError('Accès refusé à cette activité');
            }
        }
        // Valider le schéma du formulaire
        const schemaValidation = formValidation_service_1.FormValidationService.validateFormSchema(formData.schema);
        if (!schemaValidation.isValid) {
            throw new errors_1.ValidationError(`Schéma invalide: ${schemaValidation.errors.join(', ')}`);
        }
        // S'assurer que allowMultipleSubmissions est activé par défaut selon votre logique
        const formSchema = formData.schema;
        if (!formSchema.settings) {
            formSchema.settings = {};
        }
        formSchema.settings.allowMultipleSubmissions = true;
        // Créer le formulaire
        const form = await prisma.form.create({
            data: {
                title: formData.title,
                description: formData.description,
                schema: formSchema,
                isActive: formData.isActive ?? true,
                isPublic: formData.enablePublicAccess ?? false,
                allowMultipleSubmissions: true,
                creatorId,
                activityId: formData.activityId,
            },
            include: this.getFormIncludes(false)
        });
        return this.formatFormResponse(form);
    }
    // =============================================
    // PARTAGE DE FORMULAIRES
    // =============================================
    async shareFormWithUser(formId, targetUserId, permissions, userId, userRole, maxSubmissions, expiresAt) {
        const form = await this.getFormById(formId, userId, userRole);
        // Seul le créateur peut partager
        if (form.creator.id !== userId && userRole !== 'ADMINISTRATEUR') {
            throw new errors_1.AuthError('Seul le créateur peut partager ce formulaire');
        }
        // Vérifier que l'utilisateur cible existe
        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId }
        });
        if (!targetUser) {
            throw new errors_1.NotFoundError('Utilisateur non trouvé');
        }
        // Créer le partage
        const share = await prisma.formShare.create({
            data: {
                shareType: 'INTERNAL',
                canCollect: permissions.canCollect,
                canExport: permissions.canExport,
                maxSubmissions,
                expiresAt,
                formId,
                sharedWithId: targetUserId,
                createdById: userId
            },
            include: {
                sharedWith: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                createdBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
        return {
            id: share.id,
            shareType: share.shareType,
            shareToken: share.shareToken || undefined,
            canCollect: share.canCollect,
            canExport: share.canExport,
            maxSubmissions: share.maxSubmissions || undefined,
            expiresAt: share.expiresAt || undefined,
            createdAt: share.createdAt,
            lastAccessed: share.lastAccessed || undefined,
            sharedWith: share.sharedWith,
            createdBy: share.createdBy
        };
    }
    async createPublicShareLink(formId, userId, userRole, options = {}) {
        const form = await this.getFormById(formId, userId, userRole);
        // Seul le créateur peut créer un lien public
        if (form.creator.id !== userId && userRole !== 'ADMINISTRATEUR') {
            throw new errors_1.AuthError('Seul le créateur peut créer un lien public');
        }
        const shareToken = (0, shareUtils_1.generateShareToken)();
        await prisma.formShare.create({
            data: {
                shareType: 'EXTERNAL',
                shareToken,
                canCollect: true,
                canExport: false,
                maxSubmissions: options.maxSubmissions,
                expiresAt: options.expiresAt,
                formId,
                createdById: userId
            }
        });
        // Mettre à jour le formulaire pour marquer comme public
        await prisma.form.update({
            where: { id: formId },
            data: {
                isPublic: true,
                shareToken: shareToken
            }
        });
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return {
            shareToken,
            shareUrl: `${baseUrl}/forms/public/${shareToken}`,
            expiresAt: options.expiresAt,
            maxSubmissions: options.maxSubmissions
        };
    }
    async getFormByPublicToken(shareToken) {
        const share = await prisma.formShare.findUnique({
            where: { shareToken },
            include: {
                form: {
                    include: {
                        creator: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            }
        });
        if (!share) {
            throw new errors_1.NotFoundError('Lien de partage invalide ou expiré');
        }
        // Vérifier l'expiration
        if (share.expiresAt && new Date() > share.expiresAt) {
            throw new errors_1.ValidationError('Ce lien de partage a expiré');
        }
        // Vérifier la limite de soumissions si définie
        if (share.maxSubmissions) {
            const submissionCount = await prisma.formResponse.count({
                where: {
                    formId: share.formId,
                    collectorType: 'PUBLIC'
                }
            });
            if (submissionCount >= share.maxSubmissions) {
                throw new errors_1.ValidationError('Limite de soumissions atteinte pour ce formulaire');
            }
        }
        // Mettre à jour le dernier accès
        await prisma.formShare.update({
            where: { id: share.id },
            data: { lastAccessed: new Date() }
        });
        return {
            form: share.form,
            canCollect: share.canCollect,
            remainingSubmissions: share.maxSubmissions
                ? Math.max(0, share.maxSubmissions - await this.getSubmissionCount(share.formId, 'PUBLIC'))
                : null
        };
    }
    // =============================================
    // COLLECTE DE DONNÉES MULTIPLE
    // =============================================
    async submitFormResponse(formId, responseData, respondentId, respondentRole, collectorInfo) {
        let form;
        const collectorType = collectorInfo?.type || 'USER';
        // Obtenir le formulaire selon le type de collecte
        if (collectorType === 'PUBLIC') {
            form = await prisma.form.findUnique({
                where: { id: formId },
                include: {
                    creator: {
                        select: { id: true, firstName: true, lastName: true, email: true, role: true }
                    }
                }
            });
        }
        else {
            form = await this.getFormById(formId, respondentId, respondentRole);
        }
        if (!form) {
            throw new errors_1.NotFoundError('Formulaire non trouvé');
        }
        if (!form.isActive) {
            throw new errors_1.ValidationError('Ce formulaire n\'est plus actif');
        }
        // Valider les données de réponse
        const formSchema = form.schema;
        const validation = formValidation_service_1.FormValidationService.validateFormResponse(formSchema, responseData.data);
        if (!validation.isValid) {
            throw new errors_1.ValidationError(`Données invalides: ${validation.errors.join(', ')}`);
        }
        // Traitement des photos s'il y en a
        const photos = await this.processResponsePhotos(responseData.photos || []);
        // Créer la réponse
        const response = await prisma.formResponse.create({
            data: {
                formId: formId,
                respondentId: respondentId,
                data: validation.sanitizedData,
                collectorType: collectorType,
                collectorInfo: collectorInfo ? {
                    name: collectorInfo.name,
                    email: collectorInfo.email,
                    type: collectorInfo.type
                } : null,
                isOffline: responseData.isOffline || false
            },
            include: {
                respondent: respondentId ? {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                    }
                } : undefined,
                form: {
                    select: {
                        id: true,
                        title: true,
                    }
                }
            }
        });
        // Créer les enregistrements de photos si nécessaire
        if (photos.length > 0) {
            await this.createResponsePhotos(response.id, photos);
        }
        return {
            id: response.id,
            data: response.data,
            submittedAt: response.submittedAt,
            collectorType: response.collectorType,
            collectorInfo: response.collectorInfo,
            respondent: response.respondent,
            form: response.form,
            photosCount: photos.length
        };
    }
    // =============================================
    // GESTION DES PHOTOS
    // =============================================
    async processResponsePhotos(photos) {
        const processedPhotos = [];
        for (const photoData of photos) {
            try {
                const savedPhoto = await fileStorage_service_1.FileStorageService.savePhoto(photoData.base64, {
                    filename: photoData.filename,
                    quality: 80
                });
                processedPhotos.push({
                    fieldId: 'photo_field', // À adapter selon votre logique
                    filename: savedPhoto.filename,
                    originalName: photoData.filename,
                    filepath: savedPhoto.filepath,
                    mimeType: photoData.mimeType || 'image/jpeg',
                    size: savedPhoto.size,
                    width: savedPhoto.width,
                    height: savedPhoto.height,
                    caption: photoData.caption,
                    latitude: photoData.latitude,
                    longitude: photoData.longitude,
                });
            }
            catch (error) {
                console.error('Erreur traitement photo:', error);
            }
        }
        return processedPhotos;
    }
    async createResponsePhotos(responseId, photos) {
        if (photos.length === 0)
            return;
        await prisma.responsePhoto.createMany({
            data: photos.map(photo => ({
                responseId,
                ...photo,
                size: BigInt(photo.size)
            }))
        });
    }
    // =============================================
    // SYNCHRONISATION OFFLINE
    // =============================================
    async storeOfflineData(formId, deviceId, data) {
        await prisma.offlineSync.create({
            data: {
                formId,
                deviceId,
                data: data,
                status: 'PENDING'
            }
        });
    }
    async syncOfflineData(deviceId) {
        const pendingSync = await prisma.offlineSync.findMany({
            where: {
                deviceId,
                status: 'PENDING'
            }
        });
        const results = [];
        for (const sync of pendingSync) {
            try {
                const result = await this.submitFormResponse(sync.formId, { data: sync.data }, null, null, { type: 'PUBLIC', name: 'Collecte Offline' });
                await prisma.offlineSync.update({
                    where: { id: sync.id },
                    data: {
                        status: 'SYNCED',
                        syncedAt: new Date()
                    }
                });
                results.push({ syncId: sync.id, success: true, responseId: result.id });
            }
            catch (error) {
                await prisma.offlineSync.update({
                    where: { id: sync.id },
                    data: {
                        attempts: { increment: 1 },
                        error: error instanceof Error ? error.message : 'Erreur inconnue'
                    }
                });
                results.push({
                    syncId: sync.id,
                    success: false,
                    error: error instanceof Error ? error.message : 'Erreur inconnue'
                });
            }
        }
        return {
            totalProcessed: results.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results
        };
    }
    // =============================================
    // GESTION PRINCIPALE DES FORMULAIRES
    // =============================================
    async listForms(userId, userRole, query) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;
        // Construire les filtres selon votre logique : créateur + formulaires des activités auxquelles je participe
        const where = {
            OR: [
                { creatorId: userId }, // Mes formulaires
                {
                    activity: {
                        project: {
                            participants: {
                                some: {
                                    userId: userId,
                                    isActive: true
                                }
                            }
                        }
                    }
                }, // Formulaires des projets où je participe
                {
                    shares: {
                        some: {
                            sharedWithId: userId,
                            OR: [
                                { expiresAt: null },
                                { expiresAt: { gt: new Date() } }
                            ]
                        }
                    }
                } // Formulaires partagés avec moi
            ]
        };
        if (query.search) {
            where.AND = [
                where,
                {
                    OR: [
                        { title: { contains: query.search, mode: 'insensitive' } },
                        { description: { contains: query.search, mode: 'insensitive' } }
                    ]
                }
            ];
        }
        const [forms, total] = await Promise.all([
            prisma.form.findMany({
                where,
                skip,
                take: limit,
                include: this.getFormIncludes(false),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.form.count({ where })
        ]);
        return {
            forms: forms.map((form) => this.formatFormResponse(form)),
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
    async getFormById(formId, userId, userRole, includeComments = false) {
        const hasAccess = await this.checkFormAccess(formId, userId, userRole);
        if (!hasAccess) {
            throw new errors_1.AuthError('Accès refusé à ce formulaire');
        }
        const form = await prisma.form.findUnique({
            where: { id: formId },
            include: this.getFormIncludes(includeComments)
        });
        if (!form) {
            throw new errors_1.NotFoundError('Formulaire non trouvé');
        }
        return this.formatFormResponse(form);
    }
    async updateForm(formId, updateData, userId, userRole) {
        const form = await prisma.form.findUnique({
            where: { id: formId },
            include: {
                activity: {
                    include: {
                        project: true
                    }
                }
            }
        });
        if (!form) {
            throw new errors_1.ValidationError('Formulaire non trouvé');
        }
        const canEdit = this.checkFormEditPermissions(form, userId, userRole);
        if (!canEdit) {
            throw new errors_1.AuthError('Permissions insuffisantes pour modifier ce formulaire');
        }
        if (updateData.schema) {
            const schemaValidation = formValidation_service_1.FormValidationService.validateFormSchema(updateData.schema);
            if (!schemaValidation.isValid) {
                throw new errors_1.ValidationError(`Schéma invalide: ${schemaValidation.errors.join(', ')}`);
            }
        }
        const updatedForm = await prisma.form.update({
            where: { id: formId },
            data: {
                title: updateData.title,
                description: updateData.description,
                schema: updateData.schema,
                isActive: updateData.isActive,
                isPublic: updateData.enablePublicAccess,
            },
            include: this.getFormIncludes(false)
        });
        return this.formatFormResponse(updatedForm);
    }
    async deleteForm(formId, userId, userRole) {
        const form = await prisma.form.findUnique({
            where: { id: formId },
            include: {
                _count: {
                    select: {
                        responses: true,
                        comments: true
                    }
                },
                activity: {
                    include: {
                        project: true
                    }
                }
            }
        });
        if (!form) {
            throw new errors_1.ValidationError('Formulaire non trouvé');
        }
        const canDelete = this.checkFormDeletePermissions(form, userId, userRole);
        if (!canDelete) {
            throw new errors_1.AuthError('Permissions insuffisantes pour supprimer ce formulaire');
        }
        const isCreator = form.creatorId === userId;
        const isAdmin = userRole === 'ADMINISTRATEUR';
        if (isAdmin || isCreator) {
            await this.deleteFormWithDependencies(formId);
            return;
        }
        if (form._count.responses > 0) {
            throw new errors_1.ValidationError('Impossible de supprimer un formulaire ayant des réponses');
        }
        if (form._count.comments > 0) {
            throw new errors_1.ValidationError('Impossible de supprimer un formulaire ayant des commentaires');
        }
        await prisma.form.delete({
            where: { id: formId }
        });
    }
    async deleteFormWithDependencies(formId) {
        await prisma.$transaction(async (tx) => {
            // Supprimer les photos des réponses
            await tx.responsePhoto.deleteMany({
                where: { response: { formId } }
            });
            // Supprimer les réponses
            await tx.formResponse.deleteMany({
                where: { formId }
            });
            // Supprimer les commentaires liés
            await tx.comment.deleteMany({
                where: { formId }
            });
            // Supprimer les partages
            await tx.formShare.deleteMany({
                where: { formId }
            });
            // Supprimer le formulaire
            await tx.form.delete({
                where: { id: formId }
            });
        });
    }
    // =============================================
    // MÉTHODES UTILITAIRES PRIVÉES
    // =============================================
    checkProjectAccess(project, userId, userRole) {
        if (userRole === 'ADMINISTRATEUR')
            return true;
        if (project.creatorId === userId)
            return true;
        if (project.participants?.some((p) => p.userId === userId && p.isActive))
            return true;
        return false;
    }
    async checkFormAccess(formId, userId, userRole) {
        const form = await prisma.form.findUnique({
            where: { id: formId },
            include: {
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
                },
                shares: {
                    where: {
                        sharedWithId: userId,
                        OR: [
                            { expiresAt: null },
                            { expiresAt: { gt: new Date() } }
                        ]
                    }
                }
            }
        });
        if (!form)
            return false;
        if (userRole === 'ADMINISTRATEUR')
            return true;
        if (form.creatorId === userId)
            return true;
        if (form.activity?.project) {
            const hasProjectAccess = this.checkProjectAccess(form.activity.project, userId, userRole);
            if (hasProjectAccess)
                return true;
        }
        if (form.shares.length > 0)
            return true;
        return false;
    }
    checkFormEditPermissions(form, userId, userRole) {
        if (userRole === 'ADMINISTRATEUR')
            return true;
        if (form.creatorId === userId)
            return true;
        if (form.activity?.project?.creatorId === userId && userRole === 'CHERCHEUR')
            return true;
        return false;
    }
    checkFormDeletePermissions(form, userId, userRole) {
        if (userRole === 'ADMINISTRATEUR')
            return true;
        if (form.creatorId === userId)
            return true;
        if (form.activity?.project?.creatorId === userId && userRole === 'CHERCHEUR')
            return true;
        return false;
    }
    async getSubmissionCount(formId, collectorType) {
        return await prisma.formResponse.count({
            where: {
                formId,
                collectorType: collectorType // Cast to the expected Prisma enum type
            }
        });
    }
    getFormIncludes(includeComments = false) {
        const baseIncludes = {
            creator: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true,
                }
            },
            activity: {
                include: {
                    project: {
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            creatorId: true,
                        }
                    }
                }
            },
            shares: {
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
            },
            _count: {
                select: {
                    responses: true,
                    comments: true,
                    shares: true
                }
            }
        };
        if (includeComments) {
            return {
                ...baseIncludes,
                comments: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                role: true,
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 5
                }
            };
        }
        return baseIncludes;
    }
    formatFormResponse(form) {
        return {
            id: form.id,
            title: form.title,
            description: form.description || undefined,
            schema: form.schema,
            isActive: form.isActive,
            isPublic: form.isPublic || false,
            shareToken: form.shareToken || undefined,
            allowMultipleSubmissions: form.allowMultipleSubmissions,
            createdAt: form.createdAt,
            updatedAt: form.updatedAt,
            creator: form.creator,
            activity: form.activity ? {
                id: form.activity.id,
                title: form.activity.title,
                project: {
                    id: form.activity.project.id,
                    title: form.activity.project.title,
                }
            } : undefined,
            shares: form.shares?.map(share => ({
                id: share.id,
                shareType: share.shareType,
                shareToken: share.shareToken,
                canCollect: share.canCollect,
                canExport: share.canExport,
                maxSubmissions: share.maxSubmissions || undefined,
                expiresAt: share.expiresAt || undefined,
                createdAt: new Date(),
                lastAccessed: undefined,
                sharedWith: share.sharedWith || null,
                createdBy: {
                    id: form.creator.id,
                    firstName: form.creator.firstName,
                    lastName: form.creator.lastName
                }
            })),
            _count: form._count,
        };
    }
}
exports.FormService = FormService;
//# sourceMappingURL=form.service.js.map