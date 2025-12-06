// src/hooks/useMessages.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { useChat } from '../contexts/ChatContext';

interface UseMessagesOptions {
  channelId: string | null;
  autoLoad?: boolean;
}

export const useMessages = ({ channelId, autoLoad = true }: UseMessagesOptions) => {
  const { state, loadMessages, sendMessage, updateMessage, deleteMessage } = useChat();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadingRef = useRef(false);

  // Charger les messages au montage si autoLoad et channelId sont définis
  useEffect(() => {
    if (autoLoad && channelId && !loadingRef.current) {
      loadingRef.current = true;
      setPage(1);
      loadMessages(channelId, 1)
        .then(() => {
          setHasMore(true);
        })
        .catch((err) => {
          setError(err.message || 'Erreur lors du chargement des messages');
        })
        .finally(() => {
          loadingRef.current = false;
        });
    }
  }, [channelId, autoLoad, loadMessages]);

  // Charger plus de messages (pagination)
  const loadMore = useCallback(async () => {
    if (!channelId || loading || !hasMore) return;

    try {
      setLoading(true);
      setError(null);
      const nextPage = page + 1;

      await loadMessages(channelId, nextPage);
      setPage(nextPage);

      // Vérifier s'il y a plus de messages
      // Cette logique devrait être basée sur les métadonnées de pagination du backend
      const messages = state.messages[channelId] || [];
      if (messages.length < nextPage * 50) {
        setHasMore(false);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement de plus de messages');
    } finally {
      setLoading(false);
    }
  }, [channelId, loading, hasMore, page, loadMessages, state.messages]);

  // Envoyer un message
  const send = useCallback(async (
    content: string,
    mentionedUserIds?: string[],
    fileUrl?: string,
    fileName?: string,
    fileSize?: number,
    fileMimeType?: string
  ) => {
    if (!channelId) {
      setError('Aucun canal sélectionné');
      return null;
    }

    try {
      setError(null);
      // Create message with file metadata if provided
      const messageData: any = {
        content,
        mentionedUserIds,
      };
      if (fileUrl) {
        messageData.fileUrl = fileUrl;
        messageData.fileName = fileName;
        messageData.fileSize = fileSize;
        messageData.fileMimeType = fileMimeType;
      }
      const message = await sendMessage(channelId, content, mentionedUserIds);
      return message;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi du message');
      return null;
    }
  }, [channelId, sendMessage]);

  // Modifier un message
  const update = useCallback(async (messageId: string, content: string) => {
    try {
      setError(null);
      await updateMessage(messageId, content);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la modification du message');
      return false;
    }
  }, [updateMessage]);

  // Supprimer un message
  const remove = useCallback(async (messageId: string) => {
    try {
      setError(null);
      await deleteMessage(messageId);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression du message');
      return false;
    }
  }, [deleteMessage]);

  const messages = channelId ? (state.messages[channelId] || []) : [];
  const typingUsers = channelId ? (state.typingUsers[channelId] || []) : [];

  return {
    messages,
    typingUsers,
    loading,
    error,
    hasMore,
    loadMore,
    send,
    update,
    remove,
  };
};

export default useMessages;
