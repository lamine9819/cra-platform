// src/controllers/activity.controller.ts - Version CRA complète
import { Request, Response, NextFunction } from 'express';
import { ActivityService } from '../services/activity.service';
import { ActivityReportService } from '../services/activityReport.service';
import { AuthenticatedRequest } from '../types/auth.types';
import {
  createActivitySchema,
  updateActivitySchema,
  activityListQuerySchema,
  activityRecurrenceSchema,
  linkFormSchema,
  linkDocumentSchema,
  addParticipantSchema,
  updateParticipantSchema,
  duplicateActivitySchema,
  addFundingSchema,
  updateFundingSchema,
  addActivityPartnerSchema,
  updateActivityPartnerSchema,
  createTaskSchema,
  updateTaskSchema,
  createCommentSchema,
  updateCommentSchema,
  reassignTaskSchema  
} from '../utils/activityValidation';

const activityService = new ActivityService();

export class ActivityController {

  // ✅ Créer une activité CRA
  createActivity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const validatedData = createActivitySchema.parse(req.body);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const activity = await activityService.createActivity(validatedData, userId, userRole);

      res.status(201).json({
        success: true,
        message: 'Activité créée avec succès',
        data: activity,
      });
    } catch (error) {
      next(error);
    }
  };

  // ✅ Lister les activités avec filtres CRA
  listActivities = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const queryParams = activityListQuerySchema.parse(req.query);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await activityService.listActivities(userId, userRole, queryParams);

      res.status(200).json({
        success: true,
        data: result.activities,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // ✅ Obtenir une activité par ID
  getActivityById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const activity = await activityService.getActivityById(id, userId, userRole);

      res.status(200).json({
        success: true,
        data: activity,
      });
    } catch (error) {
      next(error);
    }
  };

  // ✅ Mettre à jour une activité
  updateActivity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const validatedData = updateActivitySchema.parse(req.body);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const activity = await activityService.updateActivity(id, validatedData, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Activité mise à jour avec succès',
        data: activity,
      });
    } catch (error) {
      next(error);
    }
  };

  // ✅ Supprimer une activité
  deleteActivity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      await activityService.deleteActivity(id, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Activité supprimée avec succès',
      });
    } catch (error) {
      next(error);
    }
  };

  // ✅ Obtenir les statistiques CRA
  getActivityStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const stats = await activityService.getActivityStats(userId, userRole);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  // ✅ Dupliquer une activité
  duplicateActivity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const validatedData = duplicateActivitySchema.parse(req.body);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const duplicatedActivity = await activityService.duplicateActivity(
        id, 
        userId, 
        userRole, 
        validatedData.title
      );

      res.status(201).json({
        success: true,
        message: 'Activité dupliquée avec succès',
        data: duplicatedActivity,
      });
    } catch (error) {
      next(error);
    }
  };

  // ✅ Créer une reconduction d'activité
  createRecurrence = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const validatedData = activityRecurrenceSchema.parse(req.body);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const newActivity = await activityService.createActivityRecurrence(
        id,
        userId,
        userRole,
        validatedData
      );

      res.status(201).json({
        success: true,
        message: 'Activité reconduite avec succès',
        data: newActivity,
      });
    } catch (error) {
      next(error);
    }
  };

  // ✅ Obtenir activités par thème
  getActivitiesByTheme = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { themeId } = req.params;
      const queryParams = activityListQuerySchema.parse(req.query);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await activityService.listActivities(
        userId, 
        userRole, 
        { ...queryParams, themeId }
      );

      res.status(200).json({
        success: true,
        data: result.activities,
        pagination: result.pagination,
        meta: { themeId }
      });
    } catch (error) {
      next(error);
    }
  };

  // ✅ Obtenir activités par station
  getActivitiesByStation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { stationId } = req.params;
      const queryParams = activityListQuerySchema.parse(req.query);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await activityService.listActivities(
        userId, 
        userRole, 
        { ...queryParams, stationId }
      );

      res.status(200).json({
        success: true,
        data: result.activities,
        pagination: result.pagination,
        meta: { stationId }
      });
    } catch (error) {
      next(error);
    }
  };

  // ✅ Obtenir activités sans projet
  getActivitiesWithoutProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const queryParams = activityListQuerySchema.parse(req.query);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await activityService.listActivities(
        userId, 
        userRole, 
        { ...queryParams, withoutProject: true }
      );

      res.status(200).json({
        success: true,
        data: result.activities,
        pagination: result.pagination,
        meta: { withoutProject: true }
      });
    } catch (error) {
      next(error);
    }
  };

  // ✅ Obtenir activités par responsable
  getActivitiesByResponsible = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { responsibleId } = req.params;
      const queryParams = activityListQuerySchema.parse(req.query);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await activityService.listActivities(
        userId, 
        userRole, 
        { ...queryParams, responsibleId }
      );

      res.status(200).json({
        success: true,
        data: result.activities,
        pagination: result.pagination,
        meta: { responsibleId }
      });
    } catch (error) {
      next(error);
    }
  };

  // ✅ Obtenir historique des reconductions
  getActivityRecurrenceHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      // Vérifier l'accès à l'activité
      await activityService.getActivityById(id, userId, userRole);

      // Obtenir l'historique des reconductions
      const recurrenceHistory = await prisma.activityRecurrence.findMany({
        where: {
          OR: [
            { sourceActivityId: id },
            { newActivityId: id }
          ]
        },
        include: {
          sourceActivity: { 
            select: { id: true, title: true, code: true, createdAt: true }
          },
          newActivity: { 
            select: { id: true, title: true, code: true, createdAt: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({
        success: true,
        data: recurrenceHistory,
      });
    } catch (error) {
      next(error);
    }
  };

  // ✅ Lier un formulaire
  linkForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const { formId } = linkFormSchema.parse(req.body);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await activityService.linkForm(id, formId, userId, userRole);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  // ✅ Délier un formulaire
  unlinkForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id, formId } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await activityService.unlinkForm(id, formId, userId, userRole);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  // ✅ Lier un document
  linkDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const { documentId } = linkDocumentSchema.parse(req.body);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await activityService.linkDocument(id, documentId, userId, userRole);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  // ✅ Obtenir dashboard personnalisé CRA
  getCRADashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      // Obtenir les statistiques
      const stats = await activityService.getActivityStats(userId, userRole);

      // Obtenir les activités récentes de l'utilisateur
      const recentUserActivities = await activityService.listActivities(
        userId,
        userRole,
        { 
          responsibleId: userId, 
          limit: 5, 
          page: 1 
        }
      );

      // Obtenir les activités à échéance proche
      const upcomingDeadlines = await activityService.listActivities(
        userId,
        userRole,
        { 
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          limit: 10,
          page: 1
        }
      );

      res.status(200).json({
        success: true,
        data: {
          stats,
          recentActivities: recentUserActivities.activities,
          upcomingDeadlines: upcomingDeadlines.activities,
          summary: {
            totalActivities: stats.total,
            myActivities: recentUserActivities.activities.length,
            upcomingCount: upcomingDeadlines.activities.length
          }
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // ✅ Exporter les activités (pour rapports CRA)
  exportActivities = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const queryParams = activityListQuerySchema.parse(req.query);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;
      const format = req.query.format as string || 'json';

      // Obtenir toutes les activités selon les filtres (sans pagination)
      const allActivities = await activityService.listActivities(
        userId,
        userRole,
        { ...queryParams, limit: 1000, page: 1 }
      );

      if (format === 'csv') {
        // Conversion en CSV
        const csvData = this.convertActivitiesToCSV(allActivities.activities);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="activites_cra.csv"');
        res.status(200).send(csvData);
      } else {
        // Format JSON par défaut
        res.status(200).json({
          success: true,
          data: allActivities.activities,
          exportInfo: {
            format,
            exportedAt: new Date().toISOString(),
            totalRecords: allActivities.activities.length,
            filters: queryParams
          }
        });
      }
    } catch (error) {
      next(error);
    }
  };
  // Ajouter un participant
addParticipant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const validatedData = addParticipantSchema.parse(req.body);
    const userId = authenticatedReq.user.userId;
    const userRole = authenticatedReq.user.role;

    // Assurez-vous que le rôle est bien du type ParticipantRole (enum)
    const { role, ...rest } = validatedData;
    const participantRoleEnum = (global as any).ParticipantRole || require('../types/participant.types').ParticipantRole;
    const mappedRole = participantRoleEnum[role as keyof typeof participantRoleEnum];

    const participant = await activityService.addParticipant(
      id, 
      { ...rest, role: mappedRole }, 
      userId, 
      userRole
    );

    res.status(201).json({
      success: true,
      message: 'Participant ajouté avec succès',
      data: participant,
    });
  } catch (error) {
    next(error);
  }
};

// Mettre à jour un participant
updateParticipant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id, participantUserId } = req.params;
    const validatedData = updateParticipantSchema.parse(req.body);
    const userId = authenticatedReq.user.userId;
    const userRole = authenticatedReq.user.role;

    // Assurez-vous que le rôle est bien du type ParticipantRole (enum)
    const { role, ...rest } = validatedData;
    const participantRoleEnum = (global as any).ParticipantRole || require('../types/participant.types').ParticipantRole;
    const mappedRole = participantRoleEnum[role as keyof typeof participantRoleEnum];

    const participant = await activityService.updateParticipant(
      id,
      participantUserId,
      { ...rest, role: mappedRole },
      userId,
      userRole
    );
    res.status(200).json({
      success: true,
      message: 'Participant mis à jour avec succès',
      data: participant,
    });
  } catch (error) {
    next(error);
  }
};

