// src/services/chatApi.ts
import api from './api';
import {
  Message,
  CreateMessageRequest,
  UpdateMessageRequest,
  AddReactionRequest,
  MessageListQuery,
  PaginatedMessagesResponse,
} from '../types/chat.types';

// =============================================
// MESSAGES
// =============================================

export const chatApi = {
  // Envoyer un message
  sendMessage: async (data: CreateMessageRequest): Promise<Message> => {
    const response = await api.post('/chat/messages', data);
    return response.data.data;
  },

  // Lister les messages
  listMessages: async (query?: MessageListQuery): Promise<PaginatedMessagesResponse> => {
    const response = await api.get('/chat/messages', { params: query });
    return {
      messages: response.data.data,
      pagination: response.data.pagination,
    };
  },

  // Modifier un message
  updateMessage: async (messageId: string, data: UpdateMessageRequest): Promise<Message> => {
    const response = await api.patch(`/chat/messages/${messageId}`, data);
    return response.data.data;
  },

  // Supprimer un message
  deleteMessage: async (messageId: string): Promise<void> => {
    await api.delete(`/chat/messages/${messageId}`);
  },

  // =============================================
  // UPLOAD DE FICHIERS
  // =============================================

  // Uploader un fichier
  uploadFile: async (file: File): Promise<{ url: string; filename: string; size: number; mimeType: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/chat/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // =============================================
  // RÉACTIONS
  // =============================================

  // Ajouter une réaction
  addReaction: async (messageId: string, data: AddReactionRequest): Promise<void> => {
    await api.post(`/chat/messages/${messageId}/reactions`, data);
  },

  // Retirer une réaction
  removeReaction: async (messageId: string, data: AddReactionRequest): Promise<void> => {
    await api.delete(`/chat/messages/${messageId}/reactions`, { data });
  },
};

export default chatApi;
