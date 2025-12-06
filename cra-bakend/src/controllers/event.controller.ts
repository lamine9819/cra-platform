import { Request, Response, NextFunction } from 'express';
import eventService from '../services/event.service';
import reportService from '../services/reportEvent.service';
import { DocumentType, UserRole } from '@prisma/client';
import * as fs from 'fs';

import { AuthenticatedRequest } from '../types/auth.types';

export class EventController {
  // ==================== ÉVÉNEMENTS ====================

  async createEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.userId;
      const eventData = req.body;

      const event = await eventService.createEvent(userId, eventData);

      res.status(201).json({
        success: true,
        message: 'Événement créé avec succès',
        data: event
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const userRole = req.user.role as UserRole;

      const event = await eventService.getEventById(id, userId, userRole);

      res.status(200).json({
        success: true,
        data: event
      });
    } catch (error: any) {
      next(error);
    }
  }

  async listEvents(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.userId;
      const userRole = req.user.role as UserRole;
      const filters = req.query;

      const events = await eventService.listEvents(userId, userRole, filters);

      res.status(200).json({
        success: true,
        count: events.length,
        data: events
      });
    } catch (error: any) {
      next(error);
    }
  }

  async updateEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const userRole = req.user.role as UserRole;
      const updateData = req.body;

      const event = await eventService.updateEvent(id, userId, userRole, updateData);

      res.status(200).json({
        success: true,
        message: 'Événement mis à jour avec succès',
        data: event
      });
    } catch (error: any) {
      next(error);
    }
  }

  async deleteEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const userRole = req.user.role as UserRole;

      const result = await eventService.deleteEvent(id, userId, userRole);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error: any) {
      next(error);
    }
  }

  async addDocumentToEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Aucun fichier fourni'
        });
      }

      const documentData = {
        title: req.body.title || req.file.originalname,
        filename: req.file.filename,
        filepath: req.file.path,
        mimeType: req.file.mimetype,
        size: BigInt(req.file.size),
        type: req.body.type || DocumentType.AUTRE,
        description: req.body.description
      };

      const document = await eventService.addDocumentToEvent(id, userId, documentData);

      res.status(201).json({
        success: true,
        message: 'Document ajouté avec succès',
        data: document
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getEventStatistics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.userId;
      const userRole = req.user.role as UserRole;

      const stats = await eventService.getEventStatistics(userId, userRole);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      next(error);
    }
  }

  // ==================== SÉMINAIRES ====================
  
  async createSeminar(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.userId;
      const seminarData = req.body;

      const seminar = await eventService.createSeminar(userId, seminarData);

      res.status(201).json({
        success: true,
        message: 'Séminaire créé avec succès',
        data: seminar
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getSeminar(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const userRole = req.user.role as UserRole;

      const seminar = await eventService.getSeminarById(id, userId, userRole);

      res.status(200).json({
        success: true,
        data: seminar
      });
    } catch (error: any) {
      next(error);
    }
  }

  async listSeminars(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.userId;
      const userRole = req.user.role as UserRole;
      const filters = req.query;

      const seminars = await eventService.listSeminars(userId, userRole, filters);

      res.status(200).json({
        success: true,
        count: seminars.length,
        data: seminars
      });
    } catch (error: any) {
      next(error);
    }
  }

  async updateSeminar(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const updateData = req.body;

      const seminar = await eventService.updateSeminar(id, userId, updateData);

      res.status(200).json({
        success: true,
        message: 'Séminaire mis à jour avec succès',
        data: seminar
      });
    } catch (error: any) {
      next(error);
    }
  }

  async deleteSeminar(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const result = await eventService.deleteSeminar(id, userId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error: any) {
      next(error);
    }
  }

  async addDocumentToSeminar(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Aucun fichier fourni'
        });
      }

      const documentData = {
        title: req.body.title || req.file.originalname,
        filename: req.file.filename,
        filepath: req.file.path,
        mimeType: req.file.mimetype,
        size: BigInt(req.file.size),
        type: req.body.type || DocumentType.AUTRE,
        description: req.body.description
      };

      const document = await eventService.addDocumentToSeminar(id, userId, documentData);

      res.status(201).json({
        success: true,
        message: 'Document ajouté avec succès',
        data: document
      });
    } catch (error: any) {
      next(error);
    }
  }

  // =================== RAPPORTS ===================
  
  async generateEventReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.userId;
      const userRole = req.user.role as UserRole;

      // Map and validate query parameters to EventReportDto
      const filters = {
        format: req.query.format as 'pdf' | 'docx',
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        type: req.query.type as any, // Cast as needed to EventType
        creatorId: req.query.creatorId as string | undefined
      };

      if (!filters.format || (filters.format !== 'pdf' && filters.format !== 'docx')) {
        return res.status(400).json({
          success: false,
          message: "Le paramètre 'format' est requis et doit être 'pdf' ou 'docx'."
        });
      }

      const result = await reportService.generateEventReport(userId, userRole, filters);

      res.download(result.filepath, result.filename, (err) => {
        if (err) {
          next(err);
        }
        
        // Supprimer le fichier après téléchargement
        fs.unlink(result.filepath, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Erreur lors de la suppression du fichier:', unlinkErr);
          }
        });
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export default new EventController();