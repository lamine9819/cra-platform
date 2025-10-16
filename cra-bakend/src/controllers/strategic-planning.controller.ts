// src/controllers/strategic-planning.controller.ts - VERSION CORRIGÉE
import { Request, Response, NextFunction } from 'express';
import { StrategicPlanningService } from '../services/strategic-planning.service';
import { AuthenticatedRequest } from '../types/auth.types';
import {
  createStrategicPlanSchema,
  updateStrategicPlanSchema,
  createStrategicAxisSchema,
  updateStrategicAxisSchema,
  createStrategicSubAxisSchema,
  updateStrategicSubAxisSchema,
  createResearchProgramSchema,
  updateResearchProgramSchema,
  createResearchThemeSchema,
  updateResearchThemeSchema,
  createResearchStationSchema,
  updateResearchStationSchema,
  strategicPlanQuerySchema,
  strategicAxisQuerySchema,
  researchProgramQuerySchema,
  researchThemeQuerySchema
} from '../utils/strategic-planning.validation';

const strategicPlanningService = new StrategicPlanningService();

export class StrategicPlanningController {

  // ========================================
  // CONTRÔLEURS POUR LES PLANS STRATÉGIQUES
  // ========================================

  createStrategicPlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const validatedData = createStrategicPlanSchema.parse(req.body);
      
      const result = await strategicPlanningService.createStrategicPlan(
        validatedData, 
        authenticatedReq.user.userId
      );

