// services/formation.service.ts (Version corrigée)
import { PrismaClient } from '@prisma/client';
import {
  CreateShortTrainingReceivedInput,
  CreateDiplomaticTrainingReceivedInput,
  CreateTrainingGivenInput,
  CreateSupervisionInput,
  ShortTrainingReceivedResponse,
  DiplomaticTrainingReceivedResponse,
  TrainingGivenResponse,
  SupervisionResponse,
  FormationReport
} from '../types/formation.types';

const prisma = new PrismaClient();

export class FormationService {
  // Fonction utilitaire pour formater les périodes
  private formatPeriod(start: Date, end: Date | null = null): string {
    const startFormatted = start.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
    
    if (end) {
      const endFormatted = end.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      });
      return `${startFormatted} au ${endFormatted}`;
    }
    
    return startFormatted;
  }

  // ============= FORMATIONS COURTES REÇUES =============
  
  async createShortTrainingReceived(userId: string, data: CreateShortTrainingReceivedInput): Promise<ShortTrainingReceivedResponse> {
    const training = await prisma.training.create({
      data: {
        title: data.title,
        description: data.objectives.join('; '),
        type: 'FORMATION_COURTE',
        location: data.location,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        duration: data.duration || null,
        objectives: data.objectives,
        beneficiaries: data.beneficiaries,
        isInternal: false,
        organizer: data.organizer || null,
        activityId: data.activityId || null,
        participants: {
          create: {
            userId: userId,
            role: 'PARTICIPANT'
          }
        }
      },
      include: {
        activity: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    return {
      id: training.id,
      title: training.title,
      objectives: training.objectives,
      location: training.location || '',
      startDate: training.startDate,
      endDate: training.endDate,
      duration: training.duration,
      period: this.formatPeriod(training.startDate, training.endDate),
      beneficiaries: data.beneficiaries,
      organizer: training.organizer,
      createdAt: training.createdAt,
      updatedAt: training.updatedAt,
      activity: training.activity
    };
  }

  // ============= FORMATIONS DIPLÔMANTES REÇUES =============
  
  async createDiplomaticTrainingReceived(userId: string, data: CreateDiplomaticTrainingReceivedInput): Promise<DiplomaticTrainingReceivedResponse> {
    const training = await prisma.training.create({
      data: {
        title: `Formation diplômante ${data.level} en ${data.specialty}`,
        type: 'FORMATION_DIPLOMANTE',
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        organizer: data.university,
        // Nouveaux champs spécifiques aux formations diplômantes
        level: data.level,
        specialty: data.specialty,
        period: data.period,
        diplomaObtained: data.diplomaObtained,
        studentName: data.studentName,
        activityId: data.activityId || null,
        isInternal: false,
        participants: {
          create: {
            userId: userId,
            role: 'PARTICIPANT'
          }
        }
      },
      include: {
        activity: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    return {
      id: training.id,
      studentName: training.studentName || data.studentName,
      level: training.level || data.level,
      specialty: training.specialty || data.specialty,
      university: training.organizer || data.university,
      startDate: training.startDate,
      endDate: training.endDate,
      period: training.period || data.period,
      diplomaObtained: training.diplomaObtained || data.diplomaObtained,
      createdAt: training.createdAt,
      updatedAt: training.updatedAt,
      activity: training.activity
    };
  }
  // Ajoutez ces méthodes à votre FormationService existant

// ============= MÉTHODES DE SUPPRESSION =============

async deleteShortTrainingReceived(trainingId: string, userId: string): Promise<void> {
  // Vérifier que la formation appartient à l'utilisateur
  const training = await prisma.training.findFirst({
    where: {
      id: trainingId,
      participants: {
        some: {
          userId: userId,
          role: 'PARTICIPANT'
        }
      },
      type: 'FORMATION_COURTE'
    }
  });

  if (!training) {
    throw new Error('Formation courte non trouvée ou accès non autorisé');
  }

  await prisma.training.delete({
    where: { id: trainingId }
  });
}

async deleteDiplomaticTrainingReceived(trainingId: string, userId: string): Promise<void> {
  // Vérifier que la formation appartient à l'utilisateur
  const training = await prisma.training.findFirst({
    where: {
      id: trainingId,
      participants: {
        some: {
          userId: userId,
          role: 'PARTICIPANT'
        }
      },
      type: 'FORMATION_DIPLOMANTE'
    }
  });

  if (!training) {
    throw new Error('Formation diplômante non trouvée ou accès non autorisé');
  }

  await prisma.training.delete({
    where: { id: trainingId }
  });
}

async deleteTrainingGiven(trainingId: string, userId: string): Promise<void> {
  // Vérifier que la formation appartient à l'utilisateur
  const training = await prisma.training.findFirst({
    where: {
      id: trainingId,
      participants: {
        some: {
          userId: userId,
          role: 'FORMATEUR'
        }
      }
    }
  });

  if (!training) {
    throw new Error('Formation dispensée non trouvée ou accès non autorisé');
  }

  await prisma.training.delete({
    where: { id: trainingId }
  });
}

async deleteSupervision(supervisionId: string, userId: string): Promise<void> {
  // Vérifier que l'encadrement appartient à l'utilisateur
  const supervision = await prisma.supervision.findFirst({
    where: {
      id: supervisionId,
      supervisorId: userId
    }
  });

  if (!supervision) {
    throw new Error('Encadrement non trouvé ou accès non autorisé');
  }

  await prisma.supervision.delete({
    where: { id: supervisionId }
  });
}

  // ============= FORMATIONS DISPENSÉES =============
  
  async createTrainingGiven(userId: string, data: CreateTrainingGivenInput): Promise<TrainingGivenResponse> {
    const training = await prisma.training.create({
      data: {
        title: data.title,
        description: data.description || null,
        type: data.type,
        location: data.location || null,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        duration: data.duration || null,
        objectives: data.objectives,
        maxParticipants: data.maxParticipants || null,
        isInternal: true,
        organizer: data.institution,
        activityId: data.activityId || null,
        participants: {
          create: {
            userId: userId,
            role: 'FORMATEUR'
          }
        }
      },
      include: {
        activity: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    return {
      id: training.id,
      title: training.title,
      description: training.description,
      type: training.type,
      institution: training.organizer || '',
      level: data.level,
      department: data.department,
      location: training.location,
      startDate: training.startDate,
      endDate: training.endDate,
      duration: training.duration,
      objectives: training.objectives,
      maxParticipants: training.maxParticipants,
      createdAt: training.createdAt,
      updatedAt: training.updatedAt,
      activity: training.activity
    };
  }

  // ============= ENCADREMENTS =============
  
  async createSupervision(supervisorId: string, data: CreateSupervisionInput): Promise<SupervisionResponse> {
    let studentUser = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: `${data.studentName.replace(/\s+/g, '').toLowerCase()}@temp.student` },
          { 
            AND: [
              { firstName: { contains: data.studentName.split(' ')[0], mode: 'insensitive' } },
              { lastName: { contains: data.studentName.split(' ').slice(1).join(' '), mode: 'insensitive' } }
            ]
          }
        ]
      }
    });

    if (!studentUser) {
      const nameParts = data.studentName.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || firstName;
      
      studentUser = await prisma.user.create({
        data: {
          email: `${data.studentName.replace(/\s+/g, '').toLowerCase()}@temp.student`,
          password: 'temp_password',
          firstName,
          lastName,
          role: 'CHERCHEUR',
          isActive: false,
          specialization: data.specialty
        }
      });
    }

    const supervision = await prisma.supervision.create({
      data: {
        title: data.title,
        type: data.type,
        university: data.university,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: data.status,
        abstract: data.abstract || null,
        supervisorId: supervisorId,
        studentId: studentUser.id,
        activityId: data.activityId || null
      },
      include: {
        activity: {
          select: {
            id: true,
            title: true
          }
        },
        student: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return {
      id: supervision.id,
      title: supervision.title,
      studentName: `${supervision.student.firstName} ${supervision.student.lastName}`,
      type: supervision.type,
      specialty: data.specialty,
      university: supervision.university,
      startDate: supervision.startDate,
      endDate: supervision.endDate,
      expectedDefenseDate: data.expectedDefenseDate ? new Date(data.expectedDefenseDate) : undefined,
      status: supervision.status,
      abstract: supervision.abstract,
      coSupervisors: data.coSupervisors,
      createdAt: supervision.createdAt,
      updatedAt: supervision.updatedAt,
      activity: supervision.activity
    };
  }

  // ============= RÉCUPÉRATION DES DONNÉES =============
  
  async getUserShortTrainingsReceived(userId: string): Promise<ShortTrainingReceivedResponse[]> {
    const trainings = await prisma.training.findMany({
      where: {
        participants: {
          some: {
            userId: userId,
            role: 'PARTICIPANT'
          }
        },
        type: 'FORMATION_COURTE'
      },
      include: {
        activity: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    return trainings.map(training => ({
      id: training.id,
      title: training.title,
      objectives: training.objectives,
      location: training.location || '',
      startDate: training.startDate,
      endDate: training.endDate,
      duration: training.duration,
      period: this.formatPeriod(training.startDate, training.endDate),
      beneficiaries: training.beneficiaries || [],
      organizer: training.organizer,
      createdAt: training.createdAt,
      updatedAt: training.updatedAt,
      activity: training.activity
    }));
  }

  async getUserDiplomaticTrainingsReceived(userId: string): Promise<DiplomaticTrainingReceivedResponse[]> {
    const trainings = await prisma.training.findMany({
      where: {
        participants: {
          some: {
            userId: userId,
            role: 'PARTICIPANT'
          }
        },
        type: 'FORMATION_DIPLOMANTE'
      },
      include: {
        activity: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    return trainings.map(training => ({
      id: training.id,
      studentName: training.studentName || '',
      level: training.level || '',
      specialty: training.specialty || '',
      university: training.organizer || '',
      startDate: training.startDate,
      endDate: training.endDate,
      period: training.period || '',
      diplomaObtained: training.diplomaObtained || 'EN_COURS',
      createdAt: training.createdAt,
      updatedAt: training.updatedAt,
      activity: training.activity
    }));
  }

  async getUserTrainingsGiven(userId: string): Promise<TrainingGivenResponse[]> {
    const trainings = await prisma.training.findMany({
      where: {
        participants: {
          some: {
            userId: userId,
            role: 'FORMATEUR'
          }
        }
      },
      include: {
        activity: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    return trainings.map(training => ({
      id: training.id,
      title: training.title,
      description: training.description,
      type: training.type,
      institution: training.organizer || '',
      level: '',
      department: '',
      location: training.location,
      startDate: training.startDate,
      endDate: training.endDate,
      duration: training.duration,
      objectives: training.objectives,
      maxParticipants: training.maxParticipants,
      createdAt: training.createdAt,
      updatedAt: training.updatedAt,
      activity: training.activity
    }));
  }

  async getUserSupervisions(userId: string): Promise<SupervisionResponse[]> {
    const supervisions = await prisma.supervision.findMany({
      where: { supervisorId: userId },
      include: {
        activity: {
          select: {
            id: true,
            title: true
          }
        },
        student: {
          select: {
            firstName: true,
            lastName: true,
            specialization: true
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    return supervisions.map(supervision => ({
      id: supervision.id,
      title: supervision.title,
      studentName: `${supervision.student.firstName} ${supervision.student.lastName}`,
      type: supervision.type,
      specialty: supervision.student.specialization || '',
      university: supervision.university,
      startDate: supervision.startDate,
      endDate: supervision.endDate,
      expectedDefenseDate: undefined,
      status: supervision.status,
      abstract: supervision.abstract,
      coSupervisors: [],
      createdAt: supervision.createdAt,
      updatedAt: supervision.updatedAt,
      activity: supervision.activity
    }));
  }

  // ============= RAPPORTS =============
  
  async getAllUsersFormationReport(): Promise<FormationReport[]> {
    const users = await prisma.user.findMany({
      where: { 
        isActive: true,
        role: 'CHERCHEUR'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    });

    const reports: FormationReport[] = [];

    for (const user of users) {
      const shortTrainings = await this.getUserShortTrainingsReceived(user.id);
      const diplomaticTrainings = await this.getUserDiplomaticTrainingsReceived(user.id);
      const trainingsGiven = await this.getUserTrainingsGiven(user.id);
      const supervisions = await this.getUserSupervisions(user.id);

      reports.push({
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        },
        shortTrainingsReceived: shortTrainings,
        diplomaticTrainingsReceived: diplomaticTrainings,
        trainingsGiven,
        supervisions
      });
    }

    return reports;
  }

  // ============= MÉTHODES DE MISE À JOUR =============

  async updateShortTrainingReceived(trainingId: string, userId: string, data: Partial<CreateShortTrainingReceivedInput>): Promise<ShortTrainingReceivedResponse> {
    // Vérifier que la formation appartient à l'utilisateur
    const existingTraining = await prisma.training.findFirst({
      where: {
        id: trainingId,
        participants: {
          some: {
            userId: userId,
            role: 'PARTICIPANT'
          }
        },
        type: 'FORMATION_COURTE'
      }
    });

    if (!existingTraining) {
      throw new Error('Formation courte non trouvée ou accès non autorisé');
    }

    const training = await prisma.training.update({
      where: { id: trainingId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.objectives && { objectives: data.objectives, description: data.objectives.join('; ') }),
        ...(data.location && { location: data.location }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
        ...(data.duration !== undefined && { duration: data.duration || null }),
        ...(data.beneficiaries !== undefined && { beneficiaries: data.beneficiaries }),
        ...(data.organizer !== undefined && { organizer: data.organizer || null }),
      },
      include: {
        activity: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    return {
      id: training.id,
      title: training.title,
      objectives: training.objectives,
      location: training.location || '',
      startDate: training.startDate,
      endDate: training.endDate,
      duration: training.duration,
      period: this.formatPeriod(training.startDate, training.endDate),
      beneficiaries: training.beneficiaries || [],
      organizer: training.organizer,
      createdAt: training.createdAt,
      updatedAt: training.updatedAt,
      activity: training.activity
    };
  }

  async updateDiplomaticTrainingReceived(trainingId: string, userId: string, data: Partial<CreateDiplomaticTrainingReceivedInput>): Promise<DiplomaticTrainingReceivedResponse> {
    // Vérifier que la formation appartient à l'utilisateur
    const existingTraining = await prisma.training.findFirst({
      where: {
        id: trainingId,
        participants: {
          some: {
            userId: userId,
            role: 'PARTICIPANT'
          }
        },
        type: 'FORMATION_DIPLOMANTE'
      }
    });

    if (!existingTraining) {
      throw new Error('Formation diplômante non trouvée ou accès non autorisé');
    }

    const training = await prisma.training.update({
      where: { id: trainingId },
      data: {
        ...(data.level && data.specialty && { title: `Formation diplômante ${data.level} en ${data.specialty}` }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
        ...(data.university && { organizer: data.university }),
        ...(data.level && { level: data.level }),
        ...(data.specialty && { specialty: data.specialty }),
        ...(data.period && { period: data.period }),
        ...(data.diplomaObtained && { diplomaObtained: data.diplomaObtained }),
        ...(data.studentName && { studentName: data.studentName }),
      },
      include: {
        activity: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    return {
      id: training.id,
      studentName: training.studentName || '',
      level: training.level || '',
      specialty: training.specialty || '',
      university: training.organizer || '',
      startDate: training.startDate,
      endDate: training.endDate,
      period: training.period || '',
      diplomaObtained: training.diplomaObtained || 'EN_COURS',
      createdAt: training.createdAt,
      updatedAt: training.updatedAt,
      activity: training.activity
    };
  }

  async updateTrainingGiven(trainingId: string, userId: string, data: Partial<CreateTrainingGivenInput>): Promise<TrainingGivenResponse> {
    // Vérifier que la formation appartient à l'utilisateur
    const existingTraining = await prisma.training.findFirst({
      where: {
        id: trainingId,
        participants: {
          some: {
            userId: userId,
            role: 'FORMATEUR'
          }
        }
      }
    });

    if (!existingTraining) {
      throw new Error('Formation dispensée non trouvée ou accès non autorisé');
    }

    const training = await prisma.training.update({
      where: { id: trainingId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description || null }),
        ...(data.type && { type: data.type }),
        ...(data.location !== undefined && { location: data.location || null }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
        ...(data.duration !== undefined && { duration: data.duration || null }),
        ...(data.objectives !== undefined && { objectives: data.objectives }),
        ...(data.maxParticipants !== undefined && { maxParticipants: data.maxParticipants || null }),
      },
      include: {
        activity: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    return {
      id: training.id,
      title: training.title,
      description: training.description,
      type: training.type,
      institution: training.organizer || '',
      level: data.level || '',
      department: data.department || '',
      location: training.location,
      startDate: training.startDate,
      endDate: training.endDate,
      duration: training.duration,
      objectives: training.objectives,
      maxParticipants: training.maxParticipants,
      createdAt: training.createdAt,
      updatedAt: training.updatedAt,
      activity: training.activity
    };
  }

  async updateSupervision(supervisionId: string, userId: string, data: Partial<CreateSupervisionInput>): Promise<SupervisionResponse> {
    // Vérifier que l'encadrement appartient à l'utilisateur
    const existingSupervision = await prisma.supervision.findFirst({
      where: {
        id: supervisionId,
        supervisorId: userId
      }
    });

    if (!existingSupervision) {
      throw new Error('Encadrement non trouvé ou accès non autorisé');
    }

    const supervision = await prisma.supervision.update({
      where: { id: supervisionId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.type && { type: data.type }),
        ...(data.specialty && { specialty: data.specialty }),
        ...(data.university && { university: data.university }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
        ...(data.expectedDefenseDate !== undefined && { expectedDefenseDate: data.expectedDefenseDate ? new Date(data.expectedDefenseDate) : null }),
        ...(data.status && { status: data.status }),
        ...(data.abstract !== undefined && { abstract: data.abstract || null }),
        ...(data.coSupervisors !== undefined && { coSupervisors: data.coSupervisors }),
      },
      include: {
        activity: {
          select: {
            id: true,
            title: true
          }
        },
        student: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return {
      id: supervision.id,
      title: supervision.title,
      studentName: `${supervision.student.firstName} ${supervision.student.lastName}`,
      type: supervision.type,
      specialty: supervision.specialty,
      university: supervision.university,
      startDate: supervision.startDate,
      endDate: supervision.endDate,
      expectedDefenseDate: supervision.expectedDefenseDate || undefined,
      status: supervision.status,
      abstract: supervision.abstract,
      coSupervisors: supervision.coSupervisors,
      createdAt: supervision.createdAt,
      updatedAt: supervision.updatedAt,
      activity: supervision.activity
    };
  }

  // ============= MÉTHODE UTILITAIRE =============

  async getUserInfo(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        email: true
      }
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    return user;
  }
}