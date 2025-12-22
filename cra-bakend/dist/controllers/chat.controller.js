"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatController = exports.ChatController = void 0;
const chat_service_1 = require("../services/chat.service");
const chatService = (0, chat_service_1.getChatService)();
class ChatController {
    constructor() {
        // =============================================
        // MESSAGES
        // =============================================
        // Envoyer un message
        this.sendMessage = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const message = await chatService.sendMessage(req.body, userId, userRole);
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
        // Lister les messages
        this.listMessages = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const result = await chatService.listMessages(req.query, userId, userRole);
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
        // =============================================
        // RÉACTIONS
        // =============================================
        // Ajouter une réaction
        this.addReaction = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { messageId } = req.params;
                const userId = authenticatedReq.user.userId;
                await chatService.addReaction(messageId, req.body, userId);
                res.status(200).json({
                    success: true,
                    message: 'Réaction ajoutée avec succès',
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
                await chatService.removeReaction(messageId, req.body, userId);
                res.status(200).json({
                    success: true,
                    message: 'Réaction retirée avec succès',
                });
            }
            catch (error) {
                next(error);
            }
        };
        // =============================================
        // UPLOAD
        // =============================================
        // Upload de fichier
        this.uploadFile = async (req, res, next) => {
            try {
                if (!req.file) {
                    return res.status(400).json({
                        success: false,
                        message: 'Aucun fichier fourni',
                    });
                }
                // Construire l'URL du fichier
                const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
                const fileUrl = `${baseUrl}/${req.file.path.replace(/\\/g, '/')}`;
                res.status(200).json({
                    success: true,
                    message: 'Fichier uploadé avec succès',
                    data: {
                        url: fileUrl,
                        filename: req.file.filename,
                        size: req.file.size,
                        mimeType: req.file.mimetype,
                    },
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.ChatController = ChatController;
// Export d'une instance unique
exports.chatController = new ChatController();
//# sourceMappingURL=chat.controller.js.map