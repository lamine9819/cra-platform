// src/controllers/user.controller.ts
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { AuthenticatedRequest } from '../types/auth.types';
import {
  createUserSchema,
  updateUserSchema,
  assignSupervisorSchema,
  userListQuerySchema
} from '../utils/userValidation';

const userService = new UserService();

export class UserController {

  // Créer un utilisateur
  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const validatedData = createUserSchema.parse(req.body);
      const creatorRole = authenticatedReq.user.role;

      const user = await userService.createUser(validatedData, creatorRole);

      res.status(201).json({
        success: true,
        message: 'Utilisateur créé avec succès',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };
  // Mettre à jour un utilisateur
  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { userId } = req.params;
      const validatedData = updateUserSchema.parse(req.body);
      const updaterRole = authenticatedReq.user.role;

      const user = await userService.updateUser(userId, validatedData, updaterRole);

      res.status(200).json({
        success: true,
        message: 'Utilisateur mis à jour avec succès',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };
  
  // Supprimer un utilisateur
  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { userId } = req.params;
      const requesterId = authenticatedReq.user.userId;

      await userService.deleteUser(userId, requesterId);

      res.status(204).json({
        success: true,
        message: 'Utilisateur supprimé avec succès',
      });
    } catch (error) {
      next(error);
    }
  };

  // Associer un superviseur
  assignSupervisor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { userId } = req.params;
      const { supervisorId } = assignSupervisorSchema.parse(req.body);
      const requesterId = authenticatedReq.user.userId;

      const user = await userService.assignSupervisor(userId, supervisorId, requesterId);

      res.status(200).json({
        success: true,
        message: 'Superviseur assigné avec succès',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  // Activer un utilisateur
  activateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { userId } = req.params;
      const requesterId = authenticatedReq.user.userId;

      const user = await userService.toggleUserStatus(userId, true, requesterId);

      res.status(200).json({
        success: true,
        message: 'Utilisateur activé avec succès',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  // Désactiver un utilisateur
  deactivateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { userId } = req.params;
      const requesterId = authenticatedReq.user.userId;

      const user = await userService.toggleUserStatus(userId, false, requesterId);

      res.status(200).json({
        success: true,
        message: 'Utilisateur désactivé avec succès',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  // Lister tous les utilisateurs
  listUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const queryParams = userListQuerySchema.parse(req.query);
      const result = await userService.listUsers(queryParams);

      res.status(200).json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // Lister les utilisateurs supervisés
  getSupervisedUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const supervisorId = authenticatedReq.user.userId;
      const supervisedUsers = await userService.getSupervisedUsers(supervisorId);

      res.status(200).json({
        success: true,
        data: supervisedUsers,
      });
    } catch (error) {
      next(error);
    }
  };
  

  // Obtenir un utilisateur par ID
  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const user = await userService.getUserById(userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };
}