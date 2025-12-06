// src/services/document.service.NEW_METHODS.ts
// NOUVELLES MÉTHODES À AJOUTER À document.service.ts

import { PrismaClient, DocumentType } from '@prisma/client';
import { ValidationError, AuthError, NotFoundError } from '../utils/errors';
import { deleteFile } from '../utils/fileHelpers';

const prisma = new PrismaClient();

export class DocumentServiceNewMethods {

  // =============================================
  // HELPER: Vérifier les permissions
  // =============================================

  private async canEditDocument(documentId: string, userId: string, userRole: string): Promise<boolean> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        shares: {
          where: { sharedWithId: userId }
        }
      }
    });

    if (!document) return false;

    // Propriétaire
    if (document.ownerId === userId) return true;

    // Administrateur
    if (userRole === 'ADMINISTRATEUR') return true;

    // Partagé avec permission d'édition
    const share = document.shares.find(s => s.sharedWithId === userId);
    if (share && share.canEdit) return true;

    return false;
  }

  private async canDeleteDocument(documentId: string, userId: string, userRole: string): Promise<boolean> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        shares: {
          where: { sharedWithId: userId }
        }
      }
    });

    if (!document) return false;

    // Propriétaire
    if (document.ownerId === userId) return true;

    // Administrateur
    if (userRole === 'ADMINISTRATEUR') return true;

    // Partagé avec permission de suppression
    const share = document.shares.find(s => s.sharedWithId === userId);
    if (share && share.canDelete) return true;

    return false;
  }

  // =============================================
  // PHASE 1 - ENDPOINTS CRITIQUES
  // =============================================

  /**
   * Mettre à jour les métadonnées d'un document
   */
  async updateDocumentMetadata(
    documentId: string,
    updateData: {
      title?: string;
      description?: string;
      type?: string;
      tags?: string[];
      isPublic?: boolean;
    },
    userId: string,
    userRole: string
  ) {
    // Vérifier les permissions
    const canEdit = await this.canEditDocument(documentId, userId, userRole);
    if (!canEdit) {
      throw new AuthError('Vous n\'avez pas la permission de modifier ce document');
    }

    // Vérifier que le document existe et n'est pas supprimé
    const existingDocument = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!existingDocument) {
      throw new NotFoundError('Document non trouvé');
    }

    if (existingDocument.deletedAt) {
      throw new ValidationError('Impossible de modifier un document supprimé');
    }

    // Mettre à jour le document
    const document = await prisma.document.update({
      where: { id: documentId },
      data: {
        ...updateData,
        type: updateData.type ? (updateData.type as DocumentType) : undefined,
        updatedAt: new Date()
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        project: true,
        activity: {
          include: {
            project: true
          }
        },
        task: true,
        seminar: {
          include: {
            organizer: {
              select: {
                id: true,
                firstName: true,
                lastName: true
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
                email: true
              }
            }
          }
        }
      }
    });

    // Logger l'activité
    await this.logActivity(documentId, userId, 'edit', {
      updatedFields: Object.keys(updateData)
    });

    return this.formatDocumentResponse(document);
  }

  /**
   * Lier un document à une entité
   */
  async linkDocument(
    documentId: string,
    linkData: {
      entityType: 'project' | 'activity' | 'task' | 'seminar' | 'training' | 'internship' | 'supervision' | 'knowledgeTransfer' | 'event';
      entityId: string;
    },
    userId: string,
    userRole: string
  ) {
    // Vérifier les permissions
    const canEdit = await this.canEditDocument(documentId, userId, userRole);
    if (!canEdit) {
      throw new AuthError('Vous n\'avez pas la permission de lier ce document');
    }

    // Vérifier que le document existe
    const existingDocument = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!existingDocument || existingDocument.deletedAt) {
      throw new NotFoundError('Document non trouvé');
    }

    // Vérifier que l'entité existe
    const entityModel = this.getEntityModel(linkData.entityType);
    const entity = await (prisma as any)[entityModel].findUnique({
      where: { id: linkData.entityId }
    });

    if (!entity) {
      throw new NotFoundError(`${linkData.entityType} non trouvé(e)`);
    }

    // Lier le document
    const entityIdField = `${linkData.entityType}Id`;
    const document = await prisma.document.update({
      where: { id: documentId },
      data: {
        [entityIdField]: linkData.entityId
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        project: true,
        activity: {
          include: {
            project: true
          }
        },
        task: true,
        seminar: {
          include: {
            organizer: {
              select: {
                id: true,
                firstName: true,
                lastName: true
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
                email: true
              }
            }
          }
        }
      }
    });

    // Logger l'activité
    await this.logActivity(documentId, userId, 'link', {
      entityType: linkData.entityType,
      entityId: linkData.entityId
    });

    return this.formatDocumentResponse(document);
  }

  /**
   * Délier un document d'une ou plusieurs entités
   */
  async unlinkDocument(
    documentId: string,
    unlinkData: {
      entityType?: string;
      entityId?: string;
    },
    userId: string,
    userRole: string
  ) {
    // Vérifier les permissions
    const canEdit = await this.canEditDocument(documentId, userId, userRole);
    if (!canEdit) {
      throw new AuthError('Vous n\'avez pas la permission de délier ce document');
    }

    // Préparer les données de mise à jour
    const updateData: any = {};

    if (unlinkData.entityType) {
      // Délier d'une entité spécifique
      const entityIdField = `${unlinkData.entityType}Id`;
      updateData[entityIdField] = null;
    } else {
      // Délier de toutes les entités
      updateData.projectId = null;
      updateData.activityId = null;
      updateData.taskId = null;
      updateData.seminarId = null;
      updateData.trainingId = null;
      updateData.internshipId = null;
      updateData.supervisionId = null;
      updateData.knowledgeTransferId = null;
      updateData.eventId = null;
    }

    const document = await prisma.document.update({
      where: { id: documentId },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        project: true,
        activity: {
          include: {
            project: true
          }
        },
        task: true,
        seminar: {
          include: {
            organizer: {
              select: {
                id: true,
                firstName: true,
                lastName: true
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
                email: true
              }
            }
          }
        }
      }
    });

    // Logger l'activité
    await this.logActivity(documentId, userId, 'unlink', unlinkData);

    return this.formatDocumentResponse(document);
  }

  // =============================================
  // PHASE 2 - CORBEILLE (SOFT DELETE)
  // =============================================

  /**
   * Soft delete - Marquer un document comme supprimé
   * IMPORTANT: Remplacer la méthode deleteDocument existante
   */
  async softDeleteDocument(documentId: string, userId: string, userRole: string) {
    // Vérifier les permissions
    const canDelete = await this.canDeleteDocument(documentId, userId, userRole);
    if (!canDelete) {
      throw new AuthError('Vous n\'avez pas la permission de supprimer ce document');
    }

    // Soft delete
    await prisma.document.update({
      where: { id: documentId },
      data: {
        deletedAt: new Date(),
        deletedBy: userId
      }
    });

    // Logger l'activité
    await this.logActivity(documentId, userId, 'delete', {
      softDelete: true
    });
  }

  /**
   * Obtenir les documents supprimés (corbeille)
   */
  async getTrashDocuments(userId: string, userRole: string, query: any) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: { not: null }
    };

    // Seuls les documents de l'utilisateur ou tous pour les admins
    if (userRole !== 'ADMINISTRATEUR') {
      where.OR = [
        { ownerId: userId },
        { deletedBy: userId }
      ];
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { deletedAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          },
          project: true,
          activity: {
            include: {
              project: true
            }
          },
          task: true,
          seminar: {
            include: {
              organizer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
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
                  email: true
                }
              }
            }
          }
        }
      }),
      prisma.document.count({ where })
    ]);

    return {
      documents: documents.map(doc => this.formatDocumentResponse(doc)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Restaurer un document supprimé
   */
  async restoreDocument(documentId: string, userId: string, userRole: string) {
    // Vérifier que le document existe et est supprimé
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      throw new NotFoundError('Document non trouvé');
    }

    if (!document.deletedAt) {
      throw new ValidationError('Ce document n\'est pas supprimé');
    }

    // Vérifier les permissions
    const isOwner = document.ownerId === userId;
    const isDeleter = document.deletedBy === userId;
    const isAdmin = userRole === 'ADMINISTRATEUR';

    if (!isOwner && !isDeleter && !isAdmin) {
      throw new AuthError('Vous n\'avez pas la permission de restaurer ce document');
    }

    // Restaurer
    const restoredDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        deletedAt: null,
        deletedBy: null
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        project: true,
        activity: {
          include: {
            project: true
          }
        },
        task: true,
        seminar: {
          include: {
            organizer: {
              select: {
                id: true,
                firstName: true,
                lastName: true
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
                email: true
              }
            }
          }
        }
      }
    });

    // Logger l'activité
    await this.logActivity(documentId, userId, 'restore', {});

    return this.formatDocumentResponse(restoredDocument);
  }

  /**
   * Suppression définitive d'un document
   */
  async permanentDeleteDocument(documentId: string, userId: string, userRole: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      throw new NotFoundError('Document non trouvé');
    }

    // Vérifier les permissions
    const canDelete = await this.canDeleteDocument(documentId, userId, userRole);
    if (!canDelete) {
      throw new AuthError('Vous n\'avez pas la permission de supprimer définitivement ce document');
    }

    // Supprimer le fichier physique
    try {
      await deleteFile(document.filepath);
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
    }

    // Supprimer de la base de données
    await prisma.document.delete({
      where: { id: documentId }
    });
  }

  /**
   * Vider la corbeille (supprimer les documents > 30 jours)
   */
  async emptyTrash(userId: string, userRole: string): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const where: any = {
      deletedAt: {
        not: null,
        lt: thirtyDaysAgo
      }
    };

    // Seuls les documents de l'utilisateur ou tous pour les admins
    if (userRole !== 'ADMINISTRATEUR') {
      where.OR = [
        { ownerId: userId },
        { deletedBy: userId }
      ];
    }

    // Récupérer les documents à supprimer
    const documents = await prisma.document.findMany({
      where,
      select: { id: true, filepath: true }
    });

    // Supprimer les fichiers physiques
    for (const doc of documents) {
      try {
        await deleteFile(doc.filepath);
      } catch (error) {
        console.error(`Erreur suppression fichier ${doc.filepath}:`, error);
      }
    }

    // Supprimer de la base de données
    const result = await prisma.document.deleteMany({ where });

    return result.count;
  }

  // =============================================
  // PHASE 3 - GESTION AVANCÉE DES PARTAGES
  // =============================================

  /**
   * Obtenir la liste des partages d'un document
   */
  async getDocumentShares(documentId: string, userId: string, userRole: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { ownerId: true }
    });

    if (!document) {
      throw new NotFoundError('Document non trouvé');
    }

    // Seul le propriétaire ou l'admin peut voir les partages
    if (document.ownerId !== userId && userRole !== 'ADMINISTRATEUR') {
      throw new AuthError('Vous n\'avez pas la permission de voir les partages');
    }

    const shares = await prisma.documentShare.findMany({
      where: {
        documentId,
        revokedAt: null // Seulement les partages actifs
      },
      include: {
        sharedWith: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { sharedAt: 'desc' }
    });

    return shares;
  }

  /**
   * Révoquer un partage
   */
  async revokeShare(documentId: string, shareId: string, userId: string, userRole: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { ownerId: true }
    });

    if (!document) {
      throw new NotFoundError('Document non trouvé');
    }

    // Seul le propriétaire ou l'admin peut révoquer
    if (document.ownerId !== userId && userRole !== 'ADMINISTRATEUR') {
      throw new AuthError('Vous n\'avez pas la permission de révoquer ce partage');
    }

    await prisma.documentShare.update({
      where: { id: shareId },
      data: {
        revokedAt: new Date(),
        revokedBy: userId
      }
    });
  }

  /**
   * Mettre à jour les permissions d'un partage
   */
  async updateSharePermissions(
    documentId: string,
    shareId: string,
    permissions: { canEdit?: boolean; canDelete?: boolean },
    userId: string,
    userRole: string
  ) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { ownerId: true }
    });

    if (!document) {
      throw new NotFoundError('Document non trouvé');
    }

    // Seul le propriétaire ou l'admin peut modifier les permissions
    if (document.ownerId !== userId && userRole !== 'ADMINISTRATEUR') {
      throw new AuthError('Vous n\'avez pas la permission de modifier ce partage');
    }

    const share = await prisma.documentShare.update({
      where: { id: shareId },
      data: permissions,
      include: {
        sharedWith: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return share;
  }

  // =============================================
  // PHASE 4 - FAVORIS
  // =============================================

  /**
   * Ajouter aux favoris
   */
  async addToFavorites(documentId: string, userId: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { favoritedBy: true }
    });

    if (!document) {
      throw new NotFoundError('Document non trouvé');
    }

    // Vérifier si déjà en favoris
    if (document.favoritedBy.includes(userId)) {
      return; // Déjà en favoris
    }

    await prisma.document.update({
      where: { id: documentId },
      data: {
        favoritedBy: {
          push: userId
        }
      }
    });
  }

  /**
   * Retirer des favoris
   */
  async removeFromFavorites(documentId: string, userId: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { favoritedBy: true }
    });

    if (!document) {
      throw new NotFoundError('Document non trouvé');
    }

    await prisma.document.update({
      where: { id: documentId },
      data: {
        favoritedBy: document.favoritedBy.filter(id => id !== userId)
      }
    });
  }

  /**
   * Obtenir les documents favoris
   */
  async getFavoriteDocuments(userId: string, userRole: string, query: any) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
      favoritedBy: {
        has: userId
      }
    };

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          },
          project: true,
          activity: {
            include: {
              project: true
            }
          },
          task: true,
          seminar: {
            include: {
              organizer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
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
                  email: true
                }
              }
            }
          }
        }
      }),
      prisma.document.count({ where })
    ]);

    return {
      documents: documents.map(doc => this.formatDocumentResponse(doc)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  // =============================================
  // BONUS - TRACKING
  // =============================================

  /**
   * Incrémenter le compteur de vues
   */
  async incrementViewCount(documentId: string) {
    await prisma.document.update({
      where: { id: documentId },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date()
      }
    });
  }

  /**
   * Logger une activité
   */
  private async logActivity(
    documentId: string,
    userId: string,
    action: string,
    metadata?: any
  ) {
    try {
      await prisma.documentActivity.create({
        data: {
          id: require('crypto').randomBytes(16).toString('hex'),
          documentId,
          userId,
          action,
          metadata: metadata || {}
        }
      });
    } catch (error) {
      console.error('Erreur lors du logging de l\'activité:', error);
    }
  }

  // =============================================
  // HELPERS
  // =============================================

  private getEntityModel(entityType: string): string {
    const mapping: Record<string, string> = {
      project: 'project',
      activity: 'activity',
      task: 'task',
      seminar: 'seminar',
      training: 'training',
      internship: 'internship',
      supervision: 'supervision',
      knowledgeTransfer: 'knowledgeTransfer',
      event: 'calendarEvent'
    };

    return mapping[entityType] || entityType;
  }

  private formatDocumentResponse(document: any): any {
    return {
      ...document,
      size: Number(document.size)
    };
  }

  // =============================================
  // MODIFICATION DE listDocuments EXISTANTE
  // =============================================
  // IMPORTANT: Dans la méthode listDocuments existante, ajouter ce filtre:
  // where: {
  //   deletedAt: null,  // ← AJOUTER CETTE LIGNE
  //   ...autres filtres
  // }
}

export default DocumentServiceNewMethods;
