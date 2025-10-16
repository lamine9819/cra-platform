// =============================================
// CONTRÔLEUR DE GESTION DES PROJETS - VERSION CORRIGÉE
// =============================================

// src/controllers/project.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service';
import { AuthenticatedRequest } from '../types/auth.types';
import {
  createProjectSchema,
  updateProjectSchema,
  projectListQuerySchema,
  addParticipantSchema,
  updateParticipantSchema,
  addPartnershipSchema,
  updatePartnershipSchema
} from '../utils/projectValidation';

const projectService = new ProjectService();

export class ProjectController {

  // Créer un projet avec spécificités CRA
  createProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const validatedData = createProjectSchema.parse(req.body);
      const creatorId = authenticatedReq.user.userId;

      const project = await projectService.createProject(validatedData, creatorId);

      res.status(201).json({
        success: true,
        message: 'Projet créé avec succès',
        data: project,
      });
    } catch (error) {
      next(error);
    }
  };

  // Lister les projets avec filtres CRA
  listProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const queryParams = projectListQuerySchema.parse(req.query);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await projectService.listProjects(userId, userRole, queryParams);

      res.status(200).json({
        success: true,
        data: result.projects,
        pagination: result.pagination,
        filters: {
          applied: queryParams,
          available: {
            status: ['PLANIFIE', 'EN_COURS', 'SUSPENDU', 'TERMINE', 'ARCHIVE'],
            researchType: ['RECHERCHE_FONDAMENTALE', 'RECHERCHE_APPLIQUEE', 'RECHERCHE_DEVELOPPEMENT', 'PRODUCTION_SEMENCES']
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtenir un projet par ID
  getProjectById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const project = await projectService.getProjectById(id, userId, userRole);

      res.status(200).json({
        success: true,
        data: project,
      });
    } catch (error) {
      next(error);
    }
  };

  // Mettre à jour un projet
  updateProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const validatedData = updateProjectSchema.parse(req.body);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const project = await projectService.updateProject(id, validatedData, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Projet mis à jour avec succès',
        data: project,
      });
    } catch (error) {
      next(error);
    }
  };

  // Supprimer un projet
  deleteProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      await projectService.deleteProject(id, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Projet supprimé avec succès',
      });
    } catch (error) {
      next(error);
    }
  };

  // GESTION DES PARTICIPANTS

  // Ajouter un participant
  addParticipant = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const participantData = addParticipantSchema.parse(req.body);
      const requesterId = authenticatedReq.user.userId;
      const requesterRole = authenticatedReq.user.role;

      const result = await projectService.addParticipant(id, participantData, requesterId, requesterRole);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  // Mettre à jour un participant
  updateParticipant = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id: projectId } = req.params;
      const updateData = updateParticipantSchema.parse(req.body);
      const requesterId = authenticatedReq.user.userId;
      const requesterRole = authenticatedReq.user.role;

      const result = await projectService.updateParticipant(projectId, updateData, requesterId, requesterRole);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  // Retirer un participant du projet
  removeParticipant = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id: projectId, participantId } = req.params;
      const requesterId = authenticatedReq.user.userId;
      const requesterRole = authenticatedReq.user.role;

      const result = await projectService.removeParticipant(projectId, participantId, requesterId, requesterRole);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  // NOUVELLES MÉTHODES POUR LES PARTENARIATS (Placeholder)

  // Ajouter un partenariat au projet
  // Méthode supprimée car doublon avec celle plus bas dans le fichier.

  // NOUVELLES MÉTHODES POUR LA GESTION DU FINANCEMENT (Placeholder)

  // Ajouter un financement au projet
  addFunding = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const requesterId = authenticatedReq.user.userId;
      const requesterRole = authenticatedReq.user.role;

      const result = await projectService.addFunding(id, req.body, requesterId, requesterRole);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  // MÉTHODES D'ANALYSE ET DE RAPPORTS

  // Obtenir les statistiques d'un projet
  getProjectStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      // Pour l'instant, retourner des statistiques mock
      const mockStats = {
        participants: {
          total: 0,
          byRole: {},
          activeCount: 0
        },
        activities: {
          total: 0,
          byType: {},
          byStatus: {},
          completion: 0
        },
        budget: {
          allocated: 0,
          spent: 0,
          remaining: 0
        },
        timeline: {
          startDate: null,
          endDate: null,
          duration: 0,
          progress: 0
        }
      };

      res.status(200).json({
        success: true,
        data: mockStats,
      });
    } catch (error) {
      next(error);
    }
  };

  // Générer un rapport de projet
  generateProjectReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const { format, sections } = req.query;

      res.status(200).json({
        success: true,
        message: 'Rapport de projet généré avec succès',
        data: {
          projectId: id,
          format: format || 'pdf',
          sections: sections ? (sections as string).split(',') : ['overview', 'participants', 'activities', 'budget'],
          downloadUrl: `/api/projects/${id}/reports/download?token=mock-token`
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Dupliquer un projet (utile pour les reconductions)
  duplicateProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const { 
        title, 
        copyParticipants = true, 
        copyActivities = false, 
        copyPartnerships = true 
      } = req.body;

      res.status(201).json({
        success: true,
        message: 'Projet dupliqué avec succès',
        data: {
          message: 'Fonctionnalité de duplication à implémenter',
          originalProjectId: id,
          options: {
            title,
            copyParticipants,
            copyActivities,
            copyPartnerships
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Archiver un projet
  archiveProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const { reason } = req.body;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const archivedProject = await projectService.updateProject(id, { 
        status: 'ARCHIVE' 
      }, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Projet archivé avec succès',
        data: archivedProject
      });
    } catch (error) {
      next(error);
    }
  };

  // Restaurer un projet archivé
  restoreProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const { newStatus = 'PLANIFIE' } = req.body;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const restoredProject = await projectService.updateProject(id, { 
        status: newStatus as any 
      }, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Projet restauré avec succès',
        data: restoredProject
      });
    } catch (error) {
      next(error);
    }
  };

  // MÉTHODES DE RECHERCHE PAR CRITÈRES CRA

  // Obtenir les projets par thème
  getProjectsByTheme = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { themeId } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await projectService.listProjects(userId, userRole, {
        themeId,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10
      });

      res.status(200).json({
        success: true,
        data: result.projects,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtenir les projets d'un programme de recherche
  getProjectsByProgram = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { programId } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await projectService.listProjects(userId, userRole, {
        researchProgramId: programId,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10
      });

      res.status(200).json({
        success: true,
        data: result.projects,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtenir les projets liés à une convention
  getProjectsByConvention = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { conventionId } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await projectService.listProjects(userId, userRole, {
        conventionId,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10
      });

      res.status(200).json({
        success: true,
        data: result.projects,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // Recherche avancée de projets
  advancedSearch = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      // Parser les paramètres de recherche avancée
      const searchParams = {
        keywords: req.query.keywords as string,
        themeIds: req.query.themeIds ? (req.query.themeIds as string).split(',') : [],
        programIds: req.query.programIds ? (req.query.programIds as string).split(',') : [],
        status: req.query.status ? (req.query.status as string).split(',') : [],
      };

      // Pour l'instant, utiliser la recherche normale
      const result = await projectService.listProjects(userId, userRole, {
        search: searchParams.keywords,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10
      });

      res.status(200).json({
        success: true,
        data: result.projects,
        pagination: result.pagination,
        searchParams,
      });
    } catch (error) {
      next(error);
    }
  };
  // Ajouter un partenariat au projet
  addPartnership = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const partnershipData = addPartnershipSchema.parse(req.body);
      const requesterId = authenticatedReq.user.userId;
      const requesterRole = authenticatedReq.user.role;

      const result = await projectService.addPartnership(id, partnershipData, requesterId, requesterRole);

      res.status(201).json({
        success: true,
        message: result.message,
        data: result, // Or use only result.message if that's all that's returned
      });
    } catch (error) {
      next(error);
    }
  };

  // Lister les partenariats d'un projet
  getProjectPartnerships = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const partnerships = await projectService.getProjectPartnerships(id, userId, userRole);

      res.status(200).json({
        success: true,
        data: partnerships,
        count: partnerships.length
      });
    } catch (error) {
      next(error);
    }
  };

  // Mettre à jour un partenariat
  updatePartnership = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id: projectId } = req.params;
      const updateData = updatePartnershipSchema.parse(req.body);
      const requesterId = authenticatedReq.user.userId;
      const requesterRole = authenticatedReq.user.role;

      const result = await projectService.updatePartnership(projectId, updateData, requesterId, requesterRole);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.partnership
      });
    } catch (error) {
      next(error);
    }
  };

  // Retirer un partenariat du projet
  removePartnership = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id: projectId, partnershipId } = req.params;
      const requesterId = authenticatedReq.user.userId;
      const requesterRole = authenticatedReq.user.role;

      const result = await projectService.removePartnership(projectId, partnershipId, requesterId, requesterRole);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  // Rechercher des partenaires potentiels pour un projet
  searchPotentialPartners = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const { query, expertise, type } = req.query;
      
      const expertiseArray = expertise ? (expertise as string).split(',') : undefined;

      const potentialPartners = await projectService.searchPotentialPartners(
        id, 
        query as string, 
        expertiseArray,
        type as string
      );

      res.status(200).json({
        success: true,
        data: potentialPartners,
        count: potentialPartners.length,
        searchCriteria: {
          query: query || null,
          expertise: expertiseArray || [],
          type: type || null
        }
      });
    } catch (error) {
      next(error);
    }
  };
}