// Retirer un participant
removeParticipant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id, participantUserId } = req.params;
    const userId = authenticatedReq.user.userId;
    const userRole = authenticatedReq.user.role;

    await activityService.removeParticipant(id, participantUserId, userId, userRole);

    res.status(200).json({
      success: true,
      message: 'Participant retiré avec succès',
    });
  } catch (error) {
    next(error);
  }
};

// Lister les participants
listParticipants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const userId = authenticatedReq.user.userId;
    const userRole = authenticatedReq.user.role;

    const participants = await activityService.listParticipants(id, userId, userRole);

    res.status(200).json({
      success: true,
      data: participants,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// GESTION DES FINANCEMENTS
// ========================================

addFunding = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const validatedData = addFundingSchema.parse(req.body);
    const userId = authenticatedReq.user.userId;
    const userRole = authenticatedReq.user.role;

    const funding = await activityService.addFunding(id, validatedData, userId, userRole);

    res.status(201).json({
      success: true,
      message: 'Financement ajouté avec succès',
      data: funding,
    });
  } catch (error) {
    next(error);
  }
};

updateFunding = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id, fundingId } = req.params;
    const validatedData = updateFundingSchema.parse(req.body);
    const userId = authenticatedReq.user.userId;
    const userRole = authenticatedReq.user.role;

    const funding = await activityService.updateFunding(id, fundingId, validatedData, userId, userRole);

    res.status(200).json({
      success: true,
      message: 'Financement mis à jour avec succès',
      data: funding,
    });
  } catch (error) {
    next(error);
  }
};

