import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
export declare class PublicationController {
    createPublication(req: AuthenticatedRequest, res: Response): Promise<void>;
    getPublications(req: AuthenticatedRequest, res: Response): Promise<void>;
    getPublicationById(req: AuthenticatedRequest, res: Response): Promise<void>;
    updatePublication(req: AuthenticatedRequest, res: Response): Promise<void>;
    deletePublication(req: AuthenticatedRequest, res: Response): Promise<void>;
    getMyPublications(req: AuthenticatedRequest, res: Response): Promise<void>;
    getPublicationStats(req: AuthenticatedRequest, res: Response): Promise<void>;
    uploadDocument(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    downloadDocument(req: AuthenticatedRequest, res: Response): Promise<void>;
    generateReport(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const publicationController: PublicationController;
//# sourceMappingURL=publication.controller.d.ts.map