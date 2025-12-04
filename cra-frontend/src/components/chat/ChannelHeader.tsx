// src/components/chat/ChannelHeader.tsx
import React from 'react';
import { Channel } from '../../types/chat.types';
import { MessageSquare, Users } from 'lucide-react';

interface ChannelHeaderProps {
  channel: Channel;
}

const ChannelHeader: React.FC<ChannelHeaderProps> = ({ channel }) => {
  return (
    <div className="flex-shrink-0 h-16 px-6 border-b border-gray-200 bg-white flex items-center justify-between shadow-sm">
      {/* Left side - Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
          <MessageSquare className="w-6 h-6 text-blue-600" />
        </div>

        <div>
          <h1 className="text-xl font-semibold text-gray-900">Chat Général</h1>
          <p className="text-sm text-gray-500">Espace de discussion pour toute l'équipe</p>
        </div>
      </div>

      {/* Right side - Member count */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
        <Users className="w-5 h-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {channel.memberCount} {channel.memberCount > 1 ? 'membres' : 'membre'}
        </span>
      </div>
    </div>
  );
};

export default ChannelHeader;
