import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
export declare class ChatWebSocketService {
    private io;
    initialize(server: HTTPServer | SocketIOServer): void;
    private setupChatEventHandlers;
    emitNewMessage(message: any): void;
    emitMessageUpdated(message: any): void;
    emitMessageDeleted(messageId: string): void;
    emitReactionAdded(messageId: string, reaction: any): void;
    emitReactionRemoved(messageId: string, reaction: any): void;
}
export declare const initializeChatWebSocketService: (server: HTTPServer | SocketIOServer) => ChatWebSocketService;
export declare const getChatWebSocketService: () => ChatWebSocketService;
//# sourceMappingURL=chatWebSocket.service.d.ts.map