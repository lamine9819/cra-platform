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
export declare const checkReportAccess: (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=report.middleware.d.ts.map