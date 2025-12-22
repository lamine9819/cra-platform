import { Request, Response, NextFunction } from 'express';
export declare class ChatController {
    sendMessage: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    listMessages: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateMessage: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteMessage: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    addReaction: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    removeReaction: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    uploadFile: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
}
export declare const chatController: ChatController;
//# sourceMappingURL=chat.controller.d.ts.map