removeFunding = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id, fundingId } = req.params;
    const userId = authenticatedReq.user.userId;
    const userRole = authenticatedReq.user.role;

    await activityService.removeFunding(id, fundingId, userId, userRole);

    res.status(200).json({
      success: true,
      message: 'Financement retiré avec succès',
    });
  } catch (error) {
    next(error);
  }
};

listFundings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const userId = authenticatedReq.user.userId;
    const userRole = authenticatedReq.user.role;

    const fundings = await activityService.listFundings(id, userId, userRole);

    res.status(200).json({
      success: true,
      data: fundings,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// GESTION DES PARTENARIATS
// ========================================

addPartner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const validatedData = addActivityPartnerSchema.parse(req.body);
    const userId = authenticatedReq.user.userId;
    const userRole = authenticatedReq.user.role;

    const partnership = await activityService.addPartner(id, validatedData, userId, userRole);

    res.status(201).json({
      success: true,
      message: 'Partenaire ajouté avec succès',
      data: partnership,
    });
  } catch (error) {
    next(error);
  }
};

updatePartner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id, partnerId } = req.params;
    const validatedData = updateActivityPartnerSchema.parse(req.body);
    const userId = authenticatedReq.user.userId;
    const userRole = authenticatedReq.user.role;

    const partnership = await activityService.updatePartner(id, partnerId, validatedData, userId, userRole);

    res.status(200).json({
      success: true,
      message: 'Partenariat mis à jour avec succès',
      data: partnership,
    });
  } catch (error) {
    next(error);
  }
};

