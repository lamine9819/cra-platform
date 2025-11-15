import { Request, Response, NextFunction } from 'express';
interface AuthRequest extends Request {
    user?: {
        id: string;
        role: any;
    };
}
export declare class EventController {
    createEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    listEvents(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    deleteEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    addDocumentToEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getEventStatistics(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    createSeminar(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getSeminar(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    listSeminars(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateSeminar(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    deleteSeminar(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    addDocumentToSeminar(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    generateEventReport(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
}
declare const _default: EventController;
export default _default;
//# sourceMappingURL=event.controller.d.ts.map