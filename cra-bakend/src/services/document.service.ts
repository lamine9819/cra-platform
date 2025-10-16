// src/services/document.service.ts - Version mise à jour conforme au schéma Prisma
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { ValidationError, AuthError } from '../utils/errors';
import { UploadFileRequest, ShareDocumentRequest, DocumentListQuery, DocumentResponse } from '../types/document.types';
import { getFileTypeFromMime, deleteFile } from '../utils/fileHelpers';

const prisma = new PrismaClient();

// Type pour les documents avec toutes les relations possibles
type DocumentWithRelations = {
  id: string;
  title: string;
  filename: string;
  filepath: string;
  mimeType: string;
  size: bigint;
  type: string;
  description: string | null;
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  
  // Relations optionnelles
  projectId: string | null;
  activityId: string | null;
  taskId: string | null;
  seminarId: string | null;
  trainingId: string | null;
  internshipId: string | null;
  supervisionId: string | null;
  knowledgeTransferId: string | null;
  eventId: string | null;
  
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  
  project?: {
    id: string;
    title: string;
    description: string | null;
    creatorId: string;
    participants?: { userId: string; isActive: boolean }[];
  } | null;
  
  activity?: {
    id: string;
    title: string;
    projectId: string | null;
    project: {
      id: string;
      title: string;
      creatorId: string;
      participants?: { userId: string; isActive: boolean }[];
    } | null;
  } | null;
  
  task?: {
    id: string;
    title: string;
    creatorId: string;
    assigneeId: string | null;
  } | null;
  
  seminar?: {
    id: string;
    title: string;
    organizerId: string;
    organizer: { id: string; firstName: string; lastName: string };
  } | null;
  
  training?: {
    id: string;
    title: string;
    type: string;
  } | null;
  
  internship?: {
    id: string;
    title: string;
    supervisorId: string;
    internId: string;
  } | null;
  
  supervision?: {
    id: string;
    title: string;
    type: string;
    supervisorId: string;
    studentId: string;
  } | null;
  
  knowledgeTransfer?: {
    id: string;
    title: string;
    type: string;
    organizerId: string;
  } | null;
  
  event?: {
    id: string;
    title: string;
    type: string;
    creatorId: string;
  } | null;
  
  shares?: {
    id: string;
    canEdit: boolean;
    canDelete: boolean;
    sharedAt: Date;
    sharedWithId: string;
    sharedWith: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }[];
};

export class DocumentService {

  // Créer un document après upload
  async createDocument(
    file: Express.Multer.File,
    documentData: UploadFileRequest,
    ownerId: string,
    userRole: string
  ): Promise<DocumentResponse> {
    // Vérifier les permissions d'accès aux entités liées
    await this.validateEntityAccess(documentData, ownerId, userRole);

    // Auto-déterminer le type si pas fourni et le caster en DocumentType
    const documentType = (documentData.type || getFileTypeFromMime(file.mimetype)) as any;

    // Créer le document en base
    const document = await prisma.document.create({
      data: {
        title: documentData.title,
        filename: file.originalname,
        filepath: file.path,
        mimeType: file.mimetype,
        size: BigInt(file.size),
        type: documentType,
        description: documentData.description || null,
        tags: documentData.tags || [],
        isPublic: documentData.isPublic || false,
        ownerId,
        projectId: documentData.projectId || null,
        activityId: documentData.activityId || null,
        taskId: documentData.taskId || null,
        seminarId: documentData.seminarId || null,
        trainingId: documentData.trainingId || null,
        internshipId: documentData.internshipId || null,
        supervisionId: documentData.supervisionId || null,
        knowledgeTransferId: documentData.knowledgeTransferId || null,
        eventId: documentData.eventId || null,
      },
      include: this.getDocumentIncludes()
    });

    return this.formatDocumentResponse(document as DocumentWithRelations);
  }

