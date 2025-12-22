"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatService = exports.ChatService = void 0;
// src/services/chat.service.ts
const client_1 = require("@prisma/client");
const errors_1 = require("../utils/errors");
const chatWebSocket_service_1 = require("./chatWebSocket.service");
const notification_service_1 = require("./notification.service");
const prisma = new client_1.PrismaClient();
class ChatService {
    // =============================================
    // MESSAGES
    // =============================================
    // Envoyer un message
    async sendMessage(messageData, authorId, _userRole // Parameter kept for compatibility but not used
    ) {
        // Validation: le message doit contenir du contenu OU un fichier
        if (!messageData.content?.trim() && !messageData.fileUrl) {
            throw new errors_1.ValidationError('Le message doit contenir du texte ou un fichier');
        }
        // Validation de la taille du fichier (10 MB max)
        if (messageData.fileSize && messageData.fileSize > 10 * 1024 * 1024) {
            throw new errors_1.ValidationError('La taille du fichier ne doit pas dépasser 10 MB');
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
        const wsService = (0, chatWebSocket_service_1.getChatWebSocketService)();
        wsService.emitNewMessage(formattedMessage);
        // Envoyer des notifications à tous les utilisateurs (sauf l'expéditeur)
        const notificationService = (0, notification_service_1.getNotificationService)();
        const hasFile = !!messageData.fileUrl;
        notificationService.notifyChatMessage(message.id, messageData.content || '', authorId, hasFile).catch(error => {
            console.error('Erreur lors de l\'envoi des notifications:', error);
            // Ne pas bloquer l'envoi du message en cas d'erreur de notification
        });
        return formattedMessage;
    }
    // Lister les messages
    async listMessages(query = {}, _userId, // Parameter kept for compatibility but not used
    _userRole // Parameter kept for compatibility but not used
    ) {
        const page = Math.max(1, query.page || 1);
        const limit = Math.min(100, Math.max(1, query.limit || 50));
        const skip = (page - 1) * limit;
        // Construire les filtres
        const where = {
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
        const pagination = {
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
    async updateMessage(messageId, updateData, userId, _userRole // Parameter kept for compatibility but not used
    ) {
        // Vérifier que le message existe
        const message = await prisma.chatMessage.findUnique({
            where: { id: messageId },
            include: {
                author: true,
            }
        });
        if (!message) {
            throw new errors_1.ValidationError('Message non trouvé');
        }
        if (message.isDeleted) {
            throw new errors_1.ValidationError('Impossible de modifier un message supprimé');
        }
        // Vérifier les permissions: seul l'auteur peut modifier
        if (message.authorId !== userId) {
            throw new errors_1.AuthError('Vous ne pouvez modifier que vos propres messages');
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
        const wsService = (0, chatWebSocket_service_1.getChatWebSocketService)();
        wsService.emitMessageUpdated(formattedMessage);
        return formattedMessage;
    }
    // Supprimer un message
    async deleteMessage(messageId, userId, userRole) {
        // Vérifier que le message existe
        const message = await prisma.chatMessage.findUnique({
            where: { id: messageId },
        });
        if (!message) {
            throw new errors_1.ValidationError('Message non trouvé');
        }
        if (message.isDeleted) {
            throw new errors_1.ValidationError('Message déjà supprimé');
        }
        // Vérifier les permissions: auteur ou administrateur
        const canDelete = message.authorId === userId || userRole === 'ADMINISTRATEUR';
        if (!canDelete) {
            throw new errors_1.AuthError('Vous n\'avez pas les permissions pour supprimer ce message');
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
        const wsService = (0, chatWebSocket_service_1.getChatWebSocketService)();
        wsService.emitMessageDeleted(messageId);
    }
    // =============================================
    // RÉACTIONS
    // =============================================
    // Ajouter une réaction
    async addReaction(messageId, data, userId) {
        // Vérifier que le message existe
        const message = await prisma.chatMessage.findUnique({
            where: { id: messageId }
        });
        if (!message || message.isDeleted) {
            throw new errors_1.ValidationError('Message non trouvé');
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
        const wsService = (0, chatWebSocket_service_1.getChatWebSocketService)();
        wsService.emitReactionAdded(messageId, {
            emoji: data.emoji,
            userId,
            reactions: groupedReactions
        });
    }
    // Retirer une réaction
    async removeReaction(messageId, data, userId) {
        // Vérifier que le message existe
        const message = await prisma.chatMessage.findUnique({
            where: { id: messageId }
        });
        if (!message || message.isDeleted) {
            throw new errors_1.ValidationError('Message non trouvé');
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
        const wsService = (0, chatWebSocket_service_1.getChatWebSocketService)();
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
    formatMessageResponse(message, currentUserId) {
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
    groupReactions(reactions, currentUserId) {
        const grouped = new Map();
        reactions.forEach(reaction => {
            if (!grouped.has(reaction.emoji)) {
                grouped.set(reaction.emoji, { users: [], currentUserReacted: false });
            }
            const group = grouped.get(reaction.emoji);
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
    formatUserBasicInfo(user) {
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
exports.ChatService = ChatService;
// Singleton pattern
let chatServiceInstance = null;
const getChatService = () => {
    if (!chatServiceInstance) {
        chatServiceInstance = new ChatService();
    }
    return chatServiceInstance;
};
exports.getChatService = getChatService;
//# sourceMappingURL=chat.service.js.map