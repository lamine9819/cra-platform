// src/services/project.service.ts
import { PrismaClient } from '@prisma/client';
import { ValidationError, AuthError } from '../utils/errors';
import { CreateProjectRequest, UpdateProjectRequest, ProjectListQuery, ProjectResponse } from '../types/project.types';
 

const prisma = new PrismaClient();

// Type pour les projets avec relations incluses
type ProjectWithRelations = {
  id: string;
  title: string;
  description?: string | null;
  objectives: string[];
  status: string;
  startDate?: Date | null;
  endDate?: Date | null;
  budget?: number | null;
  keywords: string[];
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  participants?: {
    id: string;
    role: string;
    joinedAt: Date;
    isActive: boolean;
    userId: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      specialization?: string | null;
    };
  }[];
  activities?: {
    id: string;
    title: string;
    description?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
    createdAt: Date;
  }[];
  _count?: {
    participants: number;
    activities: number;
    tasks: number;
    documents: number;
  };
};

export class ProjectService {

  // Créer un projet
  async createProject(projectData: CreateProjectRequest, creatorId: string): Promise<ProjectResponse> {
    // Vérifier que le créateur est un chercheur ou admin
    const creator = await prisma.user.findUnique({
      where: { id: creatorId }
    });

    if (!creator) {
      throw new ValidationError('Créateur non trouvé');
    }

    if (creator.role !== 'CHERCHEUR' && creator.role !== 'ADMINISTRATEUR') {
      throw new AuthError('Seuls les chercheurs et administrateurs peuvent créer des projets');
    }

    // Créer le projet
    const project = await prisma.project.create({
      data: {
        title: projectData.title,
        description: projectData.description,
        objectives: projectData.objectives,
        startDate: projectData.startDate ? new Date(projectData.startDate) : null,
        endDate: projectData.endDate ? new Date(projectData.endDate) : null,
        budget: projectData.budget,
        keywords: projectData.keywords,
        creatorId,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          }
        },
        _count: {
          select: {
            participants: true,
            activities: true,
            tasks: true,
            documents: true,
          }
        }
      }
    });

    // Ajouter automatiquement le créateur comme participant principal
    await prisma.projectParticipant.create({
      data: {
        projectId: project.id,
        userId: creatorId,
        role: 'Chef de projet',
      }
    });

    return this.formatProjectResponse(project);
  }

  // Lister les projets accessibles par l'utilisateur
  async listProjects(userId: string, userRole: string, query: ProjectListQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Construire les filtres de base
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.creatorId) {
      where.creatorId = query.creatorId;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { keywords: { has: query.search } },
      ];
    }

    if (query.startDate) {
      where.startDate = { gte: new Date(query.startDate) };
    }

    if (query.endDate) {
      where.endDate = { lte: new Date(query.endDate) };
    }

    // Filtrer selon les droits d'accès
    if (userRole !== 'ADMINISTRATEUR') {
      // Non-admin : seulement les projets où l'utilisateur est créateur ou participant
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
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            }
          },
          _count: {
            select: {
              participants: true,
              activities: true,
              tasks: true,
              documents: true,
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      }),
      prisma.project.count({ where })
    ]);

    return {
      projects: projects.map((project: ProjectWithRelations) => this.formatProjectResponse(project)),
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

  // Obtenir un projet par ID avec détails complets
  async getProjectById(projectId: string, userId: string, userRole: string): Promise<ProjectResponse> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
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
              }
            }
          },
          orderBy: {
            joinedAt: 'asc'
          }
        },
        activities: {
          select: {
            id: true,
            title: true,
            description: true,
            startDate: true,
            endDate: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            participants: true,
            activities: true,
            tasks: true,
            documents: true,
          }
        }
      }
    });

    if (!project) {
      throw new ValidationError('Projet non trouvé');
    }

    // Vérifier les droits d'accès
    const hasAccess = this.checkProjectAccess(project, userId, userRole);
    if (!hasAccess) {
      throw new AuthError('Accès refusé à ce projet');
    }

    return this.formatProjectResponse(project);
  }

  // Mettre à jour un projet
  async updateProject(projectId: string, updateData: UpdateProjectRequest, userId: string, userRole: string): Promise<ProjectResponse> {
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

    // Vérifier les droits de modification
    const canEdit = this.checkProjectEditRights(project, userId, userRole);
    if (!canEdit) {
      throw new AuthError('Permissions insuffisantes pour modifier ce projet');
    }

    // Préparer les données de mise à jour
    const dataToUpdate: any = {};
    if (updateData.title !== undefined) dataToUpdate.title = updateData.title;
    if (updateData.description !== undefined) dataToUpdate.description = updateData.description;
    if (updateData.objectives !== undefined) dataToUpdate.objectives = updateData.objectives;
    if (updateData.status !== undefined) dataToUpdate.status = updateData.status;
    if (updateData.budget !== undefined) dataToUpdate.budget = updateData.budget;
    if (updateData.keywords !== undefined) dataToUpdate.keywords = updateData.keywords;
    
    if (updateData.startDate !== undefined) {
      dataToUpdate.startDate = updateData.startDate ? new Date(updateData.startDate) : null;
    }
    if (updateData.endDate !== undefined) {
      dataToUpdate.endDate = updateData.endDate ? new Date(updateData.endDate) : null;
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: dataToUpdate,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
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
              }
            }
          }
        },
        _count: {
          select: {
            participants: true,
            activities: true,
            tasks: true,
            documents: true,
          }
        }
      }
    });

    return this.formatProjectResponse(updatedProject);
  }

  // Supprimer un projet
  async deleteProject(projectId: string, userId: string, userRole: string): Promise<void> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        creatorId: true,
        status: true,
      }
    });

    if (!project) {
      throw new ValidationError('Projet non trouvé');
    }

    // Vérifier les droits de suppression (créateur ou admin)
    if (project.creatorId !== userId && userRole !== 'ADMINISTRATEUR') {
      throw new AuthError('Seul le créateur du projet ou un administrateur peut le supprimer');
    }

    // Empêcher la suppression des projets en cours
    if (project.status === 'EN_COURS') {
      throw new ValidationError('Impossible de supprimer un projet en cours. Changez d\'abord le statut.');
    }

    // Supprimer le projet (cascade dans Prisma supprimera les entités liées)
    await prisma.project.delete({
      where: { id: projectId }
    });
  }

  // Ajouter un participant au projet
  async addParticipant(projectId: string, userId: string, role: string, requesterId: string, requesterRole: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new ValidationError('Projet non trouvé');
    }

    // Vérifier les droits (créateur ou admin)
    if (project.creatorId !== requesterId && requesterRole !== 'ADMINISTRATEUR') {
      throw new AuthError('Seul le créateur du projet ou un administrateur peut ajouter des participants');
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.isActive) {
      throw new ValidationError('Utilisateur non trouvé ou inactif');
    }

    // Vérifier que l'utilisateur n'est pas déjà participant
    const existingParticipant = await prisma.projectParticipant.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        }
      }
    });

    if (existingParticipant) {
      throw new ValidationError('Cet utilisateur est déjà participant du projet');
    }

    // Ajouter le participant
    await prisma.projectParticipant.create({
      data: {
        projectId,
        userId,
        role,
      }
    });

    return { message: 'Participant ajouté avec succès' };
  }

  // Retirer un participant du projet
  // DANS ProjectService.removeParticipant, remplace la méthode par :

