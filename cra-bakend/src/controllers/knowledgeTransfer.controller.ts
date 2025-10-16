import { Request, Response, NextFunction } from 'express';
import { KnowledgeTransferService } from '../services/knowledgeTransfer.service';
import { AuthenticatedRequest } from '../types/auth.types';
import {
  createKnowledgeTransferSchema,
  updateKnowledgeTransferSchema,
  knowledgeTransferListQuerySchema
} from '../utils/knowledgeTransferValidation';

const knowledgeTransferService = new KnowledgeTransferService();

export   class KnowledgeTransferController {

  createKnowledgeTransfer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const validatedData = createKnowledgeTransferSchema.parse(req.body);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const transfer = await knowledgeTransferService.createKnowledgeTransfer(
        validatedData,
        userId,
        userRole
      );

      res.status(201).json({
        success: true,
        message: 'Transfert d\'acquis créé avec succès',
        data: transfer,
      });
    } catch (error) {
      next(error);
    }
  };

  listKnowledgeTransfers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const queryParams = knowledgeTransferListQuerySchema.parse(req.query);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await knowledgeTransferService.listKnowledgeTransfers(
        userId,
        userRole,
        queryParams
      );

      res.status(200).json({
        success: true,
        data: result.transfers,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getKnowledgeTransferById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const transfer = await knowledgeTransferService.getKnowledgeTransferById(
        id,
        userId,
        userRole
      );

      res.status(200).json({
        success: true,
        data: transfer,
      });
    } catch (error) {
      next(error);
    }
  };

  updateKnowledgeTransfer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const validatedData = updateKnowledgeTransferSchema.parse(req.body);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const transfer = await knowledgeTransferService.updateKnowledgeTransfer(
        id,
        validatedData,
        userId,
        userRole
      );

      res.status(200).json({
        success: true,
        message: 'Transfert d\'acquis mis à jour avec succès',
        data: transfer,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteKnowledgeTransfer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      await knowledgeTransferService.deleteKnowledgeTransfer(id, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Transfert d\'acquis supprimé avec succès',
      });
    } catch (error) {
      next(error);
    }
  };
}