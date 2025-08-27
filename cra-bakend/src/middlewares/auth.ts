// src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';
import { AuthError } from '../utils/errors';
import { AuthenticatedRequest } from '../types/auth.types';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Accès sécurisé au header authorization
    const authHeader = req.get('authorization') || req.get('Authorization');
    
    if (!authHeader) {
      throw new AuthError('Token d\'authentification manquant');
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new AuthError('Format de token invalide');
    }

    // Vérifier et décoder le token
    const decoded = verifyToken(token);

    // Ajouter les informations utilisateur à la requête
    (req as AuthenticatedRequest).user = decoded;

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré',
      });
    }

    next(error);
  }
};