  // Lister les documents accessibles avec filtres améliorés
  async listDocuments(userId: string, userRole: string, query: DocumentListQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Construire les filtres
    const where: any = {};

    if (query.type) where.type = query.type;
    if (query.ownerId) where.ownerId = query.ownerId;
    if (query.projectId) where.projectId = query.projectId;
    if (query.activityId) where.activityId = query.activityId;
    if (query.taskId) where.taskId = query.taskId;
    if (query.seminarId) where.seminarId = query.seminarId;
    if (query.trainingId) where.trainingId = query.trainingId;
    if (query.internshipId) where.internshipId = query.internshipId;
    if (query.supervisionId) where.supervisionId = query.supervisionId;
    if (query.knowledgeTransferId) where.knowledgeTransferId = query.knowledgeTransferId;
    if (query.eventId) where.eventId = query.eventId;
    if (query.mimeType) where.mimeType = query.mimeType;
    if (query.isPublic !== undefined) where.isPublic = query.isPublic;

    if (query.tags && query.tags.length > 0) {
      where.tags = { hasSome: query.tags };
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { filename: { contains: query.search, mode: 'insensitive' } },
        { tags: { has: query.search } },
      ];
    }

    // Filtrer selon les droits d'accès
    if (userRole !== 'ADMINISTRATEUR') {
      where.OR = [
        { ownerId: userId },
        { isPublic: true },
        { shares: { some: { sharedWithId: userId } } },
        {
          project: {
            OR: [
              { creatorId: userId },
              { participants: { some: { userId: userId, isActive: true } } }
            ]
          }
        },
        {
          activity: {
            OR: [
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
            ]
          }
        },
        { task: { OR: [{ creatorId: userId }, { assigneeId: userId }] } },
        { seminar: { organizerId: userId } },
        { training: { participants: { some: { userId: userId } } } },
        { internship: { OR: [{ supervisorId: userId }, { internId: userId }] } },
        { supervision: { OR: [{ supervisorId: userId }, { studentId: userId }] } },
        { knowledgeTransfer: { organizerId: userId } },
        { event: { OR: [{ creatorId: userId }, { participants: { some: { participantId: userId } } }] } }
      ];
    }

