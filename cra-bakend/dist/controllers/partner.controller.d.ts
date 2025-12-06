import { Request, Response, NextFunction } from 'express';
export declare class PartnerController {
    createPartner: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    listPartners: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPartnerById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updatePartner: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deletePartner: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    searchByExpertise: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=partner.controller.d.ts.map