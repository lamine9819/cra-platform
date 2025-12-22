"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/chat.routes.ts
const express_1 = require("express");
const chat_controller_1 = require("../controllers/chat.controller");
const auth_1 = require("../middlewares/auth");
const chatFileUpload_config_1 = require("../utils/chatFileUpload.config");
const router = (0, express_1.Router)();
// Toutes les routes nécessitent une authentification
router.use(auth_1.authenticate);
// =============================================
// ROUTES DES MESSAGES
// =============================================
// Uploader un fichier pour le chat
router.post('/upload', chatFileUpload_config_1.uploadChatFile.single('file'), chat_controller_1.chatController.uploadFile);
// Envoyer un message
router.post('/messages', chat_controller_1.chatController.sendMessage);
// Lister les messages
router.get('/messages', chat_controller_1.chatController.listMessages);
// Modifier un message
router.patch('/messages/:messageId', chat_controller_1.chatController.updateMessage);
// Supprimer un message
router.delete('/messages/:messageId', chat_controller_1.chatController.deleteMessage);
// =============================================
// ROUTES DES RÉACTIONS
// =============================================
// Ajouter une réaction à un message
router.post('/messages/:messageId/reactions', chat_controller_1.chatController.addReaction);
// Retirer une réaction d'un message
router.delete('/messages/:messageId/reactions', chat_controller_1.chatController.removeReaction);
exports.default = router;
//# sourceMappingURL=chat.routes.js.map