// src/services/websocketNotification.service.ts
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export class WebSocketNotificationService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, Set<string>> = new Map(); // userId -> Set<socketId>

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true // Important : autorise l'envoi de cookies
      },
      path: '/socket.io'
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    
    console.log('🔌 Service WebSocket initialisé');
  }

  // Configuration du middleware d'authentification
  private setupMiddleware() {
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        let token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

        // Si pas de token dans auth ou headers, essayer de récupérer depuis les cookies
        if (!token && socket.handshake.headers.cookie) {
          const cookies = socket.handshake.headers.cookie.split(';').reduce((acc: any, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
          }, {});

          token = cookies.auth_token; // Le nom du cookie défini dans le backend (auth_token)
        }

        if (!token) {
          return next(new Error('Authentification requise'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

        // Vérifier que l'utilisateur existe et est actif
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId }
        });

        if (!user || !user.isActive) {
          return next(new Error('Utilisateur non trouvé ou inactif'));
        }

        // Stocker les données utilisateur dans socket.data (recommandé par Socket.IO v4+)
        socket.data.userId = decoded.userId;
        socket.data.userRole = decoded.role;

        // Maintenir la compatibilité avec l'ancienne approche
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;

        next();
      } catch (error) {
        console.error('Erreur d\'authentification WebSocket:', error);
        next(new Error('Token invalide'));
      }
    });
  }

  // Configuration des gestionnaires d'événements
  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`✅ Utilisateur connecté: ${socket.userId} (${socket.id})`);
      
      // Ajouter l'utilisateur aux connexions actives
      this.addUserConnection(socket.userId!, socket.id);

      // Envoyer le statut de connexion
      socket.emit('connection_status', {
        status: 'connected',
        userId: socket.userId,
        timestamp: new Date().toISOString()
      });

      // Rejoindre des salles spécifiques
      this.joinUserRooms(socket);

      // Gestionnaire de déconnexion
      socket.on('disconnect', () => {
        console.log(`❌ Utilisateur déconnecté: ${socket.userId} (${socket.id})`);
        this.removeUserConnection(socket.userId!, socket.id);
      });

      // Marquer les notifications comme lues en temps réel
      socket.on('mark_notification_read', async (data: { notificationId: string }) => {
        try {
          await prisma.notification.update({
            where: { 
              id: data.notificationId,
              receiverId: socket.userId
            },
            data: { 
              isRead: true,
              readAt: new Date()
            }
          });

          // Confirmer la lecture
          socket.emit('notification_read_confirmed', {
            notificationId: data.notificationId,
            timestamp: new Date().toISOString()
          });

          // Mettre à jour le compteur non lu
          const unreadCount = await this.getUnreadCount(socket.userId!);
          socket.emit('unread_count_updated', { count: unreadCount });

        } catch (error) {
          socket.emit('error', { message: 'Erreur lors de la lecture de la notification' });
        }
      });

      // Demander le compteur de notifications non lues
      socket.on('get_unread_count', async () => {
        try {
          const count = await this.getUnreadCount(socket.userId!);
          socket.emit('unread_count_updated', { count });
        } catch (error) {
          socket.emit('error', { message: 'Erreur lors de la récupération du compteur' });
        }
      });

      // Rejoindre une salle spécifique (ex: projet, activité)
      socket.on('join_room', (data: { roomType: string; roomId: string }) => {
        const roomName = `${data.roomType}:${data.roomId}`;
        socket.join(roomName);
        console.log(`📍 ${socket.userId} a rejoint la salle: ${roomName}`);
      });

      // Quitter une salle
      socket.on('leave_room', (data: { roomType: string; roomId: string }) => {
        const roomName = `${data.roomType}:${data.roomId}`;
        socket.leave(roomName);
        console.log(`🚪 ${socket.userId} a quitté la salle: ${roomName}`);
      });
    });
  }

  // Ajouter une connexion utilisateur
  private addUserConnection(userId: string, socketId: string) {
    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, new Set());
    }
    this.connectedUsers.get(userId)!.add(socketId);
  }

  // Supprimer une connexion utilisateur
  private removeUserConnection(userId: string, socketId: string) {
    const userSockets = this.connectedUsers.get(userId);
    if (userSockets) {
      userSockets.delete(socketId);
      if (userSockets.size === 0) {
        this.connectedUsers.delete(userId);
      }
    }
  }

  // Faire rejoindre l'utilisateur aux salles appropriées
  private async joinUserRooms(socket: AuthenticatedSocket) {
    try {
      // Rejoindre la salle personnelle
      socket.join(`user:${socket.userId}`);

      // Rejoindre les salles des projets où l'utilisateur participe
      const projects = await prisma.project.findMany({
        where: {
          OR: [
            { creatorId: socket.userId },
            {
              participants: {
                some: {
                  userId: socket.userId,
                  isActive: true
                }
              }
            }
          ]
        },
        select: { id: true }
      });

      for (const project of projects) {
        socket.join(`project:${project.id}`);
      }

      console.log(`📢 ${socket.userId} a rejoint ${projects.length + 1} salles`);
    } catch (error) {
      console.error('❌ Erreur lors de la jointure des salles:', error);
    }
  }

  // Obtenir le nombre de notifications non lues
  private async getUnreadCount(userId: string): Promise<number> {
    return await prisma.notification.count({
      where: {
        receiverId: userId,
        isRead: false
      }
    });
  }

  // =============================================
  // MÉTHODES PUBLIQUES POUR ENVOYER DES NOTIFICATIONS
  // =============================================

  // Envoyer une notification à un utilisateur spécifique
  async sendNotificationToUser(userId: string, notification: any) {
    try {
      // Envoyer via WebSocket si l'utilisateur est connecté
      this.io.to(`user:${userId}`).emit('new_notification', {
        ...notification,
        timestamp: new Date().toISOString()
      });

      // Mettre à jour le compteur
      const unreadCount = await this.getUnreadCount(userId);
      this.io.to(`user:${userId}`).emit('unread_count_updated', { count: unreadCount });

      console.log(`📨 Notification envoyée à ${userId}: ${notification.title}`);
    } catch (error) {
      console.error('❌ Erreur envoi notification WebSocket:', error);
    }
  }

  // Envoyer une notification à tous les participants d'un projet
  async sendNotificationToProject(projectId: string, notification: any, excludeUserId?: string) {
    try {
      const roomName = `project:${projectId}`;
      
      if (excludeUserId) {
        // Exclure l'utilisateur spécifié
        const sockets = await this.io.in(roomName).fetchSockets();
        for (const socket of sockets) {
          // Vérifier si le socket a les propriétés userId via une assertion de type plus sûre
          const socketData = socket.data as { userId?: string };
          if (socketData.userId !== excludeUserId) {
            socket.emit('new_notification', {
              ...notification,
              timestamp: new Date().toISOString()
            });
          }
        }
      } else {
        this.io.to(roomName).emit('new_notification', {
          ...notification,
          timestamp: new Date().toISOString()
        });
      }

      console.log(`📢 Notification diffusée au projet ${projectId}: ${notification.title}`);
    } catch (error) {
      console.error('❌ Erreur diffusion notification projet:', error);
    }
  }
  // =============================================
