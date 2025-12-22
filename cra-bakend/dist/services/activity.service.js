"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityService = void 0;
// src/services/activity.service.ts - Version CRA corrigée et complète
const client_1 = require("@prisma/client");
const errors_1 = require("../utils/errors");
const activity_types_1 = require("../types/activity.types");
const notification_service_1 = require("./notification.service");
const prisma = new client_1.PrismaClient();
class ActivityService {
    // ✅ Créer une activité CRA
    async createActivity(activityData, userId, userRole) {
        // Validation spécifique CRA
        await this.validateCRAActivity(activityData, userId, userRole);
        // Génération automatique du code si non fourni
        if (!activityData.code) {
            activityData.code = await this.generateActivityCode(activityData.themeId);
        }
        // Si un projet est spécifié, vérifier la cohérence avec le thème
        if (activityData.projectId) {
            await this.validateProjectThemeConsistency(activityData.projectId, activityData.themeId);
            // Vérifier l'accès au projet
            const project = await prisma.project.findUnique({
                where: { id: activityData.projectId },
                include: { participants: { where: { userId: userId } } }
            });
            if (!project) {
                throw new errors_1.ValidationError('Projet non trouvé');
            }
            const hasAccess = this.checkProjectAccess(project, userId, userRole);
            if (!hasAccess) {
                throw new errors_1.AuthError('Accès refusé à ce projet');
            }
            if (project.status === 'ARCHIVE') {
                throw new errors_1.ValidationError('Impossible de créer une activité dans un projet archivé');
            }
        }
        // Créer l'activité avec toutes les relations CRA
        const activity = await prisma.activity.create({
            data: {
                code: activityData.code,
                title: activityData.title,
                description: activityData.description,
                type: activityData.type,
                objectives: activityData.objectives,
                methodology: activityData.methodology,
                location: activityData.location,
                startDate: activityData.startDate ? new Date(activityData.startDate) : null,
                endDate: activityData.endDate ? new Date(activityData.endDate) : null,
                lifecycleStatus: activityData.lifecycleStatus || activity_types_1.ActivityLifecycleStatus.NOUVELLE,
                interventionRegion: activityData.interventionRegion,
                strategicPlan: activityData.strategicPlan,
                strategicAxis: activityData.strategicAxis,
                subAxis: activityData.subAxis,
                themeId: activityData.themeId,
                responsibleId: activityData.responsibleId,
                stationId: activityData.stationId,
                conventionId: activityData.conventionId,
                projectId: activityData.projectId,
            },
            include: {
                theme: true,
                responsible: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                station: true,
                convention: true,
                project: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        tasks: true,
                        documents: true,
                        forms: true,
                        comments: true,
                        participants: true
                    }
                }
            }
        });
        return this.formatActivityResponse(activity);
    }
    // ✅ Lister les activités avec filtres CRA
    async listActivities(userId, userRole, query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        // Construire les filtres
        const where = {};
        // Filtres de recherche
        if (query.search) {
            where.OR = [
                { title: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } },
                { methodology: { contains: query.search, mode: 'insensitive' } },
                { location: { contains: query.search, mode: 'insensitive' } },
                { code: { contains: query.search, mode: 'insensitive' } }
            ];
        }
        // Filtres CRA spécifiques
        if (query.themeId)
            where.themeId = query.themeId;
        if (query.stationId)
            where.stationId = query.stationId;
        if (query.responsibleId)
            where.responsibleId = query.responsibleId;
        if (query.type)
            where.type = query.type;
        if (query.status)
            where.status = query.status;
        if (query.lifecycleStatus)
            where.lifecycleStatus = query.lifecycleStatus;
        if (query.conventionId)
            where.conventionId = query.conventionId;
        if (query.projectId)
            where.projectId = query.projectId;
        if (query.interventionRegion) {
            where.interventionRegion = {
                contains: query.interventionRegion,
                mode: 'insensitive'
            };
        }
        // Filtres spéciaux
        if (query.withoutProject === true) {
            where.projectId = null;
        }
        if (query.isRecurrent !== undefined) {
            where.isRecurrent = query.isRecurrent;
        }
        if (query.hasResults !== undefined) {
            if (query.hasResults) {
                where.OR = [
                    { results: { not: null } },
                    { conclusions: { not: null } }
                ];
            }
            else {
                where.AND = [
                    { results: null },
                    { conclusions: null }
                ];
            }
        }
        // Filtres de dates
        if (query.startDate) {
            where.startDate = { gte: new Date(query.startDate) };
        }
        if (query.endDate) {
            where.endDate = { lte: new Date(query.endDate) };
        }
        // Filtrer selon les droits d'accès
        if (userRole !== 'ADMINISTRATEUR' && userRole !== 'COORDONATEUR_PROJET') {
            where.OR = [
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
            ];
        }
        // Exécuter la requête
        const [activities, total] = await Promise.all([
            prisma.activity.findMany({
                where,
                skip,
                take: limit,
                include: {
                    theme: true,
                    responsible: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    },
                    station: true,
                    convention: true,
                    project: {
                        include: {
                            creator: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true
                                }
                            }
                        }
                    },
                    parentActivity: {
                        select: {
                            id: true,
                            title: true,
                            code: true
                        }
                    },
                    _count: {
                        select: {
                            tasks: true,
                            documents: true,
                            forms: true,
                            comments: true,
                            participants: true
                        }
                    }
                },
                orderBy: [
                    { updatedAt: 'desc' }
                ]
            }),
            prisma.activity.count({ where })
        ]);
        return {
            activities: activities.map(activity => this.formatActivityResponse(activity)),
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
    // ✅ Obtenir une activité par ID
    async getActivityById(activityId, userId, userRole) {
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                theme: true,
                responsible: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                station: true,
                convention: true,
                project: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        },
                        participants: {
                            where: { userId: userId }
                        }
                    }
                },
                parentActivity: {
                    select: {
                        id: true,
                        title: true,
                        code: true
                    }
                },
                childActivities: {
                    select: {
                        id: true,
                        title: true,
                        code: true,
                        createdAt: true
                    },
                    orderBy: { createdAt: 'desc' }
                },
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    },
                    orderBy: { role: 'asc' }
                },
                partnerships: {
                    include: {
                        partner: {
                            select: {
                                id: true,
                                name: true,
                                type: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                fundings: {
                    orderBy: { createdAt: 'desc' }
                },
                tasks: {
                    include: {
                        assignee: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        },
                        creator: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                documents: {
                    include: {
                        owner: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                forms: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        },
                        _count: {
                            select: {
                                responses: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                _count: {
                    select: {
                        tasks: true,
                        documents: true,
                        forms: true,
                        comments: true,
                        participants: true
                    }
                }
            }
        });
        if (!activity) {
            throw new errors_1.ValidationError('Activité non trouvée');
        }
        // Vérifier les droits d'accès
        const hasAccess = this.checkActivityAccess(activity, userId, userRole);
        if (!hasAccess) {
            throw new errors_1.AuthError('Accès refusé à cette activité');
        }
        return this.formatActivityResponse(activity);
    }
    // ✅ Mettre à jour une activité CRA
    async updateActivity(activityId, updateData, userId, userRole) {
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                theme: true,
                responsible: true,
                project: {
                    include: { participants: { where: { userId: userId } } }
                }
            }
        });
        if (!activity) {
            throw new errors_1.ValidationError('Activité non trouvée');
        }
        // Vérifier les droits d'accès et de modification
        const hasAccess = this.checkActivityAccess(activity, userId, userRole);
        if (!hasAccess) {
            throw new errors_1.AuthError('Accès refusé à cette activité');
        }
        const canModify = this.checkActivityModifyRights(activity, userId, userRole);
        if (!canModify) {
            throw new errors_1.AuthError('Permissions insuffisantes pour modifier cette activité');
        }
        // Validation des changements CRA
        if (updateData.themeId && updateData.themeId !== activity.themeId) {
            const theme = await prisma.researchTheme.findUnique({
                where: { id: updateData.themeId }
            });
            if (!theme) {
                throw new errors_1.ValidationError('Nouveau thème non trouvé');
            }
        }
        if (updateData.responsibleId && updateData.responsibleId !== activity.responsibleId) {
            const responsible = await prisma.user.findUnique({
                where: { id: updateData.responsibleId }
            });
            if (!responsible || !['CHERCHEUR', 'COORDONATEUR_PROJET'].includes(responsible.role)) {
                throw new errors_1.ValidationError('Le nouveau responsable doit être un chercheur ou coordinateur');
            }
        }
        // Gestion du changement de projet
        if (updateData.projectId && updateData.projectId !== activity.projectId) {
            if (updateData.projectId && updateData.themeId) {
                await this.validateProjectThemeConsistency(updateData.projectId, updateData.themeId);
            }
            else if (updateData.projectId) {
                await this.validateProjectThemeConsistency(updateData.projectId, activity.themeId);
            }
        }
        // Préparer les données de mise à jour
        const dataToUpdate = {};
        if (updateData.title !== undefined)
            dataToUpdate.title = updateData.title;
        if (updateData.description !== undefined)
            dataToUpdate.description = updateData.description || null;
        if (updateData.objectives !== undefined)
            dataToUpdate.objectives = updateData.objectives;
        if (updateData.methodology !== undefined)
            dataToUpdate.methodology = updateData.methodology || null;
        if (updateData.location !== undefined)
            dataToUpdate.location = updateData.location || null;
        if (updateData.results !== undefined)
            dataToUpdate.results = updateData.results || null;
        if (updateData.conclusions !== undefined)
            dataToUpdate.conclusions = updateData.conclusions || null;
        if (updateData.code !== undefined)
            dataToUpdate.code = updateData.code || null;
        if (updateData.type !== undefined)
            dataToUpdate.type = updateData.type;
        if (updateData.lifecycleStatus !== undefined)
            dataToUpdate.lifecycleStatus = updateData.lifecycleStatus;
        if (updateData.interventionRegion !== undefined)
            dataToUpdate.interventionRegion = updateData.interventionRegion || null;
        if (updateData.strategicPlan !== undefined)
            dataToUpdate.strategicPlan = updateData.strategicPlan || null;
        if (updateData.strategicAxis !== undefined)
            dataToUpdate.strategicAxis = updateData.strategicAxis || null;
        if (updateData.subAxis !== undefined)
            dataToUpdate.subAxis = updateData.subAxis || null;
        if (updateData.themeId !== undefined)
            dataToUpdate.themeId = updateData.themeId;
        if (updateData.responsibleId !== undefined)
            dataToUpdate.responsibleId = updateData.responsibleId;
        if (updateData.stationId !== undefined)
            dataToUpdate.stationId = updateData.stationId || null;
        if (updateData.conventionId !== undefined)
            dataToUpdate.conventionId = updateData.conventionId || null;
        if (updateData.projectId !== undefined)
            dataToUpdate.projectId = updateData.projectId || null;
        // Traitement spécial des dates
        if (updateData.startDate !== undefined) {
            if (updateData.startDate === '' || updateData.startDate === null) {
                dataToUpdate.startDate = null;
            }
            else {
                dataToUpdate.startDate = new Date(updateData.startDate);
            }
        }
        if (updateData.endDate !== undefined) {
            if (updateData.endDate === '' || updateData.endDate === null) {
                dataToUpdate.endDate = null;
            }
            else {
                dataToUpdate.endDate = new Date(updateData.endDate);
            }
        }
        // Validation des dates
        if (dataToUpdate.startDate && dataToUpdate.endDate) {
            if (dataToUpdate.startDate > dataToUpdate.endDate) {
                throw new errors_1.ValidationError('La date de fin doit être postérieure à la date de début');
            }
        }
        const updatedActivity = await prisma.activity.update({
            where: { id: activityId },
            data: dataToUpdate,
            include: {
                theme: true,
                responsible: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                station: true,
                convention: true,
                project: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                },
                parentActivity: {
                    select: {
                        id: true,
                        title: true,
                        code: true
                    }
                },
                childActivities: {
                    select: {
                        id: true,
                        title: true,
                        code: true,
                        createdAt: true
                    }
                },
                _count: {
                    select: {
                        tasks: true,
                        documents: true,
                        forms: true,
                        comments: true,
                        participants: true
                    }
                }
            }
        });
        return this.formatActivityResponse(updatedActivity);
    }
    // ✅ Supprimer une activité
    async deleteActivity(activityId, userId, userRole) {
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                responsible: true,
                project: {
                    include: { participants: { where: { userId: userId } } }
                },
                childActivities: true
            }
        });
        if (!activity) {
            throw new errors_1.ValidationError('Activité non trouvée');
        }
        // Vérifier les droits de suppression
        const canDelete = this.checkActivityDeleteRights(activity, userId, userRole);
        if (!canDelete) {
            throw new errors_1.AuthError('Permissions insuffisantes pour supprimer cette activité');
        }
        // Empêcher la suppression si l'activité a des reconductions
        if (activity.childActivities && activity.childActivities.length > 0) {
            throw new errors_1.ValidationError('Impossible de supprimer une activité qui a été reconduite');
        }
        // Vérifier que l'activité n'est pas clôturée avec des résultats
        if (activity.lifecycleStatus === 'CLOTUREE' && (activity.results || activity.conclusions)) {
            throw new errors_1.ValidationError('Impossible de supprimer une activité clôturée avec des résultats');
        }
        await prisma.activity.delete({
            where: { id: activityId }
        });
    }
    // ✅ Créer une reconduction d'activité
    async createActivityRecurrence(activityId, userId, userRole, recurrenceData) {
        const sourceActivity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                theme: true,
                responsible: true,
                station: true,
                convention: true,
                project: true,
                participants: {
                    include: { user: true }
                }
            }
        });
        if (!sourceActivity) {
            throw new errors_1.ValidationError('Activité source non trouvée');
        }
        // Vérifier les droits
        const hasAccess = this.checkActivityAccess(sourceActivity, userId, userRole);
        if (!hasAccess) {
            throw new errors_1.AuthError('Accès refusé à cette activité');
        }
        // Vérifier que l'activité peut être reconduite
        if (sourceActivity.lifecycleStatus === 'CLOTUREE') {
            throw new errors_1.ValidationError('Une activité clôturée ne peut pas être reconduite');
        }
        // Créer la nouvelle activité
        const newActivityData = {
            code: await this.generateActivityCode(sourceActivity.themeId),
            title: recurrenceData.newTitle || `${sourceActivity.title} (Reconduite)`,
            description: sourceActivity.description,
            type: sourceActivity.type,
            objectives: [...sourceActivity.objectives],
            methodology: sourceActivity.methodology,
            location: sourceActivity.location,
            startDate: recurrenceData.newStartDate ? new Date(recurrenceData.newStartDate) : null,
            endDate: recurrenceData.newEndDate ? new Date(recurrenceData.newEndDate) : null,
            lifecycleStatus: activity_types_1.ActivityLifecycleStatus.RECONDUITE,
            interventionRegion: sourceActivity.interventionRegion,
            strategicPlan: sourceActivity.strategicPlan,
            strategicAxis: sourceActivity.strategicAxis,
            subAxis: sourceActivity.subAxis,
            isRecurrent: true,
            parentActivityId: sourceActivity.id,
            themeId: sourceActivity.themeId,
            responsibleId: sourceActivity.responsibleId,
            stationId: sourceActivity.stationId,
            conventionId: sourceActivity.conventionId,
            projectId: sourceActivity.projectId,
        };
        const newActivity = await prisma.$transaction(async (tx) => {
            // Créer la nouvelle activité
            const created = await tx.activity.create({
                data: newActivityData,
                include: {
                    theme: true,
                    responsible: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    },
                    station: true,
                    convention: true,
                    project: {
                        include: {
                            creator: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true
                                }
                            }
                        }
                    }
                }
            });
            // Créer l'enregistrement de reconduction
            await tx.activityRecurrence.create({
                data: {
                    sourceActivityId: sourceActivity.id,
                    newActivityId: created.id,
                    recurrenceType: 'ANNUAL',
                    reason: recurrenceData.reason,
                    modifications: recurrenceData.modifications || [],
                    budgetChanges: recurrenceData.budgetChanges,
                    teamChanges: recurrenceData.teamChanges,
                    scopeChanges: recurrenceData.scopeChanges,
                    approvedBy: userId
                }
            });
            // Mettre à jour l'activité source
            await tx.activity.update({
                where: { id: sourceActivity.id },
                data: {
                    isRecurrent: true,
                    recurrenceCount: sourceActivity.recurrenceCount + 1
                }
            });
            // Copier les participants actifs
            const activeParticipants = sourceActivity.participants?.filter(p => p.isActive) || [];
            if (activeParticipants.length > 0) {
                await tx.activityParticipant.createMany({
                    data: activeParticipants.map(p => ({
                        activityId: created.id,
                        userId: p.userId,
                        role: p.role,
                        timeAllocation: p.timeAllocation,
                        responsibilities: p.responsibilities,
                        expertise: p.expertise
                    }))
                });
            }
            return created;
        });
        return this.formatActivityResponse(newActivity);
    }
    // ✅ Dupliquer une activité
    async duplicateActivity(activityId, userId, userRole, newTitle) {
        const originalActivity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                theme: true,
                responsible: true,
                project: {
                    include: { participants: { where: { userId: userId } } }
                }
            }
        });
        if (!originalActivity) {
            throw new errors_1.ValidationError('Activité non trouvée');
        }
        const hasAccess = this.checkActivityAccess(originalActivity, userId, userRole);
        if (!hasAccess) {
            throw new errors_1.AuthError('Permission insuffisante pour dupliquer cette activité');
        }
        const duplicatedActivity = await prisma.activity.create({
            data: {
                code: await this.generateActivityCode(originalActivity.themeId),
                title: newTitle || `${originalActivity.title} (Copie)`,
                description: originalActivity.description,
                type: originalActivity.type,
                objectives: [...originalActivity.objectives],
                methodology: originalActivity.methodology,
                location: originalActivity.location,
                lifecycleStatus: 'NOUVELLE',
                interventionRegion: originalActivity.interventionRegion,
                strategicPlan: originalActivity.strategicPlan,
                strategicAxis: originalActivity.strategicAxis,
                subAxis: originalActivity.subAxis,
                themeId: originalActivity.themeId,
                responsibleId: originalActivity.responsibleId,
                stationId: originalActivity.stationId,
                conventionId: originalActivity.conventionId,
                projectId: originalActivity.projectId,
            },
            include: {
                theme: true,
                responsible: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                station: true,
                convention: true,
                project: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        tasks: true,
                        documents: true,
                        forms: true,
                        comments: true,
                        participants: true
                    }
                }
            }
        });
        return this.formatActivityResponse(duplicatedActivity);
    }
    // ✅ Obtenir les statistiques CRA
    async getActivityStats(userId, userRole) {
        const whereCondition = {};
        if (userRole !== 'ADMINISTRATEUR' && userRole !== 'COORDONATEUR_PROJET') {
            whereCondition.OR = [
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
            ];
        }
        const [total, activitiesByType, activitiesByLifecycleStatus, activitiesByTheme, activitiesByStation, activitiesByResponsible, activitiesByRegion, withoutProject, withResults, recurrent, recentActivities] = await Promise.all([
            prisma.activity.count({ where: whereCondition }),
            prisma.activity.groupBy({
                by: ['type'],
                where: whereCondition,
                _count: { id: true }
            }),
            prisma.activity.groupBy({
                by: ['lifecycleStatus'],
                where: whereCondition,
                _count: { id: true }
            }),
            prisma.activity.groupBy({
                by: ['themeId'],
                where: whereCondition,
                _count: { id: true }
            }),
            prisma.activity.groupBy({
                by: ['stationId'],
                where: { ...whereCondition, stationId: { not: null } },
                _count: { id: true }
            }),
            prisma.activity.groupBy({
                by: ['responsibleId'],
                where: whereCondition,
                _count: { id: true }
            }),
            prisma.activity.groupBy({
                by: ['interventionRegion'],
                where: { ...whereCondition, interventionRegion: { not: null } },
                _count: { id: true }
            }),
            prisma.activity.count({
                where: { ...whereCondition, projectId: null }
            }),
            prisma.activity.count({
                where: {
                    ...whereCondition,
                    OR: [
                        { results: { not: null } },
                        { conclusions: { not: null } }
                    ]
                }
            }),
            prisma.activity.count({
                where: { ...whereCondition, isRecurrent: true }
            }),
            prisma.activity.findMany({
                where: whereCondition,
                take: 10,
                orderBy: { updatedAt: 'desc' },
                include: {
                    theme: true,
                    responsible: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    },
                    project: {
                        select: {
                            id: true,
                            title: true,
                            status: true
                        }
                    },
                    _count: {
                        select: {
                            tasks: true,
                            documents: true,
                            forms: true
                        }
                    }
                }
            })
        ]);
        // Construire les répartitions avec noms
        const [themes, stations, responsibles] = await Promise.all([
            prisma.researchTheme.findMany({
                where: { id: { in: activitiesByTheme.map(a => a.themeId) } },
                select: { id: true, name: true }
            }),
            prisma.researchStation.findMany({
                where: { id: { in: activitiesByStation.map(a => a.stationId).filter(Boolean) } },
                select: { id: true, name: true }
            }),
            prisma.user.findMany({
                where: { id: { in: activitiesByResponsible.map(a => a.responsibleId) } },
                select: { id: true, firstName: true, lastName: true }
            })
        ]);
        return {
            total,
            byType: activitiesByType.reduce((acc, item) => {
                acc[item.type] = item._count.id;
                return acc;
            }, {}),
            byLifecycleStatus: activitiesByLifecycleStatus.reduce((acc, item) => {
                acc[item.lifecycleStatus] = item._count.id;
                return acc;
            }, {}),
            byTheme: activitiesByTheme.reduce((acc, item) => {
                const theme = themes.find(t => t.id === item.themeId);
                acc[theme?.name || 'Inconnu'] = item._count.id;
                return acc;
            }, {}),
            byStation: activitiesByStation.reduce((acc, item) => {
                const station = stations.find(s => s.id === item.stationId);
                acc[station?.name || 'Inconnu'] = item._count.id;
                return acc;
            }, {}),
            byResponsible: activitiesByResponsible.reduce((acc, item) => {
                const responsible = responsibles.find(r => r.id === item.responsibleId);
                acc[responsible ? `${responsible.firstName} ${responsible.lastName}` : 'Inconnu'] = {
                    count: item._count.id,
                    name: responsible ? `${responsible.firstName} ${responsible.lastName}` : 'Inconnu'
                };
                return acc;
            }, {}),
            byInterventionRegion: activitiesByRegion.reduce((acc, item) => {
                acc[item.interventionRegion || 'Non spécifiée'] = item._count.id;
                return acc;
            }, {}),
            withoutProject,
            withResults,
            recurrent,
            recent: recentActivities.map(activity => this.formatActivityResponse(activity))
        };
    }
    // ✅ Lier/délier des formulaires et documents
    async linkForm(activityId, formId, userId, userRole) {
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                responsible: true,
                project: { include: { participants: { where: { userId: userId } } } }
            }
        });
        if (!activity) {
            throw new errors_1.ValidationError('Activité non trouvée');
        }
        const hasAccess = this.checkActivityAccess(activity, userId, userRole);
        if (!hasAccess) {
            throw new errors_1.AuthError('Accès refusé à cette activité');
        }
        const form = await prisma.form.findUnique({ where: { id: formId } });
        if (!form) {
            throw new errors_1.ValidationError('Formulaire non trouvé');
        }
        if (form.activityId) {
            throw new errors_1.ValidationError('Ce formulaire est déjà lié à une activité');
        }
        await prisma.form.update({
            where: { id: formId },
            data: { activityId: activityId }
        });
        return { message: 'Formulaire lié à l\'activité avec succès' };
    }
    async unlinkForm(activityId, formId, userId, userRole) {
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                responsible: true,
                project: { include: { participants: { where: { userId: userId } } } }
            }
        });
        if (!activity) {
            throw new errors_1.ValidationError('Activité non trouvée');
        }
        const hasAccess = this.checkActivityAccess(activity, userId, userRole);
        if (!hasAccess) {
            throw new errors_1.AuthError('Accès refusé à cette activité');
        }
        const form = await prisma.form.findUnique({ where: { id: formId } });
        if (!form || form.activityId !== activityId) {
            throw new errors_1.ValidationError('Ce formulaire n\'est pas lié à cette activité');
        }
        await prisma.form.update({
            where: { id: formId },
            data: { activityId: null }
        });
        return { message: 'Formulaire délié de l\'activité avec succès' };
    }
    async linkDocument(activityId, documentId, userId, userRole) {
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                responsible: true,
                project: { include: { participants: { where: { userId: userId } } } }
            }
        });
        if (!activity) {
            throw new errors_1.ValidationError('Activité non trouvée');
        }
        const hasAccess = this.checkActivityAccess(activity, userId, userRole);
        if (!hasAccess) {
            throw new errors_1.AuthError('Accès refusé à cette activité');
        }
        const document = await prisma.document.findUnique({
            where: { id: documentId },
            include: { shares: { where: { sharedWithId: userId } } }
        });
        if (!document) {
            throw new errors_1.ValidationError('Document non trouvé');
        }
        const hasDocumentAccess = document.ownerId === userId ||
            document.isPublic ||
            document.shares.length > 0 ||
            userRole === 'ADMINISTRATEUR';
        if (!hasDocumentAccess) {
            throw new errors_1.AuthError('Accès refusé à ce document');
        }
        if (document.activityId) {
            throw new errors_1.ValidationError('Ce document est déjà lié à une activité');
        }
        await prisma.document.update({
            where: { id: documentId },
            data: { activityId: activityId }
        });
        return { message: 'Document lié à l\'activité avec succès' };
    }
    // ================================
    // MÉTHODES PRIVÉES ET UTILITAIRES
    // ================================
    // Validation spécifique CRA
    async validateCRAActivity(data, userId, userRole) {
        // Vérifier le thème
        const theme = await prisma.researchTheme.findUnique({
            where: { id: data.themeId }
        });
        if (!theme || !theme.isActive) {
            throw new errors_1.ValidationError('Thème de recherche non trouvé ou inactif');
        }
        // Vérifier le responsable
        const responsible = await prisma.user.findUnique({
            where: { id: data.responsibleId }
        });
        if (!responsible) {
            throw new errors_1.ValidationError('Responsable non trouvé');
        }
        if (!['CHERCHEUR', 'COORDONATEUR_PROJET'].includes(responsible.role)) {
            throw new errors_1.ValidationError('Le responsable doit être un chercheur ou coordinateur');
        }
        // Vérifier la station si spécifiée
        if (data.stationId) {
            const station = await prisma.researchStation.findUnique({
                where: { id: data.stationId }
            });
            if (!station || !station.isActive) {
                throw new errors_1.ValidationError('Station de recherche non trouvée ou inactive');
            }
        }
        // Vérifier la convention si spécifiée
        if (data.conventionId) {
            const convention = await prisma.convention.findUnique({
                where: { id: data.conventionId }
            });
            if (!convention) {
                throw new errors_1.ValidationError('Convention non trouvée');
            }
            if (!['SIGNEE', 'EN_COURS'].includes(convention.status)) {
                throw new errors_1.ValidationError('La convention doit être signée ou en cours');
            }
        }
        // Vérifier l'unicité du code si fourni
        if (data.code) {
            const existingActivity = await prisma.activity.findUnique({
                where: { code: data.code }
            });
            if (existingActivity) {
                throw new errors_1.ValidationError('Ce code d\'activité existe déjà');
            }
        }
    }
    // Génération automatique du code
    async generateActivityCode(themeId) {
        const theme = await prisma.researchTheme.findUnique({
            where: { id: themeId },
            select: { code: true }
        });
        const year = new Date().getFullYear();
        const themeCode = theme?.code || 'ACT';
        const count = await prisma.activity.count({
            where: {
                themeId,
                createdAt: {
                    gte: new Date(`${year}-01-01`),
                    lt: new Date(`${year + 1}-01-01`)
                }
            }
        });
        return `${themeCode}-${year}-${String(count + 1).padStart(2, '0')}`;
    }
    // Validation cohérence projet-thème
    async validateProjectThemeConsistency(projectId, themeId) {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { themeId: true }
        });
        if (project && project.themeId !== themeId) {
            throw new errors_1.ValidationError('Le thème de l\'activité doit correspondre au thème du projet');
        }
    }
    // Vérification des droits d'accès à une activité CRA
    checkActivityAccess(activity, userId, userRole) {
        // Admin a accès à tout
        if (userRole === 'ADMINISTRATEUR' || userRole === 'COORDONATEUR_PROJET')
            return true;
        // Responsable de l'activité a accès
        if (activity.responsibleId === userId)
            return true;
        // Participant à l'activité a accès
        if (activity.participants?.some((p) => p.userId === userId && p.isActive))
            return true;
        // Si l'activité est liée à un projet, vérifier l'accès au projet
        if (activity.project) {
            return this.checkProjectAccess(activity.project, userId, userRole);
        }
        return false;
    }
    // Vérification des droits d'accès à un projet
    checkProjectAccess(project, userId, userRole) {
        if (userRole === 'ADMINISTRATEUR')
            return true;
        if (project.creatorId === userId)
            return true;
        if (project.participants?.some((p) => p.userId === userId && p.isActive))
            return true;
        return false;
    }
    // Vérification des droits de modification
    checkActivityModifyRights(activity, userId, userRole) {
        if (userRole === 'ADMINISTRATEUR')
            return true;
        if (activity.responsibleId === userId)
            return true;
        if (activity.project) {
            if (activity.project.creatorId === userId)
                return true;
            const participantRole = activity.project.participants?.find((p) => p.userId === userId)?.role;
            if (participantRole && ['Chef de projet', 'Chef de projet adjoint'].includes(participantRole)) {
                return true;
            }
        }
        return false;
    }
    // Vérification des droits de suppression
    checkActivityDeleteRights(activity, userId, userRole) {
        if (userRole === 'ADMINISTRATEUR')
            return true;
        if (activity.responsibleId === userId)
            return true;
        if (activity.project) {
            if (activity.project.creatorId === userId)
                return true;
        }
        return false;
    }
    // Formatage de la réponse activité CRA
    formatActivityResponse(activity) {
        return {
            id: activity.id,
            code: activity.code,
            title: activity.title,
            description: activity.description || undefined,
            type: activity.type,
            objectives: activity.objectives,
            methodology: activity.methodology || undefined,
            location: activity.location || undefined,
            startDate: activity.startDate || undefined,
            endDate: activity.endDate || undefined,
            results: activity.results || undefined,
            conclusions: activity.conclusions || undefined,
            lifecycleStatus: activity.lifecycleStatus,
            interventionRegion: activity.interventionRegion || undefined,
            strategicPlan: activity.strategicPlan || undefined,
            strategicAxis: activity.strategicAxis || undefined,
            subAxis: activity.subAxis || undefined,
            isRecurrent: activity.isRecurrent,
            recurrenceCount: activity.recurrenceCount,
            createdAt: activity.createdAt,
            updatedAt: activity.updatedAt,
            // Relations CRA
            theme: activity.theme,
            responsible: activity.responsible,
            station: activity.station || undefined,
            convention: activity.convention || undefined,
            project: activity.project || undefined,
            // Relations optionnelles
            parentActivity: activity.parentActivity || undefined,
            childActivities: activity.childActivities || undefined,
            participants: activity.participants || undefined,
            partners: activity.partnerships || undefined,
            fundings: activity.fundings || undefined,
            tasks: activity.tasks?.map((task) => ({
                id: task.id,
                title: task.title,
                description: task.description || undefined,
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate || undefined,
                progress: task.progress || undefined,
                assignee: task.assignee || undefined,
                createdBy: task.creator || undefined,
                createdAt: task.createdAt,
                updatedAt: task.updatedAt,
            })) || undefined,
            documents: activity.documents || undefined,
            forms: activity.forms?.map((form) => ({
                id: form.id,
                title: form.title,
                description: form.description || undefined,
                isActive: form.isActive,
                createdAt: form.createdAt,
                creator: form.creator,
                _count: form._count,
            })) || undefined,
            _count: activity._count,
        };
    }
    // Ajouter un participant à une activité
    async addParticipant(activityId, participantData, userId, userRole) {
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                responsible: true,
                participants: true,
                project: { include: { participants: { where: { userId } } } }
            }
        });
        if (!activity) {
            throw new errors_1.ValidationError('Activité non trouvée');
        }
        // Vérifier les droits de modification
        const canModify = this.checkActivityModifyRights(activity, userId, userRole);
        if (!canModify) {
            throw new errors_1.AuthError('Permissions insuffisantes pour modifier les participants');
        }
        // Vérifier que l'utilisateur existe
        const user = await prisma.user.findUnique({
            where: { id: participantData.userId }
        });
        if (!user) {
            throw new errors_1.ValidationError('Utilisateur non trouvé');
        }
        // Vérifier qu'il n'est pas déjà participant
        const existingParticipant = activity.participants?.find(p => p.userId === participantData.userId);
        if (existingParticipant) {
            throw new errors_1.ValidationError('Cet utilisateur est déjà participant à cette activité');
        }
        // Empêcher d'ajouter le responsable comme participant
        if (participantData.userId === activity.responsibleId) {
            throw new errors_1.ValidationError('Le responsable ne peut pas être ajouté comme participant');
        }
        const participant = await prisma.activityParticipant.create({
            data: {
                activityId,
                userId: participantData.userId,
                role: participantData.role,
                timeAllocation: participantData.timeAllocation,
                responsibilities: participantData.responsibilities,
                expertise: participantData.expertise
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });
        // Envoyer une notification au nouveau participant
        try {
            const notificationService = (0, notification_service_1.getNotificationService)();
            await notificationService.notifyActivityAddition(activityId, activity.title, participantData.userId, userId);
        }
        catch (error) {
            console.error('Erreur lors de l\'envoi de la notification:', error);
            // Ne pas faire échouer l'ajout du participant si la notification échoue
        }
        return participant;
    }
    // Mettre à jour un participant
    async updateParticipant(activityId, participantId, updateData, userId, userRole) {
        // Vérifier que le participant existe et appartient à cette activité
        const existingParticipant = await prisma.activityParticipant.findUnique({
            where: { id: participantId },
            include: {
                activity: {
                    include: {
                        responsible: true,
                        project: { include: { participants: { where: { userId } } } }
                    }
                }
            }
        });
        if (!existingParticipant) {
            throw new errors_1.ValidationError('Participant non trouvé');
        }
        if (existingParticipant.activityId !== activityId) {
            throw new errors_1.ValidationError('Ce participant n\'appartient pas à cette activité');
        }
        const canModify = this.checkActivityModifyRights(existingParticipant.activity, userId, userRole);
        if (!canModify) {
            throw new errors_1.AuthError('Permissions insuffisantes');
        }
        const updatedParticipant = await prisma.activityParticipant.update({
            where: {
                id: participantId
            },
            data: {
                ...updateData
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });
        return updatedParticipant;
    }
    // Retirer un participant
    async removeParticipant(activityId, participantId, userId, userRole) {
        // Vérifier que le participant existe et appartient à cette activité
        const existingParticipant = await prisma.activityParticipant.findUnique({
            where: { id: participantId },
            include: {
                activity: {
                    include: {
                        responsible: true,
                        project: { include: { participants: { where: { userId } } } }
                    }
                }
            }
        });
        if (!existingParticipant) {
            throw new errors_1.ValidationError('Participant non trouvé');
        }
        if (existingParticipant.activityId !== activityId) {
            throw new errors_1.ValidationError('Ce participant n\'appartient pas à cette activité');
        }
        const canModify = this.checkActivityModifyRights(existingParticipant.activity, userId, userRole);
        if (!canModify) {
            throw new errors_1.AuthError('Permissions insuffisantes');
        }
        await prisma.activityParticipant.delete({
            where: { id: participantId }
        });
    }
    // Lister les participants d'une activité
    async listParticipants(activityId, userId, userRole) {
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                responsible: true,
                project: { include: { participants: { where: { userId } } } }
            }
        });
        if (!activity) {
            throw new errors_1.ValidationError('Activité non trouvée');
        }
        const hasAccess = this.checkActivityAccess(activity, userId, userRole);
        if (!hasAccess) {
            throw new errors_1.AuthError('Accès refusé');
        }
        const participants = await prisma.activityParticipant.findMany({
            where: { activityId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true
                    }
                }
            },
            orderBy: { role: 'asc' }
        });
        return participants;
    }
    // ========================================
    // GESTION DES FINANCEMENTS
    // ========================================
    async addFunding(activityId, fundingData, userId, userRole) {
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                responsible: true,
                project: { include: { participants: { where: { userId } } } }
            }
        });
        if (!activity) {
            throw new errors_1.ValidationError('Activité non trouvée');
        }
        const canModify = this.checkActivityModifyRights(activity, userId, userRole);
        if (!canModify) {
            throw new errors_1.AuthError('Permissions insuffisantes');
        }
        // Vérifier la convention si spécifiée
        if (fundingData.conventionId) {
            const convention = await prisma.convention.findUnique({
                where: { id: fundingData.conventionId }
            });
            if (!convention) {
                throw new errors_1.ValidationError('Convention non trouvée');
            }
        }
        const funding = await prisma.activityFunding.create({
            data: {
                activityId,
                fundingSource: fundingData.fundingSource,
                fundingType: fundingData.fundingType,
                requestedAmount: fundingData.requestedAmount,
                currency: fundingData.currency,
                applicationDate: fundingData.applicationDate ? new Date(fundingData.applicationDate) : null,
                startDate: fundingData.startDate ? new Date(fundingData.startDate) : null,
                endDate: fundingData.endDate ? new Date(fundingData.endDate) : null,
                conditions: fundingData.conditions,
                contractNumber: fundingData.contractNumber,
                conventionId: fundingData.conventionId,
            }
        });
        return funding;
    }
    async updateFunding(activityId, fundingId, updateData, userId, userRole) {
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                responsible: true,
                fundings: { where: { id: fundingId } },
                project: { include: { participants: { where: { userId } } } }
            }
        });
        if (!activity) {
            throw new errors_1.ValidationError('Activité non trouvée');
        }
        const funding = activity.fundings?.[0];
        if (!funding) {
            throw new errors_1.ValidationError('Financement non trouvé');
        }
        const canModify = this.checkActivityModifyRights(activity, userId, userRole);
        if (!canModify) {
            throw new errors_1.AuthError('Permissions insuffisantes');
        }
        const dataToUpdate = {};
        if (updateData.fundingSource !== undefined)
            dataToUpdate.fundingSource = updateData.fundingSource;
        if (updateData.fundingType !== undefined)
            dataToUpdate.fundingType = updateData.fundingType;
        if (updateData.status !== undefined)
            dataToUpdate.status = updateData.status;
        if (updateData.requestedAmount !== undefined)
            dataToUpdate.requestedAmount = updateData.requestedAmount;
        if (updateData.approvedAmount !== undefined)
            dataToUpdate.approvedAmount = updateData.approvedAmount;
        if (updateData.receivedAmount !== undefined)
            dataToUpdate.receivedAmount = updateData.receivedAmount;
        if (updateData.conditions !== undefined)
            dataToUpdate.conditions = updateData.conditions;
        if (updateData.contractNumber !== undefined)
            dataToUpdate.contractNumber = updateData.contractNumber;
        if (updateData.conventionId !== undefined)
            dataToUpdate.conventionId = updateData.conventionId;
        if (updateData.applicationDate !== undefined) {
            dataToUpdate.applicationDate = updateData.applicationDate ? new Date(updateData.applicationDate) : null;
        }
        if (updateData.approvalDate !== undefined) {
            dataToUpdate.approvalDate = updateData.approvalDate ? new Date(updateData.approvalDate) : null;
        }
        if (updateData.startDate !== undefined) {
            dataToUpdate.startDate = updateData.startDate ? new Date(updateData.startDate) : null;
        }
        if (updateData.endDate !== undefined) {
            dataToUpdate.endDate = updateData.endDate ? new Date(updateData.endDate) : null;
        }
        const updatedFunding = await prisma.activityFunding.update({
            where: { id: fundingId },
            data: dataToUpdate
        });
        return updatedFunding;
    }
    async removeFunding(activityId, fundingId, userId, userRole) {
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                responsible: true,
                fundings: { where: { id: fundingId } },
                project: { include: { participants: { where: { userId } } } }
            }
        });
        if (!activity) {
            throw new errors_1.ValidationError('Activité non trouvée');
        }
        if (!activity.fundings?.[0]) {
            throw new errors_1.ValidationError('Financement non trouvé');
        }
        const canModify = this.checkActivityModifyRights(activity, userId, userRole);
        if (!canModify) {
            throw new errors_1.AuthError('Permissions insuffisantes');
        }
        await prisma.activityFunding.delete({
            where: { id: fundingId }
        });
    }
    async listFundings(activityId, userId, userRole) {
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                responsible: true,
                project: { include: { participants: { where: { userId } } } }
            }
        });
        if (!activity) {
            throw new errors_1.ValidationError('Activité non trouvée');
        }
        const hasAccess = this.checkActivityAccess(activity, userId, userRole);
        if (!hasAccess) {
            throw new errors_1.AuthError('Accès refusé');
        }
        const fundings = await prisma.activityFunding.findMany({
            where: { activityId },
            include: {
                convention: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        status: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return fundings;
    }
    // ========================================
    // GESTION DES PARTENARIATS
    // ========================================
    async addPartner(activityId, partnerData, userId, userRole) {
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                responsible: true,
                partnerships: true,
                project: { include: { participants: { where: { userId } } } }
            }
        });
        if (!activity) {
            throw new errors_1.ValidationError('Activité non trouvée');
        }
        const canModify = this.checkActivityModifyRights(activity, userId, userRole);
        if (!canModify) {
            throw new errors_1.AuthError('Permissions insuffisantes');
        }
        let partnerId = partnerData.partnerId;
        // Si partnerId n'est pas fourni, créer un nouveau partenaire
        if (!partnerId && partnerData.partnerName) {
            const newPartner = await prisma.partner.create({
                data: {
                    name: partnerData.partnerName,
                    type: 'ASSOCIATION', // Type par défaut
                    contactPerson: partnerData.contactPerson && partnerData.contactPerson !== '' ? partnerData.contactPerson : null,
                    contactEmail: partnerData.contactEmail && partnerData.contactEmail !== '' ? partnerData.contactEmail : null,
                }
            });
            partnerId = newPartner.id;
        }
        if (!partnerId) {
            throw new errors_1.ValidationError('Un ID de partenaire ou un nom de partenaire est requis');
        }
        // Vérifier qu'il n'est pas déjà partenaire
        const existingPartnership = activity.partnerships?.find(p => p.partnerId === partnerId);
        if (existingPartnership) {
            throw new errors_1.ValidationError('Ce partenaire est déjà associé à cette activité');
        }
        const partnership = await prisma.activityPartner.create({
            data: {
                activityId,
                partnerId,
                partnerType: partnerData.partnerType,
                contribution: partnerData.contribution && partnerData.contribution !== '' ? partnerData.contribution : null,
                benefits: partnerData.benefits && partnerData.benefits !== '' ? partnerData.benefits : null,
                startDate: partnerData.startDate && partnerData.startDate !== '' ? new Date(partnerData.startDate) : new Date(),
                endDate: partnerData.endDate && partnerData.endDate !== '' ? new Date(partnerData.endDate) : null,
            },
            include: {
                partner: true
            }
        });
        return partnership;
    }
    async updatePartner(activityId, partnershipId, updateData, userId, userRole) {
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                responsible: true,
                partnerships: { where: { id: partnershipId } },
                project: { include: { participants: { where: { userId } } } }
            }
        });
        if (!activity) {
            throw new errors_1.ValidationError('Activité non trouvée');
        }
        const partnership = activity.partnerships?.[0];
        if (!partnership) {
            throw new errors_1.ValidationError('Partenariat non trouvé');
        }
        const canModify = this.checkActivityModifyRights(activity, userId, userRole);
        if (!canModify) {
            throw new errors_1.AuthError('Permissions insuffisantes');
        }
        const dataToUpdate = {};
        if (updateData.partnerType !== undefined)
            dataToUpdate.partnerType = updateData.partnerType;
        if (updateData.contribution !== undefined)
            dataToUpdate.contribution = updateData.contribution;
        if (updateData.benefits !== undefined)
            dataToUpdate.benefits = updateData.benefits;
        if (updateData.isActive !== undefined)
            dataToUpdate.isActive = updateData.isActive;
        if (updateData.startDate !== undefined) {
            dataToUpdate.startDate = updateData.startDate ? new Date(updateData.startDate) : null;
        }
        if (updateData.endDate !== undefined) {
            dataToUpdate.endDate = updateData.endDate ? new Date(updateData.endDate) : null;
        }
        const updatedPartnership = await prisma.activityPartner.update({
            where: { id: partnership.id },
            data: dataToUpdate,
            include: {
                partner: true
            }
        });
        return updatedPartnership;
    }
    async removePartner(activityId, partnershipId, userId, userRole) {
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                responsible: true,
                partnerships: { where: { id: partnershipId } },
                project: { include: { participants: { where: { userId } } } }
            }
        });
        if (!activity) {
            throw new errors_1.ValidationError('Activité non trouvée');
        }
        const partnership = activity.partnerships?.[0];
        if (!partnership) {
            throw new errors_1.ValidationError('Partenariat non trouvé');
        }
        const canModify = this.checkActivityModifyRights(activity, userId, userRole);
        if (!canModify) {
            throw new errors_1.AuthError('Permissions insuffisantes');
        }
        await prisma.activityPartner.delete({
            where: { id: partnershipId }
        });
    }
    async listPartners(activityId, userId, userRole) {
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                responsible: true,
                project: { include: { participants: { where: { userId } } } }
            }
        });
        if (!activity) {
            throw new errors_1.ValidationError('Activité non trouvée');
        }
        const hasAccess = this.checkActivityAccess(activity, userId, userRole);
        if (!hasAccess) {
            throw new errors_1.AuthError('Accès refusé');
        }
        const partnerships = await prisma.activityPartner.findMany({
            where: { activityId },
            include: {
                partner: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return partnerships;
    }
    // ========================================
    // GESTION DES TÂCHES
    // ========================================
    /**
     * Enregistrer un historique de modification de tâche
     */
    async logTaskHistory(taskId, userId, action, field, oldValue, newValue) {
        try {
            await prisma.taskHistory.create({
                data: {
                    taskId,
                    userId,
                    action,
                    field,
                    oldValue: oldValue !== undefined && oldValue !== null ? JSON.stringify(oldValue) : null,
                    newValue: newValue !== undefined && newValue !== null ? JSON.stringify(newValue) : null,
                }
            });
        }
        catch (error) {
            console.error('Erreur lors de l\'enregistrement de l\'historique:', error);
            // Ne pas bloquer l'opération principale si l'historique échoue
        }
    }
    /**
     * Envoyer une notification pour un changement de tâche
     */
    async notifyTaskChange(task, userId, action, details) {
        try {
            const notificationService = (0, notification_service_1.getNotificationService)();
            if (!notificationService)
                return;
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { firstName: true, lastName: true }
            });
            if (!user)
                return;
            let title = '';
            let message = '';
            let receiverId = '';
            switch (action) {
                case 'CREATE':
                    // Notifier l'assigné si ce n'est pas lui qui a créé
                    if (task.assigneeId && task.assigneeId !== userId) {
                        title = 'Nouvelle tâche assignée';
                        message = `${user.firstName} ${user.lastName} vous a assigné une nouvelle tâche: "${task.title}"`;
                        receiverId = task.assigneeId;
                    }
                    break;
                case 'UPDATE':
                    // Notifier le créateur si c'est l'assigné qui modifie
                    if (userId === task.assigneeId && task.creatorId !== userId) {
                        title = 'Mise à jour de tâche';
                        message = `${user.firstName} ${user.lastName} a mis à jour la tâche: "${task.title}"${details ? ` - ${details}` : ''}`;
                        receiverId = task.creatorId;
                    }
                    break;
                case 'COMPLETE':
                    // Notifier le créateur quand la tâche est terminée
                    if (task.creatorId && task.creatorId !== userId) {
                        title = 'Tâche terminée';
                        message = `${user.firstName} ${user.lastName} a marqué la tâche "${task.title}" comme terminée`;
                        receiverId = task.creatorId;
                    }
                    break;
            }
            if (receiverId) {
                await notificationService.createNotification({
                    receiverId,
                    senderId: userId,
                    title,
                    message,
                    type: 'TASK_ASSIGNED',
                    actionUrl: task.activityId ? `/chercheur/activities/${task.activityId}?tab=tasks` : undefined,
                    entityType: 'Task',
                    entityId: task.id
                });
            }
        }
        catch (error) {
            console.error('Erreur lors de l\'envoi de la notification:', error);
            // Ne pas bloquer l'opération principale
        }
    }
    async createTask(activityId, taskData, userId, userRole) {
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                responsible: true,
                project: { include: { participants: { where: { userId } } } }
            }
        });
        if (!activity) {
            throw new errors_1.ValidationError('Activité non trouvée');
        }
        const canModify = this.checkActivityModifyRights(activity, userId, userRole);
        if (!canModify) {
            throw new errors_1.AuthError('Permissions insuffisantes');
        }
        // Vérifier que l'assignee existe si spécifié
        if (taskData.assigneeId) {
            const assignee = await prisma.user.findUnique({
                where: { id: taskData.assigneeId }
            });
            if (!assignee) {
                throw new errors_1.ValidationError('Utilisateur assigné non trouvé');
            }
        }
        const task = await prisma.task.create({
            data: {
                title: taskData.title,
                description: taskData.description,
                status: taskData.status || 'A_FAIRE',
                priority: taskData.priority || 'NORMALE',
                dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
                assigneeId: taskData.assigneeId,
                activityId,
                creatorId: userId,
            },
            include: {
                assignee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                creator: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
        // Enregistrer l'historique de création
        await this.logTaskHistory(task.id, userId, 'CREATE', 'task', null, {
            title: task.title,
            status: task.status,
            priority: task.priority,
            assigneeId: task.assigneeId
        });
        // Envoyer une notification à l'assigné
        await this.notifyTaskChange(task, userId, 'CREATE');
        return task;
    }
    async updateTask(activityId, taskId, updateData, userId, userRole) {
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                responsible: true,
                tasks: { where: { id: taskId } },
                project: { include: { participants: { where: { userId } } } }
            }
        });
        if (!activity) {
            throw new errors_1.ValidationError('Activité non trouvée');
        }
        const task = activity.tasks?.[0];
        if (!task) {
            throw new errors_1.ValidationError('Tâche non trouvée dans cette activité');
        }
        // Vérifier les droits : 
        // - Créateur (superviseur) peut tout modifier
        // - Assigné peut modifier le statut et la progression uniquement
        // - Admins peuvent tout modifier
        const isCreator = task.creatorId === userId;
        const isAssignee = task.assigneeId === userId;
        const isAdmin = userRole === 'ADMINISTRATEUR';
        const canModifyActivity = this.checkActivityModifyRights(activity, userId, userRole);
        if (!isCreator && !isAssignee && !isAdmin && !canModifyActivity) {
            throw new errors_1.AuthError('Permissions insuffisantes');
        }
        // Restrictions pour l'assigné (ne peut modifier que statut et progression)
        if (isAssignee && !isCreator && !isAdmin && !canModifyActivity) {
            if (updateData.title || updateData.description || updateData.priority ||
                updateData.dueDate || updateData.assigneeId) {
                throw new errors_1.AuthError('Vous ne pouvez modifier que le statut et la progression');
            }
        }
        // Vérifier le nouvel assignee si changé (seul le créateur/superviseur peut réassigner)
        if (updateData.assigneeId && updateData.assigneeId !== task.assigneeId) {
            if (!isCreator && !isAdmin && !canModifyActivity) {
                throw new errors_1.AuthError('Seul le créateur peut réassigner une tâche');
            }
            const newAssignee = await prisma.user.findUnique({
                where: { id: updateData.assigneeId }
            });
            if (!newAssignee) {
                throw new errors_1.ValidationError('Nouvel utilisateur assigné non trouvé');
            }
        }
        const dataToUpdate = {};
        if (updateData.title !== undefined)
            dataToUpdate.title = updateData.title;
        if (updateData.description !== undefined)
            dataToUpdate.description = updateData.description;
        if (updateData.status !== undefined) {
            dataToUpdate.status = updateData.status;
            // Si marquée comme terminée, définir completedAt
            if (updateData.status === 'TERMINEE' && !task.completedAt) {
                dataToUpdate.completedAt = new Date();
                dataToUpdate.progress = 100;
            }
        }
        if (updateData.priority !== undefined)
            dataToUpdate.priority = updateData.priority;
        if (updateData.assigneeId !== undefined)
            dataToUpdate.assigneeId = updateData.assigneeId;
        if (updateData.progress !== undefined)
            dataToUpdate.progress = updateData.progress;
        if (updateData.dueDate !== undefined) {
            dataToUpdate.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null;
        }
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: dataToUpdate,
            include: {
                assignee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                creator: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
        // Enregistrer l'historique pour chaque champ modifié
        const changedFields = [];
        if (updateData.title !== undefined && task.title !== updateData.title) {
            await this.logTaskHistory(taskId, userId, 'UPDATE', 'title', task.title, updateData.title);
            changedFields.push('titre');
        }
        if (updateData.description !== undefined && task.description !== updateData.description) {
            await this.logTaskHistory(taskId, userId, 'UPDATE', 'description', task.description, updateData.description);
            changedFields.push('description');
        }
        if (updateData.status !== undefined && task.status !== updateData.status) {
            await this.logTaskHistory(taskId, userId, 'UPDATE', 'status', task.status, updateData.status);
            changedFields.push('statut');
            // Notification spéciale si marquée comme terminée
            if (updateData.status === 'TERMINEE') {
                await this.notifyTaskChange(updatedTask, userId, 'COMPLETE');
            }
        }
        if (updateData.priority !== undefined && task.priority !== updateData.priority) {
            await this.logTaskHistory(taskId, userId, 'UPDATE', 'priority', task.priority, updateData.priority);
            changedFields.push('priorité');
        }
        if (updateData.progress !== undefined && task.progress !== updateData.progress) {
            await this.logTaskHistory(taskId, userId, 'UPDATE', 'progress', task.progress, updateData.progress);
            changedFields.push('progression');
        }
        if (updateData.assigneeId !== undefined && task.assigneeId !== updateData.assigneeId) {
            await this.logTaskHistory(taskId, userId, 'UPDATE', 'assigneeId', task.assigneeId, updateData.assigneeId);
            changedFields.push('assignation');
        }
        if (updateData.dueDate !== undefined) {
            const oldDate = task.dueDate?.toISOString();
            const newDate = updateData.dueDate ? new Date(updateData.dueDate).toISOString() : null;
            if (oldDate !== newDate) {
                await this.logTaskHistory(taskId, userId, 'UPDATE', 'dueDate', oldDate, newDate);
                changedFields.push('échéance');
            }
        }
        // Envoyer notification pour les modifications (sauf si déjà notifié pour completion)
        if (changedFields.length > 0 && updateData.status !== 'TERMINEE') {
            const details = changedFields.join(', ');
            await this.notifyTaskChange(updatedTask, userId, 'UPDATE', details);
        }
        return updatedTask;
    }
    async deleteTask(activityId, taskId, userId, userRole) {
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                responsible: true,
                tasks: { where: { id: taskId } },
                project: { include: { participants: { where: { userId } } } }
            }
        });
        if (!activity) {
            throw new errors_1.ValidationError('Activité non trouvée');
        }
        const task = activity.tasks?.[0];
        if (!task) {
            throw new errors_1.ValidationError('Tâche non trouvée');
        }
        // Seuls le créateur de la tâche ou un responsable de l'activité peuvent supprimer
        const canDelete = task.creatorId === userId ||
            this.checkActivityModifyRights(activity, userId, userRole);
        if (!canDelete) {
            throw new errors_1.AuthError('Permissions insuffisantes');
        }
        await prisma.task.delete({
            where: { id: taskId }
        });
    }
    async listTasks(activityId, userId, userRole) {
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                responsible: true,
                project: { include: { participants: { where: { userId } } } }
            }
        });
        if (!activity) {
            throw new errors_1.ValidationError('Activité non trouvée');
        }
        const hasAccess = this.checkActivityAccess(activity, userId, userRole);
        if (!hasAccess) {
            throw new errors_1.AuthError('Accès refusé');
        }
        const tasks = await prisma.task.findMany({
            where: { activityId },
            include: {
                assignee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                creator: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                _count: {
                    select: {
                        documents: true,
                        comments: true
                    }
                }
            },
            orderBy: [
                { status: 'asc' },
                { priority: 'desc' },
                { dueDate: 'asc' }
            ]
        });
        return tasks;
    }
    async getTaskById(activityId, taskId, userId, userRole) {
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                responsible: true,
                project: { include: { participants: { where: { userId } } } }
            }
        });
        if (!activity) {
            throw new errors_1.ValidationError('Activité non trouvée');
        }
        const hasAccess = this.checkActivityAccess(activity, userId, userRole);
        if (!hasAccess) {
            throw new errors_1.AuthError('Accès refusé');
        }
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: {
                assignee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                creator: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                documents: {
                    include: {
                        owner: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                },
                comments: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        if (!task || task.activityId !== activityId) {
            throw new errors_1.ValidationError('Tâche non trouvée dans cette activité');
        }
        return task;
    }
    // ========================================
    // NOUVELLES MÉTHODES POUR SUPERVISEUR/ASSIGNÉ
    // ========================================
    async reassignTask(activityId, taskId, reassignData, userId, userRole) {
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                responsible: true,
                tasks: { where: { id: taskId } },
                project: { include: { participants: { where: { userId } } } }
            }
        });
        if (!activity) {
            throw new errors_1.ValidationError('Activité non trouvée');
        }
        const task = activity.tasks?.[0];
        if (!task) {
            throw new errors_1.ValidationError('Tâche non trouvée');
        }
        // Seul le créateur peut réassigner
        const isCreator = task.creatorId === userId;
        const canModifyActivity = this.checkActivityModifyRights(activity, userId, userRole);
        if (!isCreator && !canModifyActivity && userRole !== 'ADMINISTRATEUR') {
            throw new errors_1.AuthError('Seul le créateur peut réassigner cette tâche');
        }
        // Vérifier que le nouvel assigné existe
        const newAssignee = await prisma.user.findUnique({
            where: { id: reassignData.newAssigneeId }
        });
        if (!newAssignee) {
            throw new errors_1.ValidationError('Nouvel utilisateur non trouvé');
        }
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                assigneeId: reassignData.newAssigneeId
            },
            include: {
                assignee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                creator: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                activity: {
                    select: {
                        id: true,
                        title: true,
                        code: true
                    }
                }
            }
        });
        return updatedTask;
    }
    async listCreatedTasks(activityId, userId, userRole) {
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                responsible: true,
                project: { include: { participants: { where: { userId } } } }
            }
        });
        if (!activity) {
            throw new errors_1.ValidationError('Activité non trouvée');
        }
        const hasAccess = this.checkActivityAccess(activity, userId, userRole);
        if (!hasAccess) {
            throw new errors_1.AuthError('Accès refusé');
        }
        const tasks = await prisma.task.findMany({
            where: {
                activityId,
                creatorId: userId // Tâches créées par cet utilisateur (superviseur)
            },
            include: {
                assignee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                creator: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                _count: {
                    select: {
                        documents: true,
                        comments: true
                    }
                }
            },
            orderBy: [
                { status: 'asc' },
                { priority: 'desc' },
                { dueDate: 'asc' }
            ]
        });
        return tasks;
    }
    async listAssignedTasks(activityId, userId, userRole) {
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                responsible: true,
                project: { include: { participants: { where: { userId } } } }
            }
        });
        if (!activity) {
            throw new errors_1.ValidationError('Activité non trouvée');
        }
        const hasAccess = this.checkActivityAccess(activity, userId, userRole);
        if (!hasAccess) {
            throw new errors_1.AuthError('Accès refusé');
        }
        const tasks = await prisma.task.findMany({
            where: {
                activityId,
                assigneeId: userId // Tâches assignées à cet utilisateur
            },
            include: {
                assignee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                creator: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                _count: {
                    select: {
                        documents: true,
                        comments: true
                    }
                }
            },
            orderBy: [
                { status: 'asc' },
                { priority: 'desc' },
                { dueDate: 'asc' }
            ]
        });
        return tasks;
    }
    // ========================================
    // GESTION DES COMMENTAIRES
    // ========================================
    async createComment(activityId, commentData, userId, userRole) {
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                responsible: true,
                project: { include: { participants: { where: { userId } } } }
            }
        });
        if (!activity) {
            throw new errors_1.ValidationError('Activité non trouvée');
        }
        const hasAccess = this.checkActivityAccess(activity, userId, userRole);
        if (!hasAccess) {
            throw new errors_1.AuthError('Accès refusé à cette activité');
        }
        const comment = await prisma.comment.create({
            data: {
                content: commentData.content,
                activityId,
                authorId: userId,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });
        return comment;
    }
    async updateComment(activityId, commentId, updateData, userId, userRole) {
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                responsible: true,
                project: { include: { participants: { where: { userId } } } }
            }
        });
        if (!activity) {
            throw new errors_1.ValidationError('Activité non trouvée');
        }
        const comment = await prisma.comment.findUnique({
            where: { id: commentId }
        });
        if (!comment || comment.activityId !== activityId) {
            throw new errors_1.ValidationError('Commentaire non trouvé dans cette activité');
        }
        // Seul l'auteur ou un admin peut modifier
        if (comment.authorId !== userId && userRole !== 'ADMINISTRATEUR') {
            throw new errors_1.AuthError('Seul l\'auteur peut modifier ce commentaire');
        }
        const updatedComment = await prisma.comment.update({
            where: { id: commentId },
            data: {
                content: updateData.content,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });
        return updatedComment;
    }
    async deleteComment(activityId, commentId, userId, userRole) {
        const activity = await prisma.activity.findUnique({
            where: { id: activityId }
        });
        if (!activity) {
            throw new errors_1.ValidationError('Activité non trouvée');
        }
        const comment = await prisma.comment.findUnique({
            where: { id: commentId }
        });
        if (!comment || comment.activityId !== activityId) {
            throw new errors_1.ValidationError('Commentaire non trouvé');
        }
        // Seul l'auteur, le responsable de l'activité ou un admin peut supprimer
        const canDelete = comment.authorId === userId ||
            activity.responsibleId === userId ||
            userRole === 'ADMINISTRATEUR';
        if (!canDelete) {
            throw new errors_1.AuthError('Permissions insuffisantes');
        }
        await prisma.comment.delete({
            where: { id: commentId }
        });
    }
    async listComments(activityId, userId, userRole) {
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                responsible: true,
                project: { include: { participants: { where: { userId } } } }
            }
        });
        if (!activity) {
            throw new errors_1.ValidationError('Activité non trouvée');
        }
        const hasAccess = this.checkActivityAccess(activity, userId, userRole);
        if (!hasAccess) {
            throw new errors_1.AuthError('Accès refusé');
        }
        const comments = await prisma.comment.findMany({
            where: { activityId },
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        profileImage: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return comments;
    }
    // ========================================
    // GESTION DES TRANSFERTS D'ACQUIS (Liaison uniquement)
    // ========================================
    async linkKnowledgeTransfer(activityId, transferId, userId, userRole) {
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                responsible: true,
                project: { include: { participants: { where: { userId } } } }
            }
        });
        if (!activity) {
            throw new errors_1.ValidationError('Activité non trouvée');
        }
        const canModify = this.checkActivityModifyRights(activity, userId, userRole);
        if (!canModify) {
            throw new errors_1.AuthError('Permissions insuffisantes');
        }
        const transfer = await prisma.knowledgeTransfer.findUnique({
            where: { id: transferId }
        });
        if (!transfer) {
            throw new errors_1.ValidationError('Transfert d\'acquis non trouvé');
        }
        if (transfer.activityId) {
            throw new errors_1.ValidationError('Ce transfert est déjà lié à une activité');
        }
        await prisma.knowledgeTransfer.update({
            where: { id: transferId },
            data: { activityId }
        });
        return { message: 'Transfert d\'acquis lié à l\'activité avec succès' };
    }
    async unlinkKnowledgeTransfer(activityId, transferId, userId, userRole) {
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                responsible: true,
                project: { include: { participants: { where: { userId } } } }
            }
        });
        if (!activity) {
            throw new errors_1.ValidationError('Activité non trouvée');
        }
        const canModify = this.checkActivityModifyRights(activity, userId, userRole);
        if (!canModify) {
            throw new errors_1.AuthError('Permissions insuffisantes');
        }
        const transfer = await prisma.knowledgeTransfer.findUnique({
            where: { id: transferId }
        });
        if (!transfer || transfer.activityId !== activityId) {
            throw new errors_1.ValidationError('Ce transfert n\'est pas lié à cette activité');
        }
        await prisma.knowledgeTransfer.update({
            where: { id: transferId },
            data: { activityId: null }
        });
        return { message: 'Transfert d\'acquis délié de l\'activité avec succès' };
    }
    async listKnowledgeTransfers(activityId, userId, userRole) {
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                responsible: true,
                project: { include: { participants: { where: { userId } } } }
            }
        });
        if (!activity) {
            throw new errors_1.ValidationError('Activité non trouvée');
        }
        const hasAccess = this.checkActivityAccess(activity, userId, userRole);
        if (!hasAccess) {
            throw new errors_1.AuthError('Accès refusé');
        }
        const transfers = await prisma.knowledgeTransfer.findMany({
            where: { activityId },
            include: {
                organizer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                _count: {
                    select: {
                        documents: true
                    }
                }
            },
            orderBy: { date: 'desc' }
        });
        return transfers;
    }
}
exports.ActivityService = ActivityService;
//# sourceMappingURL=activity.service.js.map