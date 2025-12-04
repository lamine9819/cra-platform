// src/hooks/useChannels.ts
import { useState, useCallback } from 'react';
import chatApi from '../services/chatApi';
import {
  Channel,
  CreateChannelRequest,
  UpdateChannelRequest,
  ChannelListQuery,
} from '../types/chat.types';

export const useChannels = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createChannel = useCallback(async (data: CreateChannelRequest): Promise<Channel | null> => {
    try {
      setLoading(true);
      setError(null);
      const channel = await chatApi.createChannel(data);
      return channel;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création du canal');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateChannel = useCallback(async (
    channelId: string,
    data: UpdateChannelRequest
  ): Promise<Channel | null> => {
    try {
      setLoading(true);
      setError(null);
      const channel = await chatApi.updateChannel(channelId, data);
      return channel;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du canal');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteChannel = useCallback(async (channelId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await chatApi.deleteChannel(channelId);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression du canal');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const listChannels = useCallback(async (query?: ChannelListQuery) => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatApi.listChannels(query);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des canaux');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createChannel,
    updateChannel,
    deleteChannel,
    listChannels,
  };
};

export default useChannels;
