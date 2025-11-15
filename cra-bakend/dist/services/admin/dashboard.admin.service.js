"use strict";
// src/services/admin/dashboard.admin.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardAdminService = exports.DashboardAdminService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Service pour gérer le dashboard administrateur
 */
class DashboardAdminService {
    /**
     * Récupère toutes les données du dashboard
     */
    async getDashboardData(filters) {
        const [summary, recentActivity, alerts, charts] = await Promise.all([
            this.getDashboardSummary(filters),
            this.getRecentActivity(20),
            this.getSystemAlerts(),
            this.getChartsData(),
        ]);
        return {
            summary,
            recentActivity,
            alerts,
            charts,
            generatedAt: new Date(),
        };
    }
    /**
     * Récupère le résumé des statistiques globales
     */
    async getDashboardSummary(filters) {
        const [users, activities, projects, themes, stations, transfers, notifications] = await Promise.all([
            this.getUserStats(),
            this.getActivityStats(filters),
            this.getProjectStats(),
            this.getThemeStats(),
            this.getStationStats(),
            this.getTransferStats(),
            this.getNotificationStats(),
        ]);
        return {
            users,
            activities,
            projects,
            themes,
            stations,
            transfers,
            notifications,
        };
    }
    /**
     * Statistiques des utilisateurs
     */
    async getUserStats() {
        const [total, byRole, active] = await Promise.all([
            prisma.user.count(),
            prisma.user.groupBy({
                by: ['role'],
                _count: true,
            }),
            prisma.user.count({ where: { isActive: true } }),
        ]);
        const byRoleMap = {
            CHERCHEUR: 0,
            COORDONATEUR_PROJET: 0,
            ADMINISTRATEUR: 0,
        };
        byRole.forEach((item) => {
            byRoleMap[item.role] = item._count;
        });
        return {
            total,
            active,
            inactive: total - active,
            byRole: byRoleMap,
        };
    }
    /**
     * Statistiques des activités
     */
    async getActivityStats(filters) {
        const whereClause = {};
        if (filters?.startDate)
            whereClause.createdAt = { gte: filters.startDate };
        if (filters?.endDate)
            whereClause.createdAt = { ...whereClause.createdAt, lte: filters.endDate };
        if (filters?.themeId)
            whereClause.themeId = filters.themeId;
        if (filters?.stationId)
            whereClause.stationId = filters.stationId;
        const [total, byType, byStatus, byTheme, newVsReconducted, withProjects, withoutProjects,] = await Promise.all([
            prisma.activity.count({ where: whereClause }),
            prisma.activity.groupBy({
                by: ['type'],
                where: whereClause,
                _count: true,
            }),
            prisma.activity.groupBy({
                by: ['lifecycleStatus'],
                where: whereClause,
                _count: true,
            }),
            prisma.activity.groupBy({
                by: ['themeId'],
                where: whereClause,
                _count: true,
                take: 10,
                orderBy: { _count: { themeId: 'desc' } },
            }),
            prisma.activity.groupBy({
                by: ['lifecycleStatus'],
                where: whereClause,
                _count: true,
            }),
            prisma.activity.count({
                where: { ...whereClause, projectId: { not: null } },
            }),
            prisma.activity.count({
                where: { ...whereClause, projectId: null },
            }),
        ]);
        // Construire le mapping des types
        const byTypeMap = {};
        byType.forEach((item) => {
            byTypeMap[item.type] = item._count;
        });
        // Construire le mapping des statuts
        const byStatusMap = {};
        byStatus.forEach((item) => {
            byStatusMap[item.lifecycleStatus] = item._count;
        });
        // Récupérer les noms des thèmes
        const themeIds = byTheme.map((item) => item.themeId);
        const themes = await prisma.researchTheme.findMany({
            where: { id: { in: themeIds } },
            select: { id: true, name: true },
        });
        const themeMap = new Map(themes.map((t) => [t.id, t.name]));
        const byThemeData = byTheme.map((item) => ({
            themeId: item.themeId,
            themeName: themeMap.get(item.themeId) || 'Inconnu',
            count: item._count,
        }));
        // Calculer new vs reconducted
        const newCount = newVsReconducted.find((item) => item.lifecycleStatus === 'NOUVELLE')?._count || 0;
        const reconductedCount = newVsReconducted.find((item) => item.lifecycleStatus === 'RECONDUITE')?._count || 0;
        return {
            total,
            byType: byTypeMap,
            byStatus: byStatusMap,
            byTheme: byThemeData,
            newVsReconducted: {
                new: newCount,
                reconducted: reconductedCount,
            },
            withProjects,
            withoutProjects,
        };
    }
    /**
     * Statistiques des projets
     */
    async getProjectStats() {
        const [total, byStatus] = await Promise.all([
            prisma.project.count(),
            prisma.project.groupBy({
                by: ['status'],
                _count: true,
            }),
        ]);
        const byStatusMap = {};
        byStatus.forEach((item) => {
            byStatusMap[item.status] = item._count;
        });
        return {
            total,
            byStatus: byStatusMap,
        };
    }
    /**
     * Statistiques des thèmes de recherche
     */
    async getThemeStats() {
        const [total, active, topThemes] = await Promise.all([
            prisma.researchTheme.count(),
            prisma.researchTheme.count({ where: { isActive: true } }),
            prisma.researchTheme.findMany({
                take: 10,
                include: {
                    _count: {
                        select: { activities: true },
                    },
                },
                orderBy: {
                    activities: {
                        _count: 'desc',
                    },
                },
            }),
        ]);
        return {
            total,
            active,
            topThemes: topThemes.map((theme) => ({
                id: theme.id,
                name: theme.name,
                activityCount: theme._count.activities,
            })),
        };
    }
    /**
     * Statistiques des stations de recherche
     */
    async getStationStats() {
        const [total, topStations] = await Promise.all([
            prisma.researchStation.count(),
            prisma.researchStation.findMany({
                take: 10,
                include: {
                    _count: {
                        select: { activities: true },
                    },
                },
                orderBy: {
                    activities: {
                        _count: 'desc',
                    },
                },
            }),
        ]);
        return {
            total,
            topStations: topStations.map((station) => ({
                id: station.id,
                name: station.name,
                activityCount: station._count.activities,
            })),
        };
    }
    /**
     * Statistiques des transferts d'acquis
     */
    async getTransferStats() {
        const [total, byType] = await Promise.all([
            prisma.knowledgeTransfer.count(),
            prisma.knowledgeTransfer.groupBy({
                by: ['type'],
                _count: true,
            }),
        ]);
        const byTypeMap = {};
        byType.forEach((item) => {
            byTypeMap[item.type] = item._count;
        });
        return {
            total,
            byType: byTypeMap,
        };
    }
    /**
     * Statistiques des notifications
     */
    async getNotificationStats() {
        const [total, read] = await Promise.all([
            prisma.notification.count(),
            prisma.notification.count({ where: { isRead: true } }),
        ]);
        return {
            total,
            read,
            unread: total - read,
            readRate: total > 0 ? Math.round((read / total) * 100) : 0,
        };
    }
    /**
     * Récupère l'activité récente du système depuis les audit logs
     */
    async getRecentActivity(limit = 20) {
        const auditLogs = await prisma.auditLog.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        return auditLogs.map((log) => ({
            id: log.id,
            action: log.action,
            entityType: log.entityType,
            entityId: log.entityId,
            userId: log.userId,
            userName: log.user
                ? `${log.user.firstName || ''} ${log.user.lastName || ''}`.trim()
                : null,
            userEmail: log.user?.email || null,
            timestamp: log.createdAt,
            details: log.details,
            level: log.level,
        }));
    }
    /**
     * Génère les alertes système
     */
    async getSystemAlerts() {
        const alerts = [];
        // Alertes parallélisées pour performance
        const [inactiveUsers, activitiesWithoutResponsible, lateProjects, upcomingActivities, lateTasks, oldUnreadNotifications,] = await Promise.all([
            this.getInactiveUsers(),
            this.getActivitiesWithoutResponsible(),
            this.getLateProjects(),
            this.getUpcomingActivities(),
            this.getLateTasks(),
            this.getOldUnreadNotifications(),
        ]);
        if (inactiveUsers.count > 0) {
            alerts.push({
                type: 'warning',
                title: 'Utilisateurs inactifs',
                message: `${inactiveUsers.count} utilisateur(s) n'ont pas été actifs depuis plus de 90 jours`,
                count: inactiveUsers.count,
                entityIds: inactiveUsers.ids,
                priority: 2,
            });
        }
        if (activitiesWithoutResponsible.count > 0) {
            alerts.push({
                type: 'error',
                title: 'Activités sans responsable',
                message: `${activitiesWithoutResponsible.count} activité(s) n'ont pas de responsable assigné`,
                count: activitiesWithoutResponsible.count,
                entityIds: activitiesWithoutResponsible.ids,
                priority: 1,
            });
        }
        if (lateProjects.count > 0) {
            alerts.push({
                type: 'error',
                title: 'Projets en retard',
                message: `${lateProjects.count} projet(s) ont dépassé leur date de fin`,
                count: lateProjects.count,
                entityIds: lateProjects.ids,
                priority: 1,
            });
        }
        if (upcomingActivities.count > 0) {
            alerts.push({
                type: 'info',
                title: 'Activités approchant de leur échéance',
                message: `${upcomingActivities.count} activité(s) se terminent dans moins de 7 jours`,
                count: upcomingActivities.count,
                entityIds: upcomingActivities.ids,
                priority: 2,
            });
        }
        if (lateTasks.count > 0) {
            alerts.push({
                type: 'warning',
                title: 'Tâches en retard',
                message: `${lateTasks.count} tâche(s) sont en retard`,
                count: lateTasks.count,
                entityIds: lateTasks.ids,
                priority: 2,
            });
        }
        if (oldUnreadNotifications.count > 0) {
            alerts.push({
                type: 'info',
                title: 'Notifications non lues anciennes',
                message: `${oldUnreadNotifications.count} notification(s) non lues depuis plus de 30 jours`,
                count: oldUnreadNotifications.count,
                priority: 3,
            });
        }
        // Trier les alertes par priorité
        return alerts.sort((a, b) => a.priority - b.priority);
    }
    /**
     * Méthodes privées pour les alertes
     */
    async getInactiveUsers() {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        // Since User model doesn't have lastLoginAt, check users with no recent activity
        const users = await prisma.user.findMany({
            where: {
                isActive: true,
                updatedAt: {
                    lt: ninetyDaysAgo,
                },
            },
            select: { id: true },
        });
        return {
            count: users.length,
            ids: users.map((u) => u.id),
        };
    }
    async getActivitiesWithoutResponsible() {
        // Get activities without responsible or with empty string responsible
        const allActivities = await prisma.activity.findMany({
            where: {
                lifecycleStatus: { notIn: ['CLOTUREE'] },
            },
            select: { id: true, responsibleId: true },
        });
        const activities = allActivities.filter(a => !a.responsibleId || a.responsibleId === '');
        return {
            count: activities.length,
            ids: activities.map((a) => a.id),
        };
    }
    async getLateProjects() {
        const now = new Date();
        const projects = await prisma.project.findMany({
            where: {
                endDate: {
                    lt: now,
                },
                status: {
                    notIn: ['TERMINE', 'ARCHIVE'],
                },
            },
            select: { id: true },
        });
        return {
            count: projects.length,
            ids: projects.map((p) => p.id),
        };
    }
    async getUpcomingActivities() {
        const now = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        const activities = await prisma.activity.findMany({
            where: {
                endDate: {
                    gte: now,
                    lte: sevenDaysFromNow,
                },
                lifecycleStatus: { notIn: ['CLOTUREE'] },
            },
            select: { id: true },
        });
        return {
            count: activities.length,
            ids: activities.map((a) => a.id),
        };
    }
    async getLateTasks() {
        const now = new Date();
        const tasks = await prisma.task.findMany({
            where: {
                dueDate: {
                    lt: now,
                },
                status: {
                    notIn: ['TERMINEE', 'ANNULEE'],
                },
            },
            select: { id: true },
        });
        return {
            count: tasks.length,
            ids: tasks.map((t) => t.id),
        };
    }
    async getOldUnreadNotifications() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const count = await prisma.notification.count({
            where: {
                isRead: false,
                createdAt: {
                    lt: thirtyDaysAgo,
                },
            },
        });
        return {
            count,
        };
    }
    /**
     * Récupère les données pour les graphiques
     */
    async getChartsData() {
        const [activitiesPerMonth, usersPerMonth, projectsPerMonth, taskCompletionRate, transfersPerMonth,] = await Promise.all([
            this.getActivitiesPerMonth(),
            this.getUsersPerMonth(),
            this.getProjectsPerMonth(),
            this.getTaskCompletionRate(),
            this.getTransfersPerMonth(),
        ]);
        return {
            activitiesPerMonth,
            usersPerMonth,
            projectsPerMonth,
            taskCompletionRate,
            transfersPerMonth,
        };
    }
    /**
     * Activités créées par mois (6 derniers mois)
     */
    async getActivitiesPerMonth() {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const activities = await prisma.activity.findMany({
            where: {
                createdAt: {
                    gte: sixMonthsAgo,
                },
            },
            select: {
                createdAt: true,
            },
        });
        return this.groupByMonth(activities);
    }
    /**
     * Utilisateurs créés par mois (6 derniers mois)
     */
    async getUsersPerMonth() {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const users = await prisma.user.findMany({
            where: {
                createdAt: {
                    gte: sixMonthsAgo,
                },
            },
            select: {
                createdAt: true,
            },
        });
        return this.groupByMonth(users);
    }
    /**
     * Projets créés par mois (6 derniers mois)
     */
    async getProjectsPerMonth() {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const projects = await prisma.project.findMany({
            where: {
                createdAt: {
                    gte: sixMonthsAgo,
                },
            },
            select: {
                createdAt: true,
            },
        });
        return this.groupByMonth(projects);
    }
    /**
     * Transferts créés par mois (6 derniers mois)
     */
    async getTransfersPerMonth() {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const transfers = await prisma.knowledgeTransfer.findMany({
            where: {
                createdAt: {
                    gte: sixMonthsAgo,
                },
            },
            select: {
                createdAt: true,
            },
        });
        return this.groupByMonth(transfers);
    }
    /**
     * Taux de complétion des tâches par semaine (4 dernières semaines)
     */
    async getTaskCompletionRate() {
        const fourWeeksAgo = new Date();
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
        const [allTasks, completedTasks] = await Promise.all([
            prisma.task.findMany({
                where: {
                    createdAt: {
                        gte: fourWeeksAgo,
                    },
                },
                select: {
                    createdAt: true,
                },
            }),
            prisma.task.findMany({
                where: {
                    createdAt: {
                        gte: fourWeeksAgo,
                    },
                    status: 'TERMINEE',
                },
                select: {
                    createdAt: true,
                },
            }),
        ]);
        return this.calculateWeeklyCompletionRate(allTasks, completedTasks);
    }
    /**
     * Groupe les éléments par mois
     */
    groupByMonth(items) {
        const monthMap = new Map();
        // Initialiser les 6 derniers mois avec 0
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthMap.set(monthKey, 0);
        }
        // Compter les éléments par mois
        items.forEach((item) => {
            const date = new Date(item.createdAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
        });
        return Array.from(monthMap.entries())
            .map(([month, count]) => ({ month, count }))
            .sort((a, b) => a.month.localeCompare(b.month));
    }
    /**
     * Calcule le taux de complétion par semaine
     */
    calculateWeeklyCompletionRate(allTasks, completedTasks) {
        const weekMap = new Map();
        // Initialiser les 4 dernières semaines
        for (let i = 3; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i * 7);
            const weekKey = this.getWeekKey(date);
            weekMap.set(weekKey, { total: 0, completed: 0 });
        }
        // Compter toutes les tâches
        allTasks.forEach((task) => {
            const weekKey = this.getWeekKey(new Date(task.createdAt));
            const data = weekMap.get(weekKey);
            if (data) {
                data.total++;
            }
        });
        // Compter les tâches complétées
        completedTasks.forEach((task) => {
            const weekKey = this.getWeekKey(new Date(task.createdAt));
            const data = weekMap.get(weekKey);
            if (data) {
                data.completed++;
            }
        });
        return Array.from(weekMap.entries())
            .map(([week, data]) => ({
            week,
            rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
        }))
            .sort((a, b) => a.week.localeCompare(b.week));
    }
    /**
     * Obtient la clé de semaine au format ISO (YYYY-WXX)
     */
    getWeekKey(date) {
        const year = date.getFullYear();
        const onejan = new Date(year, 0, 1);
        const week = Math.ceil(((date.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
        return `${year}-W${String(week).padStart(2, '0')}`;
    }
}
exports.DashboardAdminService = DashboardAdminService;
exports.dashboardAdminService = new DashboardAdminService();
//# sourceMappingURL=dashboard.admin.service.js.map