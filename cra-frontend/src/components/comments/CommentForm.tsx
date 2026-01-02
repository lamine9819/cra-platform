// src/components/comments/CommentForm.tsx
import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { CreateCommentRequest, CommentResponse } from '../../types/comment.types';

interface CommentFormProps {
  targetType: 'project' | 'activity' | 'task';
  targetId: string;
  onSubmit: (data: CreateCommentRequest) => Promise<CommentResponse>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  targetType,
  targetId,
  onSubmit,
  placeholder = "Écrivez votre commentaire...",
  disabled = false,
  className = "",
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Le commentaire ne peut pas être vide');
      return;
    }

    if (content.length > 2000) {
      setError('Le commentaire ne peut pas dépasser 2000 caractères');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        content: content.trim(),
        targetType,
        targetId,
      });
      
      setContent('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout du commentaire';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e as React.FormEvent);
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <form onSubmit={handleSubmit} className="p-4">
        <div className="space-y-3">
          <div>
            <label htmlFor="comment-content" className="sr-only">
              Commentaire
            </label>
            <textarea
              id="comment-content"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isSubmitting}
              rows={3}
              className={`
                w-full px-3 py-2 border border-gray-300 rounded-md 
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                resize-none transition-colors duration-200
                ${disabled || isSubmitting ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
                ${error ? 'border-red-300 focus:ring-red-500' : ''}
              `}
              maxLength={2000}
            />
            
            <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
              <span className={content.length > 1800 ? 'text-orange-500' : ''}>
                {content.length}/2000 caractères
              </span>
              <span className="text-gray-400">
                Ctrl+Entrée pour publier
              </span>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={disabled || isSubmitting || !content.trim()}
              className={`
                inline-flex items-center px-4 py-2 border border-transparent 
                text-sm font-medium rounded-md shadow-sm text-white 
                transition-colors duration-200
                ${
                  disabled || isSubmitting || !content.trim()
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publication...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Publier
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};