      res.status(201).json({
        success: true,
        data: result,
        message: 'Plan stratégique créé avec succès'
      });
    } catch (error) {
      next(error);
    }
  };

  getStrategicPlans = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery = strategicPlanQuerySchema.parse(req.query);
      const result = await strategicPlanningService.getStrategicPlans(validatedQuery);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  getStrategicPlanById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await strategicPlanningService.getStrategicPlanById(id);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  updateStrategicPlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const validatedData = updateStrategicPlanSchema.parse(req.body);

      const result = await strategicPlanningService.updateStrategicPlan(
        id,
        validatedData,
        authenticatedReq.user.userId
      );

      res.status(200).json({
        success: true,
        data: result,
        message: 'Plan stratégique modifié avec succès'
      });
    } catch (error) {
      next(error);
    }
  };

  deleteStrategicPlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;

      const result = await strategicPlanningService.deleteStrategicPlan(
        id,
        authenticatedReq.user.userId
      );

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  };

  // ========================================
  // CONTRÔLEURS POUR LES AXES STRATÉGIQUES
  // ========================================

  createStrategicAxis = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const validatedData = createStrategicAxisSchema.parse(req.body);

      const result = await strategicPlanningService.createStrategicAxis(
        validatedData,
        authenticatedReq.user.userId
      );

      res.status(201).json({
        success: true,
        data: result,
        message: 'Axe stratégique créé avec succès'
      });
    } catch (error) {
      next(error);
    }
  };

  getStrategicAxes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery = strategicAxisQuerySchema.parse(req.query);
      const result = await strategicPlanningService.getStrategicAxes(validatedQuery);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  getStrategicAxisById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await strategicPlanningService.getStrategicAxisById(id);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  updateStrategicAxis = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const validatedData = updateStrategicAxisSchema.parse(req.body);

      const result = await strategicPlanningService.updateStrategicAxis(
        id,
        validatedData,
        authenticatedReq.user.userId
      );

      res.status(200).json({
        success: true,
        data: result,
        message: 'Axe stratégique modifié avec succès'
      });
    } catch (error) {
      next(error);
    }
  };

  deleteStrategicAxis = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;

      const result = await strategicPlanningService.deleteStrategicAxis(
        id,
        authenticatedReq.user.userId
      );

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  };

  // ========================================
  // CONTRÔLEURS POUR LES SOUS-AXES STRATÉGIQUES
  // ========================================

  createStrategicSubAxis = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const validatedData = createStrategicSubAxisSchema.parse(req.body);

      const result = await strategicPlanningService.createStrategicSubAxis(
        validatedData,
        authenticatedReq.user.userId
      );

      res.status(201).json({
        success: true,
        data: result,
        message: 'Sous-axe stratégique créé avec succès'
      });
    } catch (error) {
      next(error);
    }
  };

  getStrategicSubAxes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { strategicAxisId, ...queryParams } = req.query;
      const result = await strategicPlanningService.getStrategicSubAxes({
        ...queryParams,
        strategicAxisId: strategicAxisId as string
      });

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  // ========================================
  // CONTRÔLEURS POUR LES PROGRAMMES DE RECHERCHE
  // ========================================

  createResearchProgram = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const validatedData = createResearchProgramSchema.parse(req.body);

      const result = await strategicPlanningService.createResearchProgram(
        validatedData,
        authenticatedReq.user.userId
      );

      res.status(201).json({
        success: true,
        data: result,
        message: 'Programme de recherche créé avec succès'
      });
    } catch (error) {
      next(error);
    }
  };

  getResearchPrograms = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery = researchProgramQuerySchema.parse(req.query);
      const result = await strategicPlanningService.getResearchPrograms(validatedQuery);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  // ========================================
  // CONTRÔLEURS POUR LES THÈMES DE RECHERCHE
  // ========================================

  createResearchTheme = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const validatedData = createResearchThemeSchema.parse(req.body);

      const result = await strategicPlanningService.createResearchTheme(
        validatedData,
        authenticatedReq.user.userId
      );

      res.status(201).json({
        success: true,
        data: result,
        message: 'Thème de recherche créé avec succès'
      });
    } catch (error) {
      next(error);
    }
  };

  getResearchThemes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery = researchThemeQuerySchema.parse(req.query);
      const result = await strategicPlanningService.getResearchThemes(validatedQuery);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  updateResearchTheme = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const validatedData = updateResearchThemeSchema.parse(req.body);

      const result = await strategicPlanningService.updateResearchTheme(
        id,
        validatedData,
        authenticatedReq.user.userId
      );

      res.status(200).json({
        success: true,
        data: result,
        message: 'Thème de recherche modifié avec succès'
      });
    } catch (error) {
      next(error);
    }
  };

  deleteResearchTheme = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;

      const result = await strategicPlanningService.deleteResearchTheme(
        id,
        authenticatedReq.user.userId
      );

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  };

  // ========================================
  // CONTRÔLEURS POUR LES STATIONS DE RECHERCHE
  // ========================================

  createResearchStation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const validatedData = createResearchStationSchema.parse(req.body);

      const result = await strategicPlanningService.createResearchStation(
        validatedData,
        authenticatedReq.user.userId
      );

      res.status(201).json({
        success: true,
        data: result,
        message: 'Station de recherche créée avec succès'
      });
    } catch (error) {
      next(error);
    }
  };

  getResearchStations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, search, isActive, sortBy, sortOrder } = req.query;
      
      const result = await strategicPlanningService.getResearchStations({
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        search: search as string,
        isActive: isActive ? isActive === 'true' : undefined,
        sortBy: sortBy as string || 'name',
        sortOrder: sortOrder as 'asc' | 'desc' || 'asc'
      });

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  updateResearchStation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const validatedData = updateResearchStationSchema.parse(req.body);

      const result = await strategicPlanningService.updateResearchStation(
        id,
        validatedData,
        authenticatedReq.user.userId
      );

      res.status(200).json({
        success: true,
        data: result,
        message: 'Station de recherche modifiée avec succès'
      });
    } catch (error) {
      next(error);
    }
  };

  deleteResearchStation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;

      const result = await strategicPlanningService.deleteResearchStation(
        id,
        authenticatedReq.user.userId
      );

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  };

  // ========================================
  // CONTRÔLEURS UTILITAIRES
  // ========================================

  getStrategicHierarchy = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await strategicPlanningService.getStrategicHierarchy();

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  getStrategicPlanningStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await strategicPlanningService.getStrategicPlanningStats();

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  // Méthode pour obtenir les utilisateurs éligibles comme coordinateurs
  getEligibleCoordinators = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await strategicPlanningService.getEligibleCoordinators();

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };
}