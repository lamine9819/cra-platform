// src/services/activity.service.ts - Version CRA corrigée et complète
import { PrismaClient } from '@prisma/client';
import { ValidationError, AuthError } from '../utils/errors';
import {
  CreateActivityRequest,
  UpdateActivityRequest,
  ActivityListQuery,
  ActivityResponse,
  ActivityRecurrenceRequest,
  CRAActivityStats,
  ActivityType,
  ActivityLifecycleStatus
} from '../types/activity.types';
import {
  AddActivityPartnerInput,UpdateFundingInput,
  AddFundingInput,UpdateActivityPartnerInput,
  CreateTaskInput, UpdateTaskInput,
  CreateCommentInput, UpdateCommentInput,LinkKnowledgeTransferInput,ReassignTaskInput,
  AddParticipantInput,
  UpdateParticipantInput } from '@/utils/activityValidation';

const prisma = new PrismaClient();

export class ActivityService {

  // ✅ Créer une activité CRA
  async createActivity(activityData: CreateActivityRequest, userId: string, userRole: string): Promise<ActivityResponse> {
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
        throw new ValidationError('Projet non trouvé');
      }

      const hasAccess = this.checkProjectAccess(project, userId, userRole);
      if (!hasAccess) {
        throw new AuthError('Accès refusé à ce projet');
      }

