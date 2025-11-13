import { PrismaClient, UserRole } from '@prisma/client';
import {
  CreateEventDto,
  UpdateEventDto,
  CreateSeminarDto,
  UpdateSeminarDto,
  EventFilterDto,
  SeminarFilterDto
} from '../types/event.types';

const prisma = new PrismaClient();

export class EventService {
  // GESTION DES ÉVÉNEMENTS
  
  async createEvent(userId: string, data: CreateEventDto) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isActive: true }
    });

    if (!user || !user.isActive) {
      throw new Error('Utilisateur non trouvé ou inactif');
    }

    if (user.role !== UserRole.CHERCHEUR && user.role !== UserRole.COORDONATEUR_PROJET) {
      throw new Error('Vous n\'avez pas les permissions pour créer un événement');
    }

    // Vérifications des relations
    if (data.stationId) {
      const station = await prisma.researchStation.findUnique({
        where: { id: data.stationId, isActive: true }
      });
      if (!station) throw new Error('Station de recherche non trouvée');
    }

    if (data.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: data.projectId }
      });
      if (!project) throw new Error('Projet non trouvé');
    }

    if (data.activityId) {
      const activity = await prisma.activity.findUnique({
        where: { id: data.activityId }
      });
      if (!activity) throw new Error('Activité non trouvée');
    }

    const event = await prisma.calendarEvent.create({
      data: {
        ...data,
        creatorId: userId
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        station: true,
        project: {
          select: { id: true, code: true, title: true }
        },
        activity: {
          select: { id: true, code: true, title: true, type: true }
        },
        documents: {
          select: {
            id: true,
            title: true,
            filename: true,
            type: true,
            size: true,
            createdAt: true
          }
        }
      }
    });

    return event;
  }

  async getEventById(eventId: string, userId: string, userRole: UserRole) {
    const event = await prisma.calendarEvent.findUnique({
      where: { id: eventId },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        station: true,
        project: {
          select: { id: true, code: true, title: true }
        },
        activity: {
          select: { id: true, code: true, title: true, type: true }
        },
        documents: {
          select: {
            id: true,
            title: true,
            filename: true,
            filepath: true,
            type: true,
            mimeType: true,
            size: true,
            createdAt: true,
            owner: {
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

    if (!event) throw new Error('Événement non trouvé');

    const canView = userRole === UserRole.COORDONATEUR_PROJET || 
                    userRole === UserRole.ADMINISTRATEUR || 
                    event.creatorId === userId;

    if (!canView) {
      throw new Error('Vous n\'avez pas les permissions pour voir cet événement');
    }

    return event;
  }

  async listEvents(userId: string, userRole: UserRole, filters: EventFilterDto) {
    const whereClause: any = {};

    if (userRole === UserRole.CHERCHEUR) {
      whereClause.creatorId = userId;
    }

    if (userRole === UserRole.COORDONATEUR_PROJET && filters.creatorId) {
      whereClause.creatorId = filters.creatorId;
    }

    if (filters.type) whereClause.type = filters.type;
    if (filters.status) whereClause.status = filters.status;
    if (filters.stationId) whereClause.stationId = filters.stationId;
    if (filters.projectId) whereClause.projectId = filters.projectId;
    if (filters.activityId) whereClause.activityId = filters.activityId;

    if (filters.startDate || filters.endDate) {
      whereClause.startDate = {};
      if (filters.startDate) whereClause.startDate.gte = filters.startDate;
      if (filters.endDate) whereClause.startDate.lte = filters.endDate;
    }

    const events = await prisma.calendarEvent.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        station: {
          select: { id: true, name: true, location: true }
        },
        project: {
          select: { id: true, code: true, title: true }
        },
        activity: {
          select: { id: true, code: true, title: true, type: true }
        },
        _count: {
          select: { documents: true }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    return events;
  }

  async updateEvent(eventId: string, userId: string, userRole: UserRole, data: UpdateEventDto) {
    const event = await prisma.calendarEvent.findUnique({
      where: { id: eventId },
      select: { creatorId: true }
    });

    if (!event) throw new Error('Événement non trouvé');

    if (event.creatorId !== userId) {
      throw new Error('Vous n\'avez pas les permissions pour modifier cet événement');
    }

    const updatedEvent = await prisma.calendarEvent.update({
      where: { id: eventId },
      data,
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        station: true,
        project: {
          select: { id: true, code: true, title: true }
        },
        activity: {
          select: { id: true, code: true, title: true }
        }
      }
    });

    return updatedEvent;
  }

  async deleteEvent(eventId: string, userId: string, userRole: UserRole) {
    const event = await prisma.calendarEvent.findUnique({
      where: { id: eventId },
      select: { creatorId: true }
    });

    if (!event) throw new Error('Événement non trouvé');

    if (event.creatorId !== userId) {
      throw new Error('Vous n\'avez pas les permissions pour supprimer cet événement');
    }

    await prisma.calendarEvent.delete({
      where: { id: eventId }
    });

    return { message: 'Événement supprimé avec succès' };
  }

  async addDocumentToEvent(
    eventId: string, 
    userId: string, 
    documentData: {
      title: string;
      filename: string;
      filepath: string;
      mimeType: string;
      size: bigint;
      type: any;
      description?: string;
    }
  ) {
    const event = await prisma.calendarEvent.findUnique({
      where: { id: eventId },
      select: { creatorId: true }
    });

    if (!event) throw new Error('Événement non trouvé');

    if (event.creatorId !== userId) {
      throw new Error('Vous n\'avez pas les permissions pour ajouter un document à cet événement');
    }

    const document = await prisma.document.create({
      data: {
        ...documentData,
        ownerId: userId,
        eventId: eventId
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return document;
  }

  // GESTION DES SÉMINAIRES
  
  async createSeminar(userId: string, data: CreateSeminarDto) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isActive: true }
    });

    if (!user || !user.isActive) {
      throw new Error('Utilisateur non trouvé ou inactif');
    }

    if (user.role !== UserRole.CHERCHEUR && user.role !== UserRole.COORDONATEUR_PROJET) {
      throw new Error('Vous n\'avez pas les permissions pour créer un séminaire');
    }

    if (data.calendarEventId) {
      const event = await prisma.calendarEvent.findUnique({
        where: { id: data.calendarEventId },
        select: { creatorId: true }
      });

      if (!event) throw new Error('Événement calendrier non trouvé');
      if (event.creatorId !== userId) {
        throw new Error('L\'événement calendrier ne vous appartient pas');
      }
    }

    const seminar = await prisma.seminar.create({
      data: {
        ...data,
        organizerId: userId
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
        calendarEvent: true,
        documents: {
          select: {
            id: true,
            title: true,
            filename: true,
            type: true,
            size: true,
            createdAt: true
          }
        }
      }
    });

    return seminar;
  }

  async getSeminarById(seminarId: string, userId: string, userRole: UserRole) {
    const seminar = await prisma.seminar.findUnique({
      where: { id: seminarId },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        calendarEvent: true,
        documents: {
          select: {
            id: true,
            title: true,
            filename: true,
            filepath: true,
            type: true,
            mimeType: true,
            size: true,
            createdAt: true,
            owner: {
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

    if (!seminar) throw new Error('Séminaire non trouvé');

    const canView = userRole === UserRole.COORDONATEUR_PROJET || 
                    userRole === UserRole.ADMINISTRATEUR || 
                    seminar.organizerId === userId;

    if (!canView) {
      throw new Error('Vous n\'avez pas les permissions pour voir ce séminaire');
    }

    return seminar;
  }

  async listSeminars(userId: string, userRole: UserRole, filters: SeminarFilterDto) {
    const whereClause: any = {};

    if (userRole === UserRole.CHERCHEUR) {
      whereClause.organizerId = userId;
    }

    if (userRole === UserRole.COORDONATEUR_PROJET && filters.organizerId) {
      whereClause.organizerId = filters.organizerId;
    }

    if (filters.status) whereClause.status = filters.status;

    if (filters.startDate || filters.endDate) {
      whereClause.startDate = {};
      if (filters.startDate) whereClause.startDate.gte = filters.startDate;
      if (filters.endDate) whereClause.startDate.lte = filters.endDate;
    }

    const seminars = await prisma.seminar.findMany({
      where: whereClause,
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        calendarEvent: {
          select: {
            id: true,
            title: true,
            type: true,
            startDate: true,
            endDate: true,
            location: true
          }
        },
        _count: {
          select: {
            documents: true,
            participants: true
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    return seminars;
  }
  async updateSeminar(seminarId: string, userId: string, data: UpdateSeminarDto) {
  const seminar = await prisma.seminar.findUnique({
    where: { id: seminarId },
    select: { organizerId: true }
  });

  if (!seminar) {
    throw new Error('Séminaire non trouvé');
  }

  if (seminar.organizerId !== userId) {
    throw new Error('Vous n\'avez pas les permissions pour modifier ce séminaire');
  }

  const updatedSeminar = await prisma.seminar.update({
    where: { id: seminarId },
    data,
    include: {
      organizer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      calendarEvent: true,
      documents: {
        select: {
          id: true,
          title: true,
          filename: true,
          type: true,
          size: true,
          createdAt: true
        }
      }
    }
  });

  return updatedSeminar;
}

async deleteSeminar(seminarId: string, userId: string) {
  const seminar = await prisma.seminar.findUnique({
    where: { id: seminarId },
    select: { organizerId: true }
  });

  if (!seminar) {
    throw new Error('Séminaire non trouvé');
  }

  if (seminar.organizerId !== userId) {
    throw new Error('Vous n\'avez pas les permissions pour supprimer ce séminaire');
  }

  await prisma.seminar.delete({
    where: { id: seminarId }
  });

  return { message: 'Séminaire supprimé avec succès' };
}

async addDocumentToSeminar(
  seminarId: string,
  userId: string,
  documentData: {
    title: string;
    filename: string;
    filepath: string;
    mimeType: string;
    size: bigint;
    type: any;
    description?: string;
  }
) {
  const seminar = await prisma.seminar.findUnique({
    where: { id: seminarId },
    select: { organizerId: true }
  });

  if (!seminar) {
    throw new Error('Séminaire non trouvé');
  }

  if (seminar.organizerId !== userId) {
    throw new Error('Vous n\'avez pas les permissions pour ajouter un document à ce séminaire');
  }

  const document = await prisma.document.create({
    data: {
      ...documentData,
      ownerId: userId,
      seminarId: seminarId
    },
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  return document;
}

  async getEventStatistics(userId: string, userRole: UserRole) {
    const whereClause: any = {};

    if (userRole === UserRole.CHERCHEUR) {
      whereClause.creatorId = userId;
    }

    const [total, byType, byStatus, upcoming] = await Promise.all([
      prisma.calendarEvent.count({ where: whereClause }),
      prisma.calendarEvent.groupBy({
        by: ['type'],
        where: whereClause,
        _count: true
      }),
      prisma.calendarEvent.groupBy({
        by: ['status'],
        where: whereClause,
        _count: true
      }),
      prisma.calendarEvent.count({
        where: {
          ...whereClause,
          startDate: { gte: new Date() }
        }
      })
    ]);

    return { total, byType, byStatus, upcoming };
  }
}

export default new EventService();