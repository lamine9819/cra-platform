import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
export declare class FormationController {
    private formationService;
    private reportService;
    constructor();
    createShortTrainingReceived: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    getUserShortTrainingsReceived: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    updateShortTrainingReceived: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    deleteShortTrainingReceived: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    createDiplomaticTrainingReceived: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    getUserDiplomaticTrainingsReceived: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    updateDiplomaticTrainingReceived: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    deleteDiplomaticTrainingReceived: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    createTrainingGiven: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    getUserTrainingsGiven: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    updateTrainingGiven: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    deleteTrainingGiven: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    createSupervision: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    getUserSupervisions: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    updateSupervision: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    deleteSupervision: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    getAllUsersFormationReport: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    getUserFormationReport: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    downloadFormationReport: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    private generatePDFReport;
}
//# sourceMappingURL=formation.controller.d.ts.map