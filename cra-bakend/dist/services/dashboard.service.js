"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
// src/services/dashboard.service.ts - Version améliorée
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class DashboardService {
    async getDashboardData(userId, userRole, query) {
        // Récupérer les informations utilisateur
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
                department: true,
            }
        });
        if (!user) {
            throw new Error('Utilisateur non trouvé');
        }
        // Exécuter toutes les requêtes en parallèle pour optimiser les performances
        const [projectStats, taskStats, documentStats, activityStats, formStats // Nouvelle statistique
        ] = await Promise.all([
            this.getProjectStatistics(userId, userRole, query),
            this.getTaskStatistics(userId, query),
            this.getDocumentStatistics(userId, userRole, query),
            this.getActivityStatistics(userId, userRole, query),
            this.getFormStatistics(userId, userRole, query) // Nouvelle méthode
        ]);
        // Calculer le résumé et les métriques (maintenant avec les formulaires)
        const summary = this.calculateSummaryMetrics(projectStats, taskStats, documentStats, activityStats, formStats);
        return {
            user,
            projects: projectStats,
            tasks: taskStats,
            documents: documentStats,
            activities: activityStats,
            forms: formStats, // Nouvelle section
            summary
        };
    }
    // Statistiques des projets (méthode existante - pas de modification)
    async getProjectStatistics(userId, userRole, query) {
        // Construire les filtres selon le rôle
        const projectWhere = {};
        if (userRole !== 'ADMINISTRATEUR') {
            projectWhere.OR = [
                { creatorId: userId },
                {
                    participants: {
                        some: {
                            userId: userId,
                            isActive: true
                        }
                    }
                }
            ];
        }
        if (!query.includeArchived) {
            projectWhere.status = { not: 'ARCHIVE' };
        }
        // Statistiques par statut
        const [statusStats, totalProjects, userProjectsCount, recentProjects] = await Promise.all([
            prisma.project.groupBy({
                by: ['status'],
                _count: true,
                where: projectWhere
            }),
            prisma.project.count({
                where: projectWhere
            }),
            prisma.project.count({
                where: {
                    ...projectWhere,
                    creatorId: userId
                }
            }),
            prisma.project.findMany({
                where: projectWhere,
                take: 5,
                orderBy: { updatedAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    createdAt: true,
                    _count: {
                        select: { participants: true }
                    }
                }
            })
        ]);
        // Formater les statistiques par statut avec typage explicite
        const byStatus = {
            PLANIFIE: 0,
            EN_COURS: 0,
            SUSPENDU: 0,
            TERMINE: 0,
            ARCHIVE: 0,
        };
        statusStats.forEach((stat) => {
            if (stat.status in byStatus) {
                byStatus[stat.status] = stat._count;
            }
        });
        return {
            byStatus,
            total: totalProjects,
            userProjects: userProjectsCount,
            recentProjects: recentProjects.map((project) => ({
                id: project.id,
                title: project.title,
                status: project.status,
                createdAt: project.createdAt,
                participantCount: project._count.participants
            }))
        };
    }
    // Statistiques des tâches (méthode existante - pas de modification)
    async getTaskStatistics(userId, query) {
        const now = new Date();
        const today = new Date(now);
        today.setHours(23, 59, 59, 999);
        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
        endOfWeek.setHours(23, 59, 59, 999);
        const taskWhere = {
            OR: [
                { assigneeId: userId },
                { creatorId: userId }
            ]
        };
        const [statusStats, priorityStats, totalTasks, overdueTasks, dueTodayTasks, dueThisWeekTasks, completedTasks, recentTasks] = await Promise.all([
            prisma.task.groupBy({
                by: ['status'],
                _count: true,
                where: taskWhere
            }),
            prisma.task.groupBy({
                by: ['priority'],
                _count: true,
                where: taskWhere
            }),
            prisma.task.count({
                where: taskWhere
            }),
            prisma.task.count({
                where: {
                    ...taskWhere,
                    dueDate: { lt: now },
                    status: { notIn: ['TERMINEE', 'ANNULEE'] }
                }
            }),
            prisma.task.count({
                where: {
                    ...taskWhere,
                    dueDate: { lte: today },
                    status: { notIn: ['TERMINEE', 'ANNULEE'] }
                }
            }),
            prisma.task.count({
                where: {
                    ...taskWhere,
                    dueDate: { lte: endOfWeek },
                    status: { notIn: ['TERMINEE', 'ANNULEE'] }
                }
            }),
            prisma.task.count({
                where: {
                    ...taskWhere,
                    status: 'TERMINEE'
                }
            }),
            prisma.task.findMany({
                where: taskWhere,
                take: 5,
                orderBy: { updatedAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    priority: true,
                    dueDate: true,
                    project: {
                        select: {
                            id: true,
                            title: true
                        }
                    }
                }
            })
        ]);
        // Formater les statistiques avec typage explicite
        const byStatus = {
            A_FAIRE: 0,
            EN_COURS: 0,
            EN_REVISION: 0,
            TERMINEE: 0,
            ANNULEE: 0,
        };
        statusStats.forEach((stat) => {
            if (stat.status in byStatus) {
                byStatus[stat.status] = stat._count;
            }
        });
        const byPriority = {
            BASSE: 0,
            NORMALE: 0,
            HAUTE: 0,
            URGENTE: 0,
        };
        priorityStats.forEach((stat) => {
            if (stat.priority in byPriority) {
                byPriority[stat.priority] = stat._count;
            }
        });
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        return {
            byStatus,
            byPriority,
            total: totalTasks,
            overdue: overdueTasks,
            dueToday: dueTodayTasks,
            dueThisWeek: dueThisWeekTasks,
            completionRate,
            recentTasks: recentTasks.map((task) => ({
                id: task.id,
                title: task.title,
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate,
                project: task.project
            }))
        };
    }
    // Statistiques des documents (méthode existante - pas de modification)
    async getDocumentStatistics(userId, userRole, query) {
        // Construire les filtres selon les permissions
        const documentWhere = {};
        if (userRole !== 'ADMINISTRATEUR') {
            documentWhere.OR = [
                { ownerId: userId },
                { isPublic: true },
                {
                    shares: {
                        some: { sharedWithId: userId }
                    }
                },
                {
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
            ];
        }
        const [typeStats, totalDocuments, totalSize, userDocuments, sharedDocuments, recentDocuments] = await Promise.all([
            prisma.document.groupBy({
                by: ['type'],
                _count: true,
                where: documentWhere
            }),
            prisma.document.count({
                where: documentWhere
            }),
            prisma.document.aggregate({
                where: documentWhere,
                _sum: { size: true }
            }),
            prisma.document.count({
                where: { ownerId: userId }
            }),
            prisma.document.count({
                where: {
                    shares: {
                        some: { sharedWithId: userId }
                    }
                }
            }),
            prisma.document.findMany({
                where: documentWhere,
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    type: true,
                    size: true,
                    createdAt: true,
                    owner: {
                        select: {
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            })
        ]);
        // Formater les statistiques par type avec typage explicite
        const byType = {
            RAPPORT: 0,
            FICHE_ACTIVITE: 0,
            FICHE_TECHNIQUE: 0,
            DONNEES_EXPERIMENTALES: 0,
            FORMULAIRE: 0,
            IMAGE: 0,
            AUTRE: 0,
        };
        typeStats.forEach((stat) => {
            if (stat.type in byType) {
                byType[stat.type] = stat._count;
            }
        });
        const totalSizeBytes = Number(totalSize._sum.size || 0);
        const totalSizeMB = Math.round(totalSizeBytes / (1024 * 1024));
        return {
            byType,
            total: totalDocuments,
            totalSize: totalSizeBytes,
            totalSizeMB,
            userDocuments,
            sharedWithUser: sharedDocuments,
            recentDocuments: recentDocuments.map((doc) => ({
                id: doc.id,
                title: doc.title,
                type: doc.type,
                size: Number(doc.size),
                createdAt: doc.createdAt,
                owner: doc.owner
            }))
        };
    }
    // Statistiques des activités (méthode existante - pas de modification)
    async getActivityStatistics(userId, userRole, query) {
        // Déterminer la période à analyser
        const monthsToAnalyze = query.period === 'year' ? 12 :
            query.period === 'quarter' ? 3 : 6;
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - monthsToAnalyze);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        // Construire les filtres selon le rôle
        const activityWhere = {
            createdAt: { gte: startDate }
        };
        if (userRole !== 'ADMINISTRATEUR') {
            activityWhere.project = {
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
            };
        }
        const [allActivities, totalActivities, activitiesWithResults, recentActivities] = await Promise.all([
            prisma.activity.findMany({
                where: activityWhere,
                select: {
                    id: true,
                    createdAt: true,
                    results: true
                }
            }),
            prisma.activity.count({
                where: userRole !== 'ADMINISTRATEUR' ? activityWhere : {}
            }),
            prisma.activity.count({
                where: {
                    ...activityWhere,
                    results: { not: null }
                }
            }),
            prisma.activity.findMany({
                where: activityWhere,
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    startDate: true,
                    endDate: true,
                    project: {
                        select: {
                            id: true,
                            title: true
                        }
                    }
                }
            })
        ]);
        // Grouper les activités par mois
        const monthlyStats = new Map();
        allActivities.forEach((activity) => {
            const date = new Date(activity.createdAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyStats.has(monthKey)) {
                monthlyStats.set(monthKey, { count: 0, completedCount: 0 });
            }
            const stats = monthlyStats.get(monthKey);
            stats.count++;
            if (activity.results) {
                stats.completedCount++;
            }
        });
        // Convertir en format de réponse
        const byMonth = Array.from(monthlyStats.entries()).map(([monthKey, stats]) => {
            const [year, month] = monthKey.split('-');
            const monthNames = [
                'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
            ];
            return {
                month: monthNames[parseInt(month) - 1],
                year: parseInt(year),
                count: stats.count,
                completedCount: stats.completedCount
            };
        }).sort((a, b) => {
            if (a.year !== b.year)
                return a.year - b.year;
            const monthIndex1 = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'].indexOf(a.month);
            const monthIndex2 = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'].indexOf(b.month);
            return monthIndex1 - monthIndex2;
        });
        const averagePerMonth = monthsToAnalyze > 0 ? Math.round(totalActivities / monthsToAnalyze) : 0;
        return {
            byMonth,
            total: totalActivities,
            withResults: activitiesWithResults,
            averagePerMonth,
            recentActivities: recentActivities.map((activity) => ({
                id: activity.id,
                title: activity.title,
                startDate: activity.startDate,
                endDate: activity.endDate,
                project: activity.project
            }))
        };
    }
    // ========== NOUVELLE MÉTHODE : Statistiques des formulaires ==========
    async getFormStatistics(userId, userRole, query) {
        switch (userRole) {
            case 'TECHNICIEN_SUPERIEUR':
                return this.getTechnicianFormStats(userId, query);
            case 'ASSISTANT_CHERCHEUR':
            case 'CHERCHEUR':
                return this.getParticipantFormStats(userId, query);
            case 'ADMINISTRATEUR':
                return this.getAdminFormStats(query);
            default:
                return this.getBasicFormStats(userId);
        }
    }
    // Statistiques formulaires pour technicien supérieur
    async getTechnicianFormStats(userId, query) {
        const [totalForms, activeForms, totalResponses, recentForms, responsesByForm] = await Promise.all([
            prisma.form.count({
                where: { creatorId: userId }
            }),
            prisma.form.count({
                where: {
                    creatorId: userId,
                    isActive: true
                }
            }),
            prisma.formResponse.count({
                where: {
                    form: { creatorId: userId }
                }
            }),
            prisma.form.findMany({
                where: { creatorId: userId },
                include: {
                    activity: {
                        select: {
                            title: true,
                            project: {
                                select: { title: true }
                            }
                        }
                    },
                    _count: {
                        select: { responses: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 5
            }),
            prisma.formResponse.groupBy({
                by: ['formId'],
                where: {
                    form: { creatorId: userId }
                },
                _count: true
            })
        ]);
        const averageResponsesPerForm = totalForms > 0 ? Math.round(totalResponses / totalForms) : 0;
        return {
            created: {
                total: totalForms,
                active: activeForms,
                inactive: totalForms - activeForms,
                totalResponses,
                averageResponsesPerForm,
                responsesByForm: responsesByForm.map((response) => ({
                    formId: response.formId,
                    responseCount: response._count
                })),
                recentForms: recentForms.map((form) => ({
                    id: form.id,
                    title: form.title,
                    createdAt: form.createdAt,
                    isActive: form.isActive,
                    responseCount: form._count.responses,
                    activity: form.activity
                }))
            }
        };
    }
    // Statistiques formulaires pour participants (assistant/chercheur)
    async getParticipantFormStats(userId, query) {
        const [formsToComplete, responsesSubmitted, pendingForms, recentResponses] = await Promise.all([
            // Formulaires actifs où l'utilisateur peut répondre mais n'a pas encore répondu
            prisma.form.count({
                where: {
                    isActive: true,
                    activity: {
                        project: {
                            participants: {
                                some: { userId }
                            }
                        }
                    },
                    responses: {
                        none: { respondentId: userId }
                    }
                }
            }),
            // Nombre total de réponses soumises par l'utilisateur
            prisma.formResponse.count({
                where: { respondentId: userId }
            }),
            // Liste des formulaires en attente
            prisma.form.findMany({
                where: {
                    isActive: true,
                    activity: {
                        project: {
                            participants: {
                                some: { userId }
                            }
                        }
                    },
                    responses: {
                        none: { respondentId: userId }
                    }
                },
                include: {
                    creator: {
                        select: {
                            firstName: true,
                            lastName: true
                        }
                    },
                    activity: {
                        select: {
                            title: true,
                            project: {
                                select: { title: true }
                            }
                        }
                    }
                },
                take: 5
            }),
            // Réponses récentes soumises
            prisma.formResponse.findMany({
                where: { respondentId: userId },
                include: {
                    form: {
                        select: {
                            id: true,
                            title: true,
                            activity: {
                                select: {
                                    title: true,
                                    project: {
                                        select: { title: true }
                                    }
                                }
                            }
                        }
                    }
                },
                orderBy: { submittedAt: 'desc' },
                take: 5
            })
        ]);
        return {
            participation: {
                formsToComplete,
                responsesSubmitted,
                pendingForms: pendingForms.map((form) => ({
                    id: form.id,
                    title: form.title,
                    creator: form.creator,
                    activity: form.activity
                })),
                recentResponses: recentResponses.map((response) => ({
                    formId: response.form.id,
                    formTitle: response.form.title,
                    submittedAt: response.submittedAt,
                    activity: response.form.activity
                }))
            }
        };
    }
    // Statistiques formulaires pour administrateur
    async getAdminFormStats(_query) {
        const [totalForms, activeForms, totalResponses, uniqueRespondents, topForms, responsesTrend] = await Promise.all([
            prisma.form.count(),
            prisma.form.count({
                where: { isActive: true }
            }),
            prisma.formResponse.count(),
            prisma.formResponse.groupBy({
                by: ['respondentId'],
                _count: { respondentId: true }
            }).then((result) => result.length),
            prisma.form.findMany({
                include: {
                    _count: { select: { responses: true } },
                    creator: {
                        select: {
                            firstName: true,
                            lastName: true
                        }
                    }
                },
                orderBy: {
                    responses: {
                        _count: 'desc'
                    }
                },
                take: 5
            }),
            // Tendance des réponses sur les 7 derniers jours
            this.getResponsesTrend(7)
        ]);
        const averageResponsesPerForm = totalForms > 0 ? Math.round(totalResponses / totalForms) : 0;
        return {
            overview: {
                totalForms,
                activeForms,
                totalResponses,
                uniqueRespondents,
                averageResponsesPerForm,
                topForms: topForms.map((form) => ({
                    id: form.id,
                    title: form.title,
                    creator: `${form.creator.firstName} ${form.creator.lastName}`,
                    responses: form._count.responses
                })),
                responsesTrend
            }
        };
    }
    // Statistiques formulaires de base
    async getBasicFormStats(userId) {
        const responsesSubmitted = await prisma.formResponse.count({
            where: { respondentId: userId }
        });
        return {
            participation: {
                formsToComplete: 0,
                responsesSubmitted,
                pendingForms: [],
                recentResponses: []
            }
        };
    }
    // Calculer les métriques de résumé (version améliorée avec formulaires)
    calculateSummaryMetrics(projectStats, taskStats, documentStats, activityStats, formStats) {
        // Score de productivité basé sur plusieurs facteurs
        const taskScore = Math.min(taskStats.completionRate, 100);
        const projectScore = projectStats.total > 0 ? Math.min((projectStats.userProjects / projectStats.total) * 100, 100) : 0;
        const documentScore = documentStats.total > 0 ? Math.min((documentStats.userDocuments / documentStats.total) * 100, 100) : 0;
        const activityScore = activityStats.total > 0 ? Math.min((activityStats.withResults / activityStats.total) * 100, 100) : 0;
        // Nouveau : Score d'engagement avec les formulaires
        let formEngagement = 0;
        if (formStats?.created) {
            // Pour les techniciens : basé sur le nombre de formulaires créés et les réponses reçues
            const { total, totalResponses } = formStats.created;
            formEngagement = total > 0 ? Math.min((totalResponses / (total * 5)) * 100, 100) : 0; // Assume 5 réponses moyennes par formulaire comme objectif
        }
        else if (formStats?.participation) {
            // Pour les participants : basé sur les réponses soumises vs formulaires disponibles
            const { responsesSubmitted, formsToComplete } = formStats.participation;
            const totalForms = responsesSubmitted + formsToComplete;
            formEngagement = totalForms > 0 ? Math.min((responsesSubmitted / totalForms) * 100, 100) : 0;
        }
        else if (formStats?.overview) {
            // Pour les admins : basé sur l'engagement global
            const { totalForms, totalResponses } = formStats.overview;
            formEngagement = totalForms > 0 ? Math.min((totalResponses / (totalForms * 3)) * 100, 100) : 0; // Assume 3 réponses moyennes par formulaire
        }
        const productivityScore = Math.round((taskScore + projectScore + documentScore + activityScore + formEngagement) / 5);
        // Tendance basée sur l'activité récente (simulation)
        const recentActivityCount = activityStats.byMonth.slice(-2).reduce((sum, month) => sum + month.count, 0);
        const previousActivityCount = activityStats.byMonth.slice(-4, -2).reduce((sum, month) => sum + month.count, 0);
        let trending;
        if (recentActivityCount > previousActivityCount) {
            trending = {
                direction: 'up',
                percentage: previousActivityCount > 0 ? Math.round(((recentActivityCount - previousActivityCount) / previousActivityCount) * 100) : 100,
                period: '2 derniers mois'
            };
        }
        else if (recentActivityCount < previousActivityCount) {
            trending = {
                direction: 'down',
                percentage: previousActivityCount > 0 ? Math.round(((previousActivityCount - recentActivityCount) / previousActivityCount) * 100) : 0,
                period: '2 derniers mois'
            };
        }
        else {
            trending = {
                direction: 'stable',
                percentage: 0,
                period: '2 derniers mois'
            };
        }
        return {
            productivityScore,
            taskCompletionRate: taskStats.completionRate,
            projectParticipation: projectStats.total > 0 ? Math.round((projectStats.userProjects / projectStats.total) * 100) : 0,
            documentContribution: documentStats.total > 0 ? Math.round((documentStats.userDocuments / documentStats.total) * 100) : 0,
            formEngagement: Math.round(formEngagement), // Nouvelle métrique
            trending
        };
    }
    // ========== MÉTHODES UTILITAIRES POUR LES FORMULAIRES ==========
    // Obtenir la tendance des réponses sur une période donnée
    async getResponsesTrend(days) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const responses = await prisma.formResponse.findMany({
            where: {
                submittedAt: { gte: startDate }
            },
            select: {
                submittedAt: true
            }
        });
        // Grouper par jour
        const trendByDay = responses.reduce((acc, response) => {
            const day = response.submittedAt.toISOString().split('T')[0];
            acc[day] = (acc[day] || 0) + 1;
            return acc;
        }, {});
        // Remplir les jours manquants avec 0
        const trend = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            trend.push({
                date: dateString,
                count: trendByDay[dateString] || 0
            });
        }
        return trend;
    }
    // Obtenir les statistiques de performance des formulaires d'un utilisateur
    async getFormPerformanceMetrics(userId, userRole, period = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period);
        if (userRole === 'TECHNICIEN_SUPERIEUR') {
            const [formsCreated, responsesReceived, avgResponseTime, completionRates] = await Promise.all([
                // Formulaires créés dans la période
                prisma.form.count({
                    where: {
                        creatorId: userId,
                        createdAt: { gte: startDate }
                    }
                }),
                // Réponses reçues dans la période
                prisma.formResponse.count({
                    where: {
                        form: { creatorId: userId },
                        submittedAt: { gte: startDate }
                    }
                }),
                // Temps moyen de réponse (simulé - en heures)
                24, // Placeholder - dans un vrai système, calculer à partir des timestamps
                // Taux de completion par formulaire
                this.getFormCompletionRates(userId)
            ]);
            return {
                period,
                formsCreated,
                responsesReceived,
                avgResponseTime,
                completionRates
            };
        }
        else {
            // Pour les autres rôles, statistiques de participation
            const responsesSubmitted = await prisma.formResponse.count({
                where: {
                    respondentId: userId,
                    submittedAt: { gte: startDate }
                }
            });
            return {
                period,
                responsesSubmitted,
                participationRate: 0 // Calculer selon la logique métier
            };
        }
    }
    // Obtenir les taux de completion par formulaire
    async getFormCompletionRates(userId) {
        const forms = await prisma.form.findMany({
            where: { creatorId: userId },
            include: {
                _count: { select: { responses: true } },
                activity: {
                    select: {
                        project: {
                            select: {
                                _count: { select: { participants: true } }
                            }
                        }
                    }
                }
            }
        });
        return forms.map((form) => {
            const expectedResponses = form.activity?.project?._count?.participants || 1;
            const actualResponses = form._count.responses;
            const completionRate = Math.min((actualResponses / expectedResponses) * 100, 100);
            return {
                formId: form.id,
                title: form.title,
                expectedResponses,
                actualResponses,
                completionRate: Math.round(completionRate)
            };
        });
    }
}
exports.DashboardService = DashboardService;
//# sourceMappingURL=dashboard.service.js.map