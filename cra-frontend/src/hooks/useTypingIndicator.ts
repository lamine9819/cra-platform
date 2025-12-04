// src/hooks/useTypingIndicator.ts
import { useCallback, useEffect, useRef } from 'react';
import { useChat } from '../contexts/ChatContext';

interface UseTypingIndicatorOptions {
  channelId: string | null;
  userName: string;
  debounceMs?: number;
}

export const useTypingIndicator = ({
  channelId,
  userName,
  debounceMs = 3000,
}: UseTypingIndicatorOptions) => {
  const { startTyping, stopTyping } = useChat();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // Nettoyer le timeout au démontage
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (isTypingRef.current && channelId) {
        stopTyping(channelId);
      }
    };
  }, [channelId, stopTyping]);

  // Fonction appelée quand l'utilisateur tape
  const handleTyping = useCallback(() => {
    if (!channelId) return;

    // Nettoyer le timeout précédent
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Si ce n'est pas déjà en train de taper, envoyer l'événement
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      startTyping(channelId, userName);
    }

    // Créer un nouveau timeout pour arrêter
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        stopTyping(channelId);
      }
    }, debounceMs);
  }, [channelId, userName, debounceMs, startTyping, stopTyping]);

  // Fonction pour arrêter manuellement l'indicateur
  const handleStopTyping = useCallback(() => {
    if (!channelId) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (isTypingRef.current) {
      isTypingRef.current = false;
      stopTyping(channelId);
    }
  }, [channelId, stopTyping]);

  return {
    handleTyping,
    handleStopTyping,
  };
};

export default useTypingIndicator;
