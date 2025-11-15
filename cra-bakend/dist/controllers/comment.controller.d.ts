import { Request, Response, NextFunction } from 'express';
export declare class CommentController {
    createComment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    listComments: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getCommentById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateComment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteComment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getCommentStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getProjectComments: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getActivityComments: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getTaskComments: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=comment.controller.d.ts.map