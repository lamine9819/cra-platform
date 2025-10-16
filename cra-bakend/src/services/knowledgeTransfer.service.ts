import { PrismaClient } from '@prisma/client';
import { ValidationError, AuthError } from '../utils/errors';
import { 
  CreateKnowledgeTransferRequest,
  UpdateKnowledgeTransferRequest,
  KnowledgeTransferListQuery,
  KnowledgeTransferResponse
} from '../types/knowledgeTransfer.types';

const prisma = new PrismaClient();

export class KnowledgeTransferService {

  async createKnowledgeTransfer(
    data: CreateKnowledgeTransferRequest,
    userId: string,
    userRole: string
  ): Promise<KnowledgeTransferResponse> {
    // Vérifier que l'organisateur existe
    const organizer = await prisma.user.findUnique({
      where: { id: data.organizerId }
    });

    if (!organizer) {
      throw new ValidationError('Organisateur non trouvé');
    }

    // Seul l'organisateur ou un admin peut créer pour quelqu'un
    if (data.organizerId !== userId && userRole !== 'ADMINISTRATEUR') {
      throw new AuthError('Vous ne pouvez créer un transfert que pour vous-même');
    }

    // Vérifier l'activité si spécifiée
    if (data.activityId) {
      const activity = await prisma.activity.findUnique({
        where: { id: data.activityId }
      });

      if (!activity) {
        throw new ValidationError('Activité non trouvée');
      }
    }

    const transfer = await prisma.knowledgeTransfer.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        targetAudience: data.targetAudience,
        location: data.location,
        date: new Date(data.date),
        participants: data.participants,
        impact: data.impact,
        feedback: data.feedback,
        organizerId: data.organizerId,
        activityId: data.activityId,
      },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        activity: {
          select: {
            id: true,
            title: true,
            code: true
          }
        },
        _count: {
          select: {
            documents: true
          }
        }
      }
    });

    return this.formatResponse(transfer);
  }

  async listKnowledgeTransfers(
    userId: string,
    userRole: string,
    query: KnowledgeTransferListQuery
  ) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { location: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    if (query.type) where.type = query.type;
    if (query.organizerId) where.organizerId = query.organizerId;
    if (query.activityId) where.activityId = query.activityId;

    if (query.startDate) {
      where.date = { gte: new Date(query.startDate) };
    }
    if (query.endDate) {
      where.date = { ...where.date, lte: new Date(query.endDate) };
    }

    // Filtres selon les droits
    if (userRole !== 'ADMINISTRATEUR') {
      where.OR = [
        { organizerId: userId },
        { 
          activity: {
            OR: [
              { responsibleId: userId },
              { participants: { some: { userId, isActive: true } } }
            ]
          }
        }
      ];
    }

    const [transfers, total] = await Promise.all([
      prisma.knowledgeTransfer.findMany({
        where,
        skip,
        take: limit,
        include: {
          organizer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          activity: {
            select: {
              id: true,
              title: true,
              code: true
            }
          },
          _count: {
            select: {
              documents: true
            }
          }
        },
        orderBy: { date: 'desc' }
      }),
      prisma.knowledgeTransfer.count({ where })
    ]);

    return {
      transfers: transfers.map(t => this.formatResponse(t)),
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

  async getKnowledgeTransferById(
    transferId: string,
    userId: string,
    userRole: string
  ): Promise<KnowledgeTransferResponse> {
    const transfer = await prisma.knowledgeTransfer.findUnique({
      where: { id: transferId },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        activity: {
          select: {
            id: true,
            title: true,
            code: true
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
        _count: {
          select: {
            documents: true
          }
        }
      }
    });

    if (!transfer) {
      throw new ValidationError('Transfert d\'acquis non trouvé');
    }

    // Vérifier les droits d'accès
    const hasAccess = this.checkAccess(transfer, userId, userRole);
    if (!hasAccess) {
      throw new AuthError('Accès refusé à ce transfert');
    }

    return this.formatResponse(transfer);
  }

  async updateKnowledgeTransfer(
    transferId: string,
    updateData: UpdateKnowledgeTransferRequest,
    userId: string,
    userRole: string
  ): Promise<KnowledgeTransferResponse> {
    const transfer = await prisma.knowledgeTransfer.findUnique({
      where: { id: transferId }
    });

    if (!transfer) {
      throw new ValidationError('Transfert d\'acquis non trouvé');
    }

    // Seul l'organisateur ou un admin peut modifier
    if (transfer.organizerId !== userId && userRole !== 'ADMINISTRATEUR') {
      throw new AuthError('Seul l\'organisateur peut modifier ce transfert');
    }

    const dataToUpdate: any = {};

    if (updateData.title !== undefined) dataToUpdate.title = updateData.title;
    if (updateData.description !== undefined) dataToUpdate.description = updateData.description;
    if (updateData.type !== undefined) dataToUpdate.type = updateData.type;
    if (updateData.targetAudience !== undefined) dataToUpdate.targetAudience = updateData.targetAudience;
    if (updateData.location !== undefined) dataToUpdate.location = updateData.location;
    if (updateData.participants !== undefined) dataToUpdate.participants = updateData.participants;
    if (updateData.impact !== undefined) dataToUpdate.impact = updateData.impact;
    if (updateData.feedback !== undefined) dataToUpdate.feedback = updateData.feedback;
    if (updateData.organizerId !== undefined) dataToUpdate.organizerId = updateData.organizerId;
    if (updateData.activityId !== undefined) dataToUpdate.activityId = updateData.activityId;

    if (updateData.date !== undefined) {
      dataToUpdate.date = updateData.date ? new Date(updateData.date) : null;
    }

    const updated = await prisma.knowledgeTransfer.update({
      where: { id: transferId },
      data: dataToUpdate,
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        activity: {
          select: {
            id: true,
            title: true,
            code: true
          }
        },
        _count: {
          select: {
            documents: true
          }
        }
      }
    });

    return this.formatResponse(updated);
  }

  async deleteKnowledgeTransfer(
    transferId: string,
    userId: string,
    userRole: string
  ): Promise<void> {
    const transfer = await prisma.knowledgeTransfer.findUnique({
      where: { id: transferId },
      include: {
        _count: {
          select: {
            documents: true
          }
        }
      }
    });

    if (!transfer) {
      throw new ValidationError('Transfert d\'acquis non trouvé');
    }

    // Seul l'organisateur ou un admin peut supprimer
    if (transfer.organizerId !== userId && userRole !== 'ADMINISTRATEUR') {
      throw new AuthError('Seul l\'organisateur peut supprimer ce transfert');
    }

    // Empêcher la suppression s'il y a des documents
    if (transfer._count.documents > 0) {
      throw new ValidationError('Impossible de supprimer un transfert avec des documents liés');
    }

    await prisma.knowledgeTransfer.delete({
      where: { id: transferId }
    });
  }

  // Méthodes privées
  private checkAccess(transfer: any, userId: string, userRole: string): boolean {
    if (userRole === 'ADMINISTRATEUR') return true;
    if (transfer.organizerId === userId) return true;
    
    if (transfer.activity) {
      if (transfer.activity.responsibleId === userId) return true;
      if (transfer.activity.participants?.some((p: any) => p.userId === userId && p.isActive)) {
        return true;
      }
    }
    
    return false;
  }

  private formatResponse(transfer: any): KnowledgeTransferResponse {
    return {
      id: transfer.id,
      title: transfer.title,
      description: transfer.description || undefined,
      type: transfer.type,
      targetAudience: transfer.targetAudience,
      location: transfer.location || undefined,
      date: transfer.date,
      participants: transfer.participants || undefined,
      impact: transfer.impact || undefined,
      feedback: transfer.feedback || undefined,
      createdAt: transfer.createdAt,
      updatedAt: transfer.updatedAt,
      organizer: transfer.organizer,
      activity: transfer.activity || undefined,
      documents: transfer.documents || undefined,
      _count: transfer._count,
    };
  }
}