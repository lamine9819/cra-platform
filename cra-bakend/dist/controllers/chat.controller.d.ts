import { Request, Response, NextFunction } from 'express';
export declare class ChatController {
    createChannel: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    listChannels: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getChannelById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateChannel: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteChannel: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    addMembers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    removeMember: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateMemberRole: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    listMembers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    leaveChannel: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    markAsRead: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    sendMessage: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    listMessages: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateMessage: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteMessage: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    addReaction: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    removeReaction: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    uploadFile: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
    getStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getUnreadMessages: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=chat.controller.d.ts.map