      if (project.status === 'ARCHIVE') {
        throw new ValidationError('Impossible de créer une activité dans un projet archivé');
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
        lifecycleStatus: activityData.lifecycleStatus || ActivityLifecycleStatus.NOUVELLE,
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
  async listActivities(userId: string, userRole: string, query: ActivityListQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Construire les filtres
    const where: any = {};

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
    if (query.themeId) where.themeId = query.themeId;
    if (query.stationId) where.stationId = query.stationId;
    if (query.responsibleId) where.responsibleId = query.responsibleId;
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    if (query.lifecycleStatus) where.lifecycleStatus = query.lifecycleStatus;
    if (query.conventionId) where.conventionId = query.conventionId;
    if (query.projectId) where.projectId = query.projectId;
    
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
      } else {
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
    if (userRole !== 'ADMINISTRATEUR') {
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
  async getActivityById(activityId: string, userId: string, userRole: string): Promise<ActivityResponse> {
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
      throw new ValidationError('Activité non trouvée');
    }

    // Vérifier les droits d'accès
    const hasAccess = this.checkActivityAccess(activity, userId, userRole);
    if (!hasAccess) {
      throw new AuthError('Accès refusé à cette activité');
    }

    return this.formatActivityResponse(activity);
  }

  // ✅ Mettre à jour une activité CRA
  async updateActivity(activityId: string, updateData: UpdateActivityRequest, userId: string, userRole: string): Promise<ActivityResponse> {
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
      throw new ValidationError('Activité non trouvée');
    }

    // Vérifier les droits d'accès et de modification
    const hasAccess = this.checkActivityAccess(activity, userId, userRole);
    if (!hasAccess) {
      throw new AuthError('Accès refusé à cette activité');
    }

    const canModify = this.checkActivityModifyRights(activity, userId, userRole);
    if (!canModify) {
      throw new AuthError('Permissions insuffisantes pour modifier cette activité');
    }

    // Validation des changements CRA
    if (updateData.themeId && updateData.themeId !== activity.themeId) {
      const theme = await prisma.researchTheme.findUnique({
        where: { id: updateData.themeId }
      });
      if (!theme) {
        throw new ValidationError('Nouveau thème non trouvé');
      }
    }

    if (updateData.responsibleId && updateData.responsibleId !== activity.responsibleId) {
      const responsible = await prisma.user.findUnique({
        where: { id: updateData.responsibleId }
      });
      if (!responsible || !['CHERCHEUR', 'COORDONATEUR_PROJET'].includes(responsible.role)) {
        throw new ValidationError('Le nouveau responsable doit être un chercheur ou coordinateur');
      }
    }

    // Gestion du changement de projet
    if (updateData.projectId && updateData.projectId !== activity.projectId) {
      if (updateData.projectId && updateData.themeId) {
        await this.validateProjectThemeConsistency(updateData.projectId, updateData.themeId);
      } else if (updateData.projectId) {
        await this.validateProjectThemeConsistency(updateData.projectId, activity.themeId);
      }
    }

    // Préparer les données de mise à jour
    const dataToUpdate: any = {};
    
    if (updateData.title !== undefined) dataToUpdate.title = updateData.title;
    if (updateData.description !== undefined) dataToUpdate.description = updateData.description || null;
    if (updateData.objectives !== undefined) dataToUpdate.objectives = updateData.objectives;
    if (updateData.methodology !== undefined) dataToUpdate.methodology = updateData.methodology || null;
    if (updateData.location !== undefined) dataToUpdate.location = updateData.location || null;
    if (updateData.results !== undefined) dataToUpdate.results = updateData.results || null;
    if (updateData.conclusions !== undefined) dataToUpdate.conclusions = updateData.conclusions || null;
    if (updateData.code !== undefined) dataToUpdate.code = updateData.code || null;
    if (updateData.type !== undefined) dataToUpdate.type = updateData.type;
    if (updateData.lifecycleStatus !== undefined) dataToUpdate.lifecycleStatus = updateData.lifecycleStatus;
    if (updateData.interventionRegion !== undefined) dataToUpdate.interventionRegion = updateData.interventionRegion || null;
    if (updateData.strategicPlan !== undefined) dataToUpdate.strategicPlan = updateData.strategicPlan || null;
    if (updateData.strategicAxis !== undefined) dataToUpdate.strategicAxis = updateData.strategicAxis || null;
    if (updateData.subAxis !== undefined) dataToUpdate.subAxis = updateData.subAxis || null;
    if (updateData.themeId !== undefined) dataToUpdate.themeId = updateData.themeId;
    if (updateData.responsibleId !== undefined) dataToUpdate.responsibleId = updateData.responsibleId;
    if (updateData.stationId !== undefined) dataToUpdate.stationId = updateData.stationId || null;
    if (updateData.conventionId !== undefined) dataToUpdate.conventionId = updateData.conventionId || null;
    if (updateData.projectId !== undefined) dataToUpdate.projectId = updateData.projectId || null;

    // Traitement spécial des dates
    if (updateData.startDate !== undefined) {
      if (updateData.startDate === '' || updateData.startDate === null) {
        dataToUpdate.startDate = null;
      } else {
        dataToUpdate.startDate = new Date(updateData.startDate);
      }
    }

    if (updateData.endDate !== undefined) {
      if (updateData.endDate === '' || updateData.endDate === null) {
        dataToUpdate.endDate = null;
      } else {
        dataToUpdate.endDate = new Date(updateData.endDate);
      }
    }

    // Validation des dates
    if (dataToUpdate.startDate && dataToUpdate.endDate) {
      if (dataToUpdate.startDate > dataToUpdate.endDate) {
        throw new ValidationError('La date de fin doit être postérieure à la date de début');
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
  async deleteActivity(activityId: string, userId: string, userRole: string): Promise<void> {
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
      throw new ValidationError('Activité non trouvée');
    }

    // Vérifier les droits de suppression
    const canDelete = this.checkActivityDeleteRights(activity, userId, userRole);
    if (!canDelete) {
      throw new AuthError('Permissions insuffisantes pour supprimer cette activité');
    }

    // Empêcher la suppression si l'activité a des reconductions
    if (activity.childActivities && activity.childActivities.length > 0) {
      throw new ValidationError('Impossible de supprimer une activité qui a été reconduite');
    }

    // Vérifier que l'activité n'est pas clôturée avec des résultats
    if (activity.lifecycleStatus === 'CLOTUREE' && (activity.results || activity.conclusions)) {
      throw new ValidationError('Impossible de supprimer une activité clôturée avec des résultats');
    }

    await prisma.activity.delete({
      where: { id: activityId }
    });
  }

  // ✅ Créer une reconduction d'activité
  async createActivityRecurrence(
    activityId: string, 
    userId: string, 
    userRole: string, 
    recurrenceData: ActivityRecurrenceRequest
  ): Promise<ActivityResponse> {
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
      throw new ValidationError('Activité source non trouvée');
    }

    // Vérifier les droits
    const hasAccess = this.checkActivityAccess(sourceActivity, userId, userRole);
    if (!hasAccess) {
      throw new AuthError('Accès refusé à cette activité');
    }

    // Vérifier que l'activité peut être reconduite
    if (sourceActivity.lifecycleStatus === 'CLOTUREE') {
      throw new ValidationError('Une activité clôturée ne peut pas être reconduite');
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
      lifecycleStatus: ActivityLifecycleStatus.RECONDUITE,
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
  async duplicateActivity(activityId: string, userId: string, userRole: string, newTitle?: string): Promise<ActivityResponse> {
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
      throw new ValidationError('Activité non trouvée');
    }

    const hasAccess = this.checkActivityAccess(originalActivity, userId, userRole);
    if (!hasAccess) {
      throw new AuthError('Permission insuffisante pour dupliquer cette activité');
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
  async getActivityStats(userId: string, userRole: string): Promise<CRAActivityStats> {
    const whereCondition: any = {};
    
    if (userRole !== 'ADMINISTRATEUR') {
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

    const [
      total,
      activitiesByType,
      activitiesByLifecycleStatus,
      activitiesByTheme,
      activitiesByStation,
      activitiesByResponsible,
      activitiesByRegion,
      withoutProject,
      withResults,
      recurrent,
      recentActivities
    ] = await Promise.all([
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
        where: { id: { in: activitiesByStation.map(a => a.stationId!).filter(Boolean) } },
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
      }, {} as Record<string, number>),
      byLifecycleStatus: activitiesByLifecycleStatus.reduce((acc, item) => {
        acc[item.lifecycleStatus] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      byTheme: activitiesByTheme.reduce((acc, item) => {
        const theme = themes.find(t => t.id === item.themeId);
        acc[theme?.name || 'Inconnu'] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      byStation: activitiesByStation.reduce((acc, item) => {
        const station = stations.find(s => s.id === item.stationId);
        acc[station?.name || 'Inconnu'] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      byResponsible: activitiesByResponsible.reduce((acc, item) => {
        const responsible = responsibles.find(r => r.id === item.responsibleId);
        acc[responsible ? `${responsible.firstName} ${responsible.lastName}` : 'Inconnu'] = {
          count: item._count.id,
          name: responsible ? `${responsible.firstName} ${responsible.lastName}` : 'Inconnu'
        };
        return acc;
      }, {} as Record<string, { count: number; name: string }>),
      byInterventionRegion: activitiesByRegion.reduce((acc, item) => {
        acc[item.interventionRegion || 'Non spécifiée'] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      withoutProject,
      withResults,
      recurrent,
      recent: recentActivities.map(activity => this.formatActivityResponse(activity))
    };
  }

  // ✅ Lier/délier des formulaires et documents
  async linkForm(activityId: string, formId: string, userId: string, userRole: string) {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        responsible: true,
        project: { include: { participants: { where: { userId: userId } } } }
      }
    });

    if (!activity) {
      throw new ValidationError('Activité non trouvée');
    }

    const hasAccess = this.checkActivityAccess(activity, userId, userRole);
    if (!hasAccess) {
      throw new AuthError('Accès refusé à cette activité');
    }

    const form = await prisma.form.findUnique({ where: { id: formId } });
    if (!form) {
      throw new ValidationError('Formulaire non trouvé');
    }

    if (form.activityId) {
      throw new ValidationError('Ce formulaire est déjà lié à une activité');
    }

    await prisma.form.update({
      where: { id: formId },
      data: { activityId: activityId }
    });

    return { message: 'Formulaire lié à l\'activité avec succès' };
  }

  async unlinkForm(activityId: string, formId: string, userId: string, userRole: string) {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        responsible: true,
        project: { include: { participants: { where: { userId: userId } } } }
      }
    });

    if (!activity) {
      throw new ValidationError('Activité non trouvée');
    }

    const hasAccess = this.checkActivityAccess(activity, userId, userRole);
    if (!hasAccess) {
      throw new AuthError('Accès refusé à cette activité');
    }

    const form = await prisma.form.findUnique({ where: { id: formId } });
    if (!form || form.activityId !== activityId) {
      throw new ValidationError('Ce formulaire n\'est pas lié à cette activité');
    }

    await prisma.form.update({
      where: { id: formId },
      data: { activityId: null }
    });

    return { message: 'Formulaire délié de l\'activité avec succès' };
  }

  async linkDocument(activityId: string, documentId: string, userId: string, userRole: string) {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        responsible: true,
        project: { include: { participants: { where: { userId: userId } } } }
      }
    });

    if (!activity) {
      throw new ValidationError('Activité non trouvée');
    }

    const hasAccess = this.checkActivityAccess(activity, userId, userRole);
    if (!hasAccess) {
      throw new AuthError('Accès refusé à cette activité');
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { shares: { where: { sharedWithId: userId } } }
    });

    if (!document) {
      throw new ValidationError('Document non trouvé');
    }

    const hasDocumentAccess = document.ownerId === userId || 
                             document.isPublic || 
                             document.shares.length > 0 ||
                             userRole === 'ADMINISTRATEUR';

    if (!hasDocumentAccess) {
      throw new AuthError('Accès refusé à ce document');
    }

    if (document.activityId) {
      throw new ValidationError('Ce document est déjà lié à une activité');
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
  private async validateCRAActivity(data: CreateActivityRequest, userId: string, userRole: string) {
    // Vérifier le thème
    const theme = await prisma.researchTheme.findUnique({
      where: { id: data.themeId }
    });
    if (!theme || !theme.isActive) {
      throw new ValidationError('Thème de recherche non trouvé ou inactif');
    }

    // Vérifier le responsable
    const responsible = await prisma.user.findUnique({
      where: { id: data.responsibleId }
    });
    if (!responsible) {
      throw new ValidationError('Responsable non trouvé');
    }
    if (!['CHERCHEUR', 'COORDONATEUR_PROJET'].includes(responsible.role)) {
      throw new ValidationError('Le responsable doit être un chercheur ou coordinateur');
    }

    // Vérifier la station si spécifiée
    if (data.stationId) {
      const station = await prisma.researchStation.findUnique({
        where: { id: data.stationId }
      });
      if (!station || !station.isActive) {
        throw new ValidationError('Station de recherche non trouvée ou inactive');
      }
    }

    // Vérifier la convention si spécifiée
    if (data.conventionId) {
      const convention = await prisma.convention.findUnique({
        where: { id: data.conventionId }
      });
      if (!convention) {
        throw new ValidationError('Convention non trouvée');
      }
      if (!['SIGNEE', 'EN_COURS'].includes(convention.status)) {
        throw new ValidationError('La convention doit être signée ou en cours');
      }
    }

    // Vérifier l'unicité du code si fourni
    if (data.code) {
      const existingActivity = await prisma.activity.findUnique({
        where: { code: data.code }
      });
      if (existingActivity) {
        throw new ValidationError('Ce code d\'activité existe déjà');
      }
    }
  }

  // Génération automatique du code
  private async generateActivityCode(themeId: string): Promise<string> {
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
  private async validateProjectThemeConsistency(projectId: string, themeId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { themeId: true }
    });
    
    if (project && project.themeId !== themeId) {
      throw new ValidationError('Le thème de l\'activité doit correspondre au thème du projet');
    }
  }

  // Vérification des droits d'accès à une activité CRA
  private checkActivityAccess(activity: any, userId: string, userRole: string): boolean {
    // Admin a accès à tout
    if (userRole === 'ADMINISTRATEUR') return true;
    
    // Responsable de l'activité a accès
    if (activity.responsibleId === userId) return true;
    
    // Participant à l'activité a accès
    if (activity.participants?.some((p: any) => p.userId === userId && p.isActive)) return true;
    
    // Si l'activité est liée à un projet, vérifier l'accès au projet
    if (activity.project) {
      return this.checkProjectAccess(activity.project, userId, userRole);
    }
    
    return false;
  }

  // Vérification des droits d'accès à un projet
  private checkProjectAccess(project: any, userId: string, userRole: string): boolean {
    if (userRole === 'ADMINISTRATEUR') return true;
    if (project.creatorId === userId) return true;
    if (project.participants?.some((p: any) => p.userId === userId && p.isActive)) return true;
    return false;
  }

  // Vérification des droits de modification
  private checkActivityModifyRights(activity: any, userId: string, userRole: string): boolean {
    if (userRole === 'ADMINISTRATEUR') return true;
    if (activity.responsibleId === userId) return true;
    
    if (activity.project) {
      if (activity.project.creatorId === userId) return true;
      const participantRole = activity.project.participants?.find((p: any) => p.userId === userId)?.role;
      if (participantRole && ['Chef de projet', 'Chef de projet adjoint'].includes(participantRole)) {
        return true;
      }
    }
    
    return false;
  }

  // Vérification des droits de suppression
  private checkActivityDeleteRights(activity: any, userId: string, userRole: string): boolean {
    if (userRole === 'ADMINISTRATEUR') return true;
    if (activity.responsibleId === userId) return true;
    
    if (activity.project) {
      if (activity.project.creatorId === userId) return true;
    }
    
    return false;
  }

  // Formatage de la réponse activité CRA
  private formatActivityResponse(activity: any): ActivityResponse {
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
      tasks: activity.tasks?.map((task: any) => ({
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
      forms: activity.forms?.map((form: any) => ({
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
async addParticipant(
  activityId: string, 
  participantData: AddParticipantInput, 
  userId: string, 
  userRole: string
) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { 
      responsible: true,
      participants: true,
      project: { include: { participants: { where: { userId } } } }
    }
  });

  if (!activity) {
    throw new ValidationError('Activité non trouvée');
  }

  // Vérifier les droits de modification
  const canModify = this.checkActivityModifyRights(activity, userId, userRole);
  if (!canModify) {
    throw new AuthError('Permissions insuffisantes pour modifier les participants');
  }

  // Vérifier que l'utilisateur existe
  const user = await prisma.user.findUnique({
    where: { id: participantData.userId }
  });

  if (!user) {
    throw new ValidationError('Utilisateur non trouvé');
  }

  // Vérifier qu'il n'est pas déjà participant
  const existingParticipant = activity.participants?.find(
    p => p.userId === participantData.userId
  );

  if (existingParticipant) {
    throw new ValidationError('Cet utilisateur est déjà participant à cette activité');
  }

  // Empêcher d'ajouter le responsable comme participant
  if (participantData.userId === activity.responsibleId) {
    throw new ValidationError('Le responsable ne peut pas être ajouté comme participant');
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

  return participant;
}

// Mettre à jour un participant
async updateParticipant(
  activityId: string,
  participantId: string,
  updateData: UpdateParticipantInput,
  userId: string,
  userRole: string
) {
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
    throw new ValidationError('Participant non trouvé');
  }

  if (existingParticipant.activityId !== activityId) {
    throw new ValidationError('Ce participant n\'appartient pas à cette activité');
  }

  const canModify = this.checkActivityModifyRights(existingParticipant.activity, userId, userRole);
  if (!canModify) {
    throw new AuthError('Permissions insuffisantes');
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
async removeParticipant(
  activityId: string,
  participantId: string,
  userId: string,
  userRole: string
) {
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
    throw new ValidationError('Participant non trouvé');
  }

  if (existingParticipant.activityId !== activityId) {
    throw new ValidationError('Ce participant n\'appartient pas à cette activité');
  }

  const canModify = this.checkActivityModifyRights(existingParticipant.activity, userId, userRole);
  if (!canModify) {
    throw new AuthError('Permissions insuffisantes');
  }

  await prisma.activityParticipant.delete({
    where: { id: participantId }
  });
}

// Lister les participants d'une activité
async listParticipants(activityId: string, userId: string, userRole: string) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { 
      responsible: true,
      project: { include: { participants: { where: { userId } } } }
    }
  });

  if (!activity) {
    throw new ValidationError('Activité non trouvée');
  }

  const hasAccess = this.checkActivityAccess(activity, userId, userRole);
  if (!hasAccess) {
    throw new AuthError('Accès refusé');
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

async addFunding(
  activityId: string,
  fundingData: AddFundingInput,
  userId: string,
  userRole: string
) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { 
      responsible: true,
      project: { include: { participants: { where: { userId } } } }
    }
  });

  if (!activity) {
    throw new ValidationError('Activité non trouvée');
  }

  const canModify = this.checkActivityModifyRights(activity, userId, userRole);
  if (!canModify) {
    throw new AuthError('Permissions insuffisantes');
  }

  // Vérifier la convention si spécifiée
  if (fundingData.conventionId) {
    const convention = await prisma.convention.findUnique({
      where: { id: fundingData.conventionId }
    });
    if (!convention) {
      throw new ValidationError('Convention non trouvée');
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

async updateFunding(
  activityId: string,
  fundingId: string,
  updateData: UpdateFundingInput,
  userId: string,
  userRole: string
) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { 
      responsible: true,
      fundings: { where: { id: fundingId } },
      project: { include: { participants: { where: { userId } } } }
    }
  });

  if (!activity) {
    throw new ValidationError('Activité non trouvée');
  }

  const funding = activity.fundings?.[0];
  if (!funding) {
    throw new ValidationError('Financement non trouvé');
  }

  const canModify = this.checkActivityModifyRights(activity, userId, userRole);
  if (!canModify) {
    throw new AuthError('Permissions insuffisantes');
  }

  const dataToUpdate: any = {};
  if (updateData.fundingSource !== undefined) dataToUpdate.fundingSource = updateData.fundingSource;
  if (updateData.fundingType !== undefined) dataToUpdate.fundingType = updateData.fundingType;
  if (updateData.status !== undefined) dataToUpdate.status = updateData.status;
  if (updateData.requestedAmount !== undefined) dataToUpdate.requestedAmount = updateData.requestedAmount;
  if (updateData.approvedAmount !== undefined) dataToUpdate.approvedAmount = updateData.approvedAmount;
  if (updateData.receivedAmount !== undefined) dataToUpdate.receivedAmount = updateData.receivedAmount;
  if (updateData.conditions !== undefined) dataToUpdate.conditions = updateData.conditions;
  if (updateData.contractNumber !== undefined) dataToUpdate.contractNumber = updateData.contractNumber;
  if (updateData.conventionId !== undefined) dataToUpdate.conventionId = updateData.conventionId;

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

async removeFunding(
  activityId: string,
  fundingId: string,
  userId: string,
  userRole: string
) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { 
      responsible: true,
      fundings: { where: { id: fundingId } },
      project: { include: { participants: { where: { userId } } } }
    }
  });

  if (!activity) {
    throw new ValidationError('Activité non trouvée');
  }

  if (!activity.fundings?.[0]) {
    throw new ValidationError('Financement non trouvé');
  }

  const canModify = this.checkActivityModifyRights(activity, userId, userRole);
  if (!canModify) {
    throw new AuthError('Permissions insuffisantes');
  }

  await prisma.activityFunding.delete({
    where: { id: fundingId }
  });
}

async listFundings(activityId: string, userId: string, userRole: string) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { 
      responsible: true,
      project: { include: { participants: { where: { userId } } } }
    }
  });

  if (!activity) {
    throw new ValidationError('Activité non trouvée');
  }

  const hasAccess = this.checkActivityAccess(activity, userId, userRole);
  if (!hasAccess) {
    throw new AuthError('Accès refusé');
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

async addPartner(
  activityId: string,
  partnerData: AddActivityPartnerInput,
  userId: string,
  userRole: string
) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      responsible: true,
      partnerships: true,
      project: { include: { participants: { where: { userId } } } }
    }
  });

  if (!activity) {
    throw new ValidationError('Activité non trouvée');
  }

  const canModify = this.checkActivityModifyRights(activity, userId, userRole);
  if (!canModify) {
    throw new AuthError('Permissions insuffisantes');
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
    throw new ValidationError('Un ID de partenaire ou un nom de partenaire est requis');
  }

  // Vérifier qu'il n'est pas déjà partenaire
  const existingPartnership = activity.partnerships?.find(p => p.partnerId === partnerId);
  if (existingPartnership) {
    throw new ValidationError('Ce partenaire est déjà associé à cette activité');
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

async updatePartner(
  activityId: string,
  partnershipId: string,
  updateData: UpdateActivityPartnerInput,
  userId: string,
  userRole: string
) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      responsible: true,
      partnerships: { where: { id: partnershipId } },
      project: { include: { participants: { where: { userId } } } }
    }
  });

  if (!activity) {
    throw new ValidationError('Activité non trouvée');
  }

  const partnership = activity.partnerships?.[0];
  if (!partnership) {
    throw new ValidationError('Partenariat non trouvé');
  }

  const canModify = this.checkActivityModifyRights(activity, userId, userRole);
  if (!canModify) {
    throw new AuthError('Permissions insuffisantes');
  }

  const dataToUpdate: any = {};
  if (updateData.partnerType !== undefined) dataToUpdate.partnerType = updateData.partnerType;
  if (updateData.contribution !== undefined) dataToUpdate.contribution = updateData.contribution;
  if (updateData.benefits !== undefined) dataToUpdate.benefits = updateData.benefits;
  if (updateData.isActive !== undefined) dataToUpdate.isActive = updateData.isActive;
  
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

