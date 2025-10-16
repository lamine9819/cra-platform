import { PrismaClient } from '@prisma/client';
import { ValidationError, AuthError } from '../utils/errors';
import { 
  CreateConventionRequest, 
  UpdateConventionRequest,
  ConventionListQuery,
  ConventionResponse
} from '../types/convention.types';

const prisma = new PrismaClient();

export class ConventionService {

  async createConvention(data: CreateConventionRequest, userId: string, userRole: string): Promise<ConventionResponse> {
    // Vérifier que le responsable existe
    const responsible = await prisma.user.findUnique({
      where: { id: data.responsibleUserId }
    });

    if (!responsible) {
      throw new ValidationError('Responsable non trouvé');
    }

    // Vérifier l'unicité du numéro de contrat
    if (data.contractNumber) {
      const existing = await prisma.convention.findUnique({
        where: { contractNumber: data.contractNumber }
      });
      if (existing) {
        throw new ValidationError('Ce numéro de contrat existe déjà');
      }
    }

    const convention = await prisma.convention.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        status: data.status || 'EN_NEGOCIATION',
        contractNumber: data.contractNumber,
        signatureDate: data.signatureDate ? new Date(data.signatureDate) : null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        totalBudget: data.totalBudget,
        currency: data.currency || 'XOF',
        documentPath: data.documentPath,
        mainPartner: data.mainPartner,
        otherPartners: data.otherPartners || [],
        responsibleUserId: data.responsibleUserId,
      },
      include: {
        responsibleUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            activities: true,
            projects: true,
            fundings: true
          }
        }
      }
    });

    return this.formatConventionResponse(convention);
  }

  async listConventions(userId: string, userRole: string, query: ConventionListQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { mainPartner: { contains: query.search, mode: 'insensitive' } },
        { contractNumber: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    if (query.responsibleId) where.responsibleUserId = query.responsibleId;

    if (query.startDate) {
      where.startDate = { gte: new Date(query.startDate) };
    }
    if (query.endDate) {
      where.endDate = { lte: new Date(query.endDate) };
    }

    // Filtrer selon les droits (sauf admin)
    if (userRole !== 'ADMINISTRATEUR') {
      where.responsibleUserId = userId;
    }

    const [conventions, total] = await Promise.all([
      prisma.convention.findMany({
        where,
        skip,
        take: limit,
        include: {
          responsibleUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          _count: {
            select: {
              activities: true,
              projects: true,
              fundings: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.convention.count({ where })
    ]);

    return {
      conventions: conventions.map(c => this.formatConventionResponse(c)),
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

  async getConventionById(conventionId: string, userId: string, userRole: string): Promise<ConventionResponse> {
    const convention = await prisma.convention.findUnique({
      where: { id: conventionId },
      include: {
        responsibleUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        activities: {
          select: {
            id: true,
            title: true,
            code: true,
            type: true,
            lifecycleStatus: true
          },
          take: 10,
          orderBy: { updatedAt: 'desc' }
        },
        projects: {
          select: {
            id: true,
            title: true,
            code: true,
            status: true
          },
          take: 10,
          orderBy: { updatedAt: 'desc' }
        },
        fundings: {
          select: {
            id: true,
            fundingSource: true,
            requestedAmount: true,
            status: true
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            activities: true,
            projects: true,
            fundings: true
          }
        }
      }
    });

    if (!convention) {
      throw new ValidationError('Convention non trouvée');
    }

    // Vérifier les droits d'accès
    if (userRole !== 'ADMINISTRATEUR' && convention.responsibleUserId !== userId) {
      throw new AuthError('Accès refusé à cette convention');
    }

    return this.formatConventionResponse(convention);
  }

  async updateConvention(conventionId: string, updateData: UpdateConventionRequest, userId: string, userRole: string): Promise<ConventionResponse> {
    const convention = await prisma.convention.findUnique({
      where: { id: conventionId }
    });

    if (!convention) {
      throw new ValidationError('Convention non trouvée');
    }

    // Vérifier les droits de modification
    if (userRole !== 'ADMINISTRATEUR' && convention.responsibleUserId !== userId) {
      throw new AuthError('Permissions insuffisantes');
    }

    // Vérifier l'unicité du numéro de contrat si modifié
    if (updateData.contractNumber && updateData.contractNumber !== convention.contractNumber) {
      const existing = await prisma.convention.findUnique({
        where: { contractNumber: updateData.contractNumber }
      });
      if (existing) {
        throw new ValidationError('Ce numéro de contrat existe déjà');
      }
    }

    const dataToUpdate: any = {};
    
    if (updateData.title !== undefined) dataToUpdate.title = updateData.title;
    if (updateData.description !== undefined) dataToUpdate.description = updateData.description || null;
    if (updateData.type !== undefined) dataToUpdate.type = updateData.type;
    if (updateData.status !== undefined) dataToUpdate.status = updateData.status;
    if (updateData.contractNumber !== undefined) dataToUpdate.contractNumber = updateData.contractNumber || null;
    if (updateData.totalBudget !== undefined) dataToUpdate.totalBudget = updateData.totalBudget;
    if (updateData.documentPath !== undefined) dataToUpdate.documentPath = updateData.documentPath || null;
    if (updateData.mainPartner !== undefined) dataToUpdate.mainPartner = updateData.mainPartner;
    if (updateData.otherPartners !== undefined) dataToUpdate.otherPartners = updateData.otherPartners;
    if (updateData.responsibleUserId !== undefined) dataToUpdate.responsibleUserId = updateData.responsibleUserId;

    if (updateData.signatureDate !== undefined) {
      dataToUpdate.signatureDate = updateData.signatureDate ? new Date(updateData.signatureDate) : null;
    }
    if (updateData.startDate !== undefined) {
      dataToUpdate.startDate = updateData.startDate ? new Date(updateData.startDate) : null;
    }
    if (updateData.endDate !== undefined) {
      dataToUpdate.endDate = updateData.endDate ? new Date(updateData.endDate) : null;
    }

    const updated = await prisma.convention.update({
      where: { id: conventionId },
      data: dataToUpdate,
      include: {
        responsibleUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            activities: true,
            projects: true,
            fundings: true
          }
        }
      }
    });

    return this.formatConventionResponse(updated);
  }

  async deleteConvention(conventionId: string, userId: string, userRole: string): Promise<void> {
    const convention = await prisma.convention.findUnique({
      where: { id: conventionId },
      include: {
        _count: {
          select: {
            activities: true,
            projects: true,
            fundings: true
          }
        }
      }
    });

    if (!convention) {
      throw new ValidationError('Convention non trouvée');
    }

    // Seul un admin peut supprimer
    if (userRole !== 'ADMINISTRATEUR') {
      throw new AuthError('Seul un administrateur peut supprimer une convention');
    }

    // Empêcher la suppression si la convention a des relations
    if (convention._count.activities > 0 || convention._count.projects > 0 || convention._count.fundings > 0) {
      throw new ValidationError('Impossible de supprimer une convention liée à des activités, projets ou financements');
    }

    await prisma.convention.delete({
      where: { id: conventionId }
    });
  }

  private formatConventionResponse(convention: any): ConventionResponse {
    return {
      id: convention.id,
      title: convention.title,
      description: convention.description || undefined,
      type: convention.type,
      status: convention.status,
      contractNumber: convention.contractNumber || undefined,
      signatureDate: convention.signatureDate || undefined,
      startDate: convention.startDate || undefined,
      endDate: convention.endDate || undefined,
      totalBudget: convention.totalBudget || undefined,
      currency: convention.currency,
      documentPath: convention.documentPath || undefined,
      mainPartner: convention.mainPartner,
      otherPartners: convention.otherPartners,
      responsibleUser: convention.responsibleUser,
      createdAt: convention.createdAt,
      updatedAt: convention.updatedAt,
      _count: convention._count,
    };
  }
}