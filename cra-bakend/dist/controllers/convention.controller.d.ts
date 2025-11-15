import { Request, Response, NextFunction } from 'express';
export declare class ConventionController {
    createConvention: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    listConventions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getConventionById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateConvention: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteConvention: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=convention.controller.d.ts.map