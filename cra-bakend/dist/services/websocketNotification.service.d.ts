import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
export declare class WebSocketNotificationService {
    private io;
    private connectedUsers;
    constructor(server: HTTPServer);
    private setupMiddleware;
    private setupEventHandlers;
    private addUserConnection;
    private removeUserConnection;
    private joinUserRooms;
    private getUnreadCount;
    sendNotificationToUser(userId: string, notification: any): Promise<void>;
    sendNotificationToProject(projectId: string, notification: any, excludeUserId?: string): Promise<void>;
    /**
     * Diffuser un message générique à tous les utilisateurs connectés
     * @param eventName - Nom de l'événement
     * @param data - Données à envoyer
     */
    broadcast(eventName: string, data: any): void;
    broadcastSystemNotification(notification: any): Promise<void>;
    broadcastUserStatus(userId: string, status: 'online' | 'offline'): Promise<void>;
    sendTypingIndicator(roomType: string, roomId: string, userId: string, isTyping: boolean): Promise<void>;
    getConnectedUsers(): string[];
    isUserOnline(userId: string): boolean;
    getTotalConnections(): number;
    getConnectionStats(): {
        totalUsers: number;
        totalConnections: number;
        connectedUsers: string[];
    };
    getIO(): SocketIOServer;
}
export declare const initializeWebSocketService: (server: HTTPServer) => WebSocketNotificationService;
export declare const getWebSocketService: () => WebSocketNotificationService | null;
//# sourceMappingURL=websocketNotification.service.d.ts.map