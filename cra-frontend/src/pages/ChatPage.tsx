// src/pages/ChatPage.tsx
import React, { useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useMessages } from '../hooks/useMessages';
import MessageList from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';
import { Loader2 } from 'lucide-react';

interface ChatPageProps {
  currentUserId: string;
}

const ChatPage: React.FC<ChatPageProps> = ({ currentUserId }) => {
  const { state, addReaction, removeReaction } = useChat();

  const {
    messages,
    loading: messagesLoading,
    hasMore,
    loadMore,
    send,
    update,
    remove,
  } = useMessages({ autoLoad: true });

  const handleSendMessage = async (
    content: string,
    fileUrl?: string,
    fileName?: string,
    fileSize?: number,
    fileMimeType?: string
  ) => {
    await send(content, fileUrl, fileName, fileSize, fileMimeType);
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main chat area - Full width */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        {messagesLoading && messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-16 h-16 mx-auto mb-4 text-green-500 animate-spin" />
              <p className="text-lg font-medium text-gray-700">Chargement des messages...</p>
            </div>
          </div>
        ) : (
          <>
            <MessageList
              messages={messages}
              currentUserId={currentUserId}
              loading={messagesLoading}
              hasMore={hasMore}
              onLoadMore={loadMore}
              onEdit={handleEditMessage}
              onDelete={handleDeleteMessage}
              onReact={handleReaction}
            />

            {/* Message input */}
            <MessageInput
              onSend={handleSendMessage}
            />
          </>
        )}
      </div>

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
