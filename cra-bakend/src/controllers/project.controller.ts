// =============================================
// 4. CONTRÔLEUR DE GESTION DES PROJETS
// =============================================

// src/controllers/project.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service';
import { AuthenticatedRequest } from '../types/auth.types';
import {
  createProjectSchema,
  updateProjectSchema,
  projectListQuerySchema,
  addParticipantSchema
} from '../utils/projectValidation';

const projectService = new ProjectService();

export class ProjectController {

  // Créer un projet
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

  // Lister les projets
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

  // Ajouter un participant
  addParticipant = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const { userId, role } = addParticipantSchema.parse(req.body);
      const requesterId = authenticatedReq.user.userId;
      const requesterRole = authenticatedReq.user.role;

      const result = await projectService.addParticipant(id, userId, role, requesterId, requesterRole);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };
  // Retirer un participant
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
}