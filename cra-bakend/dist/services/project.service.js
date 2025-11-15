"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
// src/services/project.service.ts - CORRECTION DES ERREURS ORDERBY
const client_1 = require("@prisma/client");
const errors_1 = require("../utils/errors");
const prisma = new client_1.PrismaClient();
class ProjectService {
    // Créer un projet avec spécificités CRA
    async createProject(projectData, creatorId) {
        // Vérifier que le créateur est un chercheur ou admin
        const creator = await prisma.user.findUnique({
            where: { id: creatorId }
        });
        if (!creator) {
            throw new errors_1.ValidationError('Créateur non trouvé');
        }
        if (creator.role !== 'CHERCHEUR' && creator.role !== 'ADMINISTRATEUR') {
            throw new errors_1.AuthError('Seuls les chercheurs et administrateurs peuvent créer des projets');
        }
        // Vérifier que le thème existe
        const theme = await prisma.researchTheme.findUnique({
            where: { id: projectData.themeId }
        });
        if (!theme || !theme.isActive) {
            throw new errors_1.ValidationError('Thème de recherche non trouvé ou inactif');
        }
        // Vérifier le programme de recherche si spécifié
        if (projectData.researchProgramId) {
            const program = await prisma.researchProgram.findUnique({
                where: { id: projectData.researchProgramId }
            });
            if (!program || !program.isActive) {
                throw new errors_1.ValidationError('Programme de recherche non trouvé ou inactif');
            }
        }
        // Vérifier la convention si spécifiée
        if (projectData.conventionId) {
            const convention = await prisma.convention.findUnique({
                where: { id: projectData.conventionId }
            });
            if (!convention) {
                throw new errors_1.ValidationError('Convention non trouvée');
            }
        }
        // Générer un code unique si pas fourni
        let projectCode = projectData.code;
        if (!projectCode) {
            const year = new Date().getFullYear();
            const themeCode = theme.code || theme.name.substring(0, 3).toUpperCase();
            const count = await prisma.project.count({
                where: {
                    code: {
                        startsWith: `${themeCode}-${year}`
                    }
                }
            });
            projectCode = `${themeCode}-${year}-${(count + 1).toString().padStart(3, '0')}`;
        }
        // Préparer les données pour la création
        const createData = {
            title: projectData.title,
            description: projectData.description,
            objectives: projectData.objectives,
            status: projectData.status || 'PLANIFIE',
            startDate: projectData.startDate ? new Date(projectData.startDate) : null,
            endDate: projectData.endDate ? new Date(projectData.endDate) : null,
            budget: projectData.budget,
            keywords: projectData.keywords,
            creatorId,
            themeId: projectData.themeId,
        };
        // Ajouter les champs conditionnellement
        if (projectCode) {
            createData.code = projectCode;
        }
        if (projectData.researchProgramId) {
            createData.researchProgramId = projectData.researchProgramId;
        }
        if (projectData.conventionId) {
            createData.conventionId = projectData.conventionId;
        }
        // Champs stratégiques (disponibles dans votre schéma)
        if (projectData.strategicPlan) {
            createData.strategicPlan = projectData.strategicPlan;
        }
        if (projectData.strategicAxis) {
            createData.strategicAxis = projectData.strategicAxis;
        }
        if (projectData.subAxis) {
            createData.subAxis = projectData.subAxis;
        }
        if (projectData.program) {
            createData.program = projectData.program;
        }
        if (projectData.researchType) {
            createData.researchType = projectData.researchType;
        }
        if (projectData.interventionRegion) {
            createData.interventionRegion = projectData.interventionRegion;
        }
        // Créer le projet avec le créateur comme participant dans une transaction
        const project = await prisma.$transaction(async (tx) => {
            // Créer le projet
            const newProject = await tx.project.create({
                data: createData
            });
            // Ajouter automatiquement le créateur comme responsable du projet
            await tx.projectParticipant.create({
                data: {
                    projectId: newProject.id,
                    userId: creatorId,
                    role: 'Responsable',
                }
            });
            // Récupérer le projet complet avec toutes les relations
            const completeProject = await tx.project.findUnique({
                where: { id: newProject.id },
                include: this.getProjectIncludes()
            });
            return completeProject;
        });
        if (!project) {
            throw new Error('Erreur lors de la création du projet');
        }
        return this.formatProjectResponse(project);
    }
    // Lister les projets avec filtres CRA
    async listProjects(userId, userRole, query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        // Construire les filtres
        const where = {};
        if (query.status) {
            where.status = query.status;
        }
        if (query.creatorId) {
            where.creatorId = query.creatorId;
        }
        if (query.themeId) {
            where.themeId = query.themeId;
        }
        if (query.researchProgramId) {
            where.researchProgramId = query.researchProgramId;
        }
        if (query.conventionId) {
            where.conventionId = query.conventionId;
        }
        if (query.strategicAxis) {
            where.strategicAxis = { contains: query.strategicAxis, mode: 'insensitive' };
        }
        if (query.search) {
            where.OR = [
                { title: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } },
                { keywords: { has: query.search } },
                { theme: { name: { contains: query.search, mode: 'insensitive' } } },
            ];
            // Ajouter la recherche par code si disponible
            if (query.search) {
                where.OR.push({ code: { contains: query.search, mode: 'insensitive' } });
            }
        }
        if (query.startDate) {
            where.startDate = { gte: new Date(query.startDate) };
        }
        if (query.endDate) {
            where.endDate = { lte: new Date(query.endDate) };
        }
        // Filtrer selon les droits d'accès
        if (userRole !== 'ADMINISTRATEUR') {
            where.OR = [
                { creatorId: userId },
                {
                    participants: {
                        some: {
                            userId: userId,
                            isActive: true,
                        }
                    }
                }
            ];
        }
        // Exécuter la requête avec pagination
        const [projects, total] = await Promise.all([
            prisma.project.findMany({
                where,
                skip,
                take: limit,
                include: this.getProjectIncludes(),
                orderBy: {
                    updatedAt: 'desc'
                }
            }),
            prisma.project.count({ where })
        ]);
        return {
            projects: projects.map((project) => this.formatProjectResponse(project)),
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
    // Obtenir un projet par ID avec toutes les relations CRA
    async getProjectById(projectId, userId, userRole) {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: this.getProjectIncludes()
        });
        if (!project) {
            throw new errors_1.ValidationError('Projet non trouvé');
        }
        // Vérifier les droits d'accès
        const hasAccess = this.checkProjectAccess(project, userId, userRole);
        if (!hasAccess) {
            throw new errors_1.AuthError('Accès refusé à ce projet');
        }
        return this.formatProjectResponse(project);
    }
    // Mettre à jour un projet avec spécificités CRA
    async updateProject(projectId, updateData, userId, userRole) {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                participants: {
                    where: { userId: userId }
                }
            }
        });
        if (!project) {
            throw new errors_1.ValidationError('Projet non trouvé');
        }
        // Vérifier les droits de modification
        const canEdit = this.checkProjectEditRights(project, userId, userRole);
        if (!canEdit) {
            throw new errors_1.AuthError('Permissions insuffisantes pour modifier ce projet');
        }
        // Préparer les données de mise à jour
        const dataToUpdate = {};
        if (updateData.title !== undefined)
            dataToUpdate.title = updateData.title;
        if (updateData.description !== undefined)
            dataToUpdate.description = updateData.description;
        if (updateData.objectives !== undefined)
            dataToUpdate.objectives = updateData.objectives;
        if (updateData.status !== undefined)
            dataToUpdate.status = updateData.status;
        if (updateData.budget !== undefined)
            dataToUpdate.budget = updateData.budget;
        if (updateData.keywords !== undefined)
            dataToUpdate.keywords = updateData.keywords;
        if (updateData.themeId !== undefined)
            dataToUpdate.themeId = updateData.themeId;
        if (updateData.researchProgramId !== undefined)
            dataToUpdate.researchProgramId = updateData.researchProgramId;
        if (updateData.conventionId !== undefined)
            dataToUpdate.conventionId = updateData.conventionId;
        if (updateData.strategicPlan !== undefined)
            dataToUpdate.strategicPlan = updateData.strategicPlan;
        if (updateData.strategicAxis !== undefined)
            dataToUpdate.strategicAxis = updateData.strategicAxis;
        if (updateData.subAxis !== undefined)
            dataToUpdate.subAxis = updateData.subAxis;
        if (updateData.program !== undefined)
            dataToUpdate.program = updateData.program;
        if (updateData.startDate !== undefined) {
            dataToUpdate.startDate = updateData.startDate ? new Date(updateData.startDate) : null;
        }
        if (updateData.endDate !== undefined) {
            dataToUpdate.endDate = updateData.endDate ? new Date(updateData.endDate) : null;
        }
        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: dataToUpdate,
            include: this.getProjectIncludes()
        });
        return this.formatProjectResponse(updatedProject);
    }
    // Supprimer un projet
    async deleteProject(projectId, userId, userRole) {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: {
                id: true,
                creatorId: true,
                status: true,
                _count: {
                    select: {
                        activities: true,
                        tasks: true,
                    }
                }
            }
        });
        if (!project) {
            throw new errors_1.ValidationError('Projet non trouvé');
        }
        // Vérifier les droits de suppression (créateur ou admin)
        if (project.creatorId !== userId && userRole !== 'ADMINISTRATEUR') {
            throw new errors_1.AuthError('Seul le créateur du projet ou un administrateur peut le supprimer');
        }
        // Empêcher la suppression des projets en cours
        if (project.status === 'EN_COURS') {
            throw new errors_1.ValidationError('Impossible de supprimer un projet en cours. Changez d\'abord le statut.');
        }
        // Empêcher la suppression si le projet a des activités ou tâches
        if (project._count.activities > 0) {
            throw new errors_1.ValidationError('Impossible de supprimer un projet qui contient des activités');
        }
        if (project._count.tasks > 0) {
            throw new errors_1.ValidationError('Impossible de supprimer un projet qui contient des tâches');
        }
        // Supprimer le projet
        await prisma.project.delete({
            where: { id: projectId }
        });
    }
    // Ajouter un participant au projet
    async addParticipant(projectId, participantData, requesterId, requesterRole) {
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });
        if (!project) {
            throw new errors_1.ValidationError('Projet non trouvé');
        }
        // Vérifier les droits
        if (!this.canManageParticipants(project, requesterId, requesterRole)) {
            throw new errors_1.AuthError('Permissions insuffisantes pour gérer les participants');
        }
        // Vérifier que l'utilisateur existe
        const user = await prisma.user.findUnique({
            where: { id: participantData.userId }
        });
        if (!user || !user.isActive) {
            throw new errors_1.ValidationError('Utilisateur non trouvé ou inactif');
        }
        // Vérifier que l'utilisateur n'est pas déjà participant
        const existingParticipant = await prisma.projectParticipant.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId: participantData.userId,
                }
            }
        });
        if (existingParticipant) {
            throw new errors_1.ValidationError('Cet utilisateur est déjà participant du projet');
        }
        // Ajouter le participant
        await prisma.projectParticipant.create({
            data: {
                projectId,
                userId: participantData.userId,
                role: participantData.role,
            }
        });
        return { message: 'Participant ajouté avec succès au projet' };
    }
    // Mettre à jour un participant
    async updateParticipant(projectId, updateData, requesterId, requesterRole) {
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });
        if (!project) {
            throw new errors_1.ValidationError('Projet non trouvé');
        }
        // Vérifier les droits
        if (!this.canManageParticipants(project, requesterId, requesterRole)) {
            throw new errors_1.AuthError('Permissions insuffisantes pour modifier les participants');
        }
        // Vérifier que le participant existe
        const participant = await prisma.projectParticipant.findUnique({
            where: { id: updateData.participantId },
            include: { user: true }
        });
        if (!participant || participant.projectId !== projectId) {
            throw new errors_1.ValidationError('Participant non trouvé dans ce projet');
        }
        // Empêcher de modifier le créateur du projet
        if (participant.userId === project.creatorId && updateData.isActive === false) {
            throw new errors_1.ValidationError('Impossible de désactiver le créateur du projet');
        }
        // Préparer les données de mise à jour
        const dataToUpdate = {};
        if (updateData.role !== undefined)
            dataToUpdate.role = updateData.role;
        if (updateData.isActive !== undefined)
            dataToUpdate.isActive = updateData.isActive;
        // Ces champs seront activés après migration du schéma
        if (updateData.timeAllocation !== undefined)
            dataToUpdate.timeAllocation = updateData.timeAllocation;
        if (updateData.responsibilities !== undefined)
            dataToUpdate.responsibilities = updateData.responsibilities;
        if (updateData.expertise !== undefined)
            dataToUpdate.expertise = updateData.expertise;
        await prisma.projectParticipant.update({
            where: { id: updateData.participantId },
            data: dataToUpdate
        });
        return { message: 'Participant mis à jour avec succès' };
    }
    // Retirer un participant du projet
    async removeParticipant(projectId, participantId, requesterId, requesterRole) {
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });
        if (!project) {
            throw new errors_1.ValidationError('Projet non trouvé');
        }
        // Vérifier les droits
        if (!this.canManageParticipants(project, requesterId, requesterRole)) {
            throw new errors_1.AuthError('Permissions insuffisantes pour retirer des participants');
        }
        // Vérifier que le participant existe
        const participant = await prisma.projectParticipant.findUnique({
            where: { id: participantId },
            include: { user: true }
        });
        if (!participant || participant.projectId !== projectId) {
            throw new errors_1.ValidationError('Participant non trouvé dans ce projet');
        }
        // Empêcher de retirer le créateur du projet
        if (participant.userId === project.creatorId) {
            throw new errors_1.ValidationError('Impossible de retirer le créateur du projet');
        }
        // Supprimer le participant
        await prisma.projectParticipant.delete({
            where: { id: participantId }
        });
        return { message: 'Participant retiré avec succès du projet' };
    }
    // Méthodes placeholder pour les partenariats
    async addPartnership(projectId, partnershipData, requesterId, requesterRole) {
        // Vérifier que le projet existe et que l'utilisateur a les droits
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                participants: {
                    where: { userId: requesterId }
                }
            }
        });
        if (!project) {
            throw new errors_1.ValidationError('Projet non trouvé');
        }
        // Vérifier les droits d'édition
        const canEdit = this.checkProjectEditRights(project, requesterId, requesterRole);
        if (!canEdit) {
            throw new errors_1.AuthError('Permissions insuffisantes pour ajouter un partenariat');
        }
        // Vérifier que le partenaire existe
        const partner = await prisma.partner.findUnique({
            where: { id: partnershipData.partnerId }
        });
        if (!partner) {
            throw new errors_1.ValidationError('Partenaire non trouvé');
        }
        // Vérifier qu'il n'existe pas déjà un partenariat actif avec ce partenaire
        const existingPartnership = await prisma.projectPartner.findFirst({
            where: {
                projectId: projectId,
                partnerId: partnershipData.partnerId,
                isActive: true
            }
        });
        if (existingPartnership) {
            throw new errors_1.ValidationError('Ce partenaire est déjà associé à ce projet');
        }
        // Créer le partenariat
        const dataToCreate = {
            project: {
                connect: { id: projectId }
            },
            partner: {
                connect: { id: partnershipData.partnerId }
            },
            partnerType: partnershipData.partnerType,
            contribution: partnershipData.contribution || null,
            benefits: partnershipData.benefits || null,
            isActive: true
        };
        // Ajouter startDate seulement si fourni, sinon utiliser la valeur par défaut
        if (partnershipData.startDate) {
            dataToCreate.startDate = new Date(partnershipData.startDate);
        }
        // Ajouter endDate seulement si fourni
        if (partnershipData.endDate) {
            dataToCreate.endDate = new Date(partnershipData.endDate);
        }
        const partnership = await prisma.projectPartner.create({
            data: dataToCreate,
            include: {
                partner: true
            }
        });
        return {
            message: 'Partenariat ajouté avec succès',
            partnership: partnership
        };
    }
    async addFunding(projectId, fundingData, requesterId, requesterRole) {
        // Vérifier que le projet existe
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { participants: true }
        });
        if (!project) {
            throw new errors_1.ValidationError('Projet non trouvé');
        }
        // Vérifier les droits d'édition
        const canEdit = this.checkProjectEditRights(project, requesterId, requesterRole);
        if (!canEdit) {
            throw new errors_1.AuthError('Vous n\'avez pas les droits pour ajouter un financement à ce projet');
        }
        // Créer le financement
        await prisma.projectFunding.create({
            data: {
                projectId,
                fundingSource: fundingData.fundingSource,
                fundingType: fundingData.fundingType,
                status: 'DEMANDE', // Statut initial
                requestedAmount: fundingData.requestedAmount,
                currency: fundingData.currency || 'XOF',
                applicationDate: fundingData.applicationDate ? new Date(fundingData.applicationDate) : null,
                startDate: fundingData.startDate ? new Date(fundingData.startDate) : null,
                endDate: fundingData.endDate ? new Date(fundingData.endDate) : null,
                conditions: fundingData.conditions,
                contractNumber: fundingData.contractNumber,
                conventionId: fundingData.conventionId || null,
            }
        });
        return {
            message: 'Financement ajouté avec succès'
        };
    }
    async updateFunding(projectId, fundingData, requesterId, requesterRole) {
        // Vérifier que le projet existe
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { participants: true }
        });
        if (!project) {
            throw new errors_1.ValidationError('Projet non trouvé');
        }
        // Vérifier les droits d'édition
        const canEdit = this.checkProjectEditRights(project, requesterId, requesterRole);
        if (!canEdit) {
            throw new errors_1.AuthError('Vous n\'avez pas les droits pour modifier un financement de ce projet');
        }
        // Vérifier que le financement existe
        const funding = await prisma.projectFunding.findUnique({
            where: { id: fundingData.fundingId }
        });
        if (!funding || funding.projectId !== projectId) {
            throw new errors_1.ValidationError('Financement non trouvé');
        }
        // Mettre à jour le financement
        await prisma.projectFunding.update({
            where: { id: fundingData.fundingId },
            data: {
                status: fundingData.status,
                approvedAmount: fundingData.approvedAmount,
                receivedAmount: fundingData.receivedAmount,
                approvalDate: fundingData.approvalDate ? new Date(fundingData.approvalDate) : undefined,
                conditions: fundingData.conditions,
                notes: fundingData.notes,
            }
        });
        return {
            message: 'Financement modifié avec succès'
        };
    }
    async removeFunding(projectId, fundingId, requesterId, requesterRole) {
        // Vérifier que le projet existe
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { participants: true }
        });
        if (!project) {
            throw new errors_1.ValidationError('Projet non trouvé');
        }
        // Vérifier les droits d'édition
        const canEdit = this.checkProjectEditRights(project, requesterId, requesterRole);
        if (!canEdit) {
            throw new errors_1.AuthError('Vous n\'avez pas les droits pour retirer un financement de ce projet');
        }
        // Vérifier que le financement existe
        const funding = await prisma.projectFunding.findUnique({
            where: { id: fundingId }
        });
        if (!funding || funding.projectId !== projectId) {
            throw new errors_1.ValidationError('Financement non trouvé');
        }
        // Supprimer le financement
        await prisma.projectFunding.delete({
            where: { id: fundingId }
        });
        return {
            message: 'Financement retiré avec succès'
        };
    }
    // Obtenir les statistiques d'un projet
    async getProjectStatistics(projectId, userId, userRole) {
        // Récupérer le projet avec toutes ses relations
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                participants: {
                    include: {
                        user: true
                    }
                },
                activities: {
                    select: {
                        id: true,
                        type: true,
                        status: true,
                        startDate: true,
                        endDate: true
                    }
                },
                fundings: {
                    select: {
                        requestedAmount: true,
                        approvedAmount: true,
                        receivedAmount: true,
                        status: true
                    }
                }
            }
        });
        if (!project) {
            throw new errors_1.ValidationError('Projet non trouvé');
        }
        // Vérifier l'accès
        const hasAccess = this.checkProjectAccess(project, userId, userRole);
        if (!hasAccess) {
            throw new errors_1.AuthError('Accès refusé à ce projet');
        }
        // Calcul des statistiques des participants
        const activeParticipants = project.participants.filter(p => p.isActive);
        const participantsByRole = {};
        project.participants.forEach(p => {
            const role = p.role || 'Non spécifié';
            participantsByRole[role] = (participantsByRole[role] || 0) + 1;
        });
        // Calcul des statistiques des activités
        const activitiesByType = {};
        const activitiesByStatus = {};
        let completedActivities = 0;
        project.activities.forEach(a => {
            // Par type
            const type = a.type || 'Non spécifié';
            activitiesByType[type] = (activitiesByType[type] || 0) + 1;
            // Par statut
            const status = a.status || 'Non spécifié';
            activitiesByStatus[status] = (activitiesByStatus[status] || 0) + 1;
            // Comptage des activités terminées
            if (status === 'CLOTUREE') {
                completedActivities++;
            }
        });
        const activityCompletion = project.activities.length > 0
            ? Math.round((completedActivities / project.activities.length) * 100)
            : 0;
        // Calcul du budget
        const allocatedBudget = project.budget || 0;
        const totalApproved = project.fundings.reduce((sum, f) => sum + (f.approvedAmount || 0), 0);
        const totalReceived = project.fundings.reduce((sum, f) => sum + (f.receivedAmount || 0), 0);
        const budgetRemaining = allocatedBudget - totalReceived;
        // Calcul de la timeline
        let timelineProgress = 0;
        let duration = 0;
        if (project.startDate && project.endDate) {
            const start = new Date(project.startDate).getTime();
            const end = new Date(project.endDate).getTime();
            const now = Date.now();
            duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)); // en jours
            if (now >= end) {
                timelineProgress = 100;
            }
            else if (now <= start) {
                timelineProgress = 0;
            }
            else {
                timelineProgress = Math.round(((now - start) / (end - start)) * 100);
            }
        }
        return {
            participants: {
                total: project.participants.length,
                byRole: participantsByRole,
                activeCount: activeParticipants.length
            },
            activities: {
                total: project.activities.length,
                byType: activitiesByType,
                byStatus: activitiesByStatus,
                completion: activityCompletion
            },
            budget: {
                allocated: allocatedBudget,
                approved: totalApproved,
                received: totalReceived,
                remaining: budgetRemaining
            },
            timeline: {
                startDate: project.startDate,
                endDate: project.endDate,
                duration: duration,
                progress: timelineProgress
            }
        };
    }
    // Vérifier l'accès à un projet
    checkProjectAccess(project, userId, userRole) {
        if (userRole === 'ADMINISTRATEUR')
            return true;
        if (project.creatorId === userId)
            return true;
        if (project.participants?.some((p) => p.userId === userId && p.isActive))
            return true;
        return false;
    }
    // Vérifier les droits d'édition
    checkProjectEditRights(project, userId, userRole) {
        if (userRole === 'ADMINISTRATEUR')
            return true;
        if (project.creatorId === userId)
            return true;
        const participantRole = project.participants?.find((p) => p.userId === userId)?.role;
        if (participantRole && ['Chef de projet', 'Responsable', 'Co-Responsable', 'Chercheur principal', 'Chercheur associé'].includes(participantRole)) {
            return true;
        }
        return false;
    }
    // Vérifier les droits de gestion des participants
    canManageParticipants(project, userId, userRole) {
        if (userRole === 'ADMINISTRATEUR')
            return true;
        if (project.creatorId === userId)
            return true;
        return this.checkProjectEditRights(project, userId, userRole);
    }
    // Lister les partenariats d'un projet
    async getProjectPartnerships(projectId, userId, userRole) {
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });
        if (!project) {
            throw new errors_1.ValidationError('Projet non trouvé');
        }
        // Vérifier l'accès au projet
        const hasAccess = this.checkProjectAccess(project, userId, userRole);
        if (!hasAccess) {
            throw new errors_1.AuthError('Accès refusé à ce projet');
        }
        const partnerships = await prisma.projectPartner.findMany({
            where: { projectId },
            include: {
                partner: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        category: true,
                        description: true,
                        address: true,
                        phone: true,
                        email: true,
                        website: true,
                        contactPerson: true,
                        contactTitle: true,
                        contactEmail: true,
                        contactPhone: true,
                        expertise: true,
                        services: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return partnerships.map((partnership) => this.formatPartnershipResponse(partnership));
    }
    // Mettre à jour un partenariat
    async updatePartnership(projectId, updateData, requesterId, requesterRole) {
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });
        if (!project) {
            throw new errors_1.ValidationError('Projet non trouvé');
        }
        // Vérifier les droits de gestion des partenariats
        if (!this.canManagePartnerships(project, requesterId, requesterRole)) {
            throw new errors_1.AuthError('Permissions insuffisantes pour modifier les partenariats');
        }
        // Vérifier que le partenariat existe dans ce projet
        const partnership = await prisma.projectPartner.findUnique({
            where: { id: updateData.partnershipId },
            include: { partner: true }
        });
        if (!partnership || partnership.projectId !== projectId) {
            throw new errors_1.ValidationError('Partenariat non trouvé dans ce projet');
        }
        // Préparer les données de mise à jour
        const dataToUpdate = {};
        if (updateData.partnerType !== undefined)
            dataToUpdate.partnerType = updateData.partnerType;
        if (updateData.contribution !== undefined)
            dataToUpdate.contribution = updateData.contribution;
        if (updateData.benefits !== undefined)
            dataToUpdate.benefits = updateData.benefits;
        if (updateData.isActive !== undefined)
            dataToUpdate.isActive = updateData.isActive;
        if (updateData.endDate !== undefined) {
            dataToUpdate.endDate = updateData.endDate ? new Date(updateData.endDate) : null;
            // Valider que la date de fin est postérieure à la date de début
            if (updateData.endDate && partnership.startDate) {
                const endDate = new Date(updateData.endDate);
                if (partnership.startDate >= endDate) {
                    throw new errors_1.ValidationError('La date de fin doit être postérieure à la date de début');
                }
            }
        }
        const updatedPartnership = await prisma.projectPartner.update({
            where: { id: updateData.partnershipId },
            data: dataToUpdate,
            include: {
                partner: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        category: true,
                        contactPerson: true,
                        contactEmail: true,
                        expertise: true
                    }
                }
            }
        });
        return {
            message: 'Partenariat mis à jour avec succès',
            partnership: this.formatPartnershipResponse(updatedPartnership)
        };
    }
    // Retirer un partenariat du projet
    async removePartnership(projectId, partnershipId, requesterId, requesterRole) {
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });
        if (!project) {
            throw new errors_1.ValidationError('Projet non trouvé');
        }
        // Vérifier les droits de gestion des partenariats
        if (!this.canManagePartnerships(project, requesterId, requesterRole)) {
            throw new errors_1.AuthError('Permissions insuffisantes pour retirer des partenariats');
        }
        // Vérifier que le partenariat existe dans ce projet
        const partnership = await prisma.projectPartner.findUnique({
            where: { id: partnershipId },
            include: { partner: true }
        });
        if (!partnership || partnership.projectId !== projectId) {
            throw new errors_1.ValidationError('Partenariat non trouvé dans ce projet');
        }
        // Supprimer le partenariat
        await prisma.projectPartner.delete({
            where: { id: partnershipId }
        });
        return { message: `Partenariat avec ${partnership.partner.name} retiré avec succès du projet` };
    }
    // Rechercher des partenaires potentiels pour un projet
    async searchPotentialPartners(projectId, query, expertise, type) {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                partnerships: {
                    select: { partnerId: true }
                }
            }
        });
        if (!project) {
            throw new errors_1.ValidationError('Projet non trouvé');
        }
        // Obtenir les IDs des partenaires déjà liés au projet
        const excludedPartnerIds = project.partnerships.map(p => p.partnerId);
        // Construire les filtres de recherche
        const where = {
            id: { notIn: excludedPartnerIds } // Exclure les partenaires déjà liés
        };
        if (type) {
            where.type = type;
        }
        if (expertise && expertise.length > 0) {
            where.OR = [
                { expertise: { hassome: expertise } },
                { services: { hassome: expertise } }
            ];
        }
        if (query) {
            const searchConditions = [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { contactPerson: { contains: query, mode: 'insensitive' } }
            ];
            if (where.OR) {
                where.AND = [
                    { OR: where.OR },
                    { OR: searchConditions }
                ];
                delete where.OR;
            }
            else {
                where.OR = searchConditions;
            }
        }
        const potentialPartners = await prisma.partner.findMany({
            where,
            select: {
                id: true,
                name: true,
                type: true,
                category: true,
                description: true,
                contactPerson: true,
                contactEmail: true,
                expertise: true,
                services: true
            },
            orderBy: { name: 'asc' },
            take: 20 // Limiter les résultats
        });
        return potentialPartners;
    }
    // MÉTHODES UTILITAIRES PRIVÉES POUR LES PARTENARIATS
    // Vérifier les droits de gestion des partenariats
    canManagePartnerships(project, userId, userRole) {
        if (userRole === 'ADMINISTRATEUR')
            return true;
        if (project.creatorId === userId)
            return true;
        // Les responsables de projet peuvent aussi gérer les partenariats
        return this.checkProjectEditRights(project, userId, userRole);
    }
    // Formater la réponse d'un partenariat
    formatPartnershipResponse(partnership) {
        return {
            id: partnership.id,
            partnerType: partnership.partnerType,
            contribution: partnership.contribution || undefined,
            benefits: partnership.benefits || undefined,
            startDate: partnership.startDate,
            endDate: partnership.endDate || undefined,
            isActive: partnership.isActive,
            createdAt: partnership.createdAt,
            updatedAt: partnership.updatedAt,
            partner: {
                id: partnership.partner.id,
                name: partnership.partner.name,
                type: partnership.partner.type,
                category: partnership.partner.category || undefined,
                description: partnership.partner.description || undefined,
                address: partnership.partner.address || undefined,
                phone: partnership.partner.phone || undefined,
                email: partnership.partner.email || undefined,
                website: partnership.partner.website || undefined,
                contactPerson: partnership.partner.contactPerson || undefined,
                contactTitle: partnership.partner.contactTitle || undefined,
                contactEmail: partnership.partner.contactEmail || undefined,
                contactPhone: partnership.partner.contactPhone || undefined,
                expertise: partnership.partner.expertise || [],
                services: partnership.partner.services || []
            }
        };
    }
    // Mettre à jour la méthode getProjectIncludes pour inclure les partenariats
    getProjectIncludes() {
        return {
            creator: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true,
                    specialization: true,
                    discipline: true,
                }
            },
            theme: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    description: true,
                }
            },
            researchProgram: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    description: true,
                }
            },
            convention: {
                select: {
                    id: true,
                    title: true,
                    type: true,
                    status: true,
                    contractNumber: true,
                }
            },
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            role: true,
                            specialization: true,
                            discipline: true,
                        }
                    }
                },
                orderBy: [
                    {
                        // Les participants avec le rôle "Responsable" en premier
                        role: client_1.Prisma.SortOrder.desc
                    },
                    {
                        // Puis par date d'ajout
                        joinedAt: client_1.Prisma.SortOrder.asc
                    }
                ]
            },
            // AJOUT DES PARTENARIATS
            partnerships: {
                include: {
                    partner: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                            category: true,
                            description: true,
                            contactPerson: true,
                            contactEmail: true,
                            expertise: true,
                            services: true
                        }
                    }
                },
                where: { isActive: true },
                orderBy: {
                    createdAt: client_1.Prisma.SortOrder.desc
                }
            },
            // AJOUT DES FINANCEMENTS
            fundings: {
                orderBy: {
                    createdAt: client_1.Prisma.SortOrder.desc
                }
            },
            activities: {
                select: {
                    id: true,
                    code: true,
                    title: true,
                    description: true,
                    type: true,
                    status: true,
                    startDate: true,
                    endDate: true,
                    createdAt: true,
                },
                orderBy: {
                    createdAt: client_1.Prisma.SortOrder.desc
                }
            },
            _count: {
                select: {
                    participants: true,
                    activities: true,
                    tasks: true,
                    documents: true,
                    partnerships: true,
                    fundings: true
                }
            }
        };
    }
    // Mettre à jour la méthode formatProjectResponse pour inclure les partenariats
    formatProjectResponse(project) {
        return {
            id: project.id,
            code: project.code || undefined,
            title: project.title,
            description: project.description || undefined,
            objectives: project.objectives,
            status: project.status,
            startDate: project.startDate || undefined,
            endDate: project.endDate || undefined,
            budget: project.budget || undefined,
            keywords: project.keywords || undefined,
            strategicPlan: project.strategicPlan || undefined,
            strategicAxis: project.strategicAxis || undefined,
            subAxis: project.subAxis || undefined,
            program: project.program || undefined,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            creator: {
                id: project.creator.id,
                firstName: project.creator.firstName,
                lastName: project.creator.lastName,
                email: project.creator.email,
                role: project.creator.role,
                specialization: project.creator.specialization || undefined,
            },
            theme: {
                id: project.theme.id,
                name: project.theme.name,
                code: project.theme.code || undefined,
                description: project.theme.description || undefined,
            },
            researchProgram: project.researchProgram ? {
                id: project.researchProgram.id,
                name: project.researchProgram.name,
                code: project.researchProgram.code || undefined,
                description: project.researchProgram.description || undefined,
            } : undefined,
            convention: project.convention ? {
                id: project.convention.id,
                title: project.convention.title,
                type: project.convention.type,
                status: project.convention.status,
                contractNumber: project.convention.contractNumber || undefined,
            } : undefined,
            participants: project.participants ? project.participants
                .map((p) => ({
                id: p.id,
                role: p.role,
                joinedAt: p.joinedAt,
                isActive: p.isActive,
                userId: p.userId,
                user: {
                    id: p.user.id,
                    firstName: p.user.firstName,
                    lastName: p.user.lastName,
                    email: p.user.email,
                    role: p.user.role,
                    specialization: p.user.specialization || undefined,
                    discipline: p.user.discipline || undefined,
                }
            }))
                .sort((a, b) => {
                // Le créateur du projet (userId === creatorId) en premier
                if (a.userId === project.creatorId)
                    return -1;
                if (b.userId === project.creatorId)
                    return 1;
                // Sinon, trier par date d'ajout
                return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
            }) : [],
            // AJOUT DES PARTENARIATS
            partnerships: project.partnerships ? project.partnerships.map((p) => ({
                id: p.id,
                partnerType: p.partnerType,
                contribution: p.contribution || undefined,
                benefits: p.benefits || undefined,
                startDate: p.startDate,
                endDate: p.endDate || undefined,
                isActive: p.isActive,
                partner: {
                    id: p.partner.id,
                    name: p.partner.name,
                    type: p.partner.type,
                    category: p.partner.category || undefined,
                    description: p.partner.description || undefined,
                    contactPerson: p.partner.contactPerson || undefined,
                    contactEmail: p.partner.contactEmail || undefined,
                    expertise: p.partner.expertise || [],
                    services: p.partner.services || []
                }
            })) : [],
            // AJOUT DES FINANCEMENTS
            fundings: project.fundings ? project.fundings.map((f) => ({
                id: f.id,
                fundingSource: f.fundingSource,
                fundingType: f.fundingType,
                status: f.status,
                requestedAmount: f.requestedAmount,
                approvedAmount: f.approvedAmount || undefined,
                receivedAmount: f.receivedAmount || undefined,
                currency: f.currency,
                applicationDate: f.applicationDate || undefined,
                approvalDate: f.approvalDate || undefined,
                startDate: f.startDate || undefined,
                endDate: f.endDate || undefined,
                conditions: f.conditions || undefined,
                contractNumber: f.contractNumber || undefined,
                notes: f.notes || undefined,
                createdAt: f.createdAt,
                updatedAt: f.updatedAt
            })) : [],
            activities: project.activities ? project.activities.map((a) => ({
                id: a.id,
                code: a.code || undefined,
                title: a.title,
                description: a.description || undefined,
                type: a.type,
                status: a.status,
                startDate: a.startDate || undefined,
                endDate: a.endDate || undefined,
                createdAt: a.createdAt,
            })) : [],
            _count: project._count || {
                participants: 0,
                activities: 0,
                tasks: 0,
                documents: 0,
                partnerships: 0,
                fundings: 0
            },
        };
    }
}
exports.ProjectService = ProjectService;
//# sourceMappingURL=project.service.js.map