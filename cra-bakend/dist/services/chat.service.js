"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
// src/services/chat.service.ts
const client_1 = require("@prisma/client");
const errors_1 = require("../utils/errors");
const chatWebSocket_service_1 = require("./chatWebSocket.service");
const notification_service_1 = require("./notification.service");
const chat_types_1 = require("../types/chat.types");
const prisma = new client_1.PrismaClient();
class ChatService {
    // =============================================
    // GESTION DES CANAUX
    // =============================================
    // Créer un canal
    async createChannel(channelData, creatorId, creatorRole) {
        // Vérifier les permissions pour créer un canal
        if (channelData.type === chat_types_1.ChannelType.GENERAL && creatorRole !== 'ADMINISTRATEUR') {
            throw new errors_1.AuthError('Seuls les administrateurs peuvent créer des canaux généraux');
        }
        // Vérifier que le projet existe si c'est un canal de projet
        if (channelData.projectId) {
            const project = await prisma.project.findUnique({
                where: { id: channelData.projectId },
                include: {
                    participants: {
                        where: { userId: creatorId, isActive: true }
                    }
                }
            });
            if (!project) {
                throw new errors_1.ValidationError('Projet non trouvé');
            }
            const isProjectMember = project.creatorId === creatorId ||
                project.participants.length > 0 ||
                creatorRole === 'ADMINISTRATEUR';
            if (!isProjectMember) {
                throw new errors_1.AuthError('Vous devez être membre du projet pour créer un canal associé');
            }
        }
        // Vérifier que le thème existe si c'est un canal de thème
        if (channelData.themeId) {
            const theme = await prisma.researchTheme.findUnique({
                where: { id: channelData.themeId }
            });
            if (!theme) {
                throw new errors_1.ValidationError('Thème de recherche non trouvé');
            }
        }
        // Créer le canal
        const channel = await prisma.channel.create({
            data: {
                name: channelData.name,
                description: channelData.description,
                type: channelData.type,
                isPrivate: channelData.isPrivate || false,
                icon: channelData.icon,
                color: channelData.color,
                projectId: channelData.projectId,
                themeId: channelData.themeId,
                creatorId: creatorId,
            },
            include: this.getChannelIncludes()
        });
        // Ajouter le créateur comme membre avec le rôle OWNER
        await prisma.channelMember.create({
            data: {
                channelId: channel.id,
                userId: creatorId,
                role: chat_types_1.ChannelMemberRole.OWNER,
            }
        });
        // Ajouter les autres membres si spécifiés
        if (channelData.memberIds && channelData.memberIds.length > 0) {
            await this.addMembersToChannel(channel.id, channelData.memberIds, creatorId, chat_types_1.ChannelMemberRole.MEMBER);
        }
        return this.formatChannelResponse(channel, creatorId);
    }
    // Lister les canaux accessibles
    async listChannels(userId, userRole, query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;
        const skip = (page - 1) * limit;
        const where = {};
        // Filtrer par type
        if (query.type) {
            where.type = query.type;
        }
        // Filtrer par projet ou thème
        if (query.projectId) {
            where.projectId = query.projectId;
        }
        if (query.themeId) {
            where.themeId = query.themeId;
        }
        // Recherche par nom
        if (query.search) {
            where.name = {
                contains: query.search,
                mode: 'insensitive'
            };
        }
        // Filtrer les canaux archivés
        if (!query.includeArchived) {
            where.isArchived = false;
        }
        // Filtrer selon les permissions d'accès
        if (userRole !== 'ADMINISTRATEUR') {
            where.OR = [
                // Canaux publics
                { isPrivate: false },
                // Canaux dont l'utilisateur est membre
                {
                    members: {
                        some: {
                            userId: userId,
                            leftAt: null
                        }
                    }
                }
            ];
        }
        const [channels, total] = await Promise.all([
            prisma.channel.findMany({
                where,
                skip,
                take: limit,
                include: this.getChannelIncludes(),
                orderBy: { updatedAt: 'desc' }
            }),
            prisma.channel.count({ where })
        ]);
        const formattedChannels = await Promise.all(channels.map(channel => this.formatChannelResponse(channel, userId)));
        return {
            channels: formattedChannels,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1,
            }
        };
    }
    // Obtenir un canal par ID
    async getChannelById(channelId, userId, userRole) {
        const channel = await prisma.channel.findUnique({
            where: { id: channelId },
            include: this.getChannelIncludes()
        });
        if (!channel) {
            throw new errors_1.ValidationError('Canal non trouvé');
        }
        // Vérifier l'accès
        await this.checkChannelAccess(channel, userId, userRole);
        return this.formatChannelResponse(channel, userId);
    }
    // Mettre à jour un canal
    async updateChannel(channelId, updateData, userId, userRole) {
        const channel = await prisma.channel.findUnique({
            where: { id: channelId },
            include: {
                members: {
                    where: { userId: userId }
                }
            }
        });
        if (!channel) {
            throw new errors_1.ValidationError('Canal non trouvé');
        }
        // Vérifier les permissions
        const member = channel.members[0];
        const canEdit = userRole === 'ADMINISTRATEUR' ||
            member?.role === chat_types_1.ChannelMemberRole.OWNER ||
            member?.role === chat_types_1.ChannelMemberRole.ADMIN;
        if (!canEdit) {
            throw new errors_1.AuthError('Permissions insuffisantes pour modifier ce canal');
        }
        const updatedChannel = await prisma.channel.update({
            where: { id: channelId },
            data: updateData,
            include: this.getChannelIncludes()
        });
        return this.formatChannelResponse(updatedChannel, userId);
    }
    // Supprimer un canal
    async deleteChannel(channelId, userId, userRole) {
        const channel = await prisma.channel.findUnique({
            where: { id: channelId },
            include: {
                members: {
                    where: { userId: userId }
                }
            }
        });
        if (!channel) {
            throw new errors_1.ValidationError('Canal non trouvé');
        }
        // Seul le créateur ou un admin peut supprimer
        const member = channel.members[0];
        const canDelete = userRole === 'ADMINISTRATEUR' ||
            member?.role === chat_types_1.ChannelMemberRole.OWNER;
        if (!canDelete) {
            throw new errors_1.AuthError('Permissions insuffisantes pour supprimer ce canal');
        }
        await prisma.channel.delete({
            where: { id: channelId }
        });
    }
    // =============================================
    // GESTION DES MEMBRES
    // =============================================
    // Ajouter des membres à un canal
    async addMembersToChannel(channelId, userIds, requesterId, role = chat_types_1.ChannelMemberRole.MEMBER) {
        const channel = await prisma.channel.findUnique({
            where: { id: channelId },
            include: {
                members: {
                    where: { userId: requesterId }
                }
            }
        });
        if (!channel) {
            throw new errors_1.ValidationError('Canal non trouvé');
        }
        // Vérifier les permissions
        const requesterMember = channel.members[0];
        const canAddMembers = requesterMember?.role === chat_types_1.ChannelMemberRole.OWNER ||
            requesterMember?.role === chat_types_1.ChannelMemberRole.ADMIN ||
            requesterMember?.role === chat_types_1.ChannelMemberRole.MODERATOR;
        if (!canAddMembers) {
            throw new errors_1.AuthError('Permissions insuffisantes pour ajouter des membres');
        }
        // Vérifier que tous les utilisateurs existent
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } }
        });
        if (users.length !== userIds.length) {
            throw new errors_1.ValidationError('Un ou plusieurs utilisateurs n\'existent pas');
        }
        // Ajouter les membres
        const members = await Promise.all(userIds.map(userId => prisma.channelMember.upsert({
            where: {
                channelId_userId: {
                    channelId,
                    userId
                }
            },
            create: {
                channelId,
                userId,
                role,
            },
            update: {
                leftAt: null, // Réactiver si l'utilisateur était parti
                role,
            },
            include: {
                user: {
                    select: this.getUserSelect()
                }
            }
        })));
        return members.map(this.formatChannelMemberResponse);
    }
    // Retirer un membre d'un canal
    async removeMemberFromChannel(channelId, userIdToRemove, requesterId, requesterRole) {
        const channel = await prisma.channel.findUnique({
            where: { id: channelId },
            include: {
                members: {
                    where: {
                        OR: [
                            { userId: requesterId },
                            { userId: userIdToRemove }
                        ]
                    }
                }
            }
        });
        if (!channel) {
            throw new errors_1.ValidationError('Canal non trouvé');
        }
        const requesterMember = channel.members.find(m => m.userId === requesterId);
        const memberToRemove = channel.members.find(m => m.userId === userIdToRemove);
        if (!memberToRemove) {
            throw new errors_1.ValidationError('Membre non trouvé dans ce canal');
        }
        // Vérifier les permissions
        const canRemove = requesterRole === 'ADMINISTRATEUR' ||
            requesterId === userIdToRemove || // L'utilisateur peut se retirer lui-même
            requesterMember?.role === chat_types_1.ChannelMemberRole.OWNER ||
            (requesterMember?.role === chat_types_1.ChannelMemberRole.ADMIN &&
                memberToRemove.role !== chat_types_1.ChannelMemberRole.OWNER);
        if (!canRemove) {
            throw new errors_1.AuthError('Permissions insuffisantes pour retirer ce membre');
        }
        // Ne pas permettre de retirer le dernier propriétaire
        if (memberToRemove.role === chat_types_1.ChannelMemberRole.OWNER) {
            const ownerCount = await prisma.channelMember.count({
                where: {
                    channelId,
                    role: chat_types_1.ChannelMemberRole.OWNER,
                    leftAt: null
                }
            });
            if (ownerCount === 1) {
                throw new errors_1.ValidationError('Le dernier propriétaire ne peut pas être retiré');
            }
        }
        await prisma.channelMember.update({
            where: { id: memberToRemove.id },
            data: { leftAt: new Date() }
        });
    }
    // Mettre à jour le rôle d'un membre
    async updateMemberRole(channelId, userIdToUpdate, newRole, requesterId, requesterRole) {
        const channel = await prisma.channel.findUnique({
            where: { id: channelId },
            include: {
                members: {
                    where: {
                        OR: [
                            { userId: requesterId },
                            { userId: userIdToUpdate }
                        ]
                    }
                }
            }
        });
        if (!channel) {
            throw new errors_1.ValidationError('Canal non trouvé');
        }
        const requesterMember = channel.members.find(m => m.userId === requesterId);
        const memberToUpdate = channel.members.find(m => m.userId === userIdToUpdate);
        if (!memberToUpdate) {
            throw new errors_1.ValidationError('Membre non trouvé');
        }
        // Vérifier les permissions
        const canUpdate = requesterRole === 'ADMINISTRATEUR' ||
            requesterMember?.role === chat_types_1.ChannelMemberRole.OWNER ||
            (requesterMember?.role === chat_types_1.ChannelMemberRole.ADMIN &&
                memberToUpdate.role !== chat_types_1.ChannelMemberRole.OWNER);
        if (!canUpdate) {
            throw new errors_1.AuthError('Permissions insuffisantes');
        }
        const updated = await prisma.channelMember.update({
            where: { id: memberToUpdate.id },
            data: { role: newRole },
            include: {
                user: {
                    select: this.getUserSelect()
                }
            }
        });
        return this.formatChannelMemberResponse(updated);
    }
    // Lister les membres d'un canal
    async getChannelMembers(channelId, userId, userRole) {
        const channel = await prisma.channel.findUnique({
            where: { id: channelId }
        });
        if (!channel) {
            throw new errors_1.ValidationError('Canal non trouvé');
        }
        await this.checkChannelAccess(channel, userId, userRole);
        const members = await prisma.channelMember.findMany({
            where: {
                channelId,
                leftAt: null
            },
            include: {
                user: {
                    select: this.getUserSelect()
                }
            },
            orderBy: [
                { role: 'asc' },
                { joinedAt: 'asc' }
            ]
        });
        return members.map(this.formatChannelMemberResponse);
    }
    // Marquer les messages comme lus
    async markChannelAsRead(channelId, userId) {
        const member = await prisma.channelMember.findUnique({
            where: {
                channelId_userId: {
                    channelId,
                    userId
                }
            }
        });
        if (!member) {
            throw new errors_1.ValidationError('Vous n\'êtes pas membre de ce canal');
        }
        // Obtenir le dernier message
        const lastMessage = await prisma.chatMessage.findFirst({
            where: {
                channelId,
                isDeleted: false
            },
            orderBy: { createdAt: 'desc' }
        });
        await prisma.channelMember.update({
            where: { id: member.id },
            data: {
                lastReadAt: new Date(),
                lastReadMessageId: lastMessage?.id
            }
        });
    }
    // =============================================
    // GESTION DES MESSAGES
    // =============================================
    // Envoyer un message
    async sendMessage(channelId, messageData, authorId, userRole) {
        const channel = await prisma.channel.findUnique({
            where: { id: channelId },
            include: {
                members: {
                    where: { userId: authorId, leftAt: null }
                }
            }
        });
        if (!channel) {
            throw new errors_1.ValidationError('Canal non trouvé');
        }
        // Vérifier que l'utilisateur est membre du canal
        if (!channel.members[0] && userRole !== 'ADMINISTRATEUR') {
            throw new errors_1.AuthError('Vous devez être membre du canal pour envoyer des messages');
        }
        // Vérifier qu'il y a du contenu ou un fichier
        const hasContent = messageData.content && messageData.content.trim().length > 0;
        const hasFile = messageData.fileUrl && messageData.fileUrl.trim().length > 0;
        if (!hasContent && !hasFile) {
            throw new errors_1.ValidationError('Le message doit contenir du texte ou un fichier');
        }
        // Vérifier les mentions
        if (messageData.mentionedUserIds && messageData.mentionedUserIds.length > 0) {
            const users = await prisma.user.findMany({
                where: { id: { in: messageData.mentionedUserIds } }
            });
            if (users.length !== messageData.mentionedUserIds.length) {
                throw new errors_1.ValidationError('Un ou plusieurs utilisateurs mentionnés n\'existent pas');
            }
        }
        // Créer le message
        const message = await prisma.chatMessage.create({
            data: {
                content: messageData.content.trim() || '',
                type: messageData.type || 'TEXT',
                channelId,
                authorId,
                parentMessageId: messageData.parentMessageId,
                fileUrl: messageData.fileUrl,
                fileName: messageData.fileName,
                fileSize: messageData.fileSize ? BigInt(messageData.fileSize) : null,
                fileMimeType: messageData.fileMimeType,
                mentions: messageData.mentionedUserIds ? {
                    create: messageData.mentionedUserIds.map(userId => ({
                        userId
                    }))
                } : undefined
            },
            include: this.getMessageIncludes()
        });
        const formattedMessage = this.formatMessageResponse(message, authorId);
        // Émettre le message via WebSocket
        try {
            const wsService = (0, chatWebSocket_service_1.getChatWebSocketService)();
            wsService.emitNewMessage(channelId, formattedMessage);
        }
        catch (error) {
            console.error('Erreur lors de l\'émission WebSocket:', error);
            // Ne pas faire échouer la création du message si WebSocket échoue
        }
        // Envoyer des notifications pour le nouveau message
        try {
            const notificationService = (0, notification_service_1.getNotificationService)();
            await notificationService.notifyNewChatMessage(channelId, channel.name, message.id, authorId, messageData.mentionedUserIds);
        }
        catch (error) {
            console.error('Erreur lors de l\'envoi des notifications:', error);
            // Ne pas faire échouer la création du message si les notifications échouent
        }
        return formattedMessage;
    }
    // Lister les messages d'un canal
    async listMessages(channelId, userId, userRole, query) {
        const channel = await prisma.channel.findUnique({
            where: { id: channelId }
        });
        if (!channel) {
            throw new errors_1.ValidationError('Canal non trouvé');
        }
        await this.checkChannelAccess(channel, userId, userRole);
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 50;
        const skip = (page - 1) * limit;
        const where = {
            channelId,
            isDeleted: false
        };
        if (query.authorId) {
            where.authorId = query.authorId;
        }
        if (query.search) {
            where.content = {
                contains: query.search,
                mode: 'insensitive'
            };
        }
        if (query.parentMessageId) {
            where.parentMessageId = query.parentMessageId;
        }
        else if (query.parentMessageId === null) {
            // Filtrer uniquement les messages de premier niveau
            where.parentMessageId = null;
        }
        if (query.startDate) {
            where.createdAt = { gte: new Date(query.startDate) };
        }
        if (query.endDate) {
            where.createdAt = {
                ...where.createdAt,
                lte: new Date(query.endDate)
            };
        }
        const [messages, total] = await Promise.all([
            prisma.chatMessage.findMany({
                where,
                skip,
                take: limit,
                include: this.getMessageIncludes(),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.chatMessage.count({ where })
        ]);
        const formattedMessages = messages.map(msg => this.formatMessageResponse(msg, userId));
        return {
            messages: formattedMessages,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1,
            }
        };
    }
    // Modifier un message
    async updateMessage(messageId, updateData, userId, userRole) {
        const message = await prisma.chatMessage.findUnique({
            where: { id: messageId },
            include: this.getMessageIncludes()
        });
        if (!message) {
            throw new errors_1.ValidationError('Message non trouvé');
        }
        if (message.isDeleted) {
            throw new errors_1.ValidationError('Ce message a été supprimé');
        }
        // Seul l'auteur ou un admin peut modifier
        if (message.authorId !== userId && userRole !== 'ADMINISTRATEUR') {
            throw new errors_1.AuthError('Permissions insuffisantes');
        }
        const updated = await prisma.chatMessage.update({
            where: { id: messageId },
            data: {
                content: updateData.content.trim(),
                isEdited: true,
                editedAt: new Date()
            },
            include: this.getMessageIncludes()
        });
        const formattedMessage = this.formatMessageResponse(updated, userId);
        // Émettre la mise à jour via WebSocket
        try {
            const wsService = (0, chatWebSocket_service_1.getChatWebSocketService)();
            wsService.emitMessageUpdated(message.channelId, formattedMessage);
        }
        catch (error) {
            console.error('Erreur lors de l\'émission WebSocket:', error);
        }
        return formattedMessage;
    }
    // Supprimer un message
    async deleteMessage(messageId, userId, userRole) {
        const message = await prisma.chatMessage.findUnique({
            where: { id: messageId },
            include: {
                channel: {
                    include: {
                        members: {
                            where: { userId: userId, leftAt: null }
                        }
                    }
                }
            }
        });
        if (!message) {
            throw new errors_1.ValidationError('Message non trouvé');
        }
        const member = message.channel.members[0];
        const canDelete = userRole === 'ADMINISTRATEUR' ||
            message.authorId === userId ||
            member?.role === chat_types_1.ChannelMemberRole.OWNER ||
            member?.role === chat_types_1.ChannelMemberRole.ADMIN ||
            member?.role === chat_types_1.ChannelMemberRole.MODERATOR;
        if (!canDelete) {
            throw new errors_1.AuthError('Permissions insuffisantes');
        }
        await prisma.chatMessage.update({
            where: { id: messageId },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                deletedBy: userId
            }
        });
        // Émettre la suppression via WebSocket
        try {
            const wsService = (0, chatWebSocket_service_1.getChatWebSocketService)();
            wsService.emitMessageDeleted(message.channelId, messageId);
        }
        catch (error) {
            console.error('Erreur lors de l\'émission WebSocket:', error);
        }
    }
    // Ajouter une réaction
    async addReaction(messageId, emoji, userId) {
        const message = await prisma.chatMessage.findUnique({
            where: { id: messageId },
            include: {
                channel: true
            }
        });
        if (!message || message.isDeleted) {
            throw new errors_1.ValidationError('Message non trouvé');
        }
        const reaction = await prisma.messageReaction.upsert({
            where: {
                messageId_userId_emoji: {
                    messageId,
                    userId,
                    emoji
                }
            },
            create: {
                messageId,
                userId,
                emoji
            },
            update: {},
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                        profileImage: true
                    }
                }
            }
        });
        // Émettre la réaction via WebSocket
        try {
            const wsService = (0, chatWebSocket_service_1.getChatWebSocketService)();
            wsService.emitReactionAdded(message.channelId, messageId, reaction);
        }
        catch (error) {
            console.error('Erreur lors de l\'émission WebSocket:', error);
        }
    }
    // Retirer une réaction
    async removeReaction(messageId, emoji, userId) {
        const message = await prisma.chatMessage.findUnique({
            where: { id: messageId },
            select: { channelId: true }
        });
        if (!message) {
            throw new errors_1.ValidationError('Message non trouvé');
        }
        await prisma.messageReaction.deleteMany({
            where: {
                messageId,
                userId,
                emoji
            }
        });
        // Émettre le retrait de réaction via WebSocket
        try {
            const wsService = (0, chatWebSocket_service_1.getChatWebSocketService)();
            wsService.emitReactionRemoved(message.channelId, messageId, { emoji, userId });
        }
        catch (error) {
            console.error('Erreur lors de l\'émission WebSocket:', error);
        }
    }
    // =============================================
    // STATISTIQUES ET MESSAGES NON LUS
    // =============================================
    // Obtenir les statistiques des canaux
    async getChannelStats(userId, userRole) {
        const whereClause = this.buildAccessWhere(userId, userRole);
        const [totalChannels, channelsByType, totalMessages, totalMembers, activeChannels, mostActive] = await Promise.all([
            prisma.channel.count({ where: whereClause }),
            prisma.channel.groupBy({
                by: ['type'],
                where: whereClause,
                _count: true
            }),
            prisma.chatMessage.count({
                where: {
                    channel: whereClause,
                    isDeleted: false
                }
            }),
            prisma.channelMember.count({
                where: {
                    channel: whereClause,
                    leftAt: null
                }
            }),
            prisma.channel.count({
                where: {
                    ...whereClause,
                    isArchived: false
                }
            }),
            prisma.channel.findMany({
                where: whereClause,
                include: {
                    _count: {
                        select: { messages: true }
                    }
                },
                orderBy: {
                    messages: {
                        _count: 'desc'
                    }
                },
                take: 5
            })
        ]);
        const byType = {
            GENERAL: 0,
            PROJECT: 0,
            THEME: 0,
            PRIVATE: 0,
            ANNOUNCEMENT: 0
        };
        channelsByType.forEach((item) => {
            byType[item.type] = item._count;
        });
        return {
            totalChannels,
            byType,
            totalMessages,
            totalMembers,
            activeChannels,
            mostActiveChannels: mostActive.map(ch => ({
                channelId: ch.id,
                channelName: ch.name,
                messageCount: ch._count.messages
            }))
        };
    }
    // Obtenir les messages non lus
    async getUnreadMessages(userId) {
        const memberships = await prisma.channelMember.findMany({
            where: {
                userId,
                leftAt: null
            },
            include: {
                channel: {
                    include: {
                        messages: {
                            where: {
                                isDeleted: false
                            },
                            orderBy: { createdAt: 'desc' },
                            take: 1,
                            include: this.getMessageIncludes()
                        }
                    }
                }
            }
        });
        const byChannel = await Promise.all(memberships.map(async (membership) => {
            const unreadCount = await prisma.chatMessage.count({
                where: {
                    channelId: membership.channelId,
                    isDeleted: false,
                    createdAt: membership.lastReadAt
                        ? { gt: membership.lastReadAt }
                        : undefined
                }
            });
            return {
                channelId: membership.channelId,
                channelName: membership.channel.name,
                unreadCount,
                lastMessage: membership.channel.messages[0]
                    ? this.formatMessageResponse(membership.channel.messages[0], userId)
                    : undefined
            };
        }));
        const totalUnread = byChannel.reduce((sum, ch) => sum + ch.unreadCount, 0);
        return {
            totalUnread,
            byChannel: byChannel.filter(ch => ch.unreadCount > 0)
        };
    }
    // =============================================
    // MÉTHODES UTILITAIRES PRIVÉES
    // =============================================
    async checkChannelAccess(channel, userId, userRole) {
        if (userRole === 'ADMINISTRATEUR') {
            return;
        }
        if (channel.isPrivate) {
            const member = await prisma.channelMember.findFirst({
                where: {
                    channelId: channel.id,
                    userId,
                    leftAt: null
                }
            });
            if (!member) {
                throw new errors_1.AuthError('Accès refusé à ce canal privé');
            }
        }
    }
    buildAccessWhere(userId, userRole) {
        if (userRole === 'ADMINISTRATEUR') {
            return {};
        }
        return {
            OR: [
                { isPrivate: false },
                {
                    members: {
                        some: {
                            userId,
                            leftAt: null
                        }
                    }
                }
            ]
        };
    }
    getChannelIncludes() {
        return {
            creator: {
                select: this.getUserSelect()
            },
            members: {
                where: { leftAt: null },
                include: {
                    user: {
                        select: this.getUserSelect()
                    }
                }
            },
            messages: {
                where: { isDeleted: false },
                orderBy: { createdAt: 'desc' },
                take: 1,
                include: this.getMessageIncludes()
            }
        };
    }
    getMessageIncludes() {
        return {
            author: {
                select: this.getUserSelect()
            },
            mentions: {
                include: {
                    user: {
                        select: this.getUserSelect()
                    }
                }
            },
            reactions: {
                include: {
                    user: {
                        select: this.getUserSelect()
                    }
                }
            },
            _count: {
                select: { replies: true }
            }
        };
    }
    getUserSelect() {
        return {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            profileImage: true
        };
    }
    async formatChannelResponse(channel, userId) {
        const memberCount = channel.members?.length || await prisma.channelMember.count({
            where: {
                channelId: channel.id,
                leftAt: null
            }
        });
        const currentMember = channel.members?.find((m) => m.userId === userId);
        let unreadCount = 0;
        if (currentMember) {
            unreadCount = await prisma.chatMessage.count({
                where: {
                    channelId: channel.id,
                    isDeleted: false,
                    createdAt: currentMember.lastReadAt
                        ? { gt: currentMember.lastReadAt }
                        : undefined
                }
            });
        }
        return {
            id: channel.id,
            name: channel.name,
            description: channel.description,
            type: channel.type,
            isPrivate: channel.isPrivate,
            isArchived: channel.isArchived,
            icon: channel.icon,
            color: channel.color,
            projectId: channel.projectId,
            themeId: channel.themeId,
            creator: channel.creator,
            createdAt: channel.createdAt,
            updatedAt: channel.updatedAt,
            memberCount,
            unreadCount,
            lastMessage: channel.messages?.[0]
                ? this.formatMessageResponse(channel.messages[0], userId)
                : null,
            currentUserRole: currentMember?.role,
            currentUserIsMember: !!currentMember
        };
    }
    formatMessageResponse(message, userId) {
        const canEdit = message.authorId === userId;
        const canDelete = message.authorId === userId;
        // Grouper les réactions par emoji
        const reactionsByEmoji = new Map();
        if (message.reactions) {
            message.reactions.forEach((reaction) => {
                if (!reactionsByEmoji.has(reaction.emoji)) {
                    reactionsByEmoji.set(reaction.emoji, {
                        emoji: reaction.emoji,
                        count: 0,
                        users: [],
                        currentUserReacted: false
                    });
                }
                const reactionData = reactionsByEmoji.get(reaction.emoji);
                reactionData.count++;
                reactionData.users.push(reaction.user);
                if (reaction.userId === userId) {
                    reactionData.currentUserReacted = true;
                }
            });
        }
        return {
            id: message.id,
            content: message.content,
            type: message.type,
            isEdited: message.isEdited,
            editedAt: message.editedAt,
            isDeleted: message.isDeleted,
            deletedAt: message.deletedAt,
            fileUrl: message.fileUrl,
            fileName: message.fileName,
            fileSize: message.fileSize,
            fileMimeType: message.fileMimeType,
            author: message.author,
            channelId: message.channelId,
            parentMessageId: message.parentMessageId,
            mentions: message.mentions?.map((m) => m.user) || [],
            reactions: Array.from(reactionsByEmoji.values()),
            replyCount: message._count?.replies || 0,
            canEdit,
            canDelete,
            createdAt: message.createdAt,
            updatedAt: message.updatedAt
        };
    }
    formatChannelMemberResponse(member) {
        return {
            id: member.id,
            role: member.role,
            isMuted: member.isMuted,
            lastReadAt: member.lastReadAt,
            lastReadMessageId: member.lastReadMessageId,
            notificationsEnabled: member.notificationsEnabled,
            joinedAt: member.joinedAt,
            user: member.user
        };
    }
}
exports.ChatService = ChatService;
//# sourceMappingURL=chat.service.js.map