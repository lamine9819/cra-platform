import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
export declare class EventController {
    createEvent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getEvent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listEvents(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateEvent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteEvent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    addDocumentToEvent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    getEventStatistics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createSeminar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getSeminar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listSeminars(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateSeminar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteSeminar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    addDocumentToSeminar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    generateEventReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
}
declare const _default: EventController;
export default _default;
//# sourceMappingURL=event.controller.d.ts.map