removePartner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id, partnerId } = req.params;
    const userId = authenticatedReq.user.userId;
    const userRole = authenticatedReq.user.role;

    await activityService.removePartner(id, partnerId, userId, userRole);

    res.status(200).json({
      success: true,
      message: 'Partenaire retiré avec succès',
    });
  } catch (error) {
    next(error);
  }
};

listPartners = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const userId = authenticatedReq.user.userId;
    const userRole = authenticatedReq.user.role;

    const partnerships = await activityService.listPartners(id, userId, userRole);

    res.status(200).json({
      success: true,
      data: partnerships,
    });
  } catch (error) {
    next(error);
  }
};
// ========================================
// GESTION DES TÂCHES
// ========================================

createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const validatedData = createTaskSchema.parse(req.body);
    const userId = authenticatedReq.user.userId;
    const userRole = authenticatedReq.user.role;

    const task = await activityService.createTask(id, validatedData, userId, userRole);

    res.status(201).json({
      success: true,
      message: 'Tâche créée avec succès',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// Méthode existante modifiée
listTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const { filter } = req.query; // 'all', 'created', 'assigned'
    const userId = authenticatedReq.user.userId;
    const userRole = authenticatedReq.user.role;

    let tasks;
    
    if (filter === 'created') {
      tasks = await activityService.listCreatedTasks(id, userId, userRole);
    } else if (filter === 'assigned') {
      tasks = await activityService.listAssignedTasks(id, userId, userRole);
    } else {
      tasks = await activityService.listTasks(id, userId, userRole);
    }

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// Nouvelle méthode pour réassigner
reassignTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id, taskId } = req.params;
    const validatedData = reassignTaskSchema.parse(req.body);
    const userId = authenticatedReq.user.userId;
    const userRole = authenticatedReq.user.role;

    const task = await activityService.reassignTask(id, taskId, validatedData, userId, userRole);

    res.status(200).json({
      success: true,
      message: 'Tâche réassignée avec succès',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};
getTaskById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id, taskId } = req.params;
    const userId = authenticatedReq.user.userId;
    const userRole = authenticatedReq.user.role;

    const task = await activityService.getTaskById(id, taskId, userId, userRole);

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id, taskId } = req.params;
    const validatedData = updateTaskSchema.parse(req.body);
    const userId = authenticatedReq.user.userId;
    const userRole = authenticatedReq.user.role;

    const task = await activityService.updateTask(id, taskId, validatedData, userId, userRole);

    res.status(200).json({
      success: true,
      message: 'Tâche mise à jour avec succès',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id, taskId } = req.params;
    const userId = authenticatedReq.user.userId;
    const userRole = authenticatedReq.user.role;

    await activityService.deleteTask(id, taskId, userId, userRole);

    res.status(200).json({
      success: true,
      message: 'Tâche supprimée avec succès',
    });
  } catch (error) {
    next(error);
  }
};
// ========================================
// GESTION DES COMMENTAIRES
// ========================================

createComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const validatedData = createCommentSchema.parse(req.body);
    const userId = authenticatedReq.user.userId;
    const userRole = authenticatedReq.user.role;

    const comment = await activityService.createComment(id, validatedData, userId, userRole);

    res.status(201).json({
      success: true,
      message: 'Commentaire ajouté avec succès',
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

listComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const userId = authenticatedReq.user.userId;
    const userRole = authenticatedReq.user.role;

    const comments = await activityService.listComments(id, userId, userRole);

    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

updateComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id, commentId } = req.params;
    const validatedData = updateCommentSchema.parse(req.body);
    const userId = authenticatedReq.user.userId;
    const userRole = authenticatedReq.user.role;

    const comment = await activityService.updateComment(id, commentId, validatedData, userId, userRole);

    res.status(200).json({
      success: true,
      message: 'Commentaire mis à jour avec succès',
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id, commentId } = req.params;
    const userId = authenticatedReq.user.userId;
    const userRole = authenticatedReq.user.role;

    await activityService.deleteComment(id, commentId, userId, userRole);

    res.status(200).json({
      success: true,
      message: 'Commentaire supprimé avec succès',
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// GESTION DES TRANSFERTS D'ACQUIS
// ========================================

linkKnowledgeTransfer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id, transferId } = req.params;
    const userId = authenticatedReq.user.userId;
    const userRole = authenticatedReq.user.role;

    const result = await activityService.linkKnowledgeTransfer(id, transferId, userId, userRole);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

unlinkKnowledgeTransfer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id, transferId } = req.params;
    const userId = authenticatedReq.user.userId;
    const userRole = authenticatedReq.user.role;

    const result = await activityService.unlinkKnowledgeTransfer(id, transferId, userId, userRole);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

listKnowledgeTransfers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const userId = authenticatedReq.user.userId;
    const userRole = authenticatedReq.user.role;

    const transfers = await activityService.listKnowledgeTransfers(id, userId, userRole);

    res.status(200).json({
      success: true,
      data: transfers,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// GÉNÉRATION DE RAPPORTS
// ========================================

generateReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const { format } = req.query;
    const userId = authenticatedReq.user.userId;
    const userRole = authenticatedReq.user.role;

    // Valider le format
    if (!format || !['pdf', 'word'].includes(format as string)) {
      return res.status(400).json({
        success: false,
        message: 'Format invalide. Utilisez "pdf" ou "word"'
      });
    }

    const reportService = new ActivityReportService();
    const buffer = await reportService.generateActivityReport(
      id,
      userId,
      userRole,
      format as 'pdf' | 'word'
    );

    // Récupérer l'activité pour le nom du fichier
    const activity = await activityService.getActivityById(id, userId, userRole);
    const fileName = `fiche_activite_${activity.code || id}_${new Date().toISOString().split('T')[0]}`;

    // Définir les headers selon le format
    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);
    } else {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.docx"`);
    }

    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

  // Méthode utilitaire pour convertir en CSV
  private convertActivitiesToCSV(activities: any[]): string {
    if (activities.length === 0) return '';

    const headers = [
      'Code', 'Titre', 'Type', 'Statut', 'Thème', 'Responsable', 
      'Station', 'Région', 'Date début', 'Date fin', 'Projet'
    ];

    const csvRows = [
      headers.join(';'),
      ...activities.map(activity => [
        activity.code || '',
        `"${activity.title.replace(/"/g, '""')}"`,
        activity.type,
        activity.lifecycleStatus,
        activity.theme?.name || '',
        `${activity.responsible?.firstName} ${activity.responsible?.lastName}`,
        activity.station?.name || '',
        activity.interventionRegion || '',
        activity.startDate ? new Date(activity.startDate).toLocaleDateString('fr-FR') : '',
        activity.endDate ? new Date(activity.endDate).toLocaleDateString('fr-FR') : '',
        activity.project?.title || 'Activité autonome'
      ].join(';'))
    ];

    return csvRows.join('\n');
  }
}

// Import nécessaire pour l'historique des reconductions
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();