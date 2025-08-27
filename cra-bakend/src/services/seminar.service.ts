// src/services/seminar.service.ts
import { PrismaClient } from '@prisma/client';
import { ValidationError, AuthError } from '../utils/errors';
import { CreateSeminarRequest, UpdateSeminarRequest, SeminarListQuery, SeminarResponse, SeminarStatsResponse } from '../types/seminar.types';

const prisma = new PrismaClient();

// Type pour les séminaires avec relations incluses
type SeminarWithRelations = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startDate: Date;
  endDate?: Date | null;
  status: string;
  agenda?: string | null;
  maxParticipants?: number | null;
  createdAt: Date;
  updatedAt: Date;
  organizerId: string;
  organizer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    specialization?: string | null;
  };
  participants?: {
    id: string;
    registeredAt: Date;
    attendedAt?: Date | null;
    participantId: string;
    participant?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      specialization?: string | null;
      department?: string | null;
    };
  }[];
  documents?: {
    id: string;
    title: string;
    filename: string;
    type: string;
    createdAt: Date;
  }[];
  _count?: {
    participants: number;
    documents: number;
  };
};

export class SeminarService {

  // Créer un séminaire
  async createSeminar(seminarData: CreateSeminarRequest, organizerId: string, organizerRole: string): Promise<SeminarResponse> {
    // Vérifier les permissions
    if (!['CHERCHEUR', 'ADMINISTRATEUR'].includes(organizerRole)) {
      throw new AuthError('Seuls les chercheurs et administrateurs peuvent créer des séminaires');
    }

    // Vérifier les conflits de dates pour l'organisateur
    const conflictingSeminar = await prisma.seminar.findFirst({
      where: {
        organizerId,
        status: { in: ['PLANIFIE', 'EN_COURS'] },
        OR: [
          {
            AND: [
              { startDate: { lte: new Date(seminarData.startDate) } },
              { 
                OR: [
                  { endDate: { gte: new Date(seminarData.startDate) } },
                  { endDate: null }
                ]
              }
            ]
          },
          ...(seminarData.endDate ? [{
            AND: [
              { startDate: { lte: new Date(seminarData.endDate) } },
              { 
                OR: [
                  { endDate: { gte: new Date(seminarData.endDate) } },
                  { endDate: null }
                ]
              }
            ]
          }] : [])
        ]
      }
    });

    if (conflictingSeminar) {
      throw new ValidationError('Vous avez déjà un séminaire programmé à ces dates');
    }

    // Créer le séminaire
    const seminar = await prisma.seminar.create({
      data: {
        title: seminarData.title,
        description: seminarData.description,
        location: seminarData.location,
        startDate: new Date(seminarData.startDate),
        endDate: seminarData.endDate ? new Date(seminarData.endDate) : null,
        agenda: seminarData.agenda,
        maxParticipants: seminarData.maxParticipants,
        organizerId,
      },
      include: this.getSeminarIncludes()
    });

    return this.formatSeminarResponse(seminar);
  }

  // Lister les séminaires avec filtres
  async listSeminars(userId: string, userRole: string, query: SeminarListQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Construire les filtres de base
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.organizerId) {
      where.organizerId = query.organizerId;
    }