async removePartner(
  activityId: string,
  partnershipId: string,
  userId: string,
  userRole: string
) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      responsible: true,
      partnerships: { where: { id: partnershipId } },
      project: { include: { participants: { where: { userId } } } }
    }
  });

  if (!activity) {
    throw new ValidationError('Activité non trouvée');
  }

  const partnership = activity.partnerships?.[0];
  if (!partnership) {
    throw new ValidationError('Partenariat non trouvé');
  }

  const canModify = this.checkActivityModifyRights(activity, userId, userRole);
  if (!canModify) {
    throw new AuthError('Permissions insuffisantes');
  }

  await prisma.activityPartner.delete({
    where: { id: partnershipId }
  });
}

async listPartners(activityId: string, userId: string, userRole: string) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { 
      responsible: true,
      project: { include: { participants: { where: { userId } } } }
    }
  });

  if (!activity) {
    throw new ValidationError('Activité non trouvée');
  }

  const hasAccess = this.checkActivityAccess(activity, userId, userRole);
  if (!hasAccess) {
    throw new AuthError('Accès refusé');
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

async createTask(
  activityId: string,
  taskData: CreateTaskInput,
  userId: string,
  userRole: string
) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { 
      responsible: true,
      project: { include: { participants: { where: { userId } } } }
    }
  });

  if (!activity) {
    throw new ValidationError('Activité non trouvée');
  }

  const canModify = this.checkActivityModifyRights(activity, userId, userRole);
  if (!canModify) {
    throw new AuthError('Permissions insuffisantes');
  }

  // Vérifier que l'assignee existe si spécifié
  if (taskData.assigneeId) {
    const assignee = await prisma.user.findUnique({
      where: { id: taskData.assigneeId }
    });
    if (!assignee) {
      throw new ValidationError('Utilisateur assigné non trouvé');
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

  return task;
}

async updateTask(
  activityId: string,
  taskId: string,
  updateData: UpdateTaskInput,
  userId: string,
  userRole: string
) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { 
      responsible: true,
      tasks: { where: { id: taskId } },
      project: { include: { participants: { where: { userId } } } }
    }
  });

  if (!activity) {
    throw new ValidationError('Activité non trouvée');
  }

  const task = activity.tasks?.[0];
  if (!task) {
    throw new ValidationError('Tâche non trouvée dans cette activité');
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
    throw new AuthError('Permissions insuffisantes');
  }

  // Restrictions pour l'assigné (ne peut modifier que statut et progression)
  if (isAssignee && !isCreator && !isAdmin && !canModifyActivity) {
    if (updateData.title || updateData.description || updateData.priority || 
        updateData.dueDate || updateData.assigneeId) {
      throw new AuthError('Vous ne pouvez modifier que le statut et la progression');
    }
  }

  // Vérifier le nouvel assignee si changé (seul le créateur/superviseur peut réassigner)
  if (updateData.assigneeId && updateData.assigneeId !== task.assigneeId) {
    if (!isCreator && !isAdmin && !canModifyActivity) {
      throw new AuthError('Seul le créateur peut réassigner une tâche');
    }

    const newAssignee = await prisma.user.findUnique({
      where: { id: updateData.assigneeId }
    });
    if (!newAssignee) {
      throw new ValidationError('Nouvel utilisateur assigné non trouvé');
    }
  }

  const dataToUpdate: any = {};
  if (updateData.title !== undefined) dataToUpdate.title = updateData.title;
  if (updateData.description !== undefined) dataToUpdate.description = updateData.description;
  if (updateData.status !== undefined) {
    dataToUpdate.status = updateData.status;
    // Si marquée comme terminée, définir completedAt
    if (updateData.status === 'TERMINEE' && !task.completedAt) {
      dataToUpdate.completedAt = new Date();
      dataToUpdate.progress = 100;
    }
  }
  if (updateData.priority !== undefined) dataToUpdate.priority = updateData.priority;
  if (updateData.assigneeId !== undefined) dataToUpdate.assigneeId = updateData.assigneeId;
  if (updateData.progress !== undefined) dataToUpdate.progress = updateData.progress;
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

  return updatedTask;
}                                                                                       

