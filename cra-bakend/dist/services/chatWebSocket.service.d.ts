import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
export declare class ChatWebSocketService {
    private io;
    private typingUsers;
    initialize(server: HTTPServer | SocketIOServer): void;
    private setupChatEventHandlers;
    emitNewMessage(channelId: string, message: any): void;
    emitMessageUpdated(channelId: string, message: any): void;
    emitMessageDeleted(channelId: string, messageId: string): void;
    emitReactionAdded(channelId: string, messageId: string, reaction: any): void;
    emitReactionRemoved(channelId: string, messageId: string, reaction: any): void;
    emitChannelUpdated(channelId: string, channel: any): void;
    notifyUser(userId: string, notification: any): void;
    private startTyping;
    private stopTyping;
    private cleanupUserTyping;
    getTypingUsers(channelId: string): string[];
}
export declare const initializeChatWebSocketService: (server: HTTPServer | SocketIOServer) => ChatWebSocketService;
export declare const getChatWebSocketService: () => ChatWebSocketService;
//# sourceMappingURL=chatWebSocket.service.d.ts.map