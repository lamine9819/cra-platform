// src/contexts/ChatContext.tsx
import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { Channel, Message, TypingIndicator, ChatState, WebSocketMessage } from '../types/chat.types';
import chatWebSocketService from '../services/chatWebSocket';
import chatApi from '../services/chatApi';

// =============================================
// ACTIONS
// =============================================

type ChatAction =
  | { type: 'SET_CHANNELS'; payload: Channel[] }
  | { type: 'ADD_CHANNEL'; payload: Channel }
  | { type: 'UPDATE_CHANNEL'; payload: Channel }
  | { type: 'REMOVE_CHANNEL'; payload: string }
  | { type: 'SET_CURRENT_CHANNEL'; payload: Channel | null }
  | { type: 'SET_MESSAGES'; payload: { channelId: string; messages: Message[] } }
  | { type: 'ADD_MESSAGE'; payload: { channelId: string; message: Message } }
  | { type: 'UPDATE_MESSAGE'; payload: { channelId: string; message: Message } }
  | { type: 'REMOVE_MESSAGE'; payload: { channelId: string; messageId: string } }
  | { type: 'SET_TYPING_USERS'; payload: { channelId: string; users: TypingIndicator[] } }
  | { type: 'ADD_TYPING_USER'; payload: TypingIndicator }
  | { type: 'REMOVE_TYPING_USER'; payload: { channelId: string; userId: string } }
  | { type: 'SET_UNREAD_COUNT'; payload: { channelId: string; count: number } }
  | { type: 'SET_IS_CONNECTED'; payload: boolean }
  | { type: 'SET_IS_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_MESSAGES'; payload: string };

// =============================================
// REDUCER
// =============================================

