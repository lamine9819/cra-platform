// src/services/task.service.ts - Version corrigée
import { PrismaClient } from '@prisma/client';
import { ValidationError, AuthError } from '../utils/errors';
import { CreateTaskRequest, UpdateTaskRequest, TaskListQuery, TaskResponse, TaskStatsResponse } from '../types/task.types';

const prisma = new PrismaClient();

// Type pour les tâches avec relations incluses - VERSION CORRIGÉE
type TaskWithRelations = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: Date | null;
  completedAt?: Date | null;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
  assigneeId?: string | null;
  projectId?: string | null;
  activityId?: string | null;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    specialization?: string | null;
  } | null;
  project?: {
    id: string;
    title: string;
    description?: string | null;
    objectives?: string[];
    status: string;
    startDate?: Date | null;
    endDate?: Date | null;
    budget?: number | null;
    keywords?: string[];
    createdAt: Date;
    updatedAt: Date;
    creatorId: string; // ← AJOUTÉ
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
  } | null;
  activity?: {
    id: string;
    title: string;
    description?: string | null;
    objectives?: string[];
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
      description?: string | null;
      objectives?: string[];
      status?: string;
      startDate?: Date | null;
      endDate?: Date | null;
      budget?: number | null;
      keywords?: string[];
      createdAt: Date;
      updatedAt: Date;
      creatorId: string; // ← AJOUTÉ
      participants?: {
        userId: string;
        isActive: boolean;
        role: string;
      }[];
    };
  } | null;
  documents?: {
    id: string;
    title: string;
    filename: string;
    type: string;
    createdAt: Date;
  }[];
  _count?: {
    documents: number;
    comments: number;
  };
};

export class TaskService {