async deleteTask(
  activityId: string,
  taskId: string,
  userId: string,
  userRole: string
) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { 
      responsible: true,
      tasks: { where: { id: taskId } },
      project: { include: { participants: { where: { userId } } } }
    }
  });

  if (!activity) {
    throw new ValidationError('Activité non trouvée');
  }

  const task = activity.tasks?.[0];
  if (!task) {
    throw new ValidationError('Tâche non trouvée');
  }

  // Seuls le créateur de la tâche ou un responsable de l'activité peuvent supprimer
  const canDelete = 
    task.creatorId === userId ||
    this.checkActivityModifyRights(activity, userId, userRole);

  if (!canDelete) {
    throw new AuthError('Permissions insuffisantes');
  }

  await prisma.task.delete({
    where: { id: taskId }
  });
}

async listTasks(activityId: string, userId: string, userRole: string) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { 
      responsible: true,
      project: { include: { participants: { where: { userId } } } }
    }
  });

  if (!activity) {
    throw new ValidationError('Activité non trouvée');
  }

  const hasAccess = this.checkActivityAccess(activity, userId, userRole);
  if (!hasAccess) {
    throw new AuthError('Accès refusé');
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

async getTaskById(
  activityId: string,
  taskId: string,
  userId: string,
  userRole: string
) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { 
      responsible: true,
      project: { include: { participants: { where: { userId } } } }
    }
  });

  if (!activity) {
    throw new ValidationError('Activité non trouvée');
  }

  const hasAccess = this.checkActivityAccess(activity, userId, userRole);
  if (!hasAccess) {
    throw new AuthError('Accès refusé');
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
    throw new ValidationError('Tâche non trouvée dans cette activité');
  }

  return task;
}
// ========================================
// NOUVELLES MÉTHODES POUR SUPERVISEUR/ASSIGNÉ
// ========================================

