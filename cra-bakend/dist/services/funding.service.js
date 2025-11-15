"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FundingService = void 0;
// src/services/funding.service.ts
const client_1 = require("@prisma/client");
const errors_1 = require("../utils/errors");
const prisma = new client_1.PrismaClient();
class FundingService {
    /**
     * Créer une nouvelle ressource financière
     */
    async createFunding(data, userId) {
        // Vérifier que l'activité existe
        const activity = await prisma.activity.findUnique({
            where: { id: data.activityId },
            include: {
                responsible: true,
                participants: {
                    where: { userId, isActive: true }
                }
            }
        });
        if (!activity) {
            throw new errors_1.NotFoundError('Activité non trouvée');
        }
        // Vérifier que l'utilisateur est responsable ou participant de l'activité
        const isResponsible = activity.responsibleId === userId;
        const isParticipant = activity.participants.length > 0;
        if (!isResponsible && !isParticipant) {
            throw new errors_1.AuthorizationError('Vous n\'êtes pas autorisé à ajouter un financement à cette activité');
        }
        // Vérifier la convention si spécifiée
        if (data.conventionId) {
            const convention = await prisma.convention.findUnique({
                where: { id: data.conventionId }
            });
            if (!convention) {
                throw new errors_1.NotFoundError('Convention non trouvée');
            }
        }
        // Créer le financement
        const funding = await prisma.activityFunding.create({
            data: {
                ...data,
                applicationDate: data.applicationDate ? new Date(data.applicationDate) : undefined,
                approvalDate: data.approvalDate ? new Date(data.approvalDate) : undefined,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            },
            include: {
                activity: {
                    select: {
                        id: true,
                        title: true,
                        code: true
                    }
                },
                convention: {
                    select: {
                        id: true,
                        title: true,
                        contractNumber: true
                    }
                }
            }
        });
        return funding;
    }
    /**
     * Récupérer tous les financements avec filtres
     */
    async getFundings(filters, userId, userRole) {
        const where = {};
        // Si l'utilisateur n'est pas admin, filtrer par ses activités
        if (userRole !== 'ADMINISTRATEUR') {
            where.activity = {
                OR: [
                    { responsibleId: userId },
                    { participants: { some: { userId, isActive: true } } }
                ]
            };
        }
        // Appliquer les filtres
        if (filters.activityId) {
            where.activityId = filters.activityId;
        }
        if (filters.fundingType) {
            where.fundingType = filters.fundingType;
        }
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.conventionId) {
            where.conventionId = filters.conventionId;
        }
        if (filters.minAmount || filters.maxAmount) {
            where.requestedAmount = {};
            if (filters.minAmount) {
                where.requestedAmount.gte = filters.minAmount;
            }
            if (filters.maxAmount) {
                where.requestedAmount.lte = filters.maxAmount;
            }
        }
        if (filters.startDate || filters.endDate) {
            where.startDate = {};
            if (filters.startDate) {
                where.startDate.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                where.startDate.lte = new Date(filters.endDate);
            }
        }
        const fundings = await prisma.activityFunding.findMany({
            where,
            include: {
                activity: {
                    select: {
                        id: true,
                        title: true,
                        code: true,
                        responsible: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                },
                convention: {
                    select: {
                        id: true,
                        title: true,
                        contractNumber: true,
                        status: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        // Calculer des statistiques
        const stats = {
            total: fundings.length,
            totalRequested: fundings.reduce((sum, f) => sum + f.requestedAmount, 0),
            totalApproved: fundings.reduce((sum, f) => sum + (f.approvedAmount || 0), 0),
            totalReceived: fundings.reduce((sum, f) => sum + (f.receivedAmount || 0), 0),
            byStatus: fundings.reduce((acc, f) => {
                acc[f.status] = (acc[f.status] || 0) + 1;
                return acc;
            }, {}),
            byType: fundings.reduce((acc, f) => {
                acc[f.fundingType] = (acc[f.fundingType] || 0) + 1;
                return acc;
            }, {})
        };
        return { fundings, stats };
    }
    /**
     * Récupérer un financement par ID
     */
    async getFundingById(id, userId, userRole) {
        const funding = await prisma.activityFunding.findUnique({
            where: { id },
            include: {
                activity: {
                    include: {
                        responsible: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true
                            }
                        },
                        participants: {
                            where: { isActive: true },
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true
                                    }
                                }
                            }
                        }
                    }
                },
                convention: true
            }
        });
        if (!funding) {
            throw new errors_1.NotFoundError('Financement non trouvé');
        }
        // Vérifier les permissions
        if (userRole !== 'ADMINISTRATEUR') {
            const isResponsible = funding.activity.responsibleId === userId;
            const isParticipant = funding.activity.participants.some(p => p.userId === userId);
            if (!isResponsible && !isParticipant) {
                throw new errors_1.AuthorizationError('Accès non autorisé à ce financement');
            }
        }
        return funding;
    }
    /**
     * Mettre à jour un financement
     */
    async updateFunding(id, data, userId, userRole) {
        const existing = await this.getFundingById(id, userId, userRole);
        // Seul le responsable de l'activité peut modifier
        if (userRole !== 'ADMINISTRATEUR' && existing.activity.responsibleId !== userId) {
            throw new errors_1.AuthorizationError('Seul le responsable de l\'activité peut modifier ce financement');
        }
        const updated = await prisma.activityFunding.update({
            where: { id },
            data: {
                ...data,
                applicationDate: data.applicationDate ? new Date(data.applicationDate) : undefined,
                approvalDate: data.approvalDate ? new Date(data.approvalDate) : undefined,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            },
            include: {
                activity: {
                    select: {
                        id: true,
                        title: true,
                        code: true
                    }
                },
                convention: {
                    select: {
                        id: true,
                        title: true,
                        contractNumber: true
                    }
                }
            }
        });
        return updated;
    }
    /**
     * Supprimer un financement
     */
    async deleteFunding(id, userId, userRole) {
        const existing = await this.getFundingById(id, userId, userRole);
        // Seul le responsable de l'activité ou un admin peut supprimer
        if (userRole !== 'ADMINISTRATEUR' && existing.activity.responsibleId !== userId) {
            throw new errors_1.AuthorizationError('Seul le responsable de l\'activité peut supprimer ce financement');
        }
        await prisma.activityFunding.delete({
            where: { id }
        });
        return { message: 'Financement supprimé avec succès' };
    }
    /**
     * Récupérer les financements d'une activité spécifique
     */
    async getFundingsByActivity(activityId, userId, userRole) {
        // Vérifier que l'activité existe et que l'utilisateur y a accès
        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                participants: {
                    where: { userId, isActive: true }
                }
            }
        });
        if (!activity) {
            throw new errors_1.NotFoundError('Activité non trouvée');
        }
        if (userRole !== 'ADMINISTRATEUR') {
            const isResponsible = activity.responsibleId === userId;
            const isParticipant = activity.participants.length > 0;
            if (!isResponsible && !isParticipant) {
                throw new errors_1.AuthorizationError('Accès non autorisé à cette activité');
            }
        }
        const fundings = await prisma.activityFunding.findMany({
            where: { activityId },
            include: {
                convention: {
                    select: {
                        id: true,
                        title: true,
                        contractNumber: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        // Calculer le total
        const totalRequested = fundings.reduce((sum, f) => sum + f.requestedAmount, 0);
        const totalApproved = fundings.reduce((sum, f) => sum + (f.approvedAmount || 0), 0);
        const totalReceived = fundings.reduce((sum, f) => sum + (f.receivedAmount || 0), 0);
        return {
            fundings,
            summary: {
                count: fundings.length,
                totalRequested,
                totalApproved,
                totalReceived,
                fundingGap: totalRequested - totalReceived
            }
        };
    }
}
exports.FundingService = FundingService;
//# sourceMappingURL=funding.service.js.map