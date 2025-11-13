// src/controllers/auth.controller.ts - Version mise à jour avec changement de mot de passe
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema, changePasswordSchema } from '../utils/validation';
import { AuthenticatedRequest } from '../types/auth.types';

const authService = new AuthService();

export class AuthController {
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validation des données
      const validatedData = registerSchema.parse(req.body);

      // Enregistrement de l'utilisateur
      const result = await authService.register(validatedData);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validation des données
      const validatedData = loginSchema.parse(req.body);

      // Connexion de l'utilisateur
      const result = await authService.login(validatedData);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Cast vers AuthenticatedRequest après que le middleware authenticate ait ajouté user
      const authenticatedReq = req as AuthenticatedRequest;
      const userProfile = await authService.getUserProfile(authenticatedReq.user.userId);

      res.status(200).json({
        success: true,
        data: userProfile,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Changement de mot de passe de l'utilisateur
   */
  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Cast vers AuthenticatedRequest
      const authenticatedReq = req as AuthenticatedRequest;
      
      // Validation des données
      const validatedData = changePasswordSchema.parse(req.body);

      // Changement du mot de passe
      const result = await authService.changePassword(
        authenticatedReq.user.userId, 
        validatedData
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Déconnexion de l'utilisateur
   * Note: Côté client, il faut supprimer le token du localStorage/sessionStorage
   */
  logout = async (_req: Request, res: Response) => {
    // Côté client, supprimer le token du localStorage/sessionStorage
    res.status(200).json({
      success: true,
      message: 'Déconnexion réussie',
    });
  };
}