// src/services/chat.service.ts
import { PrismaClient } from '@prisma/client';
import { ValidationError, AuthError } from '../utils/errors';
import { getChatWebSocketService } from './chatWebSocket.service';
import { getNotificationService } from './notification.service';
import {
  CreateMessageRequest,
  UpdateMessageRequest,
  AddReactionRequest,
  MessageListQuery,
  MessageResponse,
  MessageReactionResponse,
  UserBasicInfo,
  PaginationMeta,
} from '../types/chat.types';

const prisma = new PrismaClient();

export class ChatService {

  // =============================================
  // MESSAGES
  // =============================================

  // Envoyer un message
  async sendMessage(
    messageData: CreateMessageRequest,
    authorId: string,
    _userRole: string // Parameter kept for compatibility but not used
  ): Promise<MessageResponse> {
    // Validation: le message doit contenir du contenu OU un fichier
    if (!messageData.content?.trim() && !messageData.fileUrl) {
      throw new ValidationError('Le message doit contenir du texte ou un fichier');
    }

    // Validation de la taille du fichier (10 MB max)
    if (messageData.fileSize && messageData.fileSize > 10 * 1024 * 1024) {
      throw new ValidationError('La taille du fichier ne doit pas dépasser 10 MB');
    }

    // Créer le message
    const message = await prisma.chatMessage.create({
      data: {
        content: messageData.content || '',
        fileUrl: messageData.fileUrl,
        fileName: messageData.fileName,
        fileSize: messageData.fileSize ? BigInt(messageData.fileSize) : null,
        fileMimeType: messageData.fileMimeType,
        authorId: authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            profileImage: true,
          }
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                profileImage: true,
              }
            }
          }
        }
      }
    });

    // Formater la réponse
    const formattedMessage = this.formatMessageResponse(message, authorId);

    // Émettre via WebSocket
    const wsService = getChatWebSocketService();
    wsService.emitNewMessage(formattedMessage);

    // Envoyer des notifications à tous les utilisateurs (sauf l'expéditeur)
    const notificationService = getNotificationService();
    const hasFile = !!messageData.fileUrl;
    notificationService.notifyChatMessage(
      message.id,
      messageData.content || '',
      authorId,
      hasFile
    ).catch(error => {
      console.error('Erreur lors de l\'envoi des notifications:', error);
      // Ne pas bloquer l'envoi du message en cas d'erreur de notification
    });

    return formattedMessage;
  }

  // Lister les messages
  async listMessages(
    query: MessageListQuery = {},
    _userId: string, // Parameter kept for compatibility but not used
    _userRole: string // Parameter kept for compatibility but not used
  ): Promise<{ messages: MessageResponse[], pagination: PaginationMeta }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 50));
    const skip = (page - 1) * limit;

    // Construire les filtres
    const where: any = {
      isDeleted: false,
    };

    if (query.search) {
      where.content = {
        contains: query.search,
        mode: 'insensitive'
      };
    }

    if (query.authorId) {
      where.authorId = query.authorId;
    }

    if (query.startDate) {
      where.createdAt = {
        ...where.createdAt,
        gte: new Date(query.startDate)
      };
    }

    if (query.endDate) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(query.endDate)
      };
    }

    // Récupérer les messages avec pagination
    const [messages, total] = await Promise.all([
      prisma.chatMessage.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
              profileImage: true,
            }
          },
          reactions: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  role: true,
                  profileImage: true,
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.chatMessage.count({ where })
    ]);

    // Formater les messages
    const formattedMessages = messages.map(msg => this.formatMessageResponse(msg, _userId));

    // Calculer la pagination
    const totalPages = Math.ceil(total / limit);
    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };

    return { messages: formattedMessages, pagination };
  }

  // Modifier un message
  async updateMessage(
    messageId: string,
    updateData: UpdateMessageRequest,
    userId: string,
    _userRole: string // Parameter kept for compatibility but not used
  ): Promise<MessageResponse> {
    // Vérifier que le message existe
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      include: {
        author: true,
      }
    });

    if (!message) {
      throw new ValidationError('Message non trouvé');
    }

    if (message.isDeleted) {
      throw new ValidationError('Impossible de modifier un message supprimé');
    }

    // Vérifier les permissions: seul l'auteur peut modifier
    if (message.authorId !== userId) {
      throw new AuthError('Vous ne pouvez modifier que vos propres messages');
    }

    // Mettre à jour le message
    const updatedMessage = await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        content: updateData.content,
        isEdited: true,
        editedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            profileImage: true,
          }
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                profileImage: true,
              }
            }
          }
        }
      }
    });

    // Formater la réponse
    const formattedMessage = this.formatMessageResponse(updatedMessage, userId);

    // Émettre via WebSocket
    const wsService = getChatWebSocketService();
    wsService.emitMessageUpdated(formattedMessage);

    return formattedMessage;
  }

  // Supprimer un message
  async deleteMessage(
    messageId: string,
    userId: string,
    userRole: string
  ): Promise<void> {
    // Vérifier que le message existe
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new ValidationError('Message non trouvé');
    }

    if (message.isDeleted) {
      throw new ValidationError('Message déjà supprimé');
    }

    // Vérifier les permissions: auteur ou administrateur
    const canDelete = message.authorId === userId || userRole === 'ADMINISTRATEUR';

    if (!canDelete) {
      throw new AuthError('Vous n\'avez pas les permissions pour supprimer ce message');
    }

    // Soft delete
    await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      }
    });

    // Émettre via WebSocket
    const wsService = getChatWebSocketService();
    wsService.emitMessageDeleted(messageId);
  }

  // =============================================
  // RÉACTIONS
  // =============================================

  // Ajouter une réaction
  async addReaction(
    messageId: string,
    data: AddReactionRequest,
    userId: string
  ): Promise<void> {
    // Vérifier que le message existe
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId }
    });

    if (!message || message.isDeleted) {
      throw new ValidationError('Message non trouvé');
    }

    // Ajouter ou mettre à jour la réaction (upsert pour éviter les doublons)
    await prisma.messageReaction.upsert({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId,
          emoji: data.emoji
        }
      },
      create: {
        messageId,
        userId,
        emoji: data.emoji
      },
      update: {} // Pas de changement si existe déjà
    });

    // Récupérer les réactions mises à jour
    const reactions = await prisma.messageReaction.findMany({
      where: { messageId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            profileImage: true,
          }
        }
      }
    });

    // Grouper les réactions par emoji
    const groupedReactions = this.groupReactions(reactions, userId);

    // Émettre via WebSocket
    const wsService = getChatWebSocketService();
    wsService.emitReactionAdded(messageId, {
      emoji: data.emoji,
      userId,
      reactions: groupedReactions
    });
  }

  // Retirer une réaction
  async removeReaction(
    messageId: string,
    data: AddReactionRequest,
    userId: string
  ): Promise<void> {
    // Vérifier que le message existe
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId }
    });

    if (!message || message.isDeleted) {
      throw new ValidationError('Message non trouvé');
    }

    // Supprimer la réaction
    await prisma.messageReaction.deleteMany({
      where: {
        messageId,
        userId,
        emoji: data.emoji
      }
    });

    // Récupérer les réactions mises à jour
    const reactions = await prisma.messageReaction.findMany({
      where: { messageId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            profileImage: true,
          }
        }
      }
    });

    // Grouper les réactions par emoji
    const groupedReactions = this.groupReactions(reactions, userId);

    // Émettre via WebSocket
    const wsService = getChatWebSocketService();
    wsService.emitReactionRemoved(messageId, {
      emoji: data.emoji,
      userId,
      reactions: groupedReactions
    });
  }

  // =============================================
  // MÉTHODES PRIVÉES
  // =============================================

  // Formater un message pour la réponse
  private formatMessageResponse(message: any, currentUserId: string): MessageResponse {
    // Grouper les réactions par emoji
    const groupedReactions = this.groupReactions(message.reactions || [], currentUserId);

    return {
      id: message.id,
      content: message.content,
      isEdited: message.isEdited,
      editedAt: message.editedAt,
      isDeleted: message.isDeleted,
      deletedAt: message.deletedAt,
      fileUrl: message.fileUrl,
      fileName: message.fileName,
      fileSize: message.fileSize,
      fileMimeType: message.fileMimeType,
      author: this.formatUserBasicInfo(message.author),
      reactions: groupedReactions,
      canEdit: message.authorId === currentUserId,
      canDelete: message.authorId === currentUserId,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }

  // Grouper les réactions par emoji
  private groupReactions(reactions: any[], currentUserId: string): MessageReactionResponse[] {
    const grouped = new Map<string, { users: UserBasicInfo[], currentUserReacted: boolean }>();

    reactions.forEach(reaction => {
      if (!grouped.has(reaction.emoji)) {
        grouped.set(reaction.emoji, { users: [], currentUserReacted: false });
      }

      const group = grouped.get(reaction.emoji)!;
      group.users.push(this.formatUserBasicInfo(reaction.user));

      if (reaction.userId === currentUserId) {
        group.currentUserReacted = true;
      }
    });

    return Array.from(grouped.entries()).map(([emoji, data]) => ({
      emoji,
      count: data.users.length,
      users: data.users,
      currentUserReacted: data.currentUserReacted
    }));
  }

  // Formater les informations basiques d'un utilisateur
  private formatUserBasicInfo(user: any): UserBasicInfo {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage
    };
  }
}

// Singleton pattern
let chatServiceInstance: ChatService | null = null;

export const getChatService = (): ChatService => {
  if (!chatServiceInstance) {
    chatServiceInstance = new ChatService();
  }
  return chatServiceInstance;
};
