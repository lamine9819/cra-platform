// src/components/chat/MessageList.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Message } from '../../types/chat.types';
import ChatMessage from './ChatMessage';
import { Loader2 } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onReply?: (message: Message) => void;
  typingUsers?: Array<{ userId: string; userName?: string }>;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  loading,
  hasMore,
  onLoadMore,
  onEdit,
  onDelete,
  onReact,
  onReply,
  typingUsers = [],
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const prevMessagesLength = useRef(messages.length);

  // Auto-scroll au bas lors de nouveaux messages
  useEffect(() => {
    if (shouldAutoScroll && prevMessagesLength.current < messages.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    prevMessagesLength.current = messages.length;
  }, [messages, shouldAutoScroll]);

  // Détecter si l'utilisateur est proche du bas
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // Si on est à moins de 100px du bas, activer l'auto-scroll
    setShouldAutoScroll(distanceFromBottom < 100);

    // Si on est en haut et qu'il y a plus de messages, charger
    if (scrollTop === 0 && hasMore && !loading && onLoadMore) {
      onLoadMore();
    }
  };

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
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
          <p className="text-lg font-medium">Aucun message</p>
          <p className="text-sm mt-1">Soyez le premier à envoyer un message!</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={messagesContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto"
    >
      {/* Load more indicator */}
      {hasMore && (
        <div className="text-center py-4">
          {loading ? (
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Chargement...</span>
            </div>
          ) : (
            <button
              onClick={onLoadMore}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Charger plus de messages
            </button>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="space-y-1">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            currentUserId={currentUserId}
            onEdit={onEdit}
            onDelete={onDelete}
            onReact={onReact}
            onReply={onReply}
          />
        ))}
      </div>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>
              {typingUsers.length === 1
                ? `${typingUsers[0].userName || 'Quelqu\'un'} est en train d'écrire...`
                : `${typingUsers.length} personnes sont en train d'écrire...`}
            </span>
          </div>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
