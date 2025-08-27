// src/components/documents/DocumentUpload.tsx
import React, { useState, useCallback } from 'react';
import { Upload, X, File } from 'lucide-react';
import { DocumentUploadProps, DOCUMENT_TYPES, MAX_FILE_SIZE } from '../../types/document.types';
import { validateFile } from '../../utils/documentUtils';
import DocumentService from '../../services/documentService';

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  multiple = false,
  projectId,
  activityId,
  taskId,
  seminarId,
  acceptedTypes,
  maxSize = MAX_FILE_SIZE
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'AUTRE',
    tags: [] as string[],
    isPublic: false
  });

  const validateFileLocal = (file: File): string | null => {
    return validateFile(file, maxSize);
  };

  const handleFiles = useCallback((newFiles: FileList) => {
    const fileArray = Array.from(newFiles);
    const validFiles: File[] = [];
    const errors: string[] = [];

    fileArray.forEach(file => {
      const error = validateFileLocal(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      onUploadError?.(errors.join('\n'));
      return;
    }

    if (!multiple && validFiles.length > 1) {
      onUploadError?.('Un seul fichier est autorisé');
      return;
    }

    setFiles(multiple ? [...files, ...validFiles] : validFiles);
  }, [files, multiple, maxSize, onUploadError]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setFormData({ ...formData, tags });
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      onUploadError?.('Aucun fichier sélectionné');
      return;
    }

    setUploading(true);
    try {
      const uploadData = {
        title: formData.title || files[0].name,
        description: formData.description,
        type: formData.type as any,
        tags: formData.tags,
        isPublic: formData.isPublic,
        projectId,
        activityId,
        taskId,
        seminarId
      };

      if (multiple && files.length > 1) {
        const documentsData = files.map((file, index) => ({
          ...uploadData,
          title: formData.title ? `${formData.title} ${index + 1}` : file.name
        }));
        
        const response = await DocumentService.uploadMultipleFiles(files, documentsData);
        onUploadSuccess?.(response.data);
      } else {
        const response = await DocumentService.uploadFile(files[0], uploadData);
        onUploadSuccess?.(response.data);
      }

      // Reset du formulaire
      setFiles([]);
      setFormData({
        title: '',
        description: '',
        type: 'AUTRE',
        tags: [],
        isPublic: false
      });
    } catch (error: any) {
      onUploadError?.(error.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const acceptedTypesString = acceptedTypes || 
    'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/jpeg,image/png,image/gif,text/plain,text/csv';

  return (
    <div className="space-y-4">
      {/* Zone de drop */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple={multiple}
          accept={acceptedTypesString}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-medium text-blue-600 hover:text-blue-500">
            Cliquez pour sélectionner
          </span>{' '}
          ou glissez-déposez vos fichiers ici
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {multiple ? 'Plusieurs fichiers autorisés' : 'Un seul fichier autorisé'} 
          - Max {Math.round(maxSize / 1024 / 1024)}MB
        </p>
      </div>

      {/* Liste des fichiers sélectionnés */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">
            Fichiers sélectionnés ({files.length})
          </h4>
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                <File className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900">{file.name}</span>
                <span className="text-xs text-gray-500">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire de métadonnées */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={files[0]?.name || 'Titre du document'}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Description du document..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {DOCUMENT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center pt-6">
              <input
                id="isPublic"
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                Document public
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (séparés par des virgules)
            </label>
            <input
              type="text"
              onChange={handleTagsChange}
              placeholder="recherche, expérimentation, rapport..."
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Bouton d'upload */}
          <div className="flex justify-end">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Upload en cours...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {multiple && files.length > 1 ? `Uploader ${files.length} fichiers` : 'Uploader'}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};