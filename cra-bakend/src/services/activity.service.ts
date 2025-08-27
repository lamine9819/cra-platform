// src/services/activity.service.ts - Version corrigée avec modification du projet
import { PrismaClient } from '@prisma/client';
import { ValidationError, AuthError } from '../utils/errors';
import { CreateActivityRequest, UpdateActivityRequest, ActivityListQuery, ActivityResponse } from '../types/activity.types';

const prisma = new PrismaClient();

// Type pour les activités avec relations incluses (gardé identique)
type ActivityWithRelations = {
  id: string;
  title: string;
  description?: string | null;
  objectives: string[];
  methodology?: string | null;
  location?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  results?: string | null;
  conclusions?: string | null;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
  project: {
    id: string;
    title: string;
    status: string;
    creatorId: string;
    startDate?: Date | null;
    endDate?: Date | null;
    creator: {
      id: string;
      firstName: string;
      lastName: string;
    };
    participants?: {
      userId: string;
      isActive: boolean;
      role: string;
    }[];
  };
  tasks?: {
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate?: Date | null;
    assignee?: {
      id: string;
      firstName: string;
      lastName: string;
    } | null;
  }[];
  documents?: {
    id: string;
    title: string;
    filename: string;
    type: string;
    size: bigint;
    createdAt: Date;
    activityId?: string | null;
    ownerId: string;
    owner: {
      id: string;
      firstName: string;
      lastName: string;
    };
    shares?: {
      sharedWithId: string;
    }[];
    isPublic: boolean;
  }[];
  forms?: {
    id: string;
    title: string;
    description?: string | null;
    isActive: boolean;
    createdAt: Date;
    activityId?: string | null;
    creator: {
      id: string;
      firstName: string;
      lastName: string;
    };
    _count: {
      responses: number;
    };
  }[];
  _count?: {
    tasks: number;
    documents: number;
    forms: number;
    comments: number;
  };
};

export class ActivityService {

  // Créer une activité (gardé identique)
  async createActivity(activityData: CreateActivityRequest, userId: string, userRole: string): Promise<ActivityResponse> {
    // Vérifier que le projet existe et que l'utilisateur a accès
    const project = await prisma.project.findUnique({
      where: { id: activityData.projectId },
      include: {
        participants: {
          where: { userId: userId }
        }
      }
    });

    if (!project) {
      throw new ValidationError('Projet non trouvé');
    }

    // Vérifier les droits d'accès au projet
    const hasAccess = this.checkProjectAccess(project, userId, userRole);
    if (!hasAccess) {
      throw new AuthError('Accès refusé à ce projet');
    }

    // Vérifier que le projet n'est pas archivé
    if (project.status === 'ARCHIVE') {
      throw new ValidationError('Impossible de créer une activité dans un projet archivé');
    }

    // Vérifier la cohérence des dates avec le projet
    if (activityData.startDate && project.startDate) {
      if (new Date(activityData.startDate) < project.startDate) {
        throw new ValidationError('La date de début de l\'activité ne peut pas être antérieure au début du projet');
      }
    }

    if (activityData.endDate && project.endDate) {
      if (new Date(activityData.endDate) > project.endDate) {
        throw new ValidationError('La date de fin de l\'activité ne peut pas dépasser la fin du projet');
      }
    }

    // Créer l'activité
    const activity = await prisma.activity.create({
      data: {
        title: activityData.title,
        description: activityData.description,
        objectives: activityData.objectives,
        methodology: activityData.methodology,
        location: activityData.location,
        startDate: activityData.startDate ? new Date(activityData.startDate) : null,
        endDate: activityData.endDate ? new Date(activityData.endDate) : null,
        projectId: activityData.projectId,
      },
      include: {
        project: {
          include: {
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
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
          }
        }
      }
    });

    return this.formatActivityResponse(activity);
  }