    if (query.location) {
      where.location = {
        contains: query.location,
        mode: 'insensitive'
      };
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { location: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Filtres temporels
    const now = new Date();
    switch (query.timeFilter) {
      case 'past':
        where.endDate = { lt: now };
        break;
      case 'current':
        where.startDate = { lte: now };
        where.OR = [
          { endDate: { gte: now } },
          { endDate: null }
        ];
        break;
      case 'upcoming':
        where.startDate = { gt: now };
        break;
      // 'all' : pas de filtre temporel
    }

    if (query.startDate) {
      where.startDate = { gte: new Date(query.startDate) };
    }

    if (query.endDate) {
      where.startDate = { lte: new Date(query.endDate) };
    }

    // Exécuter la requête
    const [seminars, total] = await Promise.all([
      prisma.seminar.findMany({
        where,
        skip,
        take: limit,
        include: {
          ...this.getSeminarIncludes(),
          participants: {
            where: { participantId: userId },
            take: 1
          }
        },
        orderBy: { startDate: 'asc' }
      }),
      prisma.seminar.count({ where })
    ]);

    // Enrichir avec les informations de statut d'inscription
    const enrichedSeminars = seminars.map((seminar: SeminarWithRelations) => {
      const formattedSeminar = this.formatSeminarResponse(seminar);
      formattedSeminar.isRegistered = seminar.participants ? seminar.participants.length > 0 : false;
      formattedSeminar.canRegister = this.canUserRegister(seminar, userId);
      formattedSeminar.registrationStatus = this.getRegistrationStatus(seminar);
      return formattedSeminar;
    });

    return {
      seminars: enrichedSeminars,
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

  // Obtenir un séminaire par ID
  async getSeminarById(seminarId: string, userId: string, userRole: string): Promise<SeminarResponse> {
    const seminar = await prisma.seminar.findUnique({
      where: { id: seminarId },
      include: {
        ...this.getSeminarIncludes(),
        participants: {
          include: {
            participant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                specialization: true,
                department: true,
              }
            }
          },
          orderBy: { registeredAt: 'asc' }
        },
        documents: {
          select: {
            id: true,
            title: true,
            filename: true,
            type: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!seminar) {
      throw new ValidationError('Séminaire non trouvé');
    }

    const formattedSeminar = this.formatSeminarResponse(seminar);
    formattedSeminar.isRegistered = seminar.participants?.some((p: any) => p.participantId === userId) || false;
    formattedSeminar.canRegister = this.canUserRegister(seminar, userId);
    formattedSeminar.registrationStatus = this.getRegistrationStatus(seminar);

    return formattedSeminar;
  }

  // Mettre à jour un séminaire
  async updateSeminar(seminarId: string, updateData: UpdateSeminarRequest, userId: string, userRole: string): Promise<SeminarResponse> {
    const seminar = await prisma.seminar.findUnique({
      where: { id: seminarId },
      include: {
        _count: {
          select: { participants: true }
        }
      }
    });

    if (!seminar) {
      throw new ValidationError('Séminaire non trouvé');
    }

    // Vérifier les droits de modification
    if (seminar.organizerId !== userId && userRole !== 'ADMINISTRATEUR') {
      throw new AuthError('Seul l\'organisateur peut modifier ce séminaire');
    }

    // Vérifications spéciales selon les modifications
    if (updateData.maxParticipants && seminar._count.participants > updateData.maxParticipants) {
      throw new ValidationError(`Impossible de réduire le nombre de participants à ${updateData.maxParticipants}. Il y a déjà ${seminar._count.participants} inscrits.`);
    }

    // Gestion automatique du statut selon les dates
    const now = new Date();
    let autoStatus = seminar.status;

    if (updateData.startDate || updateData.endDate) {
      const startDate = updateData.startDate ? new Date(updateData.startDate) : seminar.startDate;
      const endDate = updateData.endDate !== undefined ? (updateData.endDate ? new Date(updateData.endDate) : null) : seminar.endDate;

      if (startDate <= now && (!endDate || endDate >= now)) {
        autoStatus = 'EN_COURS';
      } else if (endDate && endDate < now) {
        autoStatus = 'TERMINE';
      } else if (startDate > now) {
        autoStatus = 'PLANIFIE';
      }
    }

    // Préparer les données de mise à jour
    const dataToUpdate: any = {
      title: updateData.title,
      description: updateData.description,
      location: updateData.location,
      agenda: updateData.agenda,
      maxParticipants: updateData.maxParticipants,
      status: updateData.status || autoStatus,
    };

    if (updateData.startDate !== undefined) {
      dataToUpdate.startDate = updateData.startDate ? new Date(updateData.startDate) : null;
    }
    if (updateData.endDate !== undefined) {
      dataToUpdate.endDate = updateData.endDate ? new Date(updateData.endDate) : null;
    }

    const updatedSeminar = await prisma.seminar.update({
      where: { id: seminarId },
      data: dataToUpdate,
      include: this.getSeminarIncludes()
    });

    return this.formatSeminarResponse(updatedSeminar);
  }

  // Inscrire un utilisateur à un séminaire
  async registerToSeminar(seminarId: string, targetUserId: string, requesterId: string, requesterRole: string) {
    const seminar = await prisma.seminar.findUnique({
      where: { id: seminarId },
      include: {
        _count: {
          select: { participants: true }
        }
      }
    });

    if (!seminar) {
      throw new ValidationError('Séminaire non trouvé');
    }

    // Vérifier que l'utilisateur cible existe
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (!targetUser || !targetUser.isActive) {
      throw new ValidationError('Utilisateur non trouvé ou inactif');
    }

    // Vérifier les permissions d'inscription
    if (targetUserId !== requesterId && requesterRole !== 'ADMINISTRATEUR') {
      throw new AuthError('Vous ne pouvez inscrire que vous-même à un séminaire');
    }

    // Vérifier les conditions d'inscription
    if (seminar.status === 'TERMINE' || seminar.status === 'ANNULE') {
      throw new ValidationError('Impossible de s\'inscrire à un séminaire terminé ou annulé');
    }

    if (seminar.maxParticipants && seminar._count.participants >= seminar.maxParticipants) {
      throw new ValidationError('Le séminaire est complet');
    }

    // Vérifier que l'utilisateur n'est pas déjà inscrit
    const existingRegistration = await prisma.seminarParticipant.findUnique({
      where: {
        seminarId_participantId: {
          seminarId,
          participantId: targetUserId
        }
      }
    });

    if (existingRegistration) {
      throw new ValidationError('Vous êtes déjà inscrit à ce séminaire');
    }

    // Créer l'inscription
    const registration = await prisma.seminarParticipant.create({
      data: {
        seminarId,
        participantId: targetUserId,
      },
      include: {
        participant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          }
        },
        seminar: {
          select: {
            id: true,
            title: true,
            startDate: true,
            location: true,
          }
        }
      }
    });

    return {
      id: registration.id,
      registeredAt: registration.registeredAt,
      participant: registration.participant,
      seminar: registration.seminar,
      message: 'Inscription réussie au séminaire'
    };
  }

  // Désinscrire un utilisateur d'un séminaire
  async unregisterFromSeminar(seminarId: string, targetUserId: string, requesterId: string, requesterRole: string) {
    const seminar = await prisma.seminar.findUnique({
      where: { id: seminarId }
    });

    if (!seminar) {
      throw new ValidationError('Séminaire non trouvé');
    }

    // Vérifier les permissions de désinscription
    if (targetUserId !== requesterId && requesterRole !== 'ADMINISTRATEUR') {
      throw new AuthError('Vous ne pouvez désinscrire que vous-même d\'un séminaire');
    }

    // Empêcher la désinscription si le séminaire a commencé (sauf admin)
    const now = new Date();
    if (seminar.startDate <= now && requesterRole !== 'ADMINISTRATEUR') {
      throw new ValidationError('Impossible de se désinscrire d\'un séminaire en cours ou terminé');
    }

    // Vérifier que l'utilisateur est inscrit
    const registration = await prisma.seminarParticipant.findUnique({
      where: {
        seminarId_participantId: {
          seminarId,
          participantId: targetUserId
        }
      }
    });

    if (!registration) {
      throw new ValidationError('Vous n\'êtes pas inscrit à ce séminaire');
    }

    // Supprimer l'inscription
    await prisma.seminarParticipant.delete({
      where: {
        seminarId_participantId: {
          seminarId,
          participantId: targetUserId
        }
      }
    });

    return { message: 'Désinscription réussie du séminaire' };
  }

  // Marquer la présence d'un participant
  async markAttendance(seminarId: string, participantId: string, requesterId: string, requesterRole: string) {
    const seminar = await prisma.seminar.findUnique({
      where: { id: seminarId }
    });

    if (!seminar) {
      throw new ValidationError('Séminaire non trouvé');
    }

    // Seul l'organisateur ou un admin peut marquer les présences
    if (seminar.organizerId !== requesterId && requesterRole !== 'ADMINISTRATEUR') {
      throw new AuthError('Seul l\'organisateur peut marquer les présences');
    }

    // Vérifier que le participant est inscrit
    const registration = await prisma.seminarParticipant.findUnique({
      where: {
        seminarId_participantId: {
          seminarId,
          participantId
        }
      }
    });

    if (!registration) {
      throw new ValidationError('Ce participant n\'est pas inscrit au séminaire');
    }

    if (registration.attendedAt) {
      throw new ValidationError('La présence de ce participant est déjà marquée');
    }

    // Marquer la présence
    const updatedRegistration = await prisma.seminarParticipant.update({
      where: {
        seminarId_participantId: {
          seminarId,
          participantId
        }
      },
      data: {
        attendedAt: new Date()
      },
      include: {
        participant: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    return {
      message: `Présence marquée pour ${updatedRegistration.participant.firstName} ${updatedRegistration.participant.lastName}`,
      attendedAt: updatedRegistration.attendedAt
    };
  }

  // Obtenir les statistiques des séminaires
  async getSeminarStats(userId: string, userRole: string): Promise<SeminarStatsResponse> {
    const now = new Date();
    
    // Filtrer selon les permissions
    const where = userRole === 'ADMINISTRATEUR' ? {} : { organizerId: userId };

    const [
      totalSeminars,
      byStatus,
      pastSeminars,
      currentSeminars,
      upcomingSeminars,
      participationStats
    ] = await Promise.all([
      prisma.seminar.count({ where }),
      
      prisma.seminar.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      
      prisma.seminar.count({
        where: {
          ...where,
          endDate: { lt: now }
        }
      }),
      
      prisma.seminar.count({
        where: {
          ...where,
          startDate: { lte: now },
          OR: [
            { endDate: { gte: now } },
            { endDate: null }
          ]
        }
      }),
      
      prisma.seminar.count({
        where: {
          ...where,
          startDate: { gt: now }
        }
      }),
      
      prisma.seminar.aggregate({
        where,
        _avg: { maxParticipants: true },
        _sum: { maxParticipants: true }
      })
    ]);

    // Compter les participations totales
    const totalParticipations = await prisma.seminarParticipant.count({
      where: {
        seminar: where
      }
    });

    // Formater les résultats
    const statusCounts = {
      PLANIFIE: 0,
      EN_COURS: 0,
      TERMINE: 0,
      ANNULE: 0,
    };

    byStatus.forEach((item: { status: string; _count: number }) => {
      statusCounts[item.status as keyof typeof statusCounts] = item._count;
    });

    return {
      totalSeminars,
      byStatus: statusCounts,
      byTimeframe: {
        past: pastSeminars,
        current: currentSeminars,
        upcoming: upcomingSeminars,
      },
      totalParticipations,
      averageParticipants: totalSeminars > 0 ? Math.round(totalParticipations / totalSeminars) : 0,
    };
  }

  // Supprimer un séminaire
  async deleteSeminar(seminarId: string, userId: string, userRole: string): Promise<void> {
    const seminar = await prisma.seminar.findUnique({
      where: { id: seminarId },
      include: {
        _count: {
          select: { participants: true }
        }
      }
    });

    if (!seminar) {
      throw new ValidationError('Séminaire non trouvé');
    }

    // Vérifier les droits de suppression
    if (seminar.organizerId !== userId && userRole !== 'ADMINISTRATEUR') {
      throw new AuthError('Seul l\'organisateur peut supprimer ce séminaire');
    }

    // Empêcher la suppression s'il y a des participants (sauf admin)
    if (seminar._count.participants > 0 && userRole !== 'ADMINISTRATEUR') {
      throw new ValidationError('Impossible de supprimer un séminaire ayant des participants inscrits');
    }

    // Empêcher la suppression d'un séminaire en cours ou terminé
    if (['EN_COURS', 'TERMINE'].includes(seminar.status)) {
      throw new ValidationError('Impossible de supprimer un séminaire en cours ou terminé');
    }

    await prisma.seminar.delete({
      where: { id: seminarId }
    });
  }

  // Méthodes utilitaires privées
  private canUserRegister(seminar: SeminarWithRelations, userId: string): boolean {
    // Vérifier les conditions d'inscription
    if (seminar.status === 'TERMINE' || seminar.status === 'ANNULE') {
      return false;
    }

    if (seminar.maxParticipants && seminar._count && seminar._count.participants >= seminar.maxParticipants) {
      return false;
    }

    return true;
  }

  private getRegistrationStatus(seminar: SeminarWithRelations): 'open' | 'full' | 'closed' | 'ended' {
    if (seminar.status === 'TERMINE' || seminar.status === 'ANNULE') {
      return 'ended';
    }

    if (seminar.maxParticipants && seminar._count && seminar._count.participants >= seminar.maxParticipants) {
      return 'full';
    }

    const now = new Date();
    if (seminar.startDate <= now) {
      return 'closed';
    }

    return 'open';
  }

  private getSeminarIncludes() {
    return {
      organizer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          specialization: true,
        }
      },
      _count: {
        select: {
          participants: true,
          documents: true,
        }
      }
    };
  }

  private formatSeminarResponse(seminar: SeminarWithRelations): SeminarResponse {
    return {
      id: seminar.id,
      title: seminar.title,
      description: seminar.description || undefined,
      location: seminar.location || undefined,
      startDate: seminar.startDate,
      endDate: seminar.endDate || undefined,
      status: seminar.status,
      agenda: seminar.agenda || undefined,
      maxParticipants: seminar.maxParticipants || undefined,
      createdAt: seminar.createdAt,
      updatedAt: seminar.updatedAt,
      organizer: seminar.organizer,
      participants: seminar.participants?.map((p: any) => ({
        id: p.id,
        registeredAt: p.registeredAt,
        attendedAt: p.attendedAt || undefined,
        participant: p.participant,
      })),
      documents: seminar.documents,
      _count: seminar._count,
    };
  }
}