async reassignTask(
  activityId: string,
  taskId: string,
  reassignData: ReassignTaskInput,
  userId: string,
  userRole: string
) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { 
      responsible: true,
      tasks: { where: { id: taskId } },
      project: { include: { participants: { where: { userId } } } }
    }
  });

  if (!activity) {
    throw new ValidationError('Activité non trouvée');
  }

  const task = activity.tasks?.[0];
  if (!task) {
    throw new ValidationError('Tâche non trouvée');
  }

  // Seul le créateur peut réassigner
  const isCreator = task.creatorId === userId;
  const canModifyActivity = this.checkActivityModifyRights(activity, userId, userRole);

  if (!isCreator && !canModifyActivity && userRole !== 'ADMINISTRATEUR') {
    throw new AuthError('Seul le créateur peut réassigner cette tâche');
  }

  // Vérifier que le nouvel assigné existe
  const newAssignee = await prisma.user.findUnique({
    where: { id: reassignData.newAssigneeId }
  });

  if (!newAssignee) {
    throw new ValidationError('Nouvel utilisateur non trouvé');
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

async listCreatedTasks(
  activityId: string,
  userId: string,
  userRole: string
) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { 
      responsible: true,
      project: { include: { participants: { where: { userId } } } }
    }
  });

  if (!activity) {
    throw new ValidationError('Activité non trouvée');
  }

  const hasAccess = this.checkActivityAccess(activity, userId, userRole);
  if (!hasAccess) {
    throw new AuthError('Accès refusé');
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

async listAssignedTasks(
  activityId: string,
  userId: string,
  userRole: string
) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { 
      responsible: true,
      project: { include: { participants: { where: { userId } } } }
    }
  });

  if (!activity) {
    throw new ValidationError('Activité non trouvée');
  }

  const hasAccess = this.checkActivityAccess(activity, userId, userRole);
  if (!hasAccess) {
    throw new AuthError('Accès refusé');
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

async createComment(
  activityId: string,
  commentData: CreateCommentInput,
  userId: string,
  userRole: string
) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { 
      responsible: true,
      project: { include: { participants: { where: { userId } } } }
    }
  });

  if (!activity) {
    throw new ValidationError('Activité non trouvée');
  }

  const hasAccess = this.checkActivityAccess(activity, userId, userRole);
  if (!hasAccess) {
    throw new AuthError('Accès refusé à cette activité');
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

async updateComment(
  activityId: string,
  commentId: string,
  updateData: UpdateCommentInput,
  userId: string,
  userRole: string
) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { 
      responsible: true,
      project: { include: { participants: { where: { userId } } } }
    }
  });

  if (!activity) {
    throw new ValidationError('Activité non trouvée');
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId }
  });

  if (!comment || comment.activityId !== activityId) {
    throw new ValidationError('Commentaire non trouvé dans cette activité');
  }

  // Seul l'auteur ou un admin peut modifier
  if (comment.authorId !== userId && userRole !== 'ADMINISTRATEUR') {
    throw new AuthError('Seul l\'auteur peut modifier ce commentaire');
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

async deleteComment(
  activityId: string,
  commentId: string,
  userId: string,
  userRole: string
) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId }
  });

  if (!activity) {
    throw new ValidationError('Activité non trouvée');
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId }
  });

  if (!comment || comment.activityId !== activityId) {
    throw new ValidationError('Commentaire non trouvé');
  }

  // Seul l'auteur, le responsable de l'activité ou un admin peut supprimer
  const canDelete = 
    comment.authorId === userId ||
    activity.responsibleId === userId ||
    userRole === 'ADMINISTRATEUR';

  if (!canDelete) {
    throw new AuthError('Permissions insuffisantes');
  }

  await prisma.comment.delete({
    where: { id: commentId }
  });
}

