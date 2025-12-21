// src/controllers/chat.controller.ts
import { Request, Response, NextFunction } from 'express';
import { getChatService } from '../services/chat.service';
import { AuthenticatedRequest } from '../types/auth.types';

const chatService = getChatService();

export class ChatController {

  // =============================================
  // MESSAGES
  // =============================================

  // Envoyer un message
  sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const message = await chatService.sendMessage(req.body, userId, userRole);

      res.status(201).json({
        success: true,
        message: 'Message envoyé avec succès',
        data: message,
      });
    } catch (error) {
      next(error);
    }
  };

  // Lister les messages
  listMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await chatService.listMessages(req.query, userId, userRole);

      res.status(200).json({
        success: true,
        data: result.messages,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // Modifier un message
  updateMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { messageId } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const message = await chatService.updateMessage(messageId, req.body, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Message modifié avec succès',
        data: message,
      });
    } catch (error) {
      next(error);
    }
  };

  // Supprimer un message
  deleteMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { messageId } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      await chatService.deleteMessage(messageId, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Message supprimé avec succès',
      });
    } catch (error) {
      next(error);
    }
  };

  // =============================================
  // RÉACTIONS
  // =============================================

  // Ajouter une réaction
  addReaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { messageId } = req.params;
      const userId = authenticatedReq.user.userId;

      await chatService.addReaction(messageId, req.body, userId);

      res.status(200).json({
        success: true,
        message: 'Réaction ajoutée avec succès',
      });
    } catch (error) {
      next(error);
    }
  };

  // Retirer une réaction
  removeReaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { messageId } = req.params;
      const userId = authenticatedReq.user.userId;

      await chatService.removeReaction(messageId, req.body, userId);

      res.status(200).json({
        success: true,
        message: 'Réaction retirée avec succès',
      });
    } catch (error) {
      next(error);
    }
  };

  // =============================================
  // UPLOAD
  // =============================================

  // Upload de fichier
  uploadFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Aucun fichier fourni',
        });
      }

      // Construire l'URL du fichier
      const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
      const fileUrl = `${baseUrl}/${req.file.path.replace(/\\/g, '/')}`;

      res.status(200).json({
        success: true,
        message: 'Fichier uploadé avec succès',
        data: {
          url: fileUrl,
          filename: req.file.filename,
          size: req.file.size,
          mimeType: req.file.mimetype,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

// Export d'une instance unique
export const chatController = new ChatController();
