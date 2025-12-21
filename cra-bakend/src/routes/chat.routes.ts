// src/routes/chat.routes.ts
import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';
import { authenticate } from '../middlewares/auth';
import { uploadChatFile } from '../utils/chatFileUpload.config';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// =============================================
// ROUTES DES MESSAGES
// =============================================

// Uploader un fichier pour le chat
router.post('/upload', uploadChatFile.single('file'), chatController.uploadFile);

// Envoyer un message
router.post('/messages', chatController.sendMessage);

// Lister les messages
router.get('/messages', chatController.listMessages);

// Modifier un message
router.patch('/messages/:messageId', chatController.updateMessage);

// Supprimer un message
router.delete('/messages/:messageId', chatController.deleteMessage);

// =============================================
// ROUTES DES RÉACTIONS
// =============================================

// Ajouter une réaction à un message
router.post('/messages/:messageId/reactions', chatController.addReaction);

// Retirer une réaction d'un message
router.delete('/messages/:messageId/reactions', chatController.removeReaction);

export default router;
