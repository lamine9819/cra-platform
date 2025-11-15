import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
/**
 * Middleware pour vérifier que l'utilisateur a le rôle ADMINISTRATEUR
 * Doit être utilisé après le middleware authenticate
 */
export declare const requireAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware pour vérifier que l'utilisateur a le rôle ADMINISTRATEUR ou COORDONATEUR_PROJET
 */
export declare const requireAdminOrCoordinator: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=adminAuth.d.ts.map