// src/components/chat/MessageInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Image, FileText, Loader2 } from 'lucide-react';
import { chatApi } from '../../services/chatApi';

interface MessageInputProps {
  onSend: (content: string, fileUrl?: string, fileName?: string, fileSize?: number, fileMimeType?: string) => void;
  onTyping?: () => void;
  onStopTyping?: () => void;
  disabled?: boolean;
  placeholder?: string;
  replyingTo?: {
    id: string;
    author: string;
    content: string;
  } | null;
  onCancelReply?: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  onTyping,
  onStopTyping,
  disabled = false,
  placeholder = 'Écrivez votre message...',
  replyingTo,
  onCancelReply,
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    url: string;
    filename: string;
    size: number;
    mimeType: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Handle typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onTyping?.();
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onStopTyping?.();
    }, 3000);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Seuls les fichiers images (JPEG, PNG, GIF, WebP) et PDF sont autorisés');
      return;
    }

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Le fichier ne doit pas dépasser 10 MB');
      return;
    }

    try {
      setIsUploading(true);
      const uploaded = await chatApi.uploadFile(file);
      setUploadedFile(uploaded);
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert('Erreur lors de l\'upload du fichier');
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedMessage = message.trim();
    if ((!trimmedMessage && !uploadedFile) || disabled) return;

    if (uploadedFile) {
      onSend(
        trimmedMessage || '',
        uploadedFile.url,
        uploadedFile.filename,
        uploadedFile.size,
        uploadedFile.mimeType
      );
    } else {
      onSend(trimmedMessage);
    }

    setMessage('');
    setUploadedFile(null);
    setIsTyping(false);
    onStopTyping?.();

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Focus back on textarea
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* Reply preview */}
      {replyingTo && (
        <div className="px-4 pt-3 pb-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-start gap-2">
            <div className="flex-1 text-sm">
              <div className="text-gray-600 font-medium mb-1">
                Réponse à {replyingTo.author}
              </div>
              <div className="text-gray-500 truncate">
                {replyingTo.content}
              </div>
            </div>
            {onCancelReply && (
              <button
                onClick={onCancelReply}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                aria-label="Annuler la réponse"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* File preview */}
      {uploadedFile && (
        <div className="px-4 pt-3 pb-2 bg-green-50 border-b border-green-200">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 p-2 bg-green-100 rounded-lg text-green-600">
              {getFileIcon(uploadedFile.mimeType)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {uploadedFile.filename}
              </div>
              <div className="text-xs text-gray-500">
                {formatFileSize(uploadedFile.size)}
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              aria-label="Supprimer le fichier"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex gap-3 items-end">
          {/* Attachment button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled || isUploading || !!uploadedFile}
            title="Joindre une image ou un PDF"
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Paperclip className="w-5 h-5" />
            )}
          </button>

          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none max-h-32 disabled:opacity-50 disabled:cursor-not-allowed"
            />

            {/* Character count (optional) */}
            {message.length > 1000 && (
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {message.length}/2000
              </div>
            )}
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={disabled || (!message.trim() && !uploadedFile) || isUploading}
            className="flex-shrink-0 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
            title="Envoyer (Enter)"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Help text */}
        <div className="mt-2 text-xs text-gray-500">
          <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded">Enter</kbd> pour envoyer,{' '}
          <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded">Shift + Enter</kbd> pour une nouvelle ligne
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