  // Créer une tâche
  async createTask(taskData: CreateTaskRequest, creatorId: string, creatorRole: string): Promise<TaskResponse> {
    // Vérifier les permissions selon le rôle
    if (!['CHERCHEUR', 'ASSISTANT_CHERCHEUR', 'ADMINISTRATEUR'].includes(creatorRole)) {
      throw new AuthError('Seuls les chercheurs, assistants et administrateurs peuvent créer des tâches');
    }

    let projectAccess = false;
    let activityAccess = false;

    // Vérifier l'accès au projet si fourni
    if (taskData.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: taskData.projectId },
        include: {
          participants: {
            where: { userId: creatorId }
          }
        }
      });

      if (!project) {
        throw new ValidationError('Projet non trouvé');
      }

      projectAccess = this.checkProjectAccess(project, creatorId, creatorRole);
      if (!projectAccess) {
        throw new AuthError('Accès refusé à ce projet');
      }

      if (project.status === 'ARCHIVE') {
        throw new ValidationError('Impossible de créer une tâche dans un projet archivé');
      }
    }

    // Vérifier l'accès à l'activité si fournie
    if (taskData.activityId) {
      const activity = await prisma.activity.findUnique({
        where: { id: taskData.activityId },
        include: {
          project: {
            include: {
              participants: {
                where: { userId: creatorId }
              }
            }
          }
        }
      });

      if (!activity) {
        throw new ValidationError('Activité non trouvée');
      }

      activityAccess = this.checkProjectAccess(activity.project, creatorId, creatorRole);
      if (!activityAccess) {
        throw new AuthError('Accès refusé à cette activité');
      }

      if (activity.project.status === 'ARCHIVE') {
        throw new ValidationError('Impossible de créer une tâche dans un projet archivé');
      }

      // Si une activité est fournie, récupérer automatiquement le projet
      taskData.projectId = activity.projectId;
    }

    // Vérifier que l'assigné existe et a accès au projet/activité
    if (taskData.assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: taskData.assigneeId }
      });

      if (!assignee || !assignee.isActive) {
        throw new ValidationError('Assigné non trouvé ou inactif');
      }

      // Vérifier que l'assigné a accès au projet
      if (taskData.projectId && creatorRole !== 'ADMINISTRATEUR') {
        const hasProjectAccess = await this.checkUserProjectAccess(taskData.assigneeId, taskData.projectId);
        if (!hasProjectAccess) {
          throw new ValidationError('L\'assigné n\'a pas accès à ce projet');
        }
      }
    }

    // Créer la tâche
    const task = await prisma.task.create({
      data: {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        assigneeId: taskData.assigneeId,
        projectId: taskData.projectId,
        activityId: taskData.activityId,
        creatorId,
      },
      include: this.getTaskIncludes()
    });

    return this.formatTaskResponse(task as TaskWithRelations);
  }

  // Mettre à jour une tâche
  async updateTask(taskId: string, updateData: UpdateTaskRequest, userId: string, userRole: string): Promise<TaskResponse> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: {
            participants: {
              where: { userId: userId }
            }
          }
        },
        activity: {
          include: {
            project: {
              include: {
                participants: {
                  where: { userId: userId }
                }
              }
            }
          }
        }
      }
    });

    if (!task) {
      throw new ValidationError('Tâche non trouvée');
    }

    // Vérifier les droits de modification
    const canEdit = this.checkTaskEditRights(task, userId, userRole);
    if (!canEdit) {
      throw new AuthError('Permissions insuffisantes pour modifier cette tâche');
    }

    // Préparer les données de mise à jour
    const dataToUpdate: any = {};
    if (updateData.title !== undefined) dataToUpdate.title = updateData.title;
    if (updateData.description !== undefined) dataToUpdate.description = updateData.description;
    if (updateData.status !== undefined) dataToUpdate.status = updateData.status;
    if (updateData.priority !== undefined) dataToUpdate.priority = updateData.priority;
    if (updateData.progress !== undefined) dataToUpdate.progress = updateData.progress;
    if (updateData.assigneeId !== undefined) dataToUpdate.assigneeId = updateData.assigneeId;

    if (updateData.dueDate !== undefined) {
      dataToUpdate.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null;
    }

    // Auto-complétion de la date si le statut passe à TERMINEE
    if (updateData.status === 'TERMINEE' && task.status !== 'TERMINEE') {
      dataToUpdate.completedAt = new Date();
      dataToUpdate.progress = 100;
    }

    // Réinitialiser completedAt si le statut n'est plus TERMINEE
    if (updateData.status && updateData.status !== 'TERMINEE' && task.status === 'TERMINEE') {
      dataToUpdate.completedAt = null;
    }

    // Vérifier le nouvel assigné s'il change
    if (updateData.assigneeId && updateData.assigneeId !== task.assigneeId) {
      const newAssignee = await prisma.user.findUnique({
        where: { id: updateData.assigneeId }
      });

      if (!newAssignee || !newAssignee.isActive) {
        throw new ValidationError('Nouvel assigné non trouvé ou inactif');
      }

      // Vérifier l'accès au projet pour le nouvel assigné
      if (task.projectId && userRole !== 'ADMINISTRATEUR') {
        const hasAccess = await this.checkUserProjectAccess(updateData.assigneeId, task.projectId);
        if (!hasAccess) {
          throw new ValidationError('Le nouvel assigné n\'a pas accès à ce projet');
        }
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: dataToUpdate,
      include: this.getTaskIncludes()
    });

    return this.formatTaskResponse(updatedTask as TaskWithRelations);
  }

  // Lister les tâches assignées à un utilisateur
  async getAssignedTasks(userId: string, query: TaskListQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Construire les filtres
    const where: any = {
      assigneeId: userId,
    };

    this.applyTaskFilters(where, query);

    // Exécuter la requête
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        include: this.getTaskIncludes(),
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.task.count({ where })
    ]);

    return {
      tasks: tasks.map((task) => this.formatTaskResponse(task as TaskWithRelations)),
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

  // Lister les tâches d'un projet
  async getProjectTasks(projectId: string, userId: string, userRole: string, query: TaskListQuery) {
    // Vérifier l'accès au projet
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        participants: {
          where: { userId: userId }
        }
      }
    });

    if (!project) {
      throw new ValidationError('Projet non trouvé');
    }

    const hasAccess = this.checkProjectAccess(project, userId, userRole);
    if (!hasAccess) {
      throw new AuthError('Accès refusé à ce projet');
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Construire les filtres
    const where: any = {
      projectId: projectId,
    };

    this.applyTaskFilters(where, query);

    // Exécuter la requête
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        include: this.getTaskIncludes(),
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.task.count({ where })
    ]);

    return {
      tasks: tasks.map((task) => this.formatTaskResponse(task as TaskWithRelations)),
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

  // Lister les tâches d'une activité
  async getActivityTasks(activityId: string, userId: string, userRole: string, query: TaskListQuery) {
    // Vérifier l'accès à l'activité
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

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Construire les filtres
    const where: any = {
      activityId: activityId,
    };

    this.applyTaskFilters(where, query);

    // Exécuter la requête
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        include: this.getTaskIncludes(),
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.task.count({ where })
    ]);

    return {
      tasks: tasks.map((task) => this.formatTaskResponse(task as TaskWithRelations)),
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

  // Obtenir une tâche par ID avec vérification d'accès
  async getTaskById(taskId: string, userId: string, userRole: string): Promise<TaskResponse> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        ...this.getTaskIncludes(),
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
        activity: {
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
            }
          }
        }
      }
    });

    if (!task) {
      throw new ValidationError('Tâche non trouvée');
    }

    // Vérifier les droits d'accès
    const hasAccess = this.checkTaskAccess(task as TaskWithRelations, userId, userRole);
    if (!hasAccess) {
      throw new AuthError('Accès refusé à cette tâche');
    }

    return this.formatTaskResponse(task as TaskWithRelations);
  }

  // Supprimer une tâche
  async deleteTask(taskId: string, userId: string, userRole: string): Promise<void> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
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

    if (!task) {
      throw new ValidationError('Tâche non trouvée');
    }

    // Vérifier les droits de suppression
    const canDelete = this.checkTaskDeleteRights(task, userId, userRole);
    if (!canDelete) {
      throw new AuthError('Permissions insuffisantes pour supprimer cette tâche');
    }

    // Supprimer la tâche
    await prisma.task.delete({
      where: { id: taskId }
    });
  }

  // Obtenir les statistiques des tâches pour un utilisateur
  async getTaskStats(userId: string): Promise<TaskStatsResponse> {
    const today = new Date();
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);

    const [
      total,
      byStatus,
      byPriority,
      overdue,
      dueToday,
      dueThisWeek
    ] = await Promise.all([
      prisma.task.count({
        where: { assigneeId: userId }
      }),
      prisma.task.groupBy({
        by: ['status'],
        where: { assigneeId: userId },
        _count: true,
      }),
      prisma.task.groupBy({
        by: ['priority'],
        where: { assigneeId: userId },
        _count: true,
      }),
      prisma.task.count({
        where: {
          assigneeId: userId,
          dueDate: { lt: today },
          status: { notIn: ['TERMINEE', 'ANNULEE'] }
        }
      }),
      prisma.task.count({
        where: {
          assigneeId: userId,
          dueDate: { lte: endOfToday },
          status: { notIn: ['TERMINEE', 'ANNULEE'] }
        }
      }),
      prisma.task.count({
        where: {
          assigneeId: userId,
          dueDate: { lte: endOfWeek },
          status: { notIn: ['TERMINEE', 'ANNULEE'] }
        }
      })
    ]);

    // Formater les résultats
    const statusCounts = {
      A_FAIRE: 0,
      EN_COURS: 0,
      EN_REVISION: 0,
      TERMINEE: 0,
      ANNULEE: 0,
    };

    byStatus.forEach((item: { status: string; _count: number }) => {
      statusCounts[item.status as keyof typeof statusCounts] = item._count;
    });

    const priorityCounts = {
      BASSE: 0,
      NORMALE: 0,
      HAUTE: 0,
      URGENTE: 0,
    };

    byPriority.forEach((item: { priority: string; _count: number }) => {
      priorityCounts[item.priority as keyof typeof priorityCounts] = item._count;
    });

    return {
      total,
      byStatus: statusCounts,
      byPriority: priorityCounts,
      overdue,
      dueToday,
      dueThisWeek,
    };
  }

  // Méthodes utilitaires privées
  private checkProjectAccess(project: any, userId: string, userRole: string): boolean {
    if (userRole === 'ADMINISTRATEUR') return true;
    if (project.creatorId === userId) return true;
    if (project.participants?.some((p: any) => p.userId === userId && p.isActive)) return true;
    return false;
  }

  private checkTaskEditRights(task: any, userId: string, userRole: string): boolean {
    // Admin peut tout modifier
    if (userRole === 'ADMINISTRATEUR') return true;
    
    // Créateur de la tâche peut modifier
    if (task.creatorId === userId) return true;
    
    // Assigné peut modifier le statut et le progrès
    if (task.assigneeId === userId) return true;
    
    // Créateur du projet peut modifier
    if (task.project?.creatorId === userId) return true;
    
    // Participant avec rôle chef de projet peut modifier
    const projectParticipant = task.project?.participants?.find((p: any) => p.userId === userId);
    if (projectParticipant && ['Chef de projet', 'Chef de projet adjoint'].includes(projectParticipant.role)) {
      return true;
    }
    
    return false;
  }

  // Vérifier l'accès à une tâche
  private checkTaskAccess(task: any, userId: string, userRole: string): boolean {
    // Admin a accès à tout
    if (userRole === 'ADMINISTRATEUR') return true;
    
    // Créateur a accès
    if (task.creatorId === userId) return true;
    
    // Assigné a accès
    if (task.assigneeId === userId) return true;
    
    // Vérifier l'accès via le projet
    if (task.project) {
      return this.checkProjectAccess(task.project, userId, userRole);
    }
    
    // Vérifier l'accès via l'activité
    if (task.activity?.project) {
      return this.checkProjectAccess(task.activity.project, userId, userRole);
    }
    
    return false;
  }

  // Vérifier les droits de suppression
  private checkTaskDeleteRights(task: any, userId: string, userRole: string): boolean {
    // Admin peut tout supprimer
    if (userRole === 'ADMINISTRATEUR') return true;
    
    // Créateur de la tâche peut supprimer
    if (task.creatorId === userId) return true;
    
    // Créateur du projet peut supprimer
    if (task.project?.creatorId === userId) return true;
    
    // Chef de projet peut supprimer
    const projectParticipant = task.project?.participants?.find((p: any) => p.userId === userId);
    if (projectParticipant && ['Chef de projet', 'Chef de projet adjoint'].includes(projectParticipant.role)) {
      return true;
    }
    
    return false;
  }

  private async checkUserProjectAccess(userId: string, projectId: string): Promise<boolean> {
    const participant = await prisma.projectParticipant.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        }
      }
    });

    return participant?.isActive || false;
  }

  private applyTaskFilters(where: any, query: TaskListQuery) {
    if (query.status) {
      where.status = query.status;
    }

    if (query.priority) {
      where.priority = query.priority;
    }

    if (query.creatorId) {
      where.creatorId = query.creatorId;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.dueDate) {
      where.dueDate = { lte: new Date(query.dueDate) };
    }

    if (query.overdue) {
      where.dueDate = { lt: new Date() };
      where.status = { notIn: ['TERMINEE', 'ANNULEE'] };
    }
  }

  // MÉTHODE CORRIGÉE - getTaskIncludes()
  private getTaskIncludes() {
    return {
      creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        }
      },
      assignee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          specialization: true,
        }
      },
      project: {
        select: {
          id: true,
          title: true,
          description: true,
          objectives: true,
          status: true,
          startDate: true,
          endDate: true,
          budget: true,
          keywords: true,
          createdAt: true,
          updatedAt: true,
          creatorId: true, // ← AJOUT CRITIQUE
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            }
          },
          participants: {
            select: {
              userId: true,
              isActive: true,
              role: true,
            }
          }
        }
      },
      activity: {
        select: {
          id: true,
          title: true,
          description: true,
          objectives: true,
          methodology: true,
          location: true,
          startDate: true,
          endDate: true,
          results: true,
          conclusions: true,
          createdAt: true,
          updatedAt: true,
          projectId: true,
          project: {
            select: {
              id: true,
              title: true,
              description: true,
              objectives: true,
              status: true,
              startDate: true,
              endDate: true,
              budget: true,
              keywords: true,
              createdAt: true,
              updatedAt: true,
              creatorId: true, // ← AJOUT CRITIQUE
              participants: {
                select: {
                  userId: true,
                  isActive: true,
                  role: true,
                }
              }
            }
          }
        }
      },
      documents: {
        select: {
          id: true,
          title: true,
          filename: true,
          type: true,
          createdAt: true,
        }
      },
      _count: {
        select: {
          documents: true,
          comments: true,
        }
      }
    };
  }

  private formatTaskResponse(task: TaskWithRelations): TaskResponse {
    return {
      id: task.id,
      title: task.title,
      description: task.description || undefined,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate || undefined,
      completedAt: task.completedAt || undefined,
      progress: task.progress,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      creator: task.creator,
      assignee: task.assignee || undefined,
      project: task.project || undefined,
      activity: task.activity || undefined,
      documents: task.documents,
      _count: task._count,
    };
  }
}