  // Lister les activités avec filtres (gardé identique)
  async listActivities(userId: string, userRole: string, query: ActivityListQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Construire les filtres de base
    const where: any = {};

    if (query.projectId) {
      where.projectId = query.projectId;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { methodology: { contains: query.search, mode: 'insensitive' } },
        { location: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.startDate) {
      where.startDate = { gte: new Date(query.startDate) };
    }

    if (query.endDate) {
      where.endDate = { lte: new Date(query.endDate) };
    }

    if (query.hasResults !== undefined) {
      if (query.hasResults) {
        where.results = { not: null };
      } else {
        where.results = null;
      }
    }

    // Filtrer selon les droits d'accès
    if (userRole !== 'ADMINISTRATEUR') {
      where.project = {
        OR: [
          { creatorId: userId },
          {
            participants: {
              some: {
                userId: userId,
                isActive: true,
              }
            }
          }
        ]
      };
    }

    // Exécuter la requête avec pagination
    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        skip,
        take: limit,
        include: {
          project: {
            include: {
              creator: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
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
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      }),
      prisma.activity.count({ where })
    ]);

    return {
      activities: activities.map((activity: ActivityWithRelations) => this.formatActivityResponse(activity)),
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

  // Obtenir une activité par ID (gardé identique)
  async getActivityById(activityId: string, userId: string, userRole: string): Promise<ActivityResponse> {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        project: {
          include: {
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              }
            },
            participants: {
              where: { userId: userId }
            }
          }
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        documents: {
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        forms: {
          include: {
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              }
            },
            _count: {
              select: {
                responses: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            tasks: true,
            documents: true,
            forms: true,
            comments: true,
          }
        }
      }
    });

    if (!activity) {
      throw new ValidationError('Activité non trouvée');
    }

    // Vérifier les droits d'accès
    const hasAccess = this.checkProjectAccess(activity.project, userId, userRole);
    if (!hasAccess) {
      throw new AuthError('Accès refusé à cette activité');
    }

