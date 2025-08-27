// =============================================
// 11. MIDDLEWARE DE GESTION D'ERREURS
// =============================================

// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { AuthError, ValidationError } from '../utils/errors';
import { ZodError } from 'zod';

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error:', error);

  // Erreur de validation Zod
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
  }

  // Erreurs d'authentification
  if (error instanceof AuthError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  // Erreurs de validation
  if (error instanceof ValidationError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  // Erreur par défaut
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
  });
};
