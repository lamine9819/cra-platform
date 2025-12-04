// src/components/chat/ChannelList.tsx
import React from 'react';
import { Channel, ChannelType } from '../../types/chat.types';
import {
  Hash, Lock, Users, Bell, Archive,
  MessageSquare, Calendar, Search
} from 'lucide-react';

interface ChannelListProps {
  channels: Channel[];
  currentChannelId: string | null;
  onChannelSelect: (channel: Channel) => void;
  onCreateChannel?: () => void;
}

const getChannelIcon = (type: ChannelType, isPrivate: boolean) => {
  if (isPrivate) return <Lock className="w-4 h-4" />;

  switch (type) {
    case ChannelType.GENERAL:
      return <Hash className="w-4 h-4" />;
    case ChannelType.PROJECT:
      return <MessageSquare className="w-4 h-4" />;
    case ChannelType.THEME:
      return <Search className="w-4 h-4" />;
    case ChannelType.ANNOUNCEMENT:
      return <Bell className="w-4 h-4" />;
    default:
      return <Hash className="w-4 h-4" />;
  }
};

const ChannelList: React.FC<ChannelListProps> = ({
  channels,
  currentChannelId,
  onChannelSelect,
  onCreateChannel,
}) => {
  const groupedChannels = channels.reduce((acc, channel) => {
    const key = channel.isArchived ? 'archived' : channel.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(channel);
    return acc;
  }, {} as Record<string, Channel[]>);

  const renderChannelGroup = (title: string, channels: Channel[], icon?: React.ReactNode) => {
    if (!channels || channels.length === 0) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 px-3 mb-2 text-xs font-semibold text-gray-500 uppercase">
          {icon}
          <span>{title}</span>
          <span className="ml-auto text-gray-400">{channels.length}</span>
        </div>

        <div className="space-y-1">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => onChannelSelect(channel)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left
                transition-colors duration-150
                ${currentChannelId === channel.id
                  ? 'bg-green-50 text-green-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <span className={currentChannelId === channel.id ? 'text-green-600' : 'text-gray-400'}>
                {getChannelIcon(channel.type, channel.isPrivate)}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate">{channel.name}</span>
                  {channel.unreadCount && channel.unreadCount > 0 && (
                    <span className="flex-shrink-0 px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
                      {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
                    </span>
                  )}
                </div>

                {channel.lastMessage && (
                  <div className="text-xs text-gray-500 truncate">
                    {channel.lastMessage.author.firstName}: {channel.lastMessage.content}
                  </div>
                )}
              </div>

              {channel.memberCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Users className="w-3 h-3" />
                  <span>{channel.memberCount}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Canaux</h2>

          {onCreateChannel && (
            <button
              onClick={onCreateChannel}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Créer un canal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Channel list */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderChannelGroup('Canaux généraux', groupedChannels[ChannelType.GENERAL] || [], <Hash className="w-3 h-3" />)}
        {renderChannelGroup('Projets', groupedChannels[ChannelType.PROJECT] || [], <MessageSquare className="w-3 h-3" />)}
        {renderChannelGroup('Thèmes', groupedChannels[ChannelType.THEME] || [], <Search className="w-3 h-3" />)}
        {renderChannelGroup('Annonces', groupedChannels[ChannelType.ANNOUNCEMENT] || [], <Bell className="w-3 h-3" />)}
        {renderChannelGroup('Privés', groupedChannels[ChannelType.PRIVATE] || [], <Lock className="w-3 h-3" />)}
        {renderChannelGroup('Archivés', groupedChannels['archived'] || [], <Archive className="w-3 h-3" />)}

        {channels.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Aucun canal disponible</p>
            {onCreateChannel && (
              <button
                onClick={onCreateChannel}
                className="mt-3 text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Créer un canal
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelList;