// MÉTHODE BROADCAST GÉNÉRIQUE (à ajouter dans la classe)
// =============================================

/**
 * Diffuser un message générique à tous les utilisateurs connectés
 * @param eventName - Nom de l'événement
 * @param data - Données à envoyer
 */
broadcast(eventName: string, data: any) {
  try {
    this.io.emit(eventName, {
      ...data,
      timestamp: data.timestamp || new Date().toISOString()
    });

    console.log(`📡 Broadcast envoyé: ${eventName}`, data);
  } catch (error) {
    console.error('❌ Erreur lors du broadcast:', error);
  }
}

  // Diffuser une notification système à tous les utilisateurs connectés
  async broadcastSystemNotification(notification: any) {
    try {
      this.io.emit('system_notification', {
        ...notification,
        timestamp: new Date().toISOString()
      });

      console.log(`📡 Notification système diffusée: ${notification.title}`);
    } catch (error) {
      console.error('❌ Erreur diffusion notification système:', error);
    }
  }

  // Envoyer le statut de présence d'un utilisateur
  async broadcastUserStatus(userId: string, status: 'online' | 'offline') {
    try {
      // Obtenir les projets de l'utilisateur pour notifier les collaborateurs
      const projects = await prisma.project.findMany({
        where: {
          OR: [
            { creatorId: userId },
            {
              participants: {
                some: {
                  userId: userId,
                  isActive: true
                }
              }
            }
          ]
        },
        select: { id: true }
      });

      // Diffuser le statut dans chaque projet
      for (const project of projects) {
        this.io.to(`project:${project.id}`).emit('user_status_changed', {
          userId,
          status,
          timestamp: new Date().toISOString()
        });
      }

      console.log(`👤 Statut ${status} diffusé pour ${userId}`);
    } catch (error) {
      console.error('❌ Erreur diffusion statut utilisateur:', error);
    }
  }

  // Envoyer une notification de typing (en cours de frappe)
  async sendTypingIndicator(roomType: string, roomId: string, userId: string, isTyping: boolean) {
    const roomName = `${roomType}:${roomId}`;
    
    this.io.to(roomName).emit('typing_indicator', {
      userId,
      isTyping,
      roomType,
      roomId,
      timestamp: new Date().toISOString()
    });
  }

  // Obtenir la liste des utilisateurs connectés
  getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  // Vérifier si un utilisateur est connecté
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  // Obtenir le nombre total de connexions
  getTotalConnections(): number {
    let total = 0;
    for (const sockets of this.connectedUsers.values()) {
      total += sockets.size;
    }
    return total;
  }

  // Obtenir les statistiques de connexion
  getConnectionStats() {
    return {
      totalUsers: this.connectedUsers.size,
      totalConnections: this.getTotalConnections(),
      connectedUsers: this.getConnectedUsers()
    };
  }

  // Obtenir l'instance Socket.IO
  getIO(): SocketIOServer {
    return this.io;
  }
}

// Singleton pour l'instance WebSocket
let webSocketService: WebSocketNotificationService | null = null;

export const initializeWebSocketService = (server: HTTPServer): WebSocketNotificationService => {
  if (!webSocketService) {
    webSocketService = new WebSocketNotificationService(server);
  }
  return webSocketService;
};

export const getWebSocketService = (): WebSocketNotificationService | null => {
  return webSocketService;
};