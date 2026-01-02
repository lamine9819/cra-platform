// src/pages/ChatPage.tsx
import React, { useState } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useMessages } from '../hooks/useMessages';
import { useNotifications } from '../hooks/useNotifications';
import MessageList from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';
import { Loader2, Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChatPageProps {
  currentUserId: string;
}

const ChatPage: React.FC<ChatPageProps> = ({ currentUserId }) => {
  const { state, addReaction, removeReaction } = useChat();
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const {
    messages,
    loading: messagesLoading,
    hasMore,
    loadMore,
    send,
    update,
    remove,
  } = useMessages({ autoLoad: true });

  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead,
    removeNotification
  } = useNotifications();

  // Filtrer uniquement les notifications de chat
  const chatNotifications = notifications.filter(
    notif => notif.type === 'CHAT_MESSAGE' || notif.type === 'CHAT_MENTION'
  );
  const chatUnreadCount = chatNotifications.filter(n => !n.isRead).length;

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

  // Gérer le clic sur une notification
  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    setIsNotificationOpen(false);
    // Les notifications de chat restent sur la page chat
  };

  // Formater la date de la notification
  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;

    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main chat area - Full width */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header du Chat avec Notifications */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chat</h1>
            <p className="text-sm text-gray-500">Discussion générale</p>
          </div>

          {/* Notifications de chat */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-6 h-6" />
              {chatUnreadCount > 0 && (
                <span className="absolute top-0 right-0 flex items-center justify-center min-w-[20px] h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full">
                  {chatUnreadCount > 99 ? '99+' : chatUnreadCount}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[500px] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Notifications Chat {chatUnreadCount > 0 && `(${chatUnreadCount})`}
                  </h3>
                  {chatUnreadCount > 0 && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        // Marquer toutes les notifications de chat comme lues
                        for (const notif of chatNotifications.filter(n => !n.isRead)) {
                          await markAsRead(notif.id);
                        }
                      }}
                      className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                      title="Tout marquer comme lu"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>Tout lire</span>
                    </button>
                  )}
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1">
                  {chatNotifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500">Aucune notification de chat</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {chatNotifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-4 cursor-pointer transition-colors ${
                            notification.isRead
                              ? 'bg-white hover:bg-gray-50'
                              : 'bg-blue-50 hover:bg-blue-100'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            {/* Icon */}
                            <div className="flex-shrink-0 text-2xl">
                              {notification.type === 'CHAT_MENTION' ? '📢' : '💬'}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <p className={`text-sm font-medium ${
                                  notification.isRead ? 'text-gray-900' : 'text-gray-900 font-semibold'
                                }`}>
                                  {notification.title}
                                </p>
                                {!notification.isRead && (
                                  <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500">
                                  {formatNotificationDate(notification.createdAt)}
                                </span>
                                <div className="flex items-center space-x-2">
                                  {!notification.isRead && (
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        await markAsRead(notification.id);
                                      }}
                                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                                      title="Marquer comme lu"
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                  )}
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      await removeNotification(notification.id);
                                    }}
                                    className="text-xs text-red-600 hover:text-red-700"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

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
