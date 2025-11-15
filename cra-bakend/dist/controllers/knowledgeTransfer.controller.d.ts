import { Request, Response, NextFunction } from 'express';
export declare class KnowledgeTransferController {
    createKnowledgeTransfer: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    listKnowledgeTransfers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getKnowledgeTransferById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateKnowledgeTransfer: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteKnowledgeTransfer: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=knowledgeTransfer.controller.d.ts.map