    // Exécuter la requête
    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        include: this.getDocumentIncludes(),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.document.count({ where })
    ]);

    return {
      documents: documents.map((doc) => this.formatDocumentResponse(doc as DocumentWithRelations)),
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

  // Obtenir un document par ID
  async getDocumentById(documentId: string, userId: string, userRole: string): Promise<DocumentResponse> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: this.getDocumentIncludes()
    });

    if (!document) {
      throw new ValidationError('Document non trouvé');
    }

    // Vérifier les droits d'accès
    const hasAccess = await this.checkDocumentAccess(document as DocumentWithRelations, userId, userRole);
    if (!hasAccess) {
      throw new AuthError('Accès refusé à ce document');
    }

    return this.formatDocumentResponse(document as DocumentWithRelations);
  }

  // Partager un document
  async shareDocument(
    documentId: string,
    shareData: ShareDocumentRequest,
    userId: string,
    userRole: string
  ) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: this.getDocumentIncludes()
    });

    if (!document) {
      throw new ValidationError('Document non trouvé');
    }

    // Vérifier les droits de partage
    const canShare = await this.canShareDocument(document as any, userId, userRole);
    if (!canShare) {
      throw new AuthError('Permissions insuffisantes pour partager ce document');
    }

    // Vérifier que tous les utilisateurs existent
    const users = await prisma.user.findMany({
      where: {
        id: { in: shareData.userIds },
        isActive: true
      }
    });

    if (users.length !== shareData.userIds.length) {
      throw new ValidationError('Un ou plusieurs utilisateurs sont introuvables ou inactifs');
    }

    // Créer les partages
    const shares = await Promise.all(
      shareData.userIds.map(async (userToShareId) => {
        return prisma.documentShare.upsert({
          where: {
            documentId_sharedWithId: {
              documentId,
              sharedWithId: userToShareId
            }
          },
          update: {
            canEdit: shareData.canEdit || false,
            canDelete: shareData.canDelete || false,
          },
          create: {
            documentId,
            sharedWithId: userToShareId,
            canEdit: shareData.canEdit || false,
            canDelete: shareData.canDelete || false,
          },
          include: {
            sharedWith: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        });
      })
    );

    return {
      message: 'Document partagé avec succès',
      shares: shares.map((share: any) => ({
        id: share.id,
        canEdit: share.canEdit,
        canDelete: share.canDelete,
        sharedAt: share.sharedAt,
        sharedWith: share.sharedWith,
      }))
    };
  }

  // Supprimer un document
  async deleteDocument(documentId: string, userId: string, userRole: string): Promise<void> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        shares: { where: { sharedWithId: userId } }
      }
    });

    if (!document) {
      throw new ValidationError('Document non trouvé');
    }

    // Vérifier les droits de suppression
    const canDelete = await this.canDeleteDocument(document as any, userId, userRole);
    if (!canDelete) {
      throw new AuthError('Permissions insuffisantes pour supprimer ce document');
    }

    // Supprimer le fichier physique
    try {
      await deleteFile(document.filepath);
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
    }

    // Supprimer de la base
    await prisma.document.delete({
      where: { id: documentId }
    });
  }

  // Obtenir le chemin du fichier pour téléchargement
  async getDocumentFilePath(documentId: string, userId: string, userRole: string): Promise<{
    filepath: string;
    filename: string;
    mimeType: string;
  }> {
    const document = await this.getDocumentById(documentId, userId, userRole);
    
    if (!fs.existsSync(document.filepath)) {
      throw new ValidationError('Fichier physique non trouvé');
    }

    return {
      filepath: document.filepath,
      filename: document.filename,
      mimeType: document.mimeType,
    };
  }

  // MÉTHODES PRIVÉES

  // Valider l'accès aux entités liées
  private async validateEntityAccess(
    documentData: UploadFileRequest,
    userId: string,
    userRole: string
  ) {
    // Validation pour chaque type d'entité
    const validations = [
      { id: documentData.projectId, type: 'project' },
      { id: documentData.activityId, type: 'activity' },
      { id: documentData.taskId, type: 'task' },
      { id: documentData.seminarId, type: 'seminar' },
      { id: documentData.trainingId, type: 'training' },
      { id: documentData.internshipId, type: 'internship' },
      { id: documentData.supervisionId, type: 'supervision' },
      { id: documentData.knowledgeTransferId, type: 'knowledgeTransfer' },
      { id: documentData.eventId, type: 'event' }
    ];

    for (const { id, type } of validations) {
      if (id) {
        const hasAccess = await this.validateSpecificEntityAccess(id, type, userId, userRole);
        if (!hasAccess) {
          throw new AuthError(`Accès refusé à ce(tte) ${type}`);
        }
      }
    }
  }

  // Valider l'accès à une entité spécifique
  private async validateSpecificEntityAccess(
    entityId: string,
    entityType: string,
    userId: string,
    userRole: string
  ): Promise<boolean> {
    if (userRole === 'ADMINISTRATEUR') return true;

    switch (entityType) {
      case 'project':
        const project = await prisma.project.findUnique({
          where: { id: entityId },
          include: { participants: { where: { userId } } }
        });
        return !!project && (project.creatorId === userId || project.participants.some(p => p.isActive));

      case 'activity':
        const activity = await prisma.activity.findUnique({
          where: { id: entityId },
          include: { participants: { where: { userId } } }
        });
        return !!activity && (activity.responsibleId === userId || activity.participants.some(p => p.isActive));

      case 'task':
        const task = await prisma.task.findUnique({ where: { id: entityId } });
        return !!task && (task.creatorId === userId || task.assigneeId === userId);

      case 'training':
        const training = await prisma.training.findUnique({
          where: { id: entityId },
          include: { participants: { where: { userId } } }
        });
        return !!training && training.participants.length > 0;

      case 'internship':
        const internship = await prisma.internship.findUnique({ where: { id: entityId } });
        return !!internship && (internship.supervisorId === userId || internship.internId === userId);

      case 'supervision':
        const supervision = await prisma.supervision.findUnique({ where: { id: entityId } });
        return !!supervision && (supervision.supervisorId === userId || supervision.studentId === userId);

      default:
        return true;
    }
  }

  // Vérifier l'accès à un document
  private async checkDocumentAccess(document: DocumentWithRelations, userId: string, userRole: string): Promise<boolean> {
    if (userRole === 'ADMINISTRATEUR') return true;
    if (document.ownerId === userId) return true;
    if (document.isPublic) return true;
    if (document.shares?.some(share => share.sharedWithId === userId)) return true;

    // Vérifier l'accès via les entités liées
    if (document.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: document.projectId },
        include: { participants: { where: { userId, isActive: true } } }
      });
      if (project && (project.creatorId === userId || project.participants.length > 0)) return true;
    }

    if (document.activityId) {
      const activity = await prisma.activity.findUnique({
        where: { id: document.activityId },
        include: { participants: { where: { userId, isActive: true } } }
      });
      if (activity && (activity.responsibleId === userId || activity.participants.length > 0)) return true;
    }

    return false;
  }

  // Vérifier si l'utilisateur peut partager le document
  private async canShareDocument(document: any, userId: string, userRole: string): Promise<boolean> {
    if (userRole === 'ADMINISTRATEUR') return true;
    if (document.ownerId === userId) return true;
    return false;
  }

  // Vérifier si l'utilisateur peut supprimer le document
  private async canDeleteDocument(document: any, userId: string, userRole: string): Promise<boolean> {
    if (userRole === 'ADMINISTRATEUR') return true;
    if (document.ownerId === userId) return true;
    if (document.shares?.some((s: any) => s.sharedWithId === userId && s.canDelete)) return true;
    return false;
  }

  // Inclusions pour les requêtes
  private getDocumentIncludes() {
    return {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        }
      },
      project: {
        select: {
          id: true,
          title: true,
          description: true,
          creatorId: true,
          participants: { select: { userId: true, isActive: true } }
        }
      },
      activity: {
        select: {
          id: true,
          title: true,
          projectId: true,
          project: {
            select: {
              id: true,
              title: true,
              creatorId: true,
              participants: { select: { userId: true, isActive: true } }
            }
          }
        }
      },
      task: {
        select: {
          id: true,
          title: true,
          creatorId: true,
          assigneeId: true,
        }
      },
      seminar: {
        select: {
          id: true,
          title: true,
          organizerId: true,
          organizer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            }
          }
        }
      },
      training: {
        select: {
          id: true,
          title: true,
          type: true,
        }
      },
      internship: {
        select: {
          id: true,
          title: true,
          supervisorId: true,
          internId: true,
        }
      },
      supervision: {
        select: {
          id: true,
          title: true,
          type: true,
          supervisorId: true,
          studentId: true,
        }
      },
      knowledgeTransfer: {
        select: {
          id: true,
          title: true,
          type: true,
          organizerId: true,
        }
      },
      event: {
        select: {
          id: true,
          title: true,
          type: true,
          creatorId: true,
        }
      },
      shares: {
        include: {
          sharedWith: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        }
      }
    };
  }

  // Formater la réponse document
  private formatDocumentResponse(document: DocumentWithRelations): DocumentResponse {
    return {
      id: document.id,
      title: document.title,
      filename: document.filename,
      filepath: document.filepath,
      mimeType: document.mimeType,
      size: Number(document.size),
      type: document.type,
      description: document.description ?? undefined,
      tags: document.tags,
      isPublic: document.isPublic,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      owner: document.owner,
      project: document.project ? {
        id: document.project.id,
        title: document.project.title,
        description: document.project.description ?? undefined,
        creatorId: document.project.creatorId,
        participants: document.project.participants
      } : undefined,
      activity: document.activity ? {
        id: document.activity.id,
        title: document.activity.title,
        projectId: document.activity.projectId,
        project: document.activity.project ?? null
      } : undefined,
      task: document.task ? {
        id: document.task.id,
        title: document.task.title,
        creatorId: document.task.creatorId,
        assigneeId: document.task.assigneeId ?? undefined
      } : undefined,
      seminar: document.seminar || undefined,
      training: document.training || undefined,
      internship: document.internship || undefined,
      supervision: document.supervision || undefined,
      knowledgeTransfer: document.knowledgeTransfer || undefined,
      event: document.event || undefined,
      shares: document.shares?.map((share) => ({
        id: share.id,
        canEdit: share.canEdit,
        canDelete: share.canDelete,
        sharedAt: share.sharedAt,
        sharedWith: share.sharedWith,
      })),
    };
  }
}