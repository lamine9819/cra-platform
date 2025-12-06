// src/services/report.service.ts

import { PrismaClient } from '@prisma/client';
import {
  ActivityReport,
  ConventionReport,
  KnowledgeTransferReport,
  Quarter
} from '../types/reports.types';
import { GenerateReportInput } from '../utils/report.validation';
import { quarterService } from './quarter.service';

const prisma = new PrismaClient();

export class ReportService {
  /**
   * Récupère les données des activités pour le rapport trimestriel
   */
  async getActivitiesData(filters: GenerateReportInput): Promise<ActivityReport[]> {
    const period = quarterService.getReportPeriod(filters);
    
    const whereClause: any = {
      OR: [
        {
          // Activités qui ont commencé pendant le trimestre
          startDate: {
            gte: period.startDate,
            lte: period.endDate
          }
        },
        {
          // Activités en cours pendant le trimestre
          AND: [
            {
              startDate: {
                lte: period.endDate
              }
            },
            {
              OR: [
                { endDate: { gte: period.startDate } },
                { endDate: null }
              ]
            }
          ]
        }
      ]
    };

    if (filters.themeId) {
      whereClause.themeId = filters.themeId;
    }

    if (filters.stationId) {
      whereClause.stationId = filters.stationId;
    }

    if (!filters.includeArchived) {
      whereClause.status = {
        not: 'CLOTUREE'
      };
    }

    const activities = await prisma.activity.findMany({
      where: whereClause,
      include: {
        responsible: {
          select: {
            firstName: true,
            lastName: true,
            discipline: true
          }
        },
        participants: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                discipline: true
              }
            }
          }
        },
        theme: {
          select: {
            name: true,
            program: {
              select: {
                name: true,
                code: true
              }
            }
          }
        },
        station: {
          select: {
            name: true,
            location: true
          }
        }
      },
      orderBy: [
        { lifecycleStatus: 'asc' },
        { startDate: 'desc' }
      ]
    });

    return activities.map(activity => ({
      intitule: activity.title,
      responsables: [
        `${activity.responsible.firstName} ${activity.responsible.lastName}`,
        ...activity.participants
          .filter(p => p.role === 'RESPONSABLE' || p.role === 'CO_RESPONSABLE')
          .map(p => `${p.user.firstName} ${p.user.lastName}`)
      ],
      situation: this.mapActivityStatus(activity.lifecycleStatus),
      description: activity.description || undefined,
      startDate: activity.startDate || undefined,
      endDate: activity.endDate || undefined,
      quarter: filters.quarter,
      year: filters.year
    }));
  }

  /**
   * Récupère les données des conventions pour le rapport trimestriel
   */
  async getConventionsData(filters: GenerateReportInput): Promise<ConventionReport[]> {
    const period = quarterService.getReportPeriod(filters);
    
    const whereClause: any = {
      OR: [
        {
          // Conventions qui ont démarré pendant le trimestre
          startDate: {
            gte: period.startDate,
            lte: period.endDate
          }
        },
        {
          // Conventions actives pendant le trimestre
          AND: [
            {
              startDate: {
                lte: period.endDate
              }
            },
            {
              OR: [
                { endDate: { gte: period.startDate } },
                { endDate: null }
              ]
            }
          ]
        },
        {
          // Conventions clôturées pendant le trimestre
          endDate: {
            gte: period.startDate,
            lte: period.endDate
          },
          status: 'CLOTUREE'
        }
      ]
    };

    const conventions = await prisma.convention.findMany({
      where: whereClause,
      include: {
        // fundings: {
        //   select: {
        //     fundingSource: true,
        //     approvedAmount: true,
        //     receivedAmount: true,
        //     currency: true
        //   }
        // },
        activities: {
          select: {
            title: true,
            code: true
          }
        },
        responsibleUser: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    });

    return conventions.map(conv => {
      const financementGlobal = conv.totalBudget || 0;
      // TODO: Restaurer fundings quand la relation sera disponible dans le schéma Prisma
      const financementMobilise = 0; // conv.fundings?.reduce((sum, f) => sum + (f.receivedAmount || 0), 0) || 0;

      return {
        intitule: conv.title,
        dateDebut: conv.startDate || new Date(),
        dateFin: conv.endDate || new Date(),
        financementGlobal,
        financementMobilise,
        bailleurs: [conv.mainPartner, ...conv.otherPartners],
        description: conv.description || undefined,
        quarter: filters.quarter,
        year: filters.year
      };
    });
  }

  /**
   * Récupère les données des transferts de connaissances pour le rapport trimestriel
   */
  async getKnowledgeTransfersData(
    filters: GenerateReportInput
  ): Promise<KnowledgeTransferReport[]> {
    const period = quarterService.getReportPeriod(filters);
    
    const whereClause: any = {
      date: {
        gte: period.startDate,
        lte: period.endDate
      }
    };

    if (filters.themeId) {
      whereClause.activity = {
        themeId: filters.themeId
      };
    }

    const transfers = await prisma.knowledgeTransfer.findMany({
      where: whereClause,
      include: {
        organizer: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        activity: {
          select: {
            title: true,
            theme: {
              select: {
                name: true,
                program: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    return transfers.map(transfer => ({
      intitule: transfer.title,
      dateDisponibilite: transfer.date,
      description: transfer.description || '',
      impactPotentiel: transfer.impact || 'À évaluer',
      cibles: transfer.targetAudience,
      quarter: filters.quarter,
      year: filters.year
    }));
  }

  /**
   * Obtient les statistiques trimestrielles
   */
  async getQuarterlyStatistics(filters: GenerateReportInput) {
    const period = quarterService.getReportPeriod(filters);
    
    const [
      totalActivities,
      newActivities,
      reconductedActivities,
      closedActivities,
      totalConventions,
      totalTransfers,
      totalBudget
    ] = await Promise.all([
      // Total des activités actives
      prisma.activity.count({
        where: {
          OR: [
            {
              startDate: {
                gte: period.startDate,
                lte: period.endDate
              }
            },
            {
              AND: [
                { startDate: { lte: period.endDate } },
                {
                  OR: [
                    { endDate: { gte: period.startDate } },
                    { endDate: null }
                  ]
                }
              ]
            }
          ]
        }
      }),
      // Nouvelles activités
      prisma.activity.count({
        where: {
          lifecycleStatus: 'NOUVELLE',
          startDate: {
            gte: period.startDate,
            lte: period.endDate
          }
        }
      }),
      // Activités reconduites
      prisma.activity.count({
        where: {
          lifecycleStatus: 'RECONDUITE',
          startDate: {
            gte: period.startDate,
            lte: period.endDate
          }
        }
      }),
      // Activités clôturées
      prisma.activity.count({
        where: {
          lifecycleStatus: 'CLOTUREE',
          endDate: {
            gte: period.startDate,
            lte: period.endDate
          }
        }
      }),
      // Total conventions
      prisma.convention.count({
        where: {
          OR: [
            {
              startDate: {
                gte: period.startDate,
                lte: period.endDate
              }
            },
            {
              AND: [
                { startDate: { lte: period.endDate } },
                {
                  OR: [
                    { endDate: { gte: period.startDate } },
                    { endDate: null }
                  ]
                }
              ]
            }
          ]
        }
      }),
      // Total transferts
      prisma.knowledgeTransfer.count({
        where: {
          date: {
            gte: period.startDate,
            lte: period.endDate
          }
        }
      }),
      // Budget total mobilisé
      prisma.activityFunding.aggregate({
        where: {
          activity: {
            OR: [
              {
                startDate: {
                  gte: period.startDate,
                  lte: period.endDate
                }
              },
              {
                AND: [
                  { startDate: { lte: period.endDate } },
                  {
                    OR: [
                      { endDate: { gte: period.startDate } },
                      { endDate: null }
                    ]
                  }
                ]
              }
            ]
          }
        },
        _sum: {
          receivedAmount: true
        }
      })
    ]);

    // Calculer le budget global des conventions
    const conventionsWithBudget = await prisma.convention.findMany({
      where: {
        OR: [
          {
            startDate: {
              gte: period.startDate,
              lte: period.endDate
            }
          },
          {
            AND: [
              { startDate: { lte: period.endDate } },
              {
                OR: [
                  { endDate: { gte: period.startDate } },
                  { endDate: null }
                ]
              }
            ]
          }
        ]
      },
      select: {
        totalBudget: true
      }
    });

    const totalGlobal = conventionsWithBudget.reduce((sum, conv) => sum + (conv.totalBudget || 0), 0);

    return {
      period: period.label,
      activities: {
        total: totalActivities,
        new: newActivities,
        reconducted: reconductedActivities,
        closed: closedActivities
      },
      conventions: {
        total: totalConventions
      },
      transfers: {
        total: totalTransfers
      },
      budget: {
        totalGlobal: totalGlobal,
        totalMobilized: totalBudget._sum.receivedAmount || 0
      }
    };
  }

  /**
   * Mappe le statut d'activité Prisma vers le format du rapport
   */
  private mapActivityStatus(
    status: string
  ): 'Reconduite' | 'Nouvelle' | 'Cloturee' {
    switch (status) {
      case 'RECONDUITE':
        return 'Reconduite';
      case 'CLOTUREE':
        return 'Cloturee';
      case 'NOUVELLE':
      default:
        return 'Nouvelle';
    }
  }

  /**
   * Formate une date pour l'affichage dans les rapports
   */
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  }

  /**
   * Formate un montant en devise
   */
  formatCurrency(amount: number, currency: string = 'XOF'): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  }
}

export const reportService = new ReportService();