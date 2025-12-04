// src/services/chatApi.ts
import api from './api';
import {
  Channel,
  ChannelMember,
  Message,
  CreateChannelRequest,
  UpdateChannelRequest,
  CreateMessageRequest,
  UpdateMessageRequest,
  AddChannelMembersRequest,
  UpdateMemberRoleRequest,
  AddReactionRequest,
  ChannelListQuery,
  MessageListQuery,
  PaginatedChannelsResponse,
  PaginatedMessagesResponse,
  ChannelStatsResponse,
  UnreadMessagesResponse,
} from '../types/chat.types';

// =============================================
// CANAUX
// =============================================

export const chatApi = {
  // Créer un canal
  createChannel: async (data: CreateChannelRequest): Promise<Channel> => {
    const response = await api.post('/chat/channels', data);
    return response.data.data;
  },

  // Lister les canaux
  listChannels: async (query?: ChannelListQuery): Promise<PaginatedChannelsResponse> => {
    const response = await api.get('/chat/channels', { params: query });
    return {
      channels: response.data.data,
      pagination: response.data.pagination,
    };
  },

  // Obtenir un canal par ID
  getChannel: async (channelId: string): Promise<Channel> => {
    const response = await api.get(`/chat/channels/${channelId}`);
    return response.data.data;
  },

  // Mettre à jour un canal
  updateChannel: async (channelId: string, data: UpdateChannelRequest): Promise<Channel> => {
    const response = await api.patch(`/chat/channels/${channelId}`, data);
    return response.data.data;
  },

  // Supprimer un canal
  deleteChannel: async (channelId: string): Promise<void> => {
    await api.delete(`/chat/channels/${channelId}`);
  },

  // =============================================
  // MEMBRES
  // =============================================

  // Ajouter des membres
  addMembers: async (channelId: string, data: AddChannelMembersRequest): Promise<ChannelMember[]> => {
    const response = await api.post(`/chat/channels/${channelId}/members`, data);
    return response.data.data;
  },

  // Lister les membres
  listMembers: async (channelId: string): Promise<ChannelMember[]> => {
    const response = await api.get(`/chat/channels/${channelId}/members`);
    return response.data.data;
  },

  // Mettre à jour le rôle d'un membre
  updateMemberRole: async (
    channelId: string,
    userId: string,
    data: UpdateMemberRoleRequest
  ): Promise<ChannelMember> => {
    const response = await api.patch(`/chat/channels/${channelId}/members/${userId}`, data);
    return response.data.data;
  },

  // Retirer un membre
  removeMember: async (channelId: string, userId: string): Promise<void> => {
    await api.delete(`/chat/channels/${channelId}/members/${userId}`);
  },

  // Quitter un canal
  leaveChannel: async (channelId: string): Promise<void> => {
    await api.post(`/chat/channels/${channelId}/leave`);
  },

  // Marquer comme lu
  markAsRead: async (channelId: string): Promise<void> => {
    await api.post(`/chat/channels/${channelId}/read`);
  },

  // =============================================
  // MESSAGES
  // =============================================

  // Envoyer un message
  sendMessage: async (channelId: string, data: CreateMessageRequest): Promise<Message> => {
    const response = await api.post(`/chat/channels/${channelId}/messages`, data);
    return response.data.data;
  },

  // Lister les messages
  listMessages: async (
    channelId: string,
    query?: MessageListQuery
  ): Promise<PaginatedMessagesResponse> => {
    const response = await api.get(`/chat/channels/${channelId}/messages`, { params: query });
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

  // =============================================
  // STATISTIQUES
  // =============================================

  // Obtenir les statistiques
  getStats: async (): Promise<ChannelStatsResponse> => {
    const response = await api.get('/chat/stats');
    return response.data.data;
  },

  // Obtenir les messages non lus
  getUnreadMessages: async (): Promise<UnreadMessagesResponse> => {
    const response = await api.get('/chat/unread');
    return response.data.data;
  },
};

export default chatApi;