async listComments(activityId: string, userId: string, userRole: string) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { 
      responsible: true,
      project: { include: { participants: { where: { userId } } } }
    }
  });

  if (!activity) {
    throw new ValidationError('Activité non trouvée');
  }

  const hasAccess = this.checkActivityAccess(activity, userId, userRole);
  if (!hasAccess) {
    throw new AuthError('Accès refusé');
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

async linkKnowledgeTransfer(
  activityId: string,
  transferId: string,
  userId: string,
  userRole: string
) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { 
      responsible: true,
      project: { include: { participants: { where: { userId } } } }
    }
  });

  if (!activity) {
    throw new ValidationError('Activité non trouvée');
  }

  const canModify = this.checkActivityModifyRights(activity, userId, userRole);
  if (!canModify) {
    throw new AuthError('Permissions insuffisantes');
  }

  const transfer = await prisma.knowledgeTransfer.findUnique({
    where: { id: transferId }
  });

  if (!transfer) {
    throw new ValidationError('Transfert d\'acquis non trouvé');
  }

  if (transfer.activityId) {
    throw new ValidationError('Ce transfert est déjà lié à une activité');
  }

  await prisma.knowledgeTransfer.update({
    where: { id: transferId },
    data: { activityId }
  });

  return { message: 'Transfert d\'acquis lié à l\'activité avec succès' };
}

