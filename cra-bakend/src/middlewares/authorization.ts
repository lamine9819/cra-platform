// src/middlewares/authorization.ts
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';

type UserRole = 'CHERCHEUR' | 'COORDONATEUR_PROJET' | 'ADMINISTRATEUR';

export const authorize = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Cast vers AuthenticatedRequest après que le middleware authenticate ait ajouté user
      const authenticatedReq = req as AuthenticatedRequest;
      const userRole = authenticatedReq.user.role as UserRole;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé. Permissions insuffisantes',
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware pour vérifier si l'utilisateur est admin
export const requireAdmin = authorize(['ADMINISTRATEUR']);

// Middleware pour vérifier si l'utilisateur est chercheur ou admin
export const requireChercheurOrAdmin = authorize(['CHERCHEUR', 'ADMINISTRATEUR']);