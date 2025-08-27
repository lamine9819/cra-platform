// src/controllers/dashboard.controller.ts - Version améliorée
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { DashboardService } from '../services/dashboard.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { z } from 'zod';

const prisma = new PrismaClient();

const dashboardQuerySchema = z.object({
  period: z.enum(['week', 'month', 'quarter', 'year']).default('month'),
  includeArchived: z.string().transform(val => val === 'true').default(false),
  detailed: z.string().transform(val => val === 'true').default(false),
  // Nouveaux paramètres
  includeForms: z.string().transform(val => val === 'true').default(true),
  formsPeriod: z.string().transform(Number).pipe(z.number().min(1).max(365)).default(30),
});

const dashboardService = new DashboardService();

export class DashboardController {

  // Endpoint principal du dashboard
  getDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const queryParams = dashboardQuerySchema.parse(req.query);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const dashboardData = await dashboardService.getDashboardData(userId, userRole, queryParams);

      res.status(200).json({
        success: true,
        data: dashboardData,
        generatedAt: new Date().toISOString(),
        period: queryParams.period,
      });
    } catch (error) {
      next(error);
    }
  };

  // Endpoint pour les statistiques rapides (amélioré)
  getQuickStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      // Statistiques rapides sans les détails
      const [taskCount, projectCount, documentCount, notificationCount, formStats] = await Promise.all([
        prisma.task.count({
          where: {
            OR: [
              { assigneeId: userId },
              { creatorId: userId }
            ],
            status: { notIn: ['TERMINEE', 'ANNULEE'] }
          }
        }),

        prisma.project.count({
          where: userRole === 'ADMINISTRATEUR' ? {} : {
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
        }),

        prisma.document.count({
          where: { ownerId: userId }
        }),

        prisma.notification.count({
          where: {
            receiverId: userId,
            isRead: false
          }
        }),

        // Nouvelles statistiques formulaires
        this.getQuickFormStats(userId, userRole)
      ]);

      const quickStats = {
        activeTasks: taskCount,
        activeProjects: projectCount,
        myDocuments: documentCount,
        unreadNotifications: notificationCount,
        ...formStats // Spread des statistiques formulaires
      };

      res.status(200).json({
        success: true,
        data: quickStats,
      });
    } catch (error) {
      next(error);
    }
  };

  // Endpoint pour les métriques de performance (amélioré)
  getPerformanceMetrics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [
        thisMonthTasks,
        lastMonthTasks,
        thisMonthActivities,
        lastMonthActivities,
        completedTasksThisMonth,
        completedTasksLastMonth,
        formMetrics // Nouvelles métriques formulaires
      ] = await Promise.all([
        prisma.task.count({
          where: {
            assigneeId: userId,
            createdAt: { gte: thisMonth }
          }
        }),

        prisma.task.count({
          where: {
            assigneeId: userId,
            createdAt: { gte: lastMonth, lt: thisMonth }
          }
        }),

        prisma.activity.count({
          where: {
            createdAt: { gte: thisMonth },
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
        }),

        prisma.activity.count({
          where: {
            createdAt: { gte: lastMonth, lt: thisMonth },
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
        }),

        prisma.task.count({
          where: {
            assigneeId: userId,
            status: 'TERMINEE',
            updatedAt: { gte: thisMonth }
          }
        }),

        prisma.task.count({
          where: {
            assigneeId: userId,
            status: 'TERMINEE',
            updatedAt: { gte: lastMonth, lt: thisMonth }
          }
        }),

        // Nouvelles métriques formulaires
        this.getFormPerformanceMetrics(userId, userRole, thisMonth, lastMonth)
      ]);

      const performanceMetrics = {
        taskTrend: {
          thisMonth: thisMonthTasks,
          lastMonth: lastMonthTasks,
          change: lastMonthTasks > 0 ? Math.round(((thisMonthTasks - lastMonthTasks) / lastMonthTasks) * 100) : 0,
          direction: thisMonthTasks > lastMonthTasks ? 'up' : thisMonthTasks < lastMonthTasks ? 'down' : 'stable'
        },
        activityTrend: {
          thisMonth: thisMonthActivities,
          lastMonth: lastMonthActivities,
          change: lastMonthActivities > 0 ? Math.round(((thisMonthActivities - lastMonthActivities) / lastMonthActivities) * 100) : 0,
          direction: thisMonthActivities > lastMonthActivities ? 'up' : thisMonthActivities < lastMonthActivities ? 'down' : 'stable'
        },
        completionRate: {
          thisMonth: thisMonthTasks > 0 ? Math.round((completedTasksThisMonth / thisMonthTasks) * 100) : 0,
          lastMonth: lastMonthTasks > 0 ? Math.round((completedTasksLastMonth / lastMonthTasks) * 100) : 0,
        },
        formTrend: formMetrics // Nouvelle métrique
      };

      res.status(200).json({
        success: true,
        data: performanceMetrics,
      });
    } catch (error) {
      next(error);
    }
  };

  // ========== NOUVELLES MÉTHODES POUR LES FORMULAIRES ==========

  // Endpoint spécialisé pour les statistiques de formulaires
  getFormStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;
      const { period = '30' } = req.query;

      const periodDays = parseInt(period as string);
      const formMetrics = await dashboardService.getFormPerformanceMetrics(userId, userRole, periodDays);

      res.status(200).json({
        success: true,
        data: formMetrics
      });
    } catch (error) {
      next(error);
    }
  };

  // Endpoint pour les statistiques de collecte de données
  getDataCollectionStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      let whereClause: any = {};

      if (userRole === 'TECHNICIEN_SUPERIEUR') {
        whereClause = { form: { creatorId: userId } };
      } else if (userRole === 'CHERCHEUR') {
        whereClause = {
          form: {
            activity: {
              project: { creatorId: userId }
            }
          }
        };
      } else if (userRole !== 'ADMINISTRATEUR') {
        whereClause = {
          form: {
            activity: {
              project: {
                participants: {
                  some: { userId }
                }
              }
            }
          }
        };
      }

      const [
        totalResponses,
        responsesByForm,
        recentResponses,
        responsesTrend
      ] = await Promise.all([
        prisma.formResponse.count({
          where: whereClause
        }),

        prisma.formResponse.groupBy({
          by: ['formId'],
          where: whereClause,
          _count: true
        }),

        prisma.formResponse.findMany({
          where: whereClause,
          include: {
            form: {
              select: {
                title: true,
                activity: {
                  select: {
                    title: true,
                    project: { select: { title: true } }
                  }
                }
              }
            },
            respondent: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { submittedAt: 'desc' },
          take: 10
        }),

        // Tendance sur 7 jours
        this.getResponsesTrendForUser(userId, userRole, 7)
      ]);

      res.status(200).json({
        success: true,
        data: {
          totalResponses,
          responsesByForm: responsesByForm.length,
          recentResponses,
          trend: responsesTrend
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // ========== MÉTHODES UTILITAIRES PRIVÉES ==========

  // Statistiques formulaires rapides selon le rôle
  private async getQuickFormStats(userId: string, userRole: string) {
    switch (userRole) {
      case 'TECHNICIEN_SUPERIEUR':
        const [myForms, pendingResponses] = await Promise.all([
          prisma.form.count({ where: { creatorId: userId } }),
          prisma.form.count({
            where: {
              creatorId: userId,
              isActive: true,
              responses: { some: {} }
            }
          })
        ]);
        return { myForms, formsWithResponses: pendingResponses };

      case 'ASSISTANT_CHERCHEUR':
      case 'CHERCHEUR':
        const [pendingForms, responsesSubmitted] = await Promise.all([
          prisma.form.count({
            where: {
              isActive: true,
              activity: {
                project: {
                  participants: { some: { userId } }
                }
              },
              responses: { none: { respondentId: userId } }
            }
          }),
          prisma.formResponse.count({ where: { respondentId: userId } })
        ]);
        return { pendingForms, responsesSubmitted };

      case 'ADMINISTRATEUR':
        const [totalForms, totalResponses] = await Promise.all([
          prisma.form.count(),
          prisma.formResponse.count()
        ]);
        return { totalForms, totalResponses };

      default:
        const userResponses = await prisma.formResponse.count({
          where: { respondentId: userId }
        });
        return { responsesSubmitted: userResponses };
    }
  }

  // Métriques de performance des formulaires
  private async getFormPerformanceMetrics(userId: string, userRole: string, thisMonth: Date, lastMonth: Date) {
    if (userRole === 'TECHNICIEN_SUPERIEUR') {
      const [thisMonthForms, lastMonthForms, thisMonthResponses, lastMonthResponses] = await Promise.all([
        prisma.form.count({
          where: {
            creatorId: userId,
            createdAt: { gte: thisMonth }
          }
        }),

        prisma.form.count({
          where: {
            creatorId: userId,
            createdAt: { gte: lastMonth, lt: thisMonth }
          }
        }),

        prisma.formResponse.count({
          where: {
            form: { creatorId: userId },
            submittedAt: { gte: thisMonth }
          }
        }),

        prisma.formResponse.count({
          where: {
            form: { creatorId: userId },
            submittedAt: { gte: lastMonth, lt: thisMonth }
          }
        })
      ]);

      return {
        thisMonth: thisMonthForms,
        lastMonth: lastMonthForms,
        responsesThisMonth: thisMonthResponses,
        responsesLastMonth: lastMonthResponses,
        change: lastMonthForms > 0 ? Math.round(((thisMonthForms - lastMonthForms) / lastMonthForms) * 100) : 0,
        direction: thisMonthForms > lastMonthForms ? 'up' : thisMonthForms < lastMonthForms ? 'down' : 'stable'
      };
    } else {
      // Pour les autres rôles, analyser les réponses soumises
      const [thisMonthResponses, lastMonthResponses] = await Promise.all([
        prisma.formResponse.count({
          where: {
            respondentId: userId,
            submittedAt: { gte: thisMonth }
          }
        }),

        prisma.formResponse.count({
          where: {
            respondentId: userId,
            submittedAt: { gte: lastMonth, lt: thisMonth }
          }
        })
      ]);

      return {
        thisMonth: thisMonthResponses,
        lastMonth: lastMonthResponses,
        change: lastMonthResponses > 0 ? Math.round(((thisMonthResponses - lastMonthResponses) / lastMonthResponses) * 100) : 0,
        direction: thisMonthResponses > lastMonthResponses ? 'up' : thisMonthResponses < lastMonthResponses ? 'down' : 'stable'
      };
    }
  }

  // Tendance des réponses pour un utilisateur spécifique
  private async getResponsesTrendForUser(userId: string, userRole: string, days: number) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let whereClause: any = {};

    if (userRole === 'TECHNICIEN_SUPERIEUR') {
      whereClause = {
        form: { creatorId: userId },
        submittedAt: { gte: startDate }
      };
    } else if (userRole !== 'ADMINISTRATEUR') {
      whereClause = {
        respondentId: userId,
        submittedAt: { gte: startDate }
      };
    } else {
      whereClause = {
        submittedAt: { gte: startDate }
      };
    }

    const responses = await prisma.formResponse.findMany({
      where: whereClause,
      select: { submittedAt: true }
    });

    // Grouper par jour
    const trendByDay = responses.reduce((acc:any, response:any) => {
      const day = response.submittedAt.toISOString().split('T')[0];
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Remplir les jours manquants
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
}