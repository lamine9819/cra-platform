// src/services/document.service.ts - Version améliorée
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { ValidationError, AuthError } from '../utils/errors';
import { UploadFileRequest, ShareDocumentRequest, DocumentListQuery, DocumentResponse } from '../types/document.types';
import { getFileTypeFromMime, deleteFile } from '../utils/fileHelpers';

const prisma = new PrismaClient();

// Type pour les documents avec relations incluses
type DocumentWithRelations = {
  id: string;
  title: string;
  filename: string;
  filepath: string;
  mimeType: string;
  size: bigint;
  type: string;
  description?: string | null;
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  projectId?: string | null;
  activityId?: string | null;
  taskId?: string | null;
  seminarId?: string | null;
  
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
    description?: string | null;
    creatorId: string;
    participants?: {
      id: string;
      userId: string;
      isActive: boolean;
      role: string;
    }[];
  } | null;
  
  activity?: {
    id: string;
    title: string;
    projectId: string;
    project: {
      id: string;
      title: string;
      creatorId: string;
      participants?: {
        userId: string;
        isActive: boolean;
      }[];
    };
  } | null;
  
  task?: {
    id: string;
    title: string;
    creatorId: string;
    assigneeId?: string | null;
    projectId?: string | null;
    project?: {
      id: string;
      title: string;
      creatorId: string;
      participants?: {
        userId: string;
        isActive: boolean;
      }[];
    } | null;
  } | null;
  
  seminar?: {
    id: string;
    title: string;
    organizerId: string;
    organizer: {
      id: string;
      firstName: string;
      lastName: string;
    };
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

    // Auto-déterminer le type si pas fourni
    if (!documentData.type) {
      documentData.type = getFileTypeFromMime(file.mimetype) as any;
    }

    // Créer le document en base
    const document = await prisma.document.create({
      data: {
        title: documentData.title,
        filename: file.originalname,
        filepath: file.path,
        mimeType: file.mimetype,
        size: BigInt(file.size),
        type: documentData.type,
        description: documentData.description,
        tags: documentData.tags || [],
        isPublic: documentData.isPublic || false,
        ownerId,
        projectId: documentData.projectId,
        activityId: documentData.activityId,
        taskId: documentData.taskId,
        seminarId: documentData.seminarId,
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

    // Filtrer selon les droits d'accès (amélioré)
    if (userRole !== 'ADMINISTRATEUR') {
      where.OR = [
        { ownerId: userId }, // Mes documents
        { isPublic: true }, // Documents publics
        { 
          shares: {
            some: { sharedWithId: userId }
          }
        }, // Documents partagés avec moi
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
        }, // Documents de projets où je participe
        {
          activity: {
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
        }, // Documents d'activités de mes projets
        {
          task: {
            OR: [
              { creatorId: userId },
              { assigneeId: userId }
            ]
          }
        } // Documents de mes tâches
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
    const hasAccess = this.checkDocumentAccess(document as DocumentWithRelations, userId, userRole);
    if (!hasAccess) {
      throw new AuthError('Accès refusé à ce document');
    }

    return this.formatDocumentResponse(document as DocumentWithRelations);
  }

  // Partager un document (IMPLÉMENTATION COMPLÈTE)
  async shareDocument(
    documentId: string,
    shareData: ShareDocumentRequest,
    userId: string,
    userRole: string
  ) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        project: {
          include: { participants: true }
        },
        activity: {
          include: {
            project: { include: { participants: true } }
          }
        }
      }
    });

    if (!document) {
      throw new ValidationError('Document non trouvé');
    }

    // Vérifier les droits de partage
    const canShare = this.canShareDocument(document as any, userId, userRole);
    if (!canShare) {
      throw new AuthError('Permissions insuffisantes pour partager ce document');
    }

    // Vérifier que tous les utilisateurs existent et ont accès au contexte
    const users = await prisma.user.findMany({
      where: {
        id: { in: shareData.userIds },
        isActive: true
      }
    });

    if (users.length !== shareData.userIds.length) {
      throw new ValidationError('Un ou plusieurs utilisateurs sont introuvables ou inactifs');
    }

    // Vérifier l'accès au contexte pour chaque utilisateur
    for (const user of users) {
      const hasContextAccess = await this.checkUserContextAccess(document as any, user.id, user.role);
      if (!hasContextAccess) {
        throw new AuthError(`L'utilisateur ${user.firstName} ${user.lastName} n'a pas accès au contexte de ce document`);
      }
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

  // Supprimer un document (IMPLÉMENTATION COMPLÈTE)
  async deleteDocument(documentId: string, userId: string, userRole: string): Promise<void> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        shares: {
          where: { sharedWithId: userId }
        },
        project: {
          include: { participants: true }
        },
        activity: {
          include: {
            project: { include: { participants: true } }
          }
        }
      }
    });

    if (!document) {
      throw new ValidationError('Document non trouvé');
    }

    // Vérifier les droits de suppression (amélioré)
    const canDelete = this.canDeleteDocument(document as any, userId, userRole);
    if (!canDelete) {
      throw new AuthError('Permissions insuffisantes pour supprimer ce document');
    }

    // Supprimer le fichier physique
    try {
      await deleteFile(document.filepath);
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
      // Continuer même si la suppression physique échoue
    }

    // Supprimer de la base (les partages sont supprimés en cascade)
    await prisma.document.delete({
      where: { id: documentId }
    });
  }

  // Lier un document à un projet
  async linkToProject(documentId: string, projectId: string, userId: string, userRole: string): Promise<DocumentResponse> {
    // Vérifier que le document existe et que l'utilisateur peut le modifier
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { shares: true }
    });

    if (!document) {
      throw new ValidationError('Document non trouvé');
    }

    const canEdit = this.canEditDocument(document as any, userId, userRole);
    if (!canEdit) {
      throw new AuthError('Permissions insuffisantes pour modifier ce document');
    }

    // Vérifier l'accès au projet
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { participants: true }
    });

    if (!project) {
      throw new ValidationError('Projet non trouvé');
    }

    const hasProjectAccess = project.creatorId === userId ||
                           project.participants.some(p => p.userId === userId && p.isActive) ||
                           userRole === 'ADMINISTRATEUR';

    if (!hasProjectAccess) {
      throw new AuthError('Accès refusé au projet');
    }

    // Mettre à jour le document
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: { 
        projectId,
        activityId: null // Un document ne peut être lié qu'à un projet OU une activité
      },
      include: this.getDocumentIncludes()
    });

    return this.formatDocumentResponse(updatedDocument as DocumentWithRelations);
  }

  // Lier un document à une activité
  async linkToActivity(documentId: string, activityId: string, userId: string, userRole: string): Promise<DocumentResponse> {
    // Vérifier que le document existe et que l'utilisateur peut le modifier
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { shares: true }
    });

    if (!document) {
      throw new ValidationError('Document non trouvé');
    }

    const canEdit = this.canEditDocument(document as any, userId, userRole);
    if (!canEdit) {
      throw new AuthError('Permissions insuffisantes pour modifier ce document');
    }

    // Vérifier l'accès à l'activité
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        project: {
          include: { participants: true }
        }
      }
    });

    if (!activity) {
      throw new ValidationError('Activité non trouvée');
    }

    const hasActivityAccess = activity.project.creatorId === userId ||
                            activity.project.participants.some(p => p.userId === userId && p.isActive) ||
                            userRole === 'ADMINISTRATEUR';

    if (!hasActivityAccess) {
      throw new AuthError('Accès refusé à cette activité');
    }

    // Mettre à jour le document
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: { 
        activityId,
        projectId: activity.projectId // Maintenir la cohérence avec le projet parent
      },
      include: this.getDocumentIncludes()
    });

    return this.formatDocumentResponse(updatedDocument as DocumentWithRelations);
  }

  // Délier un document (retirer du projet/activité)
  async unlinkDocument(documentId: string, userId: string, userRole: string): Promise<DocumentResponse> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { shares: true }
    });

    if (!document) {
      throw new ValidationError('Document non trouvé');
    }

    const canEdit = this.canEditDocument(document as any, userId, userRole);
    if (!canEdit) {
      throw new AuthError('Permissions insuffisantes pour modifier ce document');
    }

    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: { 
        projectId: null,
        activityId: null
      },
      include: this.getDocumentIncludes()
    });

    return this.formatDocumentResponse(updatedDocument as DocumentWithRelations);
  }

  // Obtenir le chemin du fichier pour téléchargement
  async getDocumentFilePath(documentId: string, userId: string, userRole: string): Promise<{
    filepath: string;
    filename: string;
    mimeType: string;
  }> {
    const document = await this.getDocumentById(documentId, userId, userRole);
    
    // Vérifier que le fichier existe physiquement
    if (!fs.existsSync(document.filepath)) {
      throw new ValidationError('Fichier physique non trouvé');
    }

    return {
      filepath: document.filepath,
      filename: document.filename,
      mimeType: document.mimeType,
    };
  }

  // MÉTHODES PRIVÉES AMÉLIORÉES

  // Valider l'accès aux entités liées
  private async validateEntityAccess(
    documentData: UploadFileRequest,
    userId: string,
    userRole: string
  ) {
    if (documentData.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: documentData.projectId },
        include: {
          participants: {
            where: { userId: userId }
          }
        }
      });

      if (!project) {
        throw new ValidationError('Projet non trouvé');
      }

      const hasAccess = project.creatorId === userId ||
                       project.participants.some((p: { isActive: boolean }) => p.isActive) ||
                       userRole === 'ADMINISTRATEUR';

      if (!hasAccess) {
        throw new AuthError('Accès refusé à ce projet');
      }
    }

    if (documentData.activityId) {
      const activity = await prisma.activity.findUnique({
        where: { id: documentData.activityId },
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

      const hasAccess = activity.project.creatorId === userId ||
                       activity.project.participants.some((p: { isActive: boolean }) => p.isActive) ||
                       userRole === 'ADMINISTRATEUR';

      if (!hasAccess) {
        throw new AuthError('Accès refusé à cette activité');
      }
    }

    if (documentData.taskId) {
      const task = await prisma.task.findUnique({
        where: { id: documentData.taskId }
      });

      if (!task) {
        throw new ValidationError('Tâche non trouvée');
      }

      const hasAccess = task.creatorId === userId ||
                       task.assigneeId === userId ||
                       userRole === 'ADMINISTRATEUR';

      if (!hasAccess) {
        throw new AuthError('Accès refusé à cette tâche');
      }
    }
  }

  // Vérifier l'accès à un document
  private checkDocumentAccess(document: DocumentWithRelations, userId: string, userRole: string): boolean {
    // Admin a accès à tout
    if (userRole === 'ADMINISTRATEUR') return true;
    
    // Propriétaire a accès
    if (document.ownerId === userId) return true;
    
    // Document public
    if (document.isPublic) return true;
    
    // Document partagé avec l'utilisateur
    if (document.shares?.some((share: { sharedWithId: string }) => share.sharedWithId === userId)) return true;
    
    // Accès via projet
    if (document.project) {
      const isProjectMember = document.project.creatorId === userId ||
                             document.project.participants?.some((p: { userId: string; isActive: boolean }) => p.userId === userId && p.isActive);
      if (isProjectMember) return true;
    }

    // Accès via activité
    if (document.activity) {
      const isActivityMember = document.activity.project.creatorId === userId ||
                              document.activity.project.participants?.some((p: { userId: string; isActive: boolean }) => p.userId === userId && p.isActive);
      if (isActivityMember) return true;
    }

    // Accès via tâche
    if (document.task) {
      if (document.task.creatorId === userId || document.task.assigneeId === userId) return true;
    }
    
    return false;
  }

  // Vérifier si l'utilisateur peut partager le document
  private canShareDocument(document: any, userId: string, userRole: string): boolean {
    if (userRole === 'ADMINISTRATEUR') return true;
    if (document.ownerId === userId) return true;
    
    // Créateur du projet peut partager les documents du projet
    if (document.project && document.project.creatorId === userId) return true;
    
    // Créateur de l'activité (via projet) peut partager les documents de l'activité
    if (document.activity && document.activity.project.creatorId === userId) return true;
    
    return false;
  }

  // Vérifier si l'utilisateur peut supprimer le document
  private canDeleteDocument(document: any, userId: string, userRole: string): boolean {
    if (userRole === 'ADMINISTRATEUR') return true;
    if (document.ownerId === userId) return true;
    
    // Partage avec droits de suppression
    if (document.shares?.some((share: { sharedWithId: string; canDelete: boolean }) => 
        share.sharedWithId === userId && share.canDelete)) return true;
    
    return false;
  }

  // Vérifier si l'utilisateur peut modifier le document
  private canEditDocument(document: any, userId: string, userRole: string): boolean {
    if (userRole === 'ADMINISTRATEUR') return true;
    if (document.ownerId === userId) return true;
    
    // Partage avec droits d'édition
    if (document.shares?.some((share: { sharedWithId: string; canEdit: boolean }) => 
        share.sharedWithId === userId && share.canEdit)) return true;
    
    return false;
  }

  // Vérifier l'accès d'un utilisateur au contexte du document
  private async checkUserContextAccess(document: any, userId: string, userRole: string): Promise<boolean> {
    if (userRole === 'ADMINISTRATEUR') return true;
    
    // Si document lié à un projet
    if (document.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: document.projectId },
        include: { participants: true }
      });
      
      if (project) {
        return project.creatorId === userId || 
               project.participants.some(p => p.userId === userId && p.isActive);
      }
    }
    
    // Si document lié à une activité
    if (document.activityId) {
      const activity = await prisma.activity.findUnique({
        where: { id: document.activityId },
        include: {
          project: { include: { participants: true } }
        }
      });
      
      if (activity) {
        return activity.project.creatorId === userId || 
               activity.project.participants.some(p => p.userId === userId && p.isActive);
      }
    }
    
    return true; // Si pas de contexte spécifique, autoriser
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
          participants: {
            select: {
              id: true,
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
          projectId: true,
          project: {
            select: {
              id: true,
              title: true,
              creatorId: true,
              participants: {
                select: {
                  userId: true,
                  isActive: true,
                }
              }
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
          projectId: true,
          project: {
            select: {
              id: true,
              title: true,
              creatorId: true,
              participants: {
                select: {
                  userId: true,
                  isActive: true,
                }
              }
            }
          }
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
      description: document.description || undefined,
      tags: document.tags,
      isPublic: document.isPublic,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      owner: document.owner,
      project: document.project || undefined,
      activity: document.activity || undefined,
      task: document.task || undefined,
      seminar: document.seminar || undefined,
      shares: document.shares?.map((share: {
        id: string;
        canEdit: boolean;
        canDelete: boolean;
        sharedAt: Date;
        sharedWith: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
        };
      }) => ({
        id: share.id,
        canEdit: share.canEdit,
        canDelete: share.canDelete,
        sharedAt: share.sharedAt,
        sharedWith: share.sharedWith,
      })),
    };
  }
}