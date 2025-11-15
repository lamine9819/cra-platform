import { Request, Response, NextFunction } from 'express';
export declare class ProjectController {
    createProject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    listProjects: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getProjectById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateProject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteProject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    addParticipant: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateParticipant: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    removeParticipant: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    addFunding: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateFunding: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    removeFunding: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getProjectStatistics: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    generateProjectReport: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    duplicateProject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    archiveProject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    restoreProject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getProjectsByTheme: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getProjectsByProgram: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getProjectsByConvention: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    advancedSearch: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    addPartnership: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getProjectPartnerships: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updatePartnership: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    removePartnership: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    searchPotentialPartners: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=project.controller.d.ts.map