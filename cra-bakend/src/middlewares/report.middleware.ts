// src/middlewares/report.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    email: string;
  };
}

/**
 * Vérifie que l'utilisateur est coordinateur de projet ou administrateur
 */
export const checkReportAccess = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
      return;
    }

    const allowedRoles: UserRole[] = [
      UserRole.COORDONATEUR_PROJET,
      UserRole.ADMINISTRATEUR
    ];

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Accès non autorisé. Seuls les coordinateurs de projet et les administrateurs peuvent générer des rapports.'
      });
      return;
    }

    next();
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification des permissions',
      error: error.message
    });
  }
};