    return this.formatActivityResponse(activity);
  }

  // ✅ MÉTHODE CORRIGÉE - Mettre à jour une activité AVEC modification du projet
  async updateActivity(activityId: string, updateData: UpdateActivityRequest, userId: string, userRole: string): Promise<ActivityResponse> {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        project: {
          include: {
            participants: {
              where: { userId: userId }
            }
          }
        }
      }
    });

    if (!activity) {
      throw new ValidationError('Activité non trouvée');
    }

    // Vérifier les droits d'accès et de modification
    const hasAccess = this.checkProjectAccess(activity.project, userId, userRole);
    if (!hasAccess) {
      throw new AuthError('Accès refusé à cette activité');
    }

    // Vérifier que le projet n'est pas archivé
    if (activity.project.status === 'ARCHIVE') {
      throw new ValidationError('Impossible de modifier une activité dans un projet archivé');
    }

    // ✅ NOUVELLE LOGIQUE - Gestion du changement de projet
    let newProject = null;
    if (updateData.projectId && updateData.projectId !== activity.projectId) {
      // Vérifier que le nouveau projet existe
      newProject = await prisma.project.findUnique({
        where: { id: updateData.projectId },
        include: {
          participants: {
            where: { userId: userId }
          }
        }
      });

      if (!newProject) {
        throw new ValidationError('Le nouveau projet spécifié n\'existe pas');
      }

      // Vérifier l'accès au nouveau projet
      const hasAccessToNewProject = this.checkProjectAccess(newProject, userId, userRole);
      if (!hasAccessToNewProject) {
        throw new AuthError('Vous n\'avez pas accès au projet spécifié');
      }

      // Vérifier que le nouveau projet n'est pas archivé
      if (newProject.status === 'ARCHIVE') {
        throw new ValidationError('Impossible de déplacer une activité vers un projet archivé');
      }

      // Vérifier la cohérence des dates avec le nouveau projet
      if (updateData.startDate && newProject.startDate) {
        if (new Date(updateData.startDate) < newProject.startDate) {
          throw new ValidationError('La date de début de l\'activité ne peut pas être antérieure au début du nouveau projet');
        }
      }

      if (updateData.endDate && newProject.endDate) {
        if (new Date(updateData.endDate) > newProject.endDate) {
          throw new ValidationError('La date de fin de l\'activité ne peut pas dépasser la fin du nouveau projet');
        }
      }

      console.log(`✅ Déplacement de l'activité "${activity.title}" du projet "${activity.project.title}" vers "${newProject.title}"`);
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

// ✅ AJOUT - Inclure le projectId dans les données de mise à jour
if (updateData.projectId !== undefined) dataToUpdate.projectId = updateData.projectId;

// ✅ CORRECTION - Traitement spécial des dates pour gérer les chaînes vides
if (updateData.startDate !== undefined) {
  if (updateData.startDate === '' || updateData.startDate === null) {
    dataToUpdate.startDate = null; // Effacer la date
  } else {
    dataToUpdate.startDate = new Date(updateData.startDate);
  }
}

if (updateData.endDate !== undefined) {
  if (updateData.endDate === '' || updateData.endDate === null) {
    dataToUpdate.endDate = null; // Effacer la date
  } else {
    dataToUpdate.endDate = new Date(updateData.endDate);
  }
}

// Vérifier la cohérence des nouvelles dates
if (dataToUpdate.startDate && dataToUpdate.endDate) {
  if (dataToUpdate.startDate > dataToUpdate.endDate) {
    throw new ValidationError('La date de fin doit être postérieure à la date de début');
  }
}

// Vérifier la cohérence avec les dates du projet (nouveau ou existant)
const projectToCheck = newProject || activity.project;
if (dataToUpdate.startDate && projectToCheck.startDate) {
  if (dataToUpdate.startDate < projectToCheck.startDate) {
    throw new ValidationError('La date de début de l\'activité ne peut pas être antérieure au début du projet');
  }
}
if (dataToUpdate.endDate && projectToCheck.endDate) {
  if (dataToUpdate.endDate > projectToCheck.endDate) {
    throw new ValidationError('La date de fin de l\'activité ne peut pas dépasser la fin du projet');
  }
}

console.log('📝 Données à mettre à jour:', dataToUpdate);

    const updatedActivity = await prisma.activity.update({
      where: { id: activityId },
      data: dataToUpdate,
      include: {
        project: {
          include: {
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        },
        documents: {
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        },
        forms: {
          include: {
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              }
            },
            _count: {
              select: {
                responses: true,
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
          }
        }
      }
    });

    return this.formatActivityResponse(updatedActivity);
  }

  // ✅ NOUVELLE MÉTHODE - Obtenir les statistiques des activités
  async getActivityStats(userId: string, userRole: string) {
    try {
      // Construire la condition WHERE selon les permissions
      const whereCondition: any = {};
      if (userRole !== 'ADMINISTRATEUR') {
        whereCondition.project = {
          OR: [
            { creatorId: userId },
            {
              participants: {
                some: {
                  userId: userId,
                  isActive: true,
                }
              }
            }
          ]
        };
      }

      // Statistiques de base
      const [
        total,
        withResultsCount,
        recentActivities,
        activitiesByProject
      ] = await Promise.all([
        // Total des activités
        prisma.activity.count({ where: whereCondition }),

        // Activités avec résultats
        prisma.activity.count({
          where: {
            ...whereCondition,
            OR: [
              { results: { not: null } },
              { conclusions: { not: null } }
            ]
          }
        }),

        // Activités récentes (dernières 10)
        prisma.activity.findMany({
          where: whereCondition,
          take: 10,
          orderBy: { updatedAt: 'desc' },
          include: {
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
        }),

        // Répartition par projet
        prisma.activity.groupBy({
          by: ['projectId'],
          where: whereCondition,
          _count: {
            id: true
          },
          orderBy: {
            _count: {
              id: 'desc'
            }
          }
        })
      ]);

      // Calculer les activités en cours et terminées
      const activitiesWithDates = await prisma.activity.findMany({
        where: {
          ...whereCondition,
          OR: [
            { startDate: { not: null } },
            { endDate: { not: null } }
          ]
        },
        select: {
          id: true,
          startDate: true,
          endDate: true,
          results: true,
          conclusions: true
        }
      });

      const now = new Date();
      let inProgress = 0;
      let completed = 0;

      activitiesWithDates.forEach(activity => {
        if (activity.results || activity.conclusions) {
          completed++;
        } else if (activity.startDate && activity.startDate <= now) {
          if (!activity.endDate || activity.endDate >= now) {
            inProgress++;
          } else {
            completed++;
          }
        }
      });

      // Récupérer les noms des projets pour la répartition
      const projectIds = activitiesByProject.map(item => item.projectId);
      const projects = await prisma.project.findMany({
        where: { id: { in: projectIds } },
        select: { id: true, title: true }
      });

      const byProject = activitiesByProject.reduce((acc, item) => {
        const project = projects.find(p => p.id === item.projectId);
        acc[project?.title || 'Projet inconnu'] = item._count.id;
        return acc;
      }, {} as Record<string, number>);

      return {
        total,
        inProgress,
        completed,
        withResults: withResultsCount,
        byProject,
        recent: recentActivities.map(activity => this.formatActivityResponse(activity))
      };

    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw new ValidationError('Erreur lors de la récupération des statistiques des activités');
    }
  }

  // ✅ NOUVELLE MÉTHODE - Dupliquer une activité
  async duplicateActivity(activityId: string, userId: string, userRole: string, newTitle?: string): Promise<ActivityResponse> {
    try {
      // Récupérer l'activité originale
      const originalActivity = await prisma.activity.findUnique({
        where: { id: activityId },
        include: {
          project: {
            include: {
              participants: {
                where: { userId: userId }
              }
            }
          }
        }
      });

      if (!originalActivity) {
        throw new ValidationError('Activité non trouvée');
      }

      // Vérifier les permissions
      const hasAccess = this.checkProjectAccess(originalActivity.project, userId, userRole);
      if (!hasAccess) {
        throw new AuthError('Permission insuffisante pour dupliquer cette activité');
      }

      // Créer la copie
      const duplicatedActivity = await prisma.activity.create({
        data: {
          title: newTitle || `${originalActivity.title} (Copie)`,
          description: originalActivity.description,
          objectives: [...originalActivity.objectives],
          methodology: originalActivity.methodology,
          location: originalActivity.location,
          startDate: null, // Reset des dates pour la nouvelle activité
          endDate: null,
          results: null, // Reset des résultats
          conclusions: null,
          projectId: originalActivity.projectId
        },
        include: {
          project: {
            include: {
              creator: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
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
            }
          }
        }
      });

      return this.formatActivityResponse(duplicatedActivity);

    } catch (error) {
      console.error('Erreur lors de la duplication:', error);
      throw new ValidationError('Erreur lors de la duplication de l\'activité');
    }
  }

  // Supprimer une activité (gardé identique)
  async deleteActivity(activityId: string, userId: string, userRole: string): Promise<void> {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        project: {
          include: {
            participants: {
              where: { userId: userId }
            }
          }
        }
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

    // Vérifier que le projet n'est pas archivé
    if (activity.project.status === 'ARCHIVE') {
      throw new ValidationError('Impossible de supprimer une activité dans un projet archivé');
    }

    // Supprimer l'activité (cascade dans Prisma supprimera les entités liées)
    await prisma.activity.delete({
      where: { id: activityId }
    });
  }

  // Lier un formulaire à une activité (gardé identique)
  async linkForm(activityId: string, formId: string, userId: string, userRole: string) {
    // Vérifier que l'activité existe et que l'utilisateur a accès
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        project: {
          include: {
            participants: {
              where: { userId: userId }
            }
          }
        }
      }
    });

    if (!activity) {
      throw new ValidationError('Activité non trouvée');
    }

    const hasAccess = this.checkProjectAccess(activity.project, userId, userRole);
    if (!hasAccess) {
      throw new AuthError('Accès refusé à cette activité');
    }

    // Vérifier que le formulaire existe
    const form = await prisma.form.findUnique({
      where: { id: formId }
    });

    if (!form) {
      throw new ValidationError('Formulaire non trouvé');
    }

    // Vérifier que le formulaire n'est pas déjà lié à une activité
    if (form.activityId) {
      throw new ValidationError('Ce formulaire est déjà lié à une activité');
    }

    // Lier le formulaire à l'activité
    await prisma.form.update({
      where: { id: formId },
      data: { activityId: activityId }
    });

    return { message: 'Formulaire lié à l\'activité avec succès' };
  }

  // Délier un formulaire d'une activité (gardé identique)
  async unlinkForm(activityId: string, formId: string, userId: string, userRole: string) {
    // Vérifier que l'activité existe et que l'utilisateur a accès
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        project: {
          include: {
            participants: {
              where: { userId: userId }
            }
          }
        }
      }
    });

    if (!activity) {
      throw new ValidationError('Activité non trouvée');
    }

    const hasAccess = this.checkProjectAccess(activity.project, userId, userRole);
    if (!hasAccess) {
      throw new AuthError('Accès refusé à cette activité');
    }

    // Vérifier que le formulaire existe et est lié à cette activité
    const form = await prisma.form.findUnique({
      where: { id: formId }
    });

    if (!form) {
      throw new ValidationError('Formulaire non trouvé');
    }

    if (form.activityId !== activityId) {
      throw new ValidationError('Ce formulaire n\'est pas lié à cette activité');
    }

    // Délier le formulaire
    await prisma.form.update({
      where: { id: formId },
      data: { activityId: null }
    });

    return { message: 'Formulaire délié de l\'activité avec succès' };
  }

  // Lier un document à une activité (gardé identique)
  async linkDocument(activityId: string, documentId: string, userId: string, userRole: string) {
    // Vérifier que l'activité existe et que l'utilisateur a accès
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        project: {
          include: {
            participants: {
              where: { userId: userId }
            }
          }
        }
      }
    });

    if (!activity) {
      throw new ValidationError('Activité non trouvée');
    }

    const hasAccess = this.checkProjectAccess(activity.project, userId, userRole);
    if (!hasAccess) {
      throw new AuthError('Accès refusé à cette activité');
    }

    // Vérifier que le document existe et que l'utilisateur a accès
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        shares: {
          where: { sharedWithId: userId }
        }
      }
    });

    if (!document) {
      throw new ValidationError('Document non trouvé');
    }

    // Vérifier l'accès au document
    const hasDocumentAccess = document.ownerId === userId || 
                             document.isPublic || 
                             document.shares.length > 0 ||
                             userRole === 'ADMINISTRATEUR';

    if (!hasDocumentAccess) {
      throw new AuthError('Accès refusé à ce document');
    }

    // Vérifier que le document n'est pas déjà lié à une activité
    if (document.activityId) {
      throw new ValidationError('Ce document est déjà lié à une activité');
    }

    // Lier le document à l'activité
    await prisma.document.update({
      where: { id: documentId },
      data: { activityId: activityId }
    });

    return { message: 'Document lié à l\'activité avec succès' };
  }

  // Vérifier l'accès à un projet (gardé identique)
  private checkProjectAccess(project: any, userId: string, userRole: string): boolean {
    // Admin a accès à tout
    if (userRole === 'ADMINISTRATEUR') return true;
    
    // Créateur a accès
    if (project.creatorId === userId) return true;
    
    // Participant actif a accès
    if (project.participants?.some((p: any) => p.userId === userId && p.isActive)) return true;
    
    return false;
  }

  // Vérifier les droits de suppression d'activité (gardé identique)
  private checkActivityDeleteRights(activity: any, userId: string, userRole: string): boolean {
    // Admin peut tout supprimer
    if (userRole === 'ADMINISTRATEUR') return true;
    
    // Créateur du projet peut supprimer
    if (activity.project.creatorId === userId) return true;
    
    // Participant avec rôle "Chef de projet" peut supprimer
    const participantRole = activity.project.participants?.find((p: any) => p.userId === userId)?.role;
    if (participantRole && ['Chef de projet', 'Chef de projet adjoint'].includes(participantRole)) {
      return true;
    }
    
    return false;
  }

  // Formater la réponse activité (gardé identique)
  private formatActivityResponse(activity: ActivityWithRelations): ActivityResponse {
    return {
      id: activity.id,
      title: activity.title,
      description: activity.description || undefined,
      objectives: activity.objectives,
      methodology: activity.methodology || undefined,
      location: activity.location || undefined,
      startDate: activity.startDate || undefined,
      endDate: activity.endDate || undefined,
      results: activity.results || undefined,
      conclusions: activity.conclusions || undefined,
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
      project: activity.project,
      tasks: activity.tasks?.map(task => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate || undefined,
        assignee: task.assignee || undefined,
      })),
      documents: activity.documents,
      forms: activity.forms?.map(form => ({
        id: form.id,
        title: form.title,
        description: form.description || undefined,
        isActive: form.isActive,
        createdAt: form.createdAt,
        creator: form.creator,
        _count: form._count,
      })),
      _count: activity._count,
    };
  }
}