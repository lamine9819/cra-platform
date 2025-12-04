// src/pages/ChatPage.tsx
import React, { useState, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useMessages } from '../hooks/useMessages';
import { useTypingIndicator } from '../hooks/useTypingIndicator';
import MessageList from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';
import { Message } from '../types/chat.types';
import { Loader2 } from 'lucide-react';

interface ChatPageProps {
  currentUserId: string;
  currentUserName: string;
}

const ChatPage: React.FC<ChatPageProps> = ({ currentUserId, currentUserName }) => {
  const { state, loadChannels, joinChannel, markChannelAsRead, addReaction, removeReaction } = useChat();
  const [replyingTo, setReplyingTo] = useState<{ id: string; author: string; content: string } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const currentChannelId = state.currentChannel?.id || null;

  const {
    messages,
    typingUsers,
    loading: messagesLoading,
    hasMore,
    loadMore,
    send,
    update,
    remove,
  } = useMessages({ channelId: currentChannelId });

  const { handleTyping, handleStopTyping } = useTypingIndicator({
    channelId: currentChannelId,
    userName: currentUserName,
  });

  // Charger et rejoindre automatiquement le canal général
  useEffect(() => {
    const initChat = async () => {
      try {
        // Charger les canaux
        await loadChannels();
        setIsInitialized(true);
      } catch (error) {
        console.error('Erreur lors du chargement des canaux:', error);
      }
    };

    if (!isInitialized) {
      initChat();
    }
  }, [loadChannels, isInitialized]);

  // Rejoindre automatiquement le canal général une fois chargé
  useEffect(() => {
    const joinGeneralChannel = async () => {
      if (isInitialized && state.channels.length > 0 && !state.currentChannel) {
        // Trouver le canal général
        const generalChannel = state.channels.find(c => c.type === 'GENERAL' && c.name === 'Général');

        if (generalChannel) {
          await joinChannel(generalChannel.id);
        }
      }
    };

    joinGeneralChannel();
  }, [isInitialized, state.channels, state.currentChannel, joinChannel]);

  // Marquer comme lu quand on change de canal
  useEffect(() => {
    if (currentChannelId) {
      markChannelAsRead(currentChannelId);
    }
  }, [currentChannelId, markChannelAsRead]);

  const handleSendMessage = async (
    content: string,
    fileUrl?: string,
    fileName?: string,
    fileSize?: number,
    fileMimeType?: string
  ) => {
    handleStopTyping();
    await send(content, undefined, fileUrl, fileName, fileSize, fileMimeType);
    setReplyingTo(null);
  };

  const handleEditMessage = async (messageId: string, content: string) => {
    await update(messageId, content);
  };

  const handleDeleteMessage = async (messageId: string) => {
    await remove(messageId);
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    // Check if user already reacted with this emoji
    const message = messages.find(m => m.id === messageId);
    const reaction = message?.reactions.find(r => r.emoji === emoji);

    if (reaction?.currentUserReacted) {
      await removeReaction(messageId, emoji);
    } else {
      await addReaction(messageId, emoji);
    }
  };

  const handleReply = (message: Message) => {
    setReplyingTo({
      id: message.id,
      author: `${message.author.firstName} ${message.author.lastName}`,
      content: message.content,
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main chat area - Full width */}
      <div className="flex-1 flex flex-col min-w-0">
        {state.currentChannel ? (
          <>
            {/* Messages */}
            <MessageList
              messages={messages}
              currentUserId={currentUserId}
              loading={messagesLoading}
              hasMore={hasMore}
              onLoadMore={loadMore}
              onEdit={handleEditMessage}
              onDelete={handleDeleteMessage}
              onReact={handleReaction}
              onReply={handleReply}
              typingUsers={typingUsers}
            />

            {/* Message input */}
            <MessageInput
              onSend={handleSendMessage}
              onTyping={handleTyping}
              onStopTyping={handleStopTyping}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              {state.isLoading || !isInitialized ? (
                <>
                  <Loader2 className="w-16 h-16 mx-auto mb-4 text-green-500 animate-spin" />
                  <p className="text-lg font-medium text-gray-700">Chargement du chat...</p>
                </>
              ) : (
                <>
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p className="text-lg font-medium">Espace de chat non disponible</p>
                  <p className="text-sm mt-1">Veuillez contacter l'administrateur</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Connection status - Removed to avoid UI clutter */}

      {/* Error message */}
      {state.error && (
        <div className="fixed bottom-4 right-4 px-4 py-2 bg-red-100 border border-red-300 text-red-800 rounded-lg shadow-lg">
          <p className="text-sm font-medium">{state.error}</p>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