async removeParticipant(projectId: string, participantId: string, requesterId: string, requesterRole: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw new ValidationError('Projet non trouvé');
  }

  // Vérifier les droits (créateur ou admin)
  if (project.creatorId !== requesterId && requesterRole !== 'ADMINISTRATEUR') {
    throw new AuthError('Seul le créateur du projet ou un administrateur peut retirer des participants');
  }

  // Vérifier que le participant existe et obtenir ses infos
  const participant = await prisma.projectParticipant.findUnique({
    where: { id: participantId },
    include: {
      user: true
    }
  });

  if (!participant) {
    throw new ValidationError('Participant non trouvé');
  }

  if (participant.projectId !== projectId) {
    throw new ValidationError('Ce participant n\'appartient pas à ce projet');
  }

  // Empêcher de retirer le créateur du projet
  if (participant.userId === project.creatorId) {
    throw new ValidationError('Impossible de retirer le créateur du projet');
  }

  // Supprimer le participant (suppression complète, pas juste désactivation)
  await prisma.projectParticipant.delete({
    where: { id: participantId }
  });

  return { message: 'Participant retiré avec succès' };
}

  // Vérifier l'accès à un projet
  private checkProjectAccess(project: ProjectWithRelations, userId: string, userRole: string): boolean {
    // Admin a accès à tout
    if (userRole === 'ADMINISTRATEUR') return true;
    
  // Créateur a accès
    if (project.creatorId === userId) return true;
    
    // Participant actif a accès
    if (project.participants?.some((p: any) => p.userId === userId && p.isActive)) return true;
    
    return false;
  }

  // Vérifier les droits d'édition
  private checkProjectEditRights(project: any, userId: string, userRole: string): boolean {
    // Admin peut tout modifier
    if (userRole === 'ADMINISTRATEUR') return true;
    
    // Créateur peut modifier
    if (project.creatorId === userId) return true;
    
    // Participant avec rôle spécial (à définir selon vos besoins)
    // Par exemple, un participant avec le rôle "Chef de projet adjoint"
    const participantRole = project.participants?.find((p: any) => p.userId === userId)?.role;
    if (participantRole && ['Chef de projet', 'Responsable','Co-Responsable','Chercheur principal','Chercheur associé'].includes(participantRole)) {
      return true;
    }
    
    return false;
  }

  // Formater la réponse projet
  private formatProjectResponse(project: ProjectWithRelations): ProjectResponse {
    return {
      id: project.id,
      title: project.title,
      description: project.description || undefined,
      objectives: project.objectives,
      status: project.status,
      startDate: project.startDate || undefined,
      endDate: project.endDate || undefined,
      budget: project.budget || undefined,
      keywords: project.keywords || undefined,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      creator: project.creator,
      participants: project.participants ? project.participants.map((p: any) => ({
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
        }
      })) : [], 
      activities: project.activities ? project.activities.map((a: any) => ({
        id: a.id,
        title: a.title,
        description: a.description || undefined,
        startDate: a.startDate || undefined,
        endDate: a.endDate || undefined,
        createdAt: a.createdAt,
      })) : [],
      _count: project._count ,
    };
  }
}