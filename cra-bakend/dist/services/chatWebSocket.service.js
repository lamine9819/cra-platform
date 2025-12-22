"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatWebSocketService = exports.initializeChatWebSocketService = exports.ChatWebSocketService = void 0;
// src/services/chatWebSocket.service.ts
const socket_io_1 = require("socket.io");
class ChatWebSocketService {
    constructor() {
        this.io = null;
    }
    initialize(server) {
        if (server instanceof socket_io_1.Server) {
            this.io = server;
        }
        else {
            throw new Error('ChatWebSocketService doit être initialisé avec un serveur Socket.IO existant');
        }
        this.setupChatEventHandlers();
        console.log('💬 Service WebSocket Chat initialisé');
    }
    setupChatEventHandlers() {
        if (!this.io)
            return;
        this.io.on('connection', (socket) => {
            const userId = socket.userId || socket.data?.userId;
            if (!userId) {
                console.warn('⚠️ Socket connecté sans userId pour le chat');
                return;
            }
            console.log(`💬 Utilisateur ${userId} prêt pour le chat`);
            // Pas besoin d'event handlers côté serveur pour le moment
            // Tous les events sont déclenchés côté serveur via les méthodes emit ci-dessous
        });
    }
    // Émettre un nouveau message (broadcast global)
    emitNewMessage(message) {
        if (!this.io)
            return;
        const wsMessage = {
            type: 'new_message',
            data: message,
            timestamp: new Date()
        };
        this.io.emit('chat:new_message', wsMessage);
    }
    // Émettre une mise à jour de message (broadcast global)
    emitMessageUpdated(message) {
        if (!this.io)
            return;
        const wsMessage = {
            type: 'message_updated',
            data: message,
            timestamp: new Date()
        };
        this.io.emit('chat:message_updated', wsMessage);
    }
    // Émettre une suppression de message (broadcast global)
    emitMessageDeleted(messageId) {
        if (!this.io)
            return;
        const wsMessage = {
            type: 'message_deleted',
            data: { messageId },
            timestamp: new Date()
        };
        this.io.emit('chat:message_deleted', wsMessage);
    }
    // Émettre l'ajout d'une réaction (broadcast global)
    emitReactionAdded(messageId, reaction) {
        if (!this.io)
            return;
        const wsMessage = {
            type: 'reaction_added',
            data: { messageId, reaction },
            timestamp: new Date()
        };
        this.io.emit('chat:reaction_added', wsMessage);
    }
    // Émettre la suppression d'une réaction (broadcast global)
    emitReactionRemoved(messageId, reaction) {
        if (!this.io)
            return;
        const wsMessage = {
            type: 'reaction_removed',
            data: { messageId, reaction },
            timestamp: new Date()
        };
        this.io.emit('chat:reaction_removed', wsMessage);
    }
}
exports.ChatWebSocketService = ChatWebSocketService;
// Instance singleton
let chatWebSocketService = null;
const initializeChatWebSocketService = (server) => {
    if (!chatWebSocketService) {
        chatWebSocketService = new ChatWebSocketService();
        chatWebSocketService.initialize(server);
    }
    return chatWebSocketService;
};
exports.initializeChatWebSocketService = initializeChatWebSocketService;
const getChatWebSocketService = () => {
    if (!chatWebSocketService) {
        throw new Error('ChatWebSocketService n\'a pas été initialisé. Appelez initializeChatWebSocketService() d\'abord.');
    }
    return chatWebSocketService;
};
exports.getChatWebSocketService = getChatWebSocketService;
//# sourceMappingURL=chatWebSocket.service.js.map