"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrategicPlanningService = void 0;
// src/services/strategic-planning.service.ts - VERSION CORRIGÉE
const client_1 = require("@prisma/client");
const errors_1 = require("../utils/errors");
const prisma = new client_1.PrismaClient();
class StrategicPlanningService {
    // ========================================
    // GESTION DES PLANS STRATÉGIQUES
    // ========================================
    async createStrategicPlan(data, userId) {
        // Vérifier qu'il n'existe pas déjà un plan actif pour cette période
        const existingPlan = await prisma.strategicPlan.findFirst({
            where: {
                isActive: true,
                OR: [
                    {
                        AND: [
                            { startYear: { lte: data.startYear } },
                            { endYear: { gte: data.startYear } }
                        ]
                    },
                    {
                        AND: [
                            { startYear: { lte: data.endYear } },
                            { endYear: { gte: data.endYear } }
                        ]
                    },
                    {
                        AND: [
                            { startYear: { gte: data.startYear } },
                            { endYear: { lte: data.endYear } }
                        ]
                    }
                ]
            }
        });
        if (existingPlan) {
            throw new errors_1.ConflictError(`Un plan stratégique actif existe déjà pour la période ${data.startYear}-${data.endYear}`);
        }
        const plan = await prisma.strategicPlan.create({
            data,
            include: {
                axes: {
                    include: {
                        subAxes: {
                            include: {
                                programs: {
                                    include: {
                                        coordinator: {
                                            select: { id: true, firstName: true, lastName: true, email: true }
                                        },
                                        themes: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        // Créer un log d'audit
        await this.createAuditLog('CREATE', 'strategic_plan', plan.id, userId, {
            action: 'Création d\'un plan stratégique',
            planName: plan.name
        });
        return plan;
    }
    async getStrategicPlans(params) {
        const { page = 1, limit = 10, search, isActive, startYear, endYear, sortBy = 'createdAt', sortOrder = 'desc' } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        if (startYear) {
            where.startYear = { gte: startYear };
        }
        if (endYear) {
            where.endYear = { lte: endYear };
        }
        const [plans, total] = await Promise.all([
            prisma.strategicPlan.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    axes: {
                        include: {
                            subAxes: {
                                include: {
                                    programs: {
                                        include: {
                                            coordinator: {
                                                select: { id: true, firstName: true, lastName: true, email: true }
                                            },
                                            themes: true,
                                            _count: {
                                                select: { projects: true }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }),
            prisma.strategicPlan.count({ where })
        ]);
        return {
            data: plans,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
    async getStrategicPlanById(id) {
        const plan = await prisma.strategicPlan.findUnique({
            where: { id },
            include: {
                axes: {
                    orderBy: { order: 'asc' },
                    include: {
                        subAxes: {
                            orderBy: { order: 'asc' },
                            include: {
                                programs: {
                                    include: {
                                        coordinator: {
                                            select: { id: true, firstName: true, lastName: true, email: true }
                                        },
                                        themes: {
                                            orderBy: { order: 'asc' },
                                            include: {
                                                _count: {
                                                    select: { projects: true, activities: true }
                                                }
                                            }
                                        },
                                        _count: {
                                            select: { projects: true }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!plan) {
            throw new errors_1.NotFoundError('Plan stratégique non trouvé');
        }
        return plan;
    }
    async updateStrategicPlan(id, data, userId) {
        const existingPlan = await prisma.strategicPlan.findUnique({ where: { id } });
        if (!existingPlan) {
            throw new errors_1.NotFoundError('Plan stratégique non trouvé');
        }
        // Si les années changent, vérifier les conflits
        if (data.startYear || data.endYear) {
            const startYear = data.startYear ?? existingPlan.startYear;
            const endYear = data.endYear ?? existingPlan.endYear;
            const conflictingPlan = await prisma.strategicPlan.findFirst({
                where: {
                    id: { not: id },
                    isActive: true,
                    OR: [
                        {
                            AND: [
                                { startYear: { lte: startYear } },
                                { endYear: { gte: startYear } }
                            ]
                        },
                        {
                            AND: [
                                { startYear: { lte: endYear } },
                                { endYear: { gte: endYear } }
                            ]
                        }
                    ]
                }
            });
            if (conflictingPlan) {
                throw new errors_1.ConflictError(`Un autre plan stratégique actif existe déjà pour cette période`);
            }
        }
        const updatedPlan = await prisma.strategicPlan.update({
            where: { id },
            data,
            include: {
                axes: {
                    include: {
                        subAxes: {
                            include: {
                                programs: {
                                    include: {
                                        coordinator: {
                                            select: { id: true, firstName: true, lastName: true, email: true }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        await this.createAuditLog('UPDATE', 'strategic_plan', id, userId, {
            action: 'Modification d\'un plan stratégique',
            planName: updatedPlan.name,
            changes: data
        });
        return updatedPlan;
    }
    async deleteStrategicPlan(id, userId) {
        const plan = await prisma.strategicPlan.findUnique({
            where: { id },
            include: {
                axes: {
                    include: {
                        subAxes: {
                            include: {
                                programs: {
                                    include: {
                                        projects: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!plan) {
            throw new errors_1.NotFoundError('Plan stratégique non trouvé');
        }
        // Vérifier s'il y a des projets associés
        const hasProjects = plan.axes.some(axis => axis.subAxes.some(subAxis => subAxis.programs.some(program => program.projects.length > 0)));
        if (hasProjects) {
            throw new errors_1.ConflictError('Impossible de supprimer ce plan stratégique car il contient des programmes avec des projets associés');
        }
        await prisma.strategicPlan.delete({ where: { id } });
        await this.createAuditLog('DELETE', 'strategic_plan', id, userId, {
            action: 'Suppression d\'un plan stratégique',
            planName: plan.name
        });
        return { message: 'Plan stratégique supprimé avec succès' };
    }
    // ========================================
    // GESTION DES AXES STRATÉGIQUES
    // ========================================
    async createStrategicAxis(data, userId) {
        // Vérifier que le plan stratégique existe
        const plan = await prisma.strategicPlan.findUnique({
            where: { id: data.strategicPlanId }
        });
        if (!plan) {
            throw new errors_1.NotFoundError('Plan stratégique non trouvé');
        }
        // Vérifier l'unicité du nom dans le plan
        const existingAxis = await prisma.strategicAxis.findFirst({
            where: {
                strategicPlanId: data.strategicPlanId,
                name: data.name
            }
        });
        if (existingAxis) {
            throw new errors_1.ConflictError('Un axe avec ce nom existe déjà dans ce plan stratégique');
        }
        const axis = await prisma.strategicAxis.create({
            data,
            include: {
                strategicPlan: { select: { id: true, name: true } },
                subAxes: {
                    include: {
                        programs: {
                            include: {
                                coordinator: {
                                    select: { id: true, firstName: true, lastName: true, email: true }
                                }
                            }
                        }
                    }
                }
            }
        });
        await this.createAuditLog('CREATE', 'strategic_axis', axis.id, userId, {
            action: 'Création d\'un axe stratégique',
            axisName: axis.name,
            planName: plan.name
        });
        return axis;
    }
    async getStrategicAxes(params) {
        const { page = 1, limit = 10, search, strategicPlanId, sortBy = 'order', sortOrder = 'asc' } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (strategicPlanId) {
            where.strategicPlanId = strategicPlanId;
        }
        const [axes, total] = await Promise.all([
            prisma.strategicAxis.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    strategicPlan: { select: { id: true, name: true } },
                    subAxes: {
                        include: {
                            programs: {
                                include: {
                                    coordinator: {
                                        select: { id: true, firstName: true, lastName: true, email: true }
                                    },
                                    _count: {
                                        select: { projects: true }
                                    }
                                }
                            }
                        }
                    }
                }
            }),
            prisma.strategicAxis.count({ where })
        ]);
        return {
            data: axes,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
    async getStrategicAxisById(id) {
        const axis = await prisma.strategicAxis.findUnique({
            where: { id },
            include: {
                strategicPlan: { select: { id: true, name: true } },
                subAxes: {
                    orderBy: { order: 'asc' },
                    include: {
                        programs: {
                            include: {
                                coordinator: {
                                    select: { id: true, firstName: true, lastName: true, email: true }
                                },
                                themes: {
                                    orderBy: { order: 'asc' }
                                },
                                _count: {
                                    select: { projects: true }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!axis) {
            throw new errors_1.NotFoundError('Axe stratégique non trouvé');
        }
        return axis;
    }
    async updateStrategicAxis(id, data, userId) {
        const existingAxis = await prisma.strategicAxis.findUnique({
            where: { id },
            include: { strategicPlan: true }
        });
        if (!existingAxis) {
            throw new errors_1.NotFoundError('Axe stratégique non trouvé');
        }
        // Vérifier l'unicité du nom si il change
        if (data.name && data.name !== existingAxis.name) {
            const conflictingAxis = await prisma.strategicAxis.findFirst({
                where: {
                    id: { not: id },
                    strategicPlanId: existingAxis.strategicPlanId,
                    name: data.name
                }
            });
            if (conflictingAxis) {
                throw new errors_1.ConflictError('Un axe avec ce nom existe déjà dans ce plan stratégique');
            }
        }
        const updatedAxis = await prisma.strategicAxis.update({
            where: { id },
            data,
            include: {
                strategicPlan: { select: { id: true, name: true } },
                subAxes: {
                    include: {
                        programs: {
                            include: {
                                coordinator: {
                                    select: { id: true, firstName: true, lastName: true, email: true }
                                }
                            }
                        }
                    }
                }
            }
        });
        await this.createAuditLog('UPDATE', 'strategic_axis', id, userId, {
            action: 'Modification d\'un axe stratégique',
            axisName: updatedAxis.name,
            changes: data
        });
        return updatedAxis;
    }
    async deleteStrategicAxis(id, userId) {
        const axis = await prisma.strategicAxis.findUnique({
            where: { id },
            include: {
                subAxes: {
                    include: {
                        programs: {
                            include: {
                                projects: true
                            }
                        }
                    }
                }
            }
        });
        if (!axis) {
            throw new errors_1.NotFoundError('Axe stratégique non trouvé');
        }
        // Vérifier s'il y a des projets associés
        const hasProjects = axis.subAxes.some(subAxis => subAxis.programs.some(program => program.projects.length > 0));
        if (hasProjects) {
            throw new errors_1.ConflictError('Impossible de supprimer cet axe car il contient des programmes avec des projets associés');
        }
        await prisma.strategicAxis.delete({ where: { id } });
        await this.createAuditLog('DELETE', 'strategic_axis', id, userId, {
            action: 'Suppression d\'un axe stratégique',
            axisName: axis.name
        });
        return { message: 'Axe stratégique supprimé avec succès' };
    }
    // ========================================
    // GESTION DES SOUS-AXES STRATÉGIQUES
    // ========================================
    async createStrategicSubAxis(data, userId) {
        const axis = await prisma.strategicAxis.findUnique({
            where: { id: data.strategicAxisId },
            include: { strategicPlan: true }
        });
        if (!axis) {
            throw new errors_1.NotFoundError('Axe stratégique non trouvé');
        }
        // Vérifier l'unicité du nom dans l'axe
        const existingSubAxis = await prisma.strategicSubAxis.findFirst({
            where: {
                strategicAxisId: data.strategicAxisId,
                name: data.name
            }
        });
        if (existingSubAxis) {
            throw new errors_1.ConflictError('Un sous-axe avec ce nom existe déjà dans cet axe');
        }
        const subAxis = await prisma.strategicSubAxis.create({
            data,
            include: {
                strategicAxis: {
                    select: {
                        id: true,
                        name: true,
                        strategicPlan: { select: { id: true, name: true } }
                    }
                },
                programs: {
                    include: {
                        coordinator: {
                            select: { id: true, firstName: true, lastName: true, email: true }
                        },
                        themes: true
                    }
                }
            }
        });
        await this.createAuditLog('CREATE', 'strategic_sub_axis', subAxis.id, userId, {
            action: 'Création d\'un sous-axe stratégique',
            subAxisName: subAxis.name,
            axisName: axis.name
        });
        return subAxis;
    }
    async getStrategicSubAxes(params) {
        const { page = 1, limit = 10, search, strategicAxisId, sortBy = 'order', sortOrder = 'asc' } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (strategicAxisId) {
            where.strategicAxisId = strategicAxisId;
        }
        const [subAxes, total] = await Promise.all([
            prisma.strategicSubAxis.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    strategicAxis: {
                        select: {
                            id: true,
                            name: true,
                            strategicPlan: { select: { id: true, name: true } }
                        }
                    },
                    programs: {
                        include: {
                            coordinator: {
                                select: { id: true, firstName: true, lastName: true, email: true }
                            },
                            _count: {
                                select: { projects: true, themes: true }
                            }
                        }
                    }
                }
            }),
            prisma.strategicSubAxis.count({ where })
        ]);
        return {
            data: subAxes,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
    async getStrategicSubAxisById(id) {
        const subAxis = await prisma.strategicSubAxis.findUnique({
            where: { id },
            include: {
                strategicAxis: {
                    select: {
                        id: true,
                        name: true,
                        strategicPlan: { select: { id: true, name: true } }
                    }
                },
                programs: {
                    include: {
                        coordinator: {
                            select: { id: true, firstName: true, lastName: true, email: true }
                        },
                        themes: {
                            orderBy: { order: 'asc' }
                        },
                        _count: {
                            select: { projects: true }
                        }
                    }
                }
            }
        });
        if (!subAxis) {
            throw new errors_1.NotFoundError('Sous-axe stratégique non trouvé');
        }
        return subAxis;
    }
    async updateStrategicSubAxis(id, data, userId) {
        const existingSubAxis = await prisma.strategicSubAxis.findUnique({
            where: { id },
            include: { strategicAxis: true }
        });
        if (!existingSubAxis) {
            throw new errors_1.NotFoundError('Sous-axe stratégique non trouvé');
        }
        // Vérifier l'unicité du nom si il change
        if (data.name && data.name !== existingSubAxis.name) {
            const conflictingSubAxis = await prisma.strategicSubAxis.findFirst({
                where: {
                    id: { not: id },
                    strategicAxisId: existingSubAxis.strategicAxisId,
                    name: data.name
                }
            });
            if (conflictingSubAxis) {
                throw new errors_1.ConflictError('Un sous-axe avec ce nom existe déjà dans cet axe');
            }
        }
        const updatedSubAxis = await prisma.strategicSubAxis.update({
            where: { id },
            data,
            include: {
                strategicAxis: {
                    select: {
                        id: true,
                        name: true,
                        strategicPlan: { select: { id: true, name: true } }
                    }
                },
                programs: {
                    include: {
                        coordinator: {
                            select: { id: true, firstName: true, lastName: true, email: true }
                        }
                    }
                }
            }
        });
        await this.createAuditLog('UPDATE', 'strategic_sub_axis', id, userId, {
            action: 'Modification d\'un sous-axe stratégique',
            subAxisName: updatedSubAxis.name,
            changes: data
        });
        return updatedSubAxis;
    }
    async deleteStrategicSubAxis(id, userId) {
        const subAxis = await prisma.strategicSubAxis.findUnique({
            where: { id },
            include: {
                programs: {
                    include: {
                        projects: true
                    }
                }
            }
        });
        if (!subAxis) {
            throw new errors_1.NotFoundError('Sous-axe stratégique non trouvé');
        }
        // Vérifier s'il y a des projets associés
        const hasProjects = subAxis.programs.some(program => program.projects.length > 0);
        if (hasProjects) {
            throw new errors_1.ConflictError('Impossible de supprimer ce sous-axe car il contient des programmes avec des projets associés');
        }
        await prisma.strategicSubAxis.delete({ where: { id } });
        await this.createAuditLog('DELETE', 'strategic_sub_axis', id, userId, {
            action: 'Suppression d\'un sous-axe stratégique',
            subAxisName: subAxis.name
        });
        return { message: 'Sous-axe stratégique supprimé avec succès' };
    }
    // ========================================
    // GESTION DES PROGRAMMES DE RECHERCHE
    // ========================================
    async createResearchProgram(data, userId) {
        const subAxis = await prisma.strategicSubAxis.findUnique({
            where: { id: data.strategicSubAxisId },
            include: {
                strategicAxis: {
                    include: { strategicPlan: true }
                }
            }
        });
        if (!subAxis) {
            throw new errors_1.NotFoundError('Sous-axe stratégique non trouvé');
        }
        // Vérifier que le coordinateur existe et a le bon rôle
        const coordinator = await prisma.user.findUnique({
            where: { id: data.coordinatorId }
        });
        if (!coordinator) {
            throw new errors_1.NotFoundError('Coordinateur non trouvé');
        }
        if (coordinator.role !== 'COORDONATEUR_PROJET' && coordinator.role !== 'ADMINISTRATEUR') {
            throw new errors_1.ValidationError('L\'utilisateur doit avoir le rôle COORDONATEUR_PROJET ou ADMINISTRATEUR');
        }
        // Vérifier l'unicité du code
        if (data.code) {
            const existingProgram = await prisma.researchProgram.findUnique({
                where: { code: data.code }
            });
            if (existingProgram) {
                throw new errors_1.ConflictError('Un programme avec ce code existe déjà');
            }
        }
        const program = await prisma.researchProgram.create({
            data,
            include: {
                strategicSubAxis: {
                    select: {
                        id: true,
                        name: true,
                        strategicAxis: {
                            select: {
                                id: true,
                                name: true,
                                strategicPlan: { select: { id: true, name: true } }
                            }
                        }
                    }
                },
                coordinator: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                themes: {
                    orderBy: { order: 'asc' }
                }
            }
        });
        await this.createAuditLog('CREATE', 'research_program', program.id, userId, {
            action: 'Création d\'un programme de recherche',
            programName: program.name,
            coordinatorName: `${coordinator.firstName} ${coordinator.lastName}`
        });
        return program;
    }
    async getResearchPrograms(params) {
        const { page = 1, limit = 10, search, strategicSubAxisId, coordinatorId, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (strategicSubAxisId) {
            where.strategicSubAxisId = strategicSubAxisId;
        }
        if (coordinatorId) {
            where.coordinatorId = coordinatorId;
        }
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        const [programs, total] = await Promise.all([
            prisma.researchProgram.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    strategicSubAxis: {
                        select: {
                            id: true,
                            name: true,
                            strategicAxis: {
                                select: {
                                    id: true,
                                    name: true,
                                    strategicPlan: { select: { id: true, name: true } }
                                }
                            }
                        }
                    },
                    coordinator: {
                        select: { id: true, firstName: true, lastName: true, email: true }
                    },
                    themes: {
                        orderBy: { order: 'asc' }
                    },
                    _count: {
                        select: { projects: true }
                    }
                }
            }),
            prisma.researchProgram.count({ where })
        ]);
        return {
            data: programs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
    async getResearchProgramById(id) {
        const program = await prisma.researchProgram.findUnique({
            where: { id },
            include: {
                strategicSubAxis: {
                    select: {
                        id: true,
                        name: true,
                        strategicAxis: {
                            select: {
                                id: true,
                                name: true,
                                strategicPlan: { select: { id: true, name: true } }
                            }
                        }
                    }
                },
                coordinator: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                themes: {
                    orderBy: { order: 'asc' },
                    include: {
                        _count: {
                            select: { projects: true, activities: true }
                        }
                    }
                },
                _count: {
                    select: { projects: true }
                }
            }
        });
        if (!program) {
            throw new errors_1.NotFoundError('Programme de recherche non trouvé');
        }
        return program;
    }
    async updateResearchProgram(id, data, userId) {
        const existingProgram = await prisma.researchProgram.findUnique({
            where: { id },
            include: { coordinator: true }
        });
        if (!existingProgram) {
            throw new errors_1.NotFoundError('Programme de recherche non trouvé');
        }
        // Si le coordinateur change, vérifier qu'il existe et a le bon rôle
        if (data.coordinatorId && data.coordinatorId !== existingProgram.coordinatorId) {
            const newCoordinator = await prisma.user.findUnique({
                where: { id: data.coordinatorId }
            });
            if (!newCoordinator) {
                throw new errors_1.NotFoundError('Coordinateur non trouvé');
            }
            if (newCoordinator.role !== 'COORDONATEUR_PROJET' && newCoordinator.role !== 'ADMINISTRATEUR') {
                throw new errors_1.ValidationError('L\'utilisateur doit avoir le rôle COORDONATEUR_PROJET ou ADMINISTRATEUR');
            }
        }
        // Vérifier l'unicité du code si il change
        if (data.code && data.code !== existingProgram.code) {
            const conflictingProgram = await prisma.researchProgram.findFirst({
                where: {
                    id: { not: id },
                    code: data.code
                }
            });
            if (conflictingProgram) {
                throw new errors_1.ConflictError('Un programme avec ce code existe déjà');
            }
        }
        const updatedProgram = await prisma.researchProgram.update({
            where: { id },
            data,
            include: {
                strategicSubAxis: {
                    select: {
                        id: true,
                        name: true,
                        strategicAxis: {
                            select: {
                                id: true,
                                name: true,
                                strategicPlan: { select: { id: true, name: true } }
                            }
                        }
                    }
                },
                coordinator: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                themes: {
                    orderBy: { order: 'asc' }
                }
            }
        });
        await this.createAuditLog('UPDATE', 'research_program', id, userId, {
            action: 'Modification d\'un programme de recherche',
            programName: updatedProgram.name,
            changes: data
        });
        return updatedProgram;
    }
    async deleteResearchProgram(id, userId) {
        const program = await prisma.researchProgram.findUnique({
            where: { id },
            include: {
                projects: true
            }
        });
        if (!program) {
            throw new errors_1.NotFoundError('Programme de recherche non trouvé');
        }
        // Vérifier s'il y a des projets associés
        if (program.projects.length > 0) {
            throw new errors_1.ConflictError('Impossible de supprimer ce programme car il contient des projets associés');
        }
        await prisma.researchProgram.delete({ where: { id } });
        await this.createAuditLog('DELETE', 'research_program', id, userId, {
            action: 'Suppression d\'un programme de recherche',
            programName: program.name
        });
        return { message: 'Programme de recherche supprimé avec succès' };
    }
    // ========================================
    // GESTION DES THÈMES DE RECHERCHE
    // ========================================
    async createResearchTheme(data, userId) {
        const program = await prisma.researchProgram.findUnique({
            where: { id: data.programId },
            include: {
                strategicSubAxis: {
                    include: {
                        strategicAxis: {
                            include: { strategicPlan: true }
                        }
                    }
                }
            }
        });
        if (!program) {
            throw new errors_1.NotFoundError('Programme de recherche non trouvé');
        }
        // Vérifier l'unicité du nom dans le programme
        const existingTheme = await prisma.researchTheme.findFirst({
            where: {
                programId: data.programId,
                name: data.name
            }
        });
        if (existingTheme) {
            throw new errors_1.ConflictError('Un thème avec ce nom existe déjà dans ce programme');
        }
        // Vérifier l'unicité du code
        if (data.code) {
            const existingThemeByCode = await prisma.researchTheme.findUnique({
                where: { code: data.code }
            });
            if (existingThemeByCode) {
                throw new errors_1.ConflictError('Un thème avec ce code existe déjà');
            }
        }
        const theme = await prisma.researchTheme.create({
            data,
            include: {
                program: {
                    select: {
                        id: true,
                        name: true,
                        strategicSubAxis: {
                            select: {
                                id: true,
                                name: true,
                                strategicAxis: {
                                    select: {
                                        id: true,
                                        name: true,
                                        strategicPlan: { select: { id: true, name: true } }
                                    }
                                }
                            }
                        }
                    }
                },
                _count: {
                    select: { projects: true, activities: true }
                }
            }
        });
        await this.createAuditLog('CREATE', 'research_theme', theme.id, userId, {
            action: 'Création d\'un thème de recherche',
            themeName: theme.name,
            programName: program.name
        });
        return theme;
    }
    async getResearchThemes(params) {
        const { page = 1, limit = 10, search, programId, isActive, sortBy = 'order', sortOrder = 'asc' } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (programId) {
            where.programId = programId;
        }
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        const [themes, total] = await Promise.all([
            prisma.researchTheme.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    program: {
                        select: {
                            id: true,
                            name: true,
                            strategicSubAxis: {
                                select: {
                                    id: true,
                                    name: true,
                                    strategicAxis: {
                                        select: {
                                            id: true,
                                            name: true,
                                            strategicPlan: { select: { id: true, name: true } }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    _count: {
                        select: { projects: true, activities: true }
                    }
                }
            }),
            prisma.researchTheme.count({ where })
        ]);
        return {
            data: themes,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
    async getResearchThemeById(id) {
        const theme = await prisma.researchTheme.findUnique({
            where: { id },
            include: {
                program: {
                    select: {
                        id: true,
                        name: true,
                        strategicSubAxis: {
                            select: {
                                id: true,
                                name: true,
                                strategicAxis: {
                                    select: {
                                        id: true,
                                        name: true,
                                        strategicPlan: { select: { id: true, name: true } }
                                    }
                                }
                            }
                        }
                    }
                },
                projects: {
                    select: {
                        id: true,
                        title: true,
                        status: true
                    }
                },
                activities: {
                    select: {
                        id: true,
                        title: true,
                        status: true
                    }
                },
                _count: {
                    select: { projects: true, activities: true }
                }
            }
        });
        if (!theme) {
            throw new errors_1.NotFoundError('Thème de recherche non trouvé');
        }
        return theme;
    }
    async updateResearchTheme(id, data, userId) {
        const existingTheme = await prisma.researchTheme.findUnique({
            where: { id },
            include: { program: true }
        });
        if (!existingTheme) {
            throw new errors_1.NotFoundError('Thème de recherche non trouvé');
        }
        // Vérifier l'unicité du nom si il change
        if (data.name && data.name !== existingTheme.name) {
            const conflictingTheme = await prisma.researchTheme.findFirst({
                where: {
                    id: { not: id },
                    programId: existingTheme.programId,
                    name: data.name
                }
            });
            if (conflictingTheme) {
                throw new errors_1.ConflictError('Un thème avec ce nom existe déjà dans ce programme');
            }
        }
        // Vérifier l'unicité du code si il change
        if (data.code && data.code !== existingTheme.code) {
            const conflictingThemeByCode = await prisma.researchTheme.findFirst({
                where: {
                    id: { not: id },
                    code: data.code
                }
            });
            if (conflictingThemeByCode) {
                throw new errors_1.ConflictError('Un thème avec ce code existe déjà');
            }
        }
        const updatedTheme = await prisma.researchTheme.update({
            where: { id },
            data,
            include: {
                program: {
                    select: {
                        id: true,
                        name: true,
                        strategicSubAxis: {
                            select: {
                                id: true,
                                name: true,
                                strategicAxis: {
                                    select: {
                                        id: true,
                                        name: true,
                                        strategicPlan: { select: { id: true, name: true } }
                                    }
                                }
                            }
                        }
                    }
                },
                _count: {
                    select: { projects: true, activities: true }
                }
            }
        });
        await this.createAuditLog('UPDATE', 'research_theme', id, userId, {
            action: 'Modification d\'un thème de recherche',
            themeName: updatedTheme.name,
            changes: data
        });
        return updatedTheme;
    }
    async deleteResearchTheme(id, userId) {
        const theme = await prisma.researchTheme.findUnique({
            where: { id },
            include: {
                projects: true,
                activities: true
            }
        });
        if (!theme) {
            throw new errors_1.NotFoundError('Thème de recherche non trouvé');
        }
        // Vérifier s'il y a des projets ou activités associés
        if (theme.projects.length > 0 || theme.activities.length > 0) {
            throw new errors_1.ConflictError('Impossible de supprimer ce thème car il contient des projets ou activités associés');
        }
        await prisma.researchTheme.delete({ where: { id } });
        await this.createAuditLog('DELETE', 'research_theme', id, userId, {
            action: 'Suppression d\'un thème de recherche',
            themeName: theme.name
        });
        return { message: 'Thème de recherche supprimé avec succès' };
    }
    // ========================================
    // GESTION DES STATIONS DE RECHERCHE
    // ========================================
    async createResearchStation(data, userId) {
        // Vérifier l'unicité du nom
        const existingStation = await prisma.researchStation.findUnique({
            where: { name: data.name }
        });
        if (existingStation) {
            throw new errors_1.ConflictError('Une station avec ce nom existe déjà');
        }
        const station = await prisma.researchStation.create({
            data,
            include: {
                _count: {
                    select: { activities: true, events: true }
                }
            }
        });
        await this.createAuditLog('CREATE', 'research_station', station.id, userId, {
            action: 'Création d\'une station de recherche',
            stationName: station.name,
            location: station.location
        });
        return station;
    }
    async getResearchStations(params) {
        const { page = 1, limit = 10, search, isActive, sortBy = 'name', sortOrder = 'asc' } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { location: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        const [stations, total] = await Promise.all([
            prisma.researchStation.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    _count: {
                        select: { activities: true, events: true }
                    }
                }
            }),
            prisma.researchStation.count({ where })
        ]);
        return {
            data: stations,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
    async updateResearchStation(id, data, userId) {
        const existingStation = await prisma.researchStation.findUnique({ where: { id } });
        if (!existingStation) {
            throw new errors_1.NotFoundError('Station de recherche non trouvée');
        }
        // Vérifier l'unicité du nom si il change
        if (data.name && data.name !== existingStation.name) {
            const conflictingStation = await prisma.researchStation.findFirst({
                where: {
                    id: { not: id },
                    name: data.name
                }
            });
            if (conflictingStation) {
                throw new errors_1.ConflictError('Une station avec ce nom existe déjà');
            }
        }
        const updatedStation = await prisma.researchStation.update({
            where: { id },
            data,
            include: {
                _count: {
                    select: { activities: true, events: true }
                }
            }
        });
        await this.createAuditLog('UPDATE', 'research_station', id, userId, {
            action: 'Modification d\'une station de recherche',
            stationName: updatedStation.name,
            changes: data
        });
        return updatedStation;
    }
    async deleteResearchStation(id, userId) {
        const station = await prisma.researchStation.findUnique({
            where: { id },
            include: {
                activities: true,
                events: true
            }
        });
        if (!station) {
            throw new errors_1.NotFoundError('Station de recherche non trouvée');
        }
        // Vérifier s'il y a des activités ou événements associés
        if (station.activities.length > 0 || station.events.length > 0) {
            throw new errors_1.ConflictError('Impossible de supprimer cette station car elle contient des activités ou événements associés');
        }
        await prisma.researchStation.delete({ where: { id } });
        await this.createAuditLog('DELETE', 'research_station', id, userId, {
            action: 'Suppression d\'une station de recherche',
            stationName: station.name
        });
        return { message: 'Station de recherche supprimée avec succès' };
    }
    // ========================================
    // MÉTHODES UTILITAIRES
    // ========================================
    async createAuditLog(action, entityType, entityId, userId, details) {
        await prisma.auditLog.create({
            data: {
                action,
                entityType,
                entityId,
                userId,
                level: 'INFO',
                details,
                createdAt: new Date()
            }
        });
    }
    // Méthode pour obtenir la hiérarchie complète
    async getStrategicHierarchy() {
        const plans = await prisma.strategicPlan.findMany({
            where: { isActive: true },
            orderBy: { startYear: 'desc' },
            include: {
                axes: {
                    orderBy: { order: 'asc' },
                    include: {
                        subAxes: {
                            orderBy: { order: 'asc' },
                            include: {
                                programs: {
                                    where: { isActive: true },
                                    include: {
                                        coordinator: {
                                            select: { id: true, firstName: true, lastName: true, email: true }
                                        },
                                        themes: {
                                            where: { isActive: true },
                                            orderBy: { order: 'asc' },
                                            include: {
                                                _count: {
                                                    select: { projects: true, activities: true }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        return plans;
    }
    // Méthode pour obtenir les statistiques
    async getStrategicPlanningStats() {
        const [plansCount, axesCount, subAxesCount, programsCount, themesCount, stationsCount, activeProjectsCount] = await Promise.all([
            prisma.strategicPlan.count({ where: { isActive: true } }),
            prisma.strategicAxis.count(),
            prisma.strategicSubAxis.count(),
            prisma.researchProgram.count({ where: { isActive: true } }),
            prisma.researchTheme.count({ where: { isActive: true } }),
            prisma.researchStation.count({ where: { isActive: true } }),
            prisma.project.count({ where: { status: { in: ['PLANIFIE', 'EN_COURS'] } } })
        ]);
        return {
            plans: plansCount,
            axes: axesCount,
            subAxes: subAxesCount,
            programs: programsCount,
            themes: themesCount,
            stations: stationsCount,
            activeProjects: activeProjectsCount
        };
    }
    // Méthode pour obtenir les coordinateurs éligibles
    async getEligibleCoordinators() {
        const coordinators = await prisma.user.findMany({
            where: {
                isActive: true,
                role: {
                    in: ['COORDONATEUR_PROJET', 'ADMINISTRATEUR']
                }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                specialization: true,
                department: true,
                _count: {
                    select: {
                        coordinatedPrograms: true
                    }
                }
            },
            orderBy: [
                { lastName: 'asc' },
                { firstName: 'asc' }
            ]
        });
        return coordinators;
    }
}
exports.StrategicPlanningService = StrategicPlanningService;
//# sourceMappingURL=strategic-planning.service.js.map