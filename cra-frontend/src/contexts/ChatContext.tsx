// src/contexts/ChatContext.tsx
import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { Message, ChatState, ChatAction } from '../types/chat.types';
import chatWebSocketService from '../services/chatWebSocket';
import chatApi from '../services/chatApi';

// =============================================
// REDUCER
// =============================================

const initialState: ChatState = {
  messages: [],
  isConnected: false,
  isLoading: false,
  error: null,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };

    case 'PREPEND_MESSAGES':
      // Ajouter des messages au début (pour la pagination)
      return { ...state, messages: [...action.payload, ...state.messages] };

    case 'ADD_MESSAGE':
      // Éviter les doublons (ex: message déjà ajouté de manière optimiste puis reçu via WebSocket)
      const messageExists = state.messages.some(msg => msg.id === action.payload.id);
      if (messageExists) {
        return state;
      }
      return { ...state, messages: [...state.messages, action.payload] };

    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id ? action.payload : msg
        ),
      };

    case 'REMOVE_MESSAGE':
      return {
        ...state,
        messages: state.messages.filter(msg => msg.id !== action.payload),
      };

    case 'SET_IS_CONNECTED':
      return { ...state, isConnected: action.payload };

    case 'SET_IS_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

// =============================================
// CONTEXT
// =============================================

interface ChatContextValue {
  state: ChatState;
  loadMessages: (page?: number) => Promise<void>;
  sendMessage: (content: string, fileUrl?: string, fileName?: string, fileSize?: number, fileMimeType?: string) => Promise<Message>;
  updateMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  removeReaction: (messageId: string, emoji: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

// =============================================
// PROVIDER
// =============================================

interface ChatProviderProps {
  children: ReactNode;
  token?: string;
}

export function ChatProvider({ children, token }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // ========================================
  // WEBSOCKET SETUP
  // ========================================

  useEffect(() => {
    if (!token) return;

    const setupWebSocket = async () => {
      try {
        await chatWebSocketService.connect(token);
        dispatch({ type: 'SET_IS_CONNECTED', payload: true });
      } catch (error) {
        console.error('Erreur de connexion WebSocket:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Erreur de connexion temps réel' });
      }
    };

    setupWebSocket();

    // Écouter les événements WebSocket
    const unsubscribers = [
      chatWebSocketService.on('connected', () => {
        dispatch({ type: 'SET_IS_CONNECTED', payload: true });
      }),

      chatWebSocketService.on('disconnected', () => {
        dispatch({ type: 'SET_IS_CONNECTED', payload: false });
      }),

      chatWebSocketService.on('new_message', (data: any) => {
        if (data.data) {
          dispatch({ type: 'ADD_MESSAGE', payload: data.data });
        }
      }),

      chatWebSocketService.on('message_updated', (data: any) => {
        if (data.data) {
          dispatch({ type: 'UPDATE_MESSAGE', payload: data.data });
        }
      }),

      chatWebSocketService.on('message_deleted', (data: any) => {
        if (data.data?.messageId) {
          dispatch({ type: 'REMOVE_MESSAGE', payload: data.data.messageId });
        }
      }),

      chatWebSocketService.on('reaction_added', (data: any) => {
        // Recharger le message pour obtenir les réactions mises à jour
        if (data.data?.messageId) {
          loadMessageById(data.data.messageId);
        }
      }),

      chatWebSocketService.on('reaction_removed', (data: any) => {
        // Recharger le message pour obtenir les réactions mises à jour
        if (data.data?.messageId) {
          loadMessageById(data.data.messageId);
        }
      }),
    ];

    // Cleanup
    return () => {
      unsubscribers.forEach(unsub => unsub());
      chatWebSocketService.disconnect();
    };
  }, [token]);

  // ========================================
  // API METHODS
  // ========================================

  const loadMessages = useCallback(async (page: number = 1) => {
    try {
      dispatch({ type: 'SET_IS_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const result = await chatApi.listMessages({ page, limit: 50 });

      if (page === 1) {
        dispatch({ type: 'SET_MESSAGES', payload: result.messages });
      } else {
        // Ajouter les messages plus anciens au début
        dispatch({ type: 'PREPEND_MESSAGES', payload: result.messages });
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des messages:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Erreur lors du chargement des messages' });
    } finally {
      dispatch({ type: 'SET_IS_LOADING', payload: false });
    }
  }, []); // Pas de dépendances - utilise dispatch qui est stable

  const loadMessageById = async (messageId: string) => {
    try {
      // Recharger tous les messages pour obtenir le message mis à jour
      // (Une approche plus optimisée serait d'avoir un endpoint GET /messages/:id)
      await loadMessages(1);
    } catch (error) {
      console.error('Erreur lors du rechargement du message:', error);
    }
  };

  const sendMessage = useCallback(async (
    content: string,
    fileUrl?: string,
    fileName?: string,
    fileSize?: number,
    fileMimeType?: string
  ): Promise<Message> => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });

      const message = await chatApi.sendMessage({
        content,
        fileUrl,
        fileName,
        fileSize,
        fileMimeType,
      });

      // Ajouter immédiatement le message (mise à jour optimiste)
      dispatch({ type: 'ADD_MESSAGE', payload: message });

      return message;
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du message:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Erreur lors de l\'envoi du message' });
      throw error;
    }
  }, []);

  const updateMessage = useCallback(async (messageId: string, content: string) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });

      const updatedMessage = await chatApi.updateMessage(messageId, { content });

      // Mettre à jour immédiatement le message (mise à jour optimiste)
      dispatch({ type: 'UPDATE_MESSAGE', payload: updatedMessage });
    } catch (error: any) {
      console.error('Erreur lors de la modification du message:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Erreur lors de la modification du message' });
      throw error;
    }
  }, []);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });

      await chatApi.deleteMessage(messageId);

      // Supprimer immédiatement le message (mise à jour optimiste)
      dispatch({ type: 'REMOVE_MESSAGE', payload: messageId });
    } catch (error: any) {
      // Ignorer l'erreur si le message est déjà supprimé (probablement via WebSocket)
      if (error.response?.status === 400 && error.response?.data?.message?.includes('déjà supprimé')) {
        console.log('Message déjà supprimé, ignoré silencieusement');
        // Supprimer quand même le message du state local
        dispatch({ type: 'REMOVE_MESSAGE', payload: messageId });
        return;
      }
      console.error('Erreur lors de la suppression du message:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Erreur lors de la suppression du message' });
      throw error;
    }
  }, []);

  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });

      await chatApi.addReaction(messageId, { emoji });

      // La réaction sera propagée via WebSocket
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout de la réaction:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Erreur lors de l\'ajout de la réaction' });
      throw error;
    }
  }, []);

  const removeReaction = useCallback(async (messageId: string, emoji: string) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });

      await chatApi.removeReaction(messageId, { emoji });

      // Le retrait sera propagé via WebSocket
    } catch (error: any) {
      console.error('Erreur lors du retrait de la réaction:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Erreur lors du retrait de la réaction' });
      throw error;
    }
  }, []);

  // ========================================
  // PROVIDER VALUE
  // ========================================

  const value: ChatContextValue = {
    state,
    loadMessages,
    sendMessage,
    updateMessage,
    deleteMessage,
    addReaction,
    removeReaction,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

// =============================================
// HOOK
// =============================================

export function useChat(): ChatContextValue {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat doit être utilisé à l\'intérieur d\'un ChatProvider');
  }
  return context;
}
