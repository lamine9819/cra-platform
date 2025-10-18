// src/middlewares/adminAuth.ts

import { Response, NextFunction } from 'express';
import { AuthorizationError } from '../utils/errors';
import { AuthenticatedRequest } from '../types/auth.types';

/**
 * Middleware pour vérifier que l'utilisateur a le rôle ADMINISTRATEUR
 * Doit être utilisé après le middleware authenticate
 */
export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Vérifier que req.user existe (devrait être défini par le middleware authenticate)
    if (!req.user) {
      throw new AuthorizationError('Authentification requise');
    }

    // Vérifier que l'utilisateur a le rôle ADMINISTRATEUR
    if (req.user.role !== 'ADMINISTRATEUR') {
      throw new AuthorizationError('Accès refusé. Privilèges administrateur requis.');
    }

    // L'utilisateur est un administrateur, continuer
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware pour vérifier que l'utilisateur a le rôle ADMINISTRATEUR ou COORDONATEUR_PROJET
 */
export const requireAdminOrCoordinator = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AuthorizationError('Authentification requise');
    }

    if (req.user.role !== 'ADMINISTRATEUR' && req.user.role !== 'COORDONATEUR_PROJET') {
      throw new AuthorizationError('Accès refusé. Privilèges administrateur ou coordinateur requis.');
    }

    next();
  } catch (error) {
    next(error);
  }
};
