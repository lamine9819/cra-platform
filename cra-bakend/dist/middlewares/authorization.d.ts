import { Request, Response, NextFunction } from 'express';
type UserRole = 'CHERCHEUR' | 'COORDONATEUR_PROJET' | 'ADMINISTRATEUR';
export declare const authorize: (allowedRoles: UserRole[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const requireChercheurOrAdmin: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const requireChercheurCoordinateurOrAdmin: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const requireCoordinateurOrAdmin: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export {};
//# sourceMappingURL=authorization.d.ts.map