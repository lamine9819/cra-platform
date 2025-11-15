import { Request, Response, NextFunction } from 'express';
export declare class DashboardController {
    getDashboard: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getQuickStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPerformanceMetrics: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getFormStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getDataCollectionStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    private getQuickFormStats;
    private getFormPerformanceMetrics;
    private getResponsesTrendForUser;
}
//# sourceMappingURL=dashboard.controller.d.ts.map