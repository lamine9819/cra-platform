// src/routes/chat.routes.ts
import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { authenticate } from '../middlewares/auth';
import { uploadChatFile } from '../utils/chatFileUpload.config';

const router = Router();
const chatController = new ChatController();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

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
router.post('/upload', uploadChatFile.single('file'), chatController.uploadFile);

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

export default router;
