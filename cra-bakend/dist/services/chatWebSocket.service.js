"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatWebSocketService = exports.initializeChatWebSocketService = exports.ChatWebSocketService = void 0;
// src/services/chatWebSocket.service.ts
const socket_io_1 = require("socket.io");
class ChatWebSocketService {
    constructor() {
        this.io = null;
        this.typingUsers = new Map(); // channelId -> userId -> timeout
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
            // Rejoindre un canal
            socket.on('chat:join_channel', (data) => {
                const { channelId } = data;
                socket.join(`channel:${channelId}`);
                console.log(`👤 ${userId} a rejoint le canal ${channelId}`);
                // Notifier les autres membres
                socket.to(`channel:${channelId}`).emit('chat:user_joined', {
                    channelId,
                    userId,
                    timestamp: new Date()
                });
            });
            // Quitter un canal
            socket.on('chat:leave_channel', (data) => {
                const { channelId } = data;
                socket.leave(`channel:${channelId}`);
                console.log(`👤 ${userId} a quitté le canal ${channelId}`);
                // Arrêter l'indicateur de saisie si actif
                this.stopTyping(channelId, userId);
                // Notifier les autres membres
                socket.to(`channel:${channelId}`).emit('chat:user_left', {
                    channelId,
                    userId,
                    timestamp: new Date()
                });
            });
            // Indicateur de saisie
            socket.on('chat:typing_start', (data) => {
                const { channelId, userName } = data;
                this.startTyping(channelId, userId, userName);
                socket.to(`channel:${channelId}`).emit('chat:user_typing', {
                    channelId,
                    userId,
                    userName,
                    isTyping: true
                });
            });
            socket.on('chat:typing_stop', (data) => {
                const { channelId } = data;
                this.stopTyping(channelId, userId);
                socket.to(`channel:${channelId}`).emit('chat:user_typing', {
                    channelId,
                    userId,
                    isTyping: false
                });
            });
            // Déconnexion
            socket.on('disconnect', () => {
                // Nettoyer tous les indicateurs de saisie de cet utilisateur
                this.cleanupUserTyping(userId);
            });
        });
    }
    // Émettre un nouveau message
    emitNewMessage(channelId, message) {
        if (!this.io)
            return;
        const wsMessage = {
            type: 'new_message',
            channelId,
            data: message,
            timestamp: new Date()
        };
        this.io.to(`channel:${channelId}`).emit('chat:new_message', wsMessage);
    }
    // Émettre une mise à jour de message
    emitMessageUpdated(channelId, message) {
        if (!this.io)
            return;
        const wsMessage = {
            type: 'message_updated',
            channelId,
            data: message,
            timestamp: new Date()
        };
        this.io.to(`channel:${channelId}`).emit('chat:message_updated', wsMessage);
    }
    // Émettre une suppression de message
    emitMessageDeleted(channelId, messageId) {
        if (!this.io)
            return;
        const wsMessage = {
            type: 'message_deleted',
            channelId,
            data: { messageId },
            timestamp: new Date()
        };
        this.io.to(`channel:${channelId}`).emit('chat:message_deleted', wsMessage);
    }
    // Émettre l'ajout d'une réaction
    emitReactionAdded(channelId, messageId, reaction) {
        if (!this.io)
            return;
        const wsMessage = {
            type: 'reaction_added',
            channelId,
            data: { messageId, reaction },
            timestamp: new Date()
        };
        this.io.to(`channel:${channelId}`).emit('chat:reaction_added', wsMessage);
    }
    // Émettre la suppression d'une réaction
    emitReactionRemoved(channelId, messageId, reaction) {
        if (!this.io)
            return;
        const wsMessage = {
            type: 'reaction_removed',
            channelId,
            data: { messageId, reaction },
            timestamp: new Date()
        };
        this.io.to(`channel:${channelId}`).emit('chat:reaction_removed', wsMessage);
    }
    // Émettre une mise à jour de canal
    emitChannelUpdated(channelId, channel) {
        if (!this.io)
            return;
        const wsMessage = {
            type: 'channel_updated',
            channelId,
            data: channel,
            timestamp: new Date()
        };
        this.io.to(`channel:${channelId}`).emit('chat:channel_updated', wsMessage);
    }
    // Notifier un utilisateur spécifique (pour les mentions)
    notifyUser(userId, notification) {
        if (!this.io)
            return;
        this.io.to(`user:${userId}`).emit('chat:mention', notification);
    }
    // Gestion de l'indicateur de saisie
    startTyping(channelId, userId, userName) {
        if (!this.typingUsers.has(channelId)) {
            this.typingUsers.set(channelId, new Map());
        }
        const channelTyping = this.typingUsers.get(channelId);
        // Annuler le timeout précédent si existant
        if (channelTyping.has(userId)) {
            clearTimeout(channelTyping.get(userId));
        }
        // Auto-arrêt après 3 secondes d'inactivité
        const timeout = setTimeout(() => {
            this.stopTyping(channelId, userId);
            if (this.io) {
                this.io.to(`channel:${channelId}`).emit('chat:user_typing', {
                    channelId,
                    userId,
                    isTyping: false
                });
            }
        }, 3000);
        channelTyping.set(userId, timeout);
    }
    stopTyping(channelId, userId) {
        const channelTyping = this.typingUsers.get(channelId);
        if (channelTyping && channelTyping.has(userId)) {
            clearTimeout(channelTyping.get(userId));
            channelTyping.delete(userId);
            // Nettoyer le canal s'il n'y a plus de typeurs
            if (channelTyping.size === 0) {
                this.typingUsers.delete(channelId);
            }
        }
    }
    cleanupUserTyping(userId) {
        for (const [channelId, channelTyping] of this.typingUsers.entries()) {
            if (channelTyping.has(userId)) {
                clearTimeout(channelTyping.get(userId));
                channelTyping.delete(userId);
                // Notifier le canal
                if (this.io) {
                    this.io.to(`channel:${channelId}`).emit('chat:user_typing', {
                        channelId,
                        userId,
                        isTyping: false
                    });
                }
                // Nettoyer le canal s'il est vide
                if (channelTyping.size === 0) {
                    this.typingUsers.delete(channelId);
                }
            }
        }
    }
    // Obtenir les utilisateurs actuellement en train de taper dans un canal
    getTypingUsers(channelId) {
        const channelTyping = this.typingUsers.get(channelId);
        return channelTyping ? Array.from(channelTyping.keys()) : [];
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