async unlinkKnowledgeTransfer(
  activityId: string,
  transferId: string,
  userId: string,
  userRole: string
) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { 
      responsible: true,
      project: { include: { participants: { where: { userId } } } }
    }
  });

  if (!activity) {
    throw new ValidationError('Activité non trouvée');
  }

  const canModify = this.checkActivityModifyRights(activity, userId, userRole);
  if (!canModify) {
    throw new AuthError('Permissions insuffisantes');
  }

  const transfer = await prisma.knowledgeTransfer.findUnique({
    where: { id: transferId }
  });

  if (!transfer || transfer.activityId !== activityId) {
    throw new ValidationError('Ce transfert n\'est pas lié à cette activité');
  }

  await prisma.knowledgeTransfer.update({
    where: { id: transferId },
    data: { activityId: null }
  });

  return { message: 'Transfert d\'acquis délié de l\'activité avec succès' };
}

async listKnowledgeTransfers(activityId: string, userId: string, userRole: string) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { 
      responsible: true,
      project: { include: { participants: { where: { userId } } } }
    }
  });

  if (!activity) {
    throw new ValidationError('Activité non trouvée');
  }

  const hasAccess = this.checkActivityAccess(activity, userId, userRole);
  if (!hasAccess) {
    throw new AuthError('Accès refusé');
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
