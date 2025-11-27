// src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';
import { AuthError } from '../utils/errors';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types/auth.types';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Lire le token depuis le cookie HttpOnly
    const token = req.cookies?.auth_token;

    if (!token) {
      throw new AuthError('Token d\'authentification manquant');
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
// Authentification optionnelle (pour les routes publiques avec amélioration si connecté)
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.auth_token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      (req as AuthenticatedRequest).user = decoded;
    } catch (error) {
      // Ignorer les erreurs d'authentification pour l'auth optionnelle
    }
  }

  next();
};

// Authentification flexible : accepte le token dans le cookie OU en query parameter
// Utile pour les routes comme preview/download qui peuvent être ouvertes dans un nouvel onglet
export const flexibleAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Essayer d'abord le cookie
    let token = req.cookies?.auth_token;

    // Si pas de cookie, essayer le query parameter
    if (!token) {
      token = req.query.token as string;
    }

    if (!token) {
      throw new AuthError('Token d\'authentification manquant');
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