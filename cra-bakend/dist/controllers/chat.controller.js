"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const chat_service_1 = require("../services/chat.service");
const chatService = new chat_service_1.ChatService();
class ChatController {
    constructor() {
        // =============================================
        // CANAUX
        // =============================================
        // Créer un canal
        this.createChannel = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const channel = await chatService.createChannel(req.body, userId, userRole);
                res.status(201).json({
                    success: true,
                    message: 'Canal créé avec succès',
                    data: channel,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Lister les canaux
        this.listChannels = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const result = await chatService.listChannels(userId, userRole, req.query);
                res.status(200).json({
                    success: true,
                    data: result.channels,
                    pagination: result.pagination,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Obtenir un canal par ID
        this.getChannelById = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { channelId } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const channel = await chatService.getChannelById(channelId, userId, userRole);
                res.status(200).json({
                    success: true,
                    data: channel,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Mettre à jour un canal
        this.updateChannel = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { channelId } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const channel = await chatService.updateChannel(channelId, req.body, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: 'Canal mis à jour avec succès',
                    data: channel,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Supprimer un canal
        this.deleteChannel = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { channelId } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                await chatService.deleteChannel(channelId, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: 'Canal supprimé avec succès',
                });
            }
            catch (error) {
                next(error);
            }
        };
        // =============================================
        // MEMBRES
        // =============================================
        // Ajouter des membres à un canal
        this.addMembers = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { channelId } = req.params;
                const userId = authenticatedReq.user.userId;
                const { userIds, role } = req.body;
                const members = await chatService.addMembersToChannel(channelId, userIds, userId, role);
                res.status(200).json({
                    success: true,
                    message: 'Membres ajoutés avec succès',
                    data: members,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Retirer un membre
        this.removeMember = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { channelId, userId: userIdToRemove } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                await chatService.removeMemberFromChannel(channelId, userIdToRemove, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: 'Membre retiré avec succès',
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Mettre à jour le rôle d'un membre
        this.updateMemberRole = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { channelId, userId: userIdToUpdate } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const { role } = req.body;
                const member = await chatService.updateMemberRole(channelId, userIdToUpdate, role, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: 'Rôle mis à jour avec succès',
                    data: member,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Lister les membres d'un canal
        this.listMembers = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { channelId } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const members = await chatService.getChannelMembers(channelId, userId, userRole);
                res.status(200).json({
                    success: true,
                    data: members,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Quitter un canal
        this.leaveChannel = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { channelId } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                await chatService.removeMemberFromChannel(channelId, userId, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: 'Vous avez quitté le canal',
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Marquer comme lu
        this.markAsRead = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { channelId } = req.params;
                const userId = authenticatedReq.user.userId;
                await chatService.markChannelAsRead(channelId, userId);
                res.status(200).json({
                    success: true,
                    message: 'Canal marqué comme lu',
                });
            }
            catch (error) {
                next(error);
            }
        };
        // =============================================
        // MESSAGES
        // =============================================
        // Envoyer un message
        this.sendMessage = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { channelId } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const message = await chatService.sendMessage(channelId, req.body, userId, userRole);
                res.status(201).json({
                    success: true,
                    message: 'Message envoyé avec succès',
                    data: message,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Lister les messages d'un canal
        this.listMessages = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { channelId } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const result = await chatService.listMessages(channelId, userId, userRole, req.query);
                res.status(200).json({
                    success: true,
                    data: result.messages,
                    pagination: result.pagination,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Modifier un message
        this.updateMessage = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { messageId } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const message = await chatService.updateMessage(messageId, req.body, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: 'Message modifié avec succès',
                    data: message,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Supprimer un message
        this.deleteMessage = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { messageId } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                await chatService.deleteMessage(messageId, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: 'Message supprimé avec succès',
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Ajouter une réaction
        this.addReaction = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { messageId } = req.params;
                const userId = authenticatedReq.user.userId;
                const { emoji } = req.body;
                await chatService.addReaction(messageId, emoji, userId);
                res.status(200).json({
                    success: true,
                    message: 'Réaction ajoutée',
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Retirer une réaction
        this.removeReaction = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { messageId } = req.params;
                const userId = authenticatedReq.user.userId;
                const { emoji } = req.body;
                await chatService.removeReaction(messageId, emoji, userId);
                res.status(200).json({
                    success: true,
                    message: 'Réaction retirée',
                });
            }
            catch (error) {
                next(error);
            }
        };
        // =============================================
        // UPLOAD DE FICHIERS
        // =============================================
        // Uploader un fichier
        this.uploadFile = async (req, res, next) => {
            try {
                if (!req.file) {
                    return res.status(400).json({
                        success: false,
                        message: 'Aucun fichier fourni'
                    });
                }
                // Retourner les informations du fichier
                const fileUrl = `/uploads/chat/${req.file.filename}`;
                res.status(200).json({
                    success: true,
                    data: {
                        url: fileUrl,
                        filename: req.file.originalname,
                        size: req.file.size,
                        mimeType: req.file.mimetype
                    }
                });
            }
            catch (error) {
                next(error);
            }
        };
        // =============================================
        // STATISTIQUES
        // =============================================
        // Obtenir les statistiques
        this.getStats = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const stats = await chatService.getChannelStats(userId, userRole);
                res.status(200).json({
                    success: true,
                    data: stats,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Obtenir les messages non lus
        this.getUnreadMessages = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const userId = authenticatedReq.user.userId;
                const unread = await chatService.getUnreadMessages(userId);
                res.status(200).json({
                    success: true,
                    data: unread,
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.ChatController = ChatController;
//# sourceMappingURL=chat.controller.js.map