"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/chat.routes.ts
const express_1 = require("express");
const chat_controller_1 = require("../controllers/chat.controller");
const auth_1 = require("../middlewares/auth");
const chatFileUpload_config_1 = require("../utils/chatFileUpload.config");
const router = (0, express_1.Router)();
const chatController = new chat_controller_1.ChatController();
// Toutes les routes nécessitent une authentification
router.use(auth_1.authenticate);
// =============================================
// ROUTES DES STATISTIQUES (avant /:channelId)
// =============================================
router.get('/stats', chatController.getStats);
router.get('/unread', chatController.getUnreadMessages);
// =============================================
// ROUTES DES CANAUX
// =============================================
// Créer un canal
router.post('/channels', chatController.createChannel);
// Lister les canaux
router.get('/channels', chatController.listChannels);
// Obtenir un canal spécifique
router.get('/channels/:channelId', chatController.getChannelById);
// Mettre à jour un canal
router.patch('/channels/:channelId', chatController.updateChannel);
// Supprimer un canal
router.delete('/channels/:channelId', chatController.deleteChannel);
// =============================================
// ROUTES DES MEMBRES
// =============================================
// Ajouter des membres à un canal
router.post('/channels/:channelId/members', chatController.addMembers);
// Lister les membres d'un canal
router.get('/channels/:channelId/members', chatController.listMembers);
// Mettre à jour le rôle d'un membre
router.patch('/channels/:channelId/members/:userId', chatController.updateMemberRole);
// Retirer un membre d'un canal
router.delete('/channels/:channelId/members/:userId', chatController.removeMember);
// Quitter un canal
router.post('/channels/:channelId/leave', chatController.leaveChannel);
// Marquer les messages comme lus
router.post('/channels/:channelId/read', chatController.markAsRead);
// =============================================
// ROUTES DES MESSAGES
// =============================================
// Uploader un fichier pour le chat
router.post('/upload', chatFileUpload_config_1.uploadChatFile.single('file'), chatController.uploadFile);
// Envoyer un message dans un canal
router.post('/channels/:channelId/messages', chatController.sendMessage);
// Lister les messages d'un canal
router.get('/channels/:channelId/messages', chatController.listMessages);
// Modifier un message
router.patch('/messages/:messageId', chatController.updateMessage);
// Supprimer un message
router.delete('/messages/:messageId', chatController.deleteMessage);
// Ajouter une réaction à un message
router.post('/messages/:messageId/reactions', chatController.addReaction);
// Retirer une réaction d'un message
router.delete('/messages/:messageId/reactions', chatController.removeReaction);
exports.default = router;
//# sourceMappingURL=chat.routes.js.map