const initialState: ChatState = {
  channels: [],
  currentChannel: null,
  messages: {},
  typingUsers: {},
  unreadCounts: {},
  isConnected: false,
  isLoading: false,
  error: null,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_CHANNELS':
      return { ...state, channels: action.payload };

    case 'ADD_CHANNEL':
      return { ...state, channels: [action.payload, ...state.channels] };

    case 'UPDATE_CHANNEL':
      return {
        ...state,
        channels: state.channels.map(ch => ch.id === action.payload.id ? action.payload : ch),
        currentChannel: state.currentChannel?.id === action.payload.id ? action.payload : state.currentChannel,
      };

    case 'REMOVE_CHANNEL':
      return {
        ...state,
        channels: state.channels.filter(ch => ch.id !== action.payload),
        currentChannel: state.currentChannel?.id === action.payload ? null : state.currentChannel,
      };

    case 'SET_CURRENT_CHANNEL':
      return { ...state, currentChannel: action.payload };

    case 'SET_MESSAGES':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.channelId]: action.payload.messages,
        },
      };

    case 'ADD_MESSAGE':
      const currentMessages = state.messages[action.payload.channelId] || [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.channelId]: [...currentMessages, action.payload.message],
        },
      };

    case 'UPDATE_MESSAGE':
      const messagesForUpdate = state.messages[action.payload.channelId] || [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.channelId]: messagesForUpdate.map(msg =>
            msg.id === action.payload.message.id ? action.payload.message : msg
          ),
        },
      };

    case 'REMOVE_MESSAGE':
      const messagesForRemoval = state.messages[action.payload.channelId] || [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.channelId]: messagesForRemoval.filter(msg => msg.id !== action.payload.messageId),
        },
      };

    case 'CLEAR_MESSAGES':
      const { [action.payload]: _, ...remainingMessages } = state.messages;
      return { ...state, messages: remainingMessages };

    case 'SET_TYPING_USERS':
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [action.payload.channelId]: action.payload.users,
        },
      };

    case 'ADD_TYPING_USER':
      const currentTyping = state.typingUsers[action.payload.channelId] || [];
      const existingIndex = currentTyping.findIndex(u => u.userId === action.payload.userId);

      if (existingIndex >= 0) {
        // Mettre à jour l'utilisateur existant
        const updatedTyping = [...currentTyping];
        updatedTyping[existingIndex] = action.payload;
        return {
          ...state,
          typingUsers: {
            ...state.typingUsers,
            [action.payload.channelId]: updatedTyping,
          },
        };
      } else {
        // Ajouter le nouvel utilisateur
        return {
          ...state,
          typingUsers: {
            ...state.typingUsers,
            [action.payload.channelId]: [...currentTyping, action.payload],
          },
        };
      }

    case 'REMOVE_TYPING_USER':
      const typingForRemoval = state.typingUsers[action.payload.channelId] || [];
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [action.payload.channelId]: typingForRemoval.filter(u => u.userId !== action.payload.userId),
        },
      };

    case 'SET_UNREAD_COUNT':
      return {
        ...state,
        unreadCounts: {
          ...state.unreadCounts,
          [action.payload.channelId]: action.payload.count,
        },
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
  dispatch: React.Dispatch<ChatAction>;
  loadChannels: () => Promise<void>;
  loadMessages: (channelId: string, page?: number) => Promise<void>;
  sendMessage: (channelId: string, content: string, mentionedUserIds?: string[]) => Promise<Message>;
  updateMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  joinChannel: (channelId: string) => Promise<void>;
  leaveChannel: (channelId: string) => Promise<void>;
  markChannelAsRead: (channelId: string) => Promise<void>;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  removeReaction: (messageId: string, emoji: string) => Promise<void>;
  startTyping: (channelId: string, userName: string) => void;
  stopTyping: (channelId: string) => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

// =============================================
// PROVIDER
// =============================================

interface ChatProviderProps {
  children: ReactNode;
  token?: string;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children, token }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Connexion WebSocket
  useEffect(() => {
    if (!token) return;

    const connectWebSocket = async () => {
      try {
        await chatWebSocketService.connect(token);
        dispatch({ type: 'SET_IS_CONNECTED', payload: true });
      } catch (error) {
        console.error('Erreur de connexion WebSocket:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Impossible de se connecter au chat en temps réel' });
      }
    };

    connectWebSocket();

    return () => {
      chatWebSocketService.disconnect();
      dispatch({ type: 'SET_IS_CONNECTED', payload: false });
    };
  }, [token]);

  // Écouter les événements WebSocket
  useEffect(() => {
    const unsubscribeFns: (() => void)[] = [];

    // Nouveau message
    unsubscribeFns.push(
      chatWebSocketService.on('new_message', (data: WebSocketMessage) => {
        dispatch({
          type: 'ADD_MESSAGE',
          payload: { channelId: data.channelId, message: data.data },
        });
      })
    );

    // Message modifié
    unsubscribeFns.push(
      chatWebSocketService.on('message_updated', (data: WebSocketMessage) => {
        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: { channelId: data.channelId, message: data.data },
        });
      })
    );

    // Message supprimé
    unsubscribeFns.push(
      chatWebSocketService.on('message_deleted', (data: WebSocketMessage) => {
        dispatch({
          type: 'REMOVE_MESSAGE',
          payload: { channelId: data.channelId, messageId: data.data.messageId },
        });
      })
    );

    // Utilisateur en train de taper
    unsubscribeFns.push(
      chatWebSocketService.on('user_typing', (data: TypingIndicator) => {
        if (data.isTyping) {
          dispatch({ type: 'ADD_TYPING_USER', payload: data });
        } else {
          dispatch({
            type: 'REMOVE_TYPING_USER',
            payload: { channelId: data.channelId, userId: data.userId },
          });
        }
      })
    );

    // Canal modifié
    unsubscribeFns.push(
      chatWebSocketService.on('channel_updated', (data: WebSocketMessage) => {
        dispatch({ type: 'UPDATE_CHANNEL', payload: data.data });
      })
    );

    return () => {
      unsubscribeFns.forEach(fn => fn());
    };
  }, []);

  // Charger les canaux
  const loadChannels = useCallback(async () => {
    try {
      dispatch({ type: 'SET_IS_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await chatApi.listChannels({ limit: 100 });
      dispatch({ type: 'SET_CHANNELS', payload: response.channels });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Erreur lors du chargement des canaux' });
      console.error('Erreur loadChannels:', error);
    } finally {
      dispatch({ type: 'SET_IS_LOADING', payload: false });
    }
  }, []);

  // Charger les messages
  const loadMessages = useCallback(async (channelId: string, page = 1) => {
    try {
      dispatch({ type: 'SET_IS_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await chatApi.listMessages(channelId, { page, limit: 50 });

      // Inverser pour avoir les plus anciens en premier
      const messages = response.messages.reverse();

      if (page === 1) {
        dispatch({ type: 'SET_MESSAGES', payload: { channelId, messages } });
      } else {
        // Ajouter au début pour la pagination
        messages.forEach(message => {
          dispatch({ type: 'ADD_MESSAGE', payload: { channelId, message } });
        });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Erreur lors du chargement des messages' });
      console.error('Erreur loadMessages:', error);
    } finally {
      dispatch({ type: 'SET_IS_LOADING', payload: false });
    }
  }, []);

  // Envoyer un message
  const sendMessage = useCallback(async (
    channelId: string,
    content: string,
    mentionedUserIds?: string[],
    fileUrl?: string,
    fileName?: string,
    fileSize?: number,
    fileMimeType?: string
  ): Promise<Message> => {
    const message = await chatApi.sendMessage(channelId, {
      content,
      mentionedUserIds,
      fileUrl,
      fileName,
      fileSize,
      fileMimeType,
    });

    // Le message sera ajouté via WebSocket, mais on le retourne pour un affichage optimiste
    return message;
  }, []);

  // Modifier un message
  const updateMessage = useCallback(async (messageId: string, content: string) => {
    await chatApi.updateMessage(messageId, { content });
  }, []);

  // Supprimer un message
  const deleteMessage = useCallback(async (messageId: string) => {
    await chatApi.deleteMessage(messageId);
  }, []);

  // Rejoindre un canal
  const joinChannel = useCallback(async (channelId: string) => {
    chatWebSocketService.joinChannel(channelId);
    const channel = await chatApi.getChannel(channelId);
    dispatch({ type: 'SET_CURRENT_CHANNEL', payload: channel });
    await loadMessages(channelId);
  }, [loadMessages]);

  // Quitter un canal
  const leaveChannel = useCallback(async (channelId: string) => {
    chatWebSocketService.leaveChannel(channelId);
    dispatch({ type: 'CLEAR_MESSAGES', payload: channelId });

    if (state.currentChannel?.id === channelId) {
      dispatch({ type: 'SET_CURRENT_CHANNEL', payload: null });
    }
  }, [state.currentChannel]);

  // Marquer comme lu
  const markChannelAsRead = useCallback(async (channelId: string) => {
    await chatApi.markAsRead(channelId);
    dispatch({ type: 'SET_UNREAD_COUNT', payload: { channelId, count: 0 } });
  }, []);

  // Ajouter une réaction
  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    try {
      await chatApi.addReaction(messageId, { emoji });
    } catch (error: any) {
      // Ignorer silencieusement l'erreur si le message a été supprimé
      if (error.response?.data?.message !== 'Message non trouvé') {
        console.error('Erreur lors de l\'ajout de la réaction:', error);
      }
    }
  }, []);

  // Retirer une réaction
  const removeReaction = useCallback(async (messageId: string, emoji: string) => {
    try {
      await chatApi.removeReaction(messageId, { emoji });
    } catch (error: any) {
      // Ignorer silencieusement l'erreur si le message a été supprimé
      if (error.response?.data?.message !== 'Message non trouvé') {
        console.error('Erreur lors du retrait de la réaction:', error);
      }
    }
  }, []);

  // Commencer à taper
  const startTyping = useCallback((channelId: string, userName: string) => {
    chatWebSocketService.startTyping(channelId, userName);
  }, []);

  // Arrêter de taper
  const stopTyping = useCallback((channelId: string) => {
    chatWebSocketService.stopTyping(channelId);
  }, []);

  const value: ChatContextValue = {
    state,
    dispatch,
    loadChannels,
    loadMessages,
    sendMessage,
    updateMessage,
    deleteMessage,
    joinChannel,
    leaveChannel,
    markChannelAsRead,
    addReaction,
    removeReaction,
    startTyping,
    stopTyping,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// =============================================
// HOOK
// =============================================

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat doit être utilisé à l\'intérieur d\'un ChatProvider');
  }
  return context;
};

export default ChatContext;
