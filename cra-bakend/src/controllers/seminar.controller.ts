// src/controllers/seminar.controller.ts
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { SeminarService } from '../services/seminar.service';
import { AuthenticatedRequest } from '../types/auth.types';
import {
  createSeminarSchema,
  updateSeminarSchema,
  seminarListQuerySchema,
  seminarRegistrationSchema
} from '../utils/seminarValidation';

const prisma = new PrismaClient();
const seminarService = new SeminarService();

export class SeminarController {

  // Créer un séminaire
  createSeminar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const validatedData = createSeminarSchema.parse(req.body);
      const organizerId = authenticatedReq.user.userId;
      const organizerRole = authenticatedReq.user.role;

      const seminar = await seminarService.createSeminar(validatedData, organizerId, organizerRole);

      res.status(201).json({
        success: true,
        message: 'Séminaire créé avec succès',
        data: seminar,
      });
    } catch (error) {
      next(error);
    }
  };

  // Lister les séminaires
  listSeminars = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const queryParams = seminarListQuerySchema.parse(req.query);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await seminarService.listSeminars(userId, userRole, queryParams);

      res.status(200).json({
        success: true,
        data: result.seminars,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtenir un séminaire par ID
  getSeminarById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const seminar = await seminarService.getSeminarById(id, userId, userRole);

      res.status(200).json({
        success: true,
        data: seminar,
      });
    } catch (error) {
      next(error);
    }
  };

  // Mettre à jour un séminaire
  updateSeminar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const validatedData = updateSeminarSchema.parse(req.body);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const seminar = await seminarService.updateSeminar(id, validatedData, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Séminaire mis à jour avec succès',
        data: seminar,
      });
    } catch (error) {
      next(error);
    }
  };

  // S'inscrire à un séminaire
  registerToSeminar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const { userId: targetUserId } = seminarRegistrationSchema.parse(req.body);
      const requesterId = authenticatedReq.user.userId;
      const requesterRole = authenticatedReq.user.role;

      // Si aucun userId spécifié, l'utilisateur s'inscrit lui-même
      const userToRegister = targetUserId || requesterId;

      const result = await seminarService.registerToSeminar(id, userToRegister, requesterId, requesterRole);

      res.status(201).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  // Se désinscrire d'un séminaire
  unregisterFromSeminar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const { userId: targetUserId } = req.query;
      const requesterId = authenticatedReq.user.userId;
      const requesterRole = authenticatedReq.user.role;

      // Si aucun userId spécifié, l'utilisateur se désinscrit lui-même
      const userToUnregister = (targetUserId as string) || requesterId;

      const result = await seminarService.unregisterFromSeminar(id, userToUnregister, requesterId, requesterRole);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  // Marquer la présence d'un participant
  markAttendance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id, participantId } = req.params;
      const requesterId = authenticatedReq.user.userId;
      const requesterRole = authenticatedReq.user.role;

      const result = await seminarService.markAttendance(id, participantId, requesterId, requesterRole);

      res.status(200).json({
        success: true,
        message: result.message,
        data: { attendedAt: result.attendedAt },
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtenir les statistiques des séminaires
  getSeminarStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const stats = await seminarService.getSeminarStats(userId, userRole);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  // Supprimer un séminaire
  deleteSeminar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      await seminarService.deleteSeminar(id, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Séminaire supprimé avec succès',
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtenir les séminaires passés
  getPastSeminars = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const queryParams = seminarListQuerySchema.parse({
        ...req.query,
        timeFilter: 'past'
      });
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await seminarService.listSeminars(userId, userRole, queryParams);

      res.status(200).json({
        success: true,
        data: result.seminars,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtenir les séminaires à venir
  getUpcomingSeminars = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const queryParams = seminarListQuerySchema.parse({
        ...req.query,
        timeFilter: 'upcoming'
      });
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await seminarService.listSeminars(userId, userRole, queryParams);

      res.status(200).json({
        success: true,
        data: result.seminars,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtenir les séminaires en cours
  getCurrentSeminars = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const queryParams = seminarListQuerySchema.parse({
        ...req.query,
        timeFilter: 'current'
      });
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await seminarService.listSeminars(userId, userRole, queryParams);

      res.status(200).json({
        success: true,
        data: result.seminars,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtenir mes inscriptions
  getMyRegistrations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;
      
      const registrations = await prisma.seminarParticipant.findMany({
        where: { participantId: userId },
        include: {
          seminar: {
            include: {
              organizer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                }
              },
              _count: {
                select: {
                  participants: true,
                }
              }
            }
          }
        },
        orderBy: { registeredAt: 'desc' }
      });

      res.status(200).json({
        success: true,
        data: registrations.map((reg: any) => ({
          id: reg.id,
          registeredAt: reg.registeredAt,
          attendedAt: reg.attendedAt,
          seminar: {
            id: reg.seminar.id,
            title: reg.seminar.title,
            description: reg.seminar.description,
            location: reg.seminar.location,
            startDate: reg.seminar.startDate,
            endDate: reg.seminar.endDate,
            status: reg.seminar.status,
            organizer: reg.seminar.organizer,
            _count: reg.seminar._count,
          }
        }))
      });
    } catch (error) {
      next(error);
    }
  };
}