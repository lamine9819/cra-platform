import { Request, Response, NextFunction } from 'express';
import { ConventionService } from '../services/convention.service';
import { AuthenticatedRequest } from '../types/auth.types';
import {
  createConventionSchema,
  updateConventionSchema,
  conventionListQuerySchema
} from '../utils/conventionValidation';

const conventionService = new ConventionService();

export class ConventionController {

  createConvention = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const validatedData = createConventionSchema.parse(req.body);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const convention = await conventionService.createConvention(validatedData, userId, userRole);

      res.status(201).json({
        success: true,
        message: 'Convention créée avec succès',
        data: convention,
      });
    } catch (error) {
      next(error);
    }
  };

  listConventions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const queryParams = conventionListQuerySchema.parse(req.query);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await conventionService.listConventions(userId, userRole, queryParams);

      res.status(200).json({
        success: true,
        data: result.conventions,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getConventionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const convention = await conventionService.getConventionById(id, userId, userRole);

      res.status(200).json({
        success: true,
        data: convention,
      });
    } catch (error) {
      next(error);
    }
  };

  updateConvention = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const validatedData = updateConventionSchema.parse(req.body);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const convention = await conventionService.updateConvention(id, validatedData, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Convention mise à jour avec succès',
        data: convention,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteConvention = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      await conventionService.deleteConvention(id, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Convention supprimée avec succès',
      });
    } catch (error) {
      next(error);
    }
  };
}