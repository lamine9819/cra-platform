// src/components/chat/ChatMessage.tsx
import React, { useState } from 'react';
import { Message } from '../../types/chat.types';
import { Edit2, Trash2, MoreVertical, Reply, SmilePlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getFileUrl, formatFileSize } from '../../utils/fileUrl';

interface ChatMessageProps {
  message: Message;
  currentUserId: string;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onReply?: (message: Message) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  currentUserId,
  onEdit,
  onDelete,
  onReact,
  onReply,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);

  const isOwnMessage = message.author.id === currentUserId;
  const isDeleted = message.isDeleted;

  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🚀', '👏'];

  const handleEdit = () => {
    if (onEdit && editedContent.trim() !== message.content) {
      onEdit(message.id, editedContent.trim());
      setIsEditing(false);
    } else {
      setIsEditing(false);
      setEditedContent(message.content);
    }
  };

  const handleReaction = (emoji: string) => {
    if (onReact) {
      onReact(message.id, emoji);
    }
    setShowReactions(false);
  };

  if (isDeleted) {
    return (
      <div className="flex gap-3 px-4 py-2 opacity-50">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200" />
        <div className="flex-1">
          <div className="text-sm text-gray-400 italic">Message supprimé</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group flex gap-3 px-4 py-2 hover:bg-gray-50 transition-colors relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {message.author.profileImage ? (
          <img
            src={getFileUrl(message.author.profileImage)}
            alt={`${message.author.firstName} ${message.author.lastName}`}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-medium">
            {message.author.firstName[0]}{message.author.lastName[0]}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-semibold text-gray-900 text-sm">
            {message.author.firstName} {message.author.lastName}
          </span>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(message.createdAt), {
              addSuffix: true,
              locale: fr,
            })}
          </span>
          {message.isEdited && (
            <span className="text-xs text-gray-400">(modifié)</span>
          )}
        </div>

        {/* Message content */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows={3}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Enregistrer
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(message.content);
                }}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          message.content && message.content.trim() && (
            <div className="text-sm text-gray-800 whitespace-pre-wrap break-words">
              {message.content}
            </div>
          )
        )}

        {/* File attachment */}
        {message.fileUrl && (
          <div className="mt-2">
            {message.fileMimeType?.startsWith('image/') ? (
              // Afficher l'image
              <div className="relative group">
                <a
                  href={getFileUrl(message.fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={getFileUrl(message.fileUrl)}
                    alt={message.fileName || 'Image'}
                    className="max-w-md max-h-96 rounded-lg border border-gray-200 hover:opacity-95 transition-opacity cursor-pointer"
                    loading="lazy"
                  />
                </a>
                {message.fileName && (
                  <div className="mt-1 text-xs text-gray-500">
                    {message.fileName}
                  </div>
                )}
              </div>
            ) : (
              // Afficher le fichier PDF
              <a
                href={getFileUrl(message.fileUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-200"
              >
                <div className="flex-shrink-0 p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {message.fileName || 'Fichier PDF'}
                  </div>
                  {message.fileSize && (
                    <div className="text-xs text-gray-500">
                      {formatFileSize(message.fileSize)}
                    </div>
                  )}
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
            )}
          </div>
        )}

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {message.reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                onClick={() => handleReaction(reaction.emoji)}
                className={`
                  inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm
                  transition-colors
                  ${reaction.currentUserReacted
                    ? 'bg-green-100 border border-green-300'
                    : 'bg-gray-100 border border-gray-200 hover:bg-gray-200'
                  }
                `}
                title={reaction.users.map(u => `${u.firstName} ${u.lastName}`).join(', ')}
              >
                <span>{reaction.emoji}</span>
                <span className="text-xs font-medium">{reaction.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Reply count */}
        {message.replyCount > 0 && (
          <button
            onClick={() => onReply?.(message)}
            className="mt-2 text-sm text-green-600 hover:underline"
          >
            {message.replyCount} réponse{message.replyCount > 1 ? 's' : ''}
          </button>
        )}
      </div>

      {/* Actions */}
      {showActions && !isEditing && (
        <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Reaction button */}
          <div className="relative">
            <button
              onClick={() => setShowReactions(!showReactions)}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded-md border border-gray-200 bg-white shadow-sm"
              title="Ajouter une réaction"
            >
              <SmilePlus className="w-4 h-4" />
            </button>

            {showReactions && (
              <div className="absolute right-0 mt-2 p-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="flex gap-1">
                  {commonEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(emoji)}
                      className="p-1 hover:bg-gray-100 rounded text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reply button */}
          {onReply && (
            <button
              onClick={() => onReply(message)}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded-md border border-gray-200 bg-white shadow-sm"
              title="Répondre"
            >
              <Reply className="w-4 h-4" />
            </button>
          )}

          {/* Edit/Delete for own messages */}
          {isOwnMessage && (
            <>
              {message.canEdit && onEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded-md border border-gray-200 bg-white shadow-sm"
                  title="Modifier"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}

              {message.canDelete && onDelete && (
                <button
                  onClick={() => {
                    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
                      onDelete(message.id);
                    }
                  }}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-white rounded-md border border-gray-200 bg-white shadow-sm"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
