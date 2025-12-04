// src/services/chatWebSocket.ts
import { io, Socket } from 'socket.io-client';
import { WebSocketMessage, TypingIndicator, Message } from '../types/chat.types';

type EventCallback = (data: any) => void;

class ChatWebSocketService {
  private socket: Socket | null = null;
  private isConnecting = false;
  private eventListeners: Map<string, Set<EventCallback>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // Initialiser la connexion WebSocket
  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Connexion déjà en cours'));
        return;
      }

      this.isConnecting = true;

      const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3001';

      const socketOptions: any = {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 5000,
        withCredentials: true, // Envoyer les cookies
      };

      // Ajouter le token si fourni
      if (token) {
        socketOptions.auth = { token };
      }

      this.socket = io(SOCKET_URL, socketOptions);

      this.socket.on('connect', () => {
        console.log('✅ WebSocket Chat connecté');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit('connected', {});
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Erreur de connexion WebSocket Chat:', error);
        this.isConnecting = false;
        this.emit('error', error);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 WebSocket Chat déconnecté:', reason);
        this.emit('disconnected', { reason });
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log(`🔄 WebSocket Chat reconnecté après ${attemptNumber} tentatives`);
        this.emit('reconnected', { attemptNumber });
      });

      this.socket.on('reconnect_failed', () => {
        console.error('❌ Échec de reconnexion WebSocket Chat');
        this.emit('reconnect_failed', {});
      });

      // Écouter les événements de chat
      this.setupChatEventListeners();
    });
  }

  // Configurer les écouteurs d'événements
  private setupChatEventListeners(): void {
    if (!this.socket) return;

    // Nouveaux messages
    this.socket.on('chat:new_message', (data: WebSocketMessage) => {
      this.emit('new_message', data);
    });

    // Message modifié
    this.socket.on('chat:message_updated', (data: WebSocketMessage) => {
      this.emit('message_updated', data);
    });

    // Message supprimé
    this.socket.on('chat:message_deleted', (data: WebSocketMessage) => {
      this.emit('message_deleted', data);
    });

    // Réaction ajoutée
    this.socket.on('chat:reaction_added', (data: WebSocketMessage) => {
      this.emit('reaction_added', data);
    });

    // Réaction retirée
    this.socket.on('chat:reaction_removed', (data: WebSocketMessage) => {
      this.emit('reaction_removed', data);
    });

    // Utilisateur en train de taper
    this.socket.on('chat:user_typing', (data: TypingIndicator) => {
      this.emit('user_typing', data);
    });

    // Utilisateur a rejoint
    this.socket.on('chat:user_joined', (data: any) => {
      this.emit('user_joined', data);
    });

    // Utilisateur a quitté
    this.socket.on('chat:user_left', (data: any) => {
      this.emit('user_left', data);
    });

    // Canal modifié
    this.socket.on('chat:channel_updated', (data: WebSocketMessage) => {
      this.emit('channel_updated', data);
    });

    // Mention reçue
    this.socket.on('chat:mention', (data: any) => {
      this.emit('mention', data);
    });
  }

  // Rejoindre un canal
  joinChannel(channelId: string): void {
    if (!this.socket?.connected) {
      console.warn('⚠️ WebSocket non connecté, impossible de rejoindre le canal');
      return;
    }

    this.socket.emit('chat:join_channel', { channelId });
  }

  // Quitter un canal
  leaveChannel(channelId: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit('chat:leave_channel', { channelId });
  }

  // Commencer à taper
  startTyping(channelId: string, userName: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit('chat:typing_start', { channelId, userName });
  }

  // Arrêter de taper
  stopTyping(channelId: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit('chat:typing_stop', { channelId });
  }

  // Écouter un événement
  on(event: string, callback: EventCallback): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }

    this.eventListeners.get(event)!.add(callback);

    // Retourner une fonction pour se désabonner
    return () => {
      this.off(event, callback);
    };
  }

  // Se désabonner d'un événement
  off(event: string, callback: EventCallback): void {
    const callbacks = this.eventListeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.eventListeners.delete(event);
      }
    }
  }

  // Émettre un événement aux écouteurs
  private emit(event: string, data: any): void {
    const callbacks = this.eventListeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Erreur dans le callback de l'événement ${event}:`, error);
        }
      });
    }
  }

  // Déconnecter
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.eventListeners.clear();
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  // Vérifier si connecté
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Obtenir le socket
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Singleton
const chatWebSocketService = new ChatWebSocketService();
export default chatWebSocketService;
