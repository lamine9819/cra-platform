import { Request, Response, NextFunction } from 'express';
export declare class FormController {
    createForm: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    listForms: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getFormById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateForm: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteForm: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    shareFormWithUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createPublicShareLink: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getFormByPublicLink: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getFormShares: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    removeFormShare: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    submitFormResponse: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    submitPublicFormResponse: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getFormResponses: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    uploadFieldPhoto: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    uploadMultiplePhotos: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    getResponsePhotos: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    storeOfflineData: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    syncOfflineData: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getOfflineSyncStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    exportResponses: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    addComment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getFormComments: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getCollectorDashboard: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    previewForm: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    private checkIfFormIsShared;
    private checkResponseAccess;
    private formatResponsesForExport;
    private generatePreviewData;
}
declare const formController: FormController;
export default formController;
//# sourceMappingURL=form.controller.d.ts.map