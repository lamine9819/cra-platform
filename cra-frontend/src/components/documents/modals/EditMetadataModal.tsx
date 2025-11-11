// src/components/documents/modals/EditMetadataModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Save, Tag, X as TagX } from 'lucide-react';
import { DocumentResponse } from '../../../types/document.types';
import { useUpdateDocumentMetadata } from '../../../hooks/documents/useDocumentsAdvanced';

interface EditMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentResponse;
  onSuccess?: () => void;
}

const DOCUMENT_TYPES = [
  { value: 'RAPPORT', label: 'Rapport' },
  { value: 'FICHE_ACTIVITE', label: 'Fiche d\'activité' },
  { value: 'FICHE_TECHNIQUE', label: 'Fiche technique' },
  { value: 'FICHE_INDIVIDUELLE', label: 'Fiche individuelle' },
  { value: 'DONNEES_EXPERIMENTALES', label: 'Données expérimentales' },
  { value: 'FORMULAIRE', label: 'Formulaire' },
  { value: 'PUBLICATION_SCIENTIFIQUE', label: 'Publication scientifique' },
  { value: 'MEMOIRE', label: 'Mémoire' },
  { value: 'THESE', label: 'Thèse' },
  { value: 'IMAGE', label: 'Image' },
  { value: 'PRESENTATION', label: 'Présentation' },
  { value: 'AUTRE', label: 'Autre' },
];

export const EditMetadataModal: React.FC<EditMetadataModalProps> = ({
  isOpen,
  onClose,
  document,
  onSuccess,
}) => {
  const [title, setTitle] = useState(document.title);
  const [description, setDescription] = useState(document.description || '');
  const [type, setType] = useState(document.type);
  const [tags, setTags] = useState<string[]>(document.tags || []);
  const [newTag, setNewTag] = useState('');
  const [isPublic, setIsPublic] = useState(document.isPublic);

  const updateMutation = useUpdateDocumentMetadata();

  // Reset form when document changes
  useEffect(() => {
    setTitle(document.title);
    setDescription(document.description || '');
    setType(document.type);
    setTags(document.tags || []);
    setIsPublic(document.isPublic);
  }, [document]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 20) {
      setTags([...tags, trimmedTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateMutation.mutateAsync({
        id: document.id,
        data: {
          title,
          description: description || undefined,
          type,
          tags,
          isPublic,
        },
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  const hasChanges =
    title !== document.title ||
    description !== (document.description || '') ||
    type !== document.type ||
    JSON.stringify(tags) !== JSON.stringify(document.tags || []) ||
    isPublic !== document.isPublic;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Éditer les métadonnées
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={255}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Titre du document"
              />
              <p className="text-xs text-gray-500 mt-1">
                {title.length}/255 caractères
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={1000}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Description du document (optionnelle)"
              />
              <p className="text-xs text-gray-500 mt-1">
                {description.length}/1000 caractères
              </p>
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Type de document
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {DOCUMENT_TYPES.map((docType) => (
                  <option key={docType.value} value={docType.value}>
                    {docType.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="newTag" className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>

              {/* Existing tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <TagX className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add new tag */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  id="newTag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  maxLength={50}
                  disabled={tags.length >= 20}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder={tags.length >= 20 ? 'Maximum 20 tags' : 'Ajouter un tag...'}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!newTag.trim() || tags.length >= 20}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ajouter
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {tags.length}/20 tags • Appuyez sur Entrée pour ajouter
              </p>
            </div>

            {/* Public/Private */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                Document public (accessible à tous les utilisateurs)
              </label>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            {hasChanges ? 'Modifications non enregistrées' : 'Aucune modification'}
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={!hasChanges || !title.trim() || updateMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>
                {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
