import { Request, Response, NextFunction } from 'express';
export declare class AuthController {
    register: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Changement de mot de passe de l'utilisateur
     */
    changePassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Déconnexion de l'utilisateur
     * Note: Côté client, il faut supprimer le token du localStorage/sessionStorage
     */
    logout: (_req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=auth.controller.d.ts.map