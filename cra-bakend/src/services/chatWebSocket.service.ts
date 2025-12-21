// src/services/chatWebSocket.service.ts
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { WebSocketMessage } from '../types/chat.types';

export class ChatWebSocketService {
  private io: SocketIOServer | null = null;

  initialize(server: HTTPServer | SocketIOServer) {
    if (server instanceof SocketIOServer) {
      this.io = server;
    } else {
      throw new Error('ChatWebSocketService doit être initialisé avec un serveur Socket.IO existant');
    }

    this.setupChatEventHandlers();
    console.log('💬 Service WebSocket Chat initialisé');
  }

  private setupChatEventHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket: any) => {
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
  emitNewMessage(message: any) {
    if (!this.io) return;

    const wsMessage: WebSocketMessage = {
      type: 'new_message',
      data: message,
      timestamp: new Date()
    };

    this.io.emit('chat:new_message', wsMessage);
  }

  // Émettre une mise à jour de message (broadcast global)
  emitMessageUpdated(message: any) {
    if (!this.io) return;

    const wsMessage: WebSocketMessage = {
      type: 'message_updated',
      data: message,
      timestamp: new Date()
    };

    this.io.emit('chat:message_updated', wsMessage);
  }

  // Émettre une suppression de message (broadcast global)
  emitMessageDeleted(messageId: string) {
    if (!this.io) return;

    const wsMessage: WebSocketMessage = {
      type: 'message_deleted',
      data: { messageId },
      timestamp: new Date()
    };

    this.io.emit('chat:message_deleted', wsMessage);
  }

  // Émettre l'ajout d'une réaction (broadcast global)
  emitReactionAdded(messageId: string, reaction: any) {
    if (!this.io) return;

    const wsMessage: WebSocketMessage = {
      type: 'reaction_added',
      data: { messageId, reaction },
      timestamp: new Date()
    };

    this.io.emit('chat:reaction_added', wsMessage);
  }

  // Émettre la suppression d'une réaction (broadcast global)
  emitReactionRemoved(messageId: string, reaction: any) {
    if (!this.io) return;

    const wsMessage: WebSocketMessage = {
      type: 'reaction_removed',
      data: { messageId, reaction },
      timestamp: new Date()
    };

    this.io.emit('chat:reaction_removed', wsMessage);
  }
}

// Instance singleton
let chatWebSocketService: ChatWebSocketService | null = null;

export const initializeChatWebSocketService = (server: HTTPServer | SocketIOServer): ChatWebSocketService => {
  if (!chatWebSocketService) {
    chatWebSocketService = new ChatWebSocketService();
    chatWebSocketService.initialize(server);
  }
  return chatWebSocketService;
};

export const getChatWebSocketService = (): ChatWebSocketService => {
  if (!chatWebSocketService) {
    throw new Error('ChatWebSocketService n\'a pas été initialisé. Appelez initializeChatWebSocketService() d\'abord.');
  }
  return chatWebSocketService;
};
