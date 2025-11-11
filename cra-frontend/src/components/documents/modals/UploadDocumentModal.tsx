// src/components/documents/modals/UploadDocumentModal.tsx
import React, { useState, useCallback } from 'react';
import { X, Upload, File, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useUploadDocument, useUploadMultipleDocuments } from '../../../hooks/documents/useDocuments';
import {
  DocumentType,
  DOCUMENT_TYPES,
  MAX_FILE_SIZE,
  MAX_FILES_PER_UPLOAD,
  formatDocumentSize,
  validateDocumentUpload
} from '../../../types/document.types';
import { Button } from '../../ui/Button';
import toast from 'react-hot-toast';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;

  // Contexte automatique
  activityId?: string;
  projectId?: string;
  taskId?: string;
  seminarId?: string;

  // Options
  multiple?: boolean;
  autoLink?: boolean; // Lier automatiquement au contexte
}

interface FileWithMeta {
  file: File;
  id: string;
  title: string;
  type: DocumentType;
  description: string;
  tags: string[];
  isPublic: boolean;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  activityId,
  projectId,
  taskId,
  seminarId,
  multiple = true,
  autoLink = true,
}) => {
  const [files, setFiles] = useState<FileWithMeta[]>([]);
  const [currentTab, setCurrentTab] = useState<'upload' | 'link'>('upload');
  const [isUploading, setIsUploading] = useState(false);

  const uploadSingleMutation = useUploadDocument();
  const uploadMultipleMutation = useUploadMultipleDocuments();

  // Drag & Drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: FileWithMeta[] = acceptedFiles.slice(0, MAX_FILES_PER_UPLOAD - files.length).map((file) => {
      const validationError = validateDocumentUpload(file);

      return {
        file,
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        title: file.name.replace(/\.[^/.]+$/, ''), // Nom sans extension
        type: DocumentType.AUTRE,
        description: '',
        tags: [],
        isPublic: false,
        progress: 0,
        status: validationError ? 'error' : 'pending',
        error: validationError || undefined,
      };
    });

    setFiles(prev => [...prev, ...newFiles]);
  }, [files.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    maxFiles: MAX_FILES_PER_UPLOAD,
    maxSize: MAX_FILE_SIZE,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
    },
  });

  const removeFile = (fileId: string) => {
    setFiles(files.filter(f => f.id !== fileId));
  };

  const updateFileMeta = (fileId: string, updates: Partial<FileWithMeta>) => {
    setFiles(files.map(f => f.id === fileId ? { ...f, ...updates } : f));
  };

  const handleUpload = async () => {
    const validFiles = files.filter(f => f.status !== 'error');

    if (validFiles.length === 0) {
      toast.error('Aucun fichier valide � uploader');
      return;
    }

    setIsUploading(true);

    try {
      if (validFiles.length === 1) {
        // Upload unique
        const fileData = validFiles[0];

        await uploadSingleMutation.mutateAsync({
          file: fileData.file,
          data: {
            title: fileData.title,
            type: fileData.type,
            description: fileData.description || undefined,
            tags: fileData.tags.length > 0 ? fileData.tags : undefined,
            isPublic: fileData.isPublic,
            ...(autoLink && activityId && { activityId }),
            ...(autoLink && projectId && { projectId }),
            ...(autoLink && taskId && { taskId }),
            ...(autoLink && seminarId && { seminarId }),
          },
          onProgress: (progress) => {
            updateFileMeta(fileData.id, { progress, status: 'uploading' });
          },
        });

        updateFileMeta(fileData.id, { status: 'success', progress: 100 });
      } else {
        // Upload multiple
        const filesArray = validFiles.map(f => f.file);
        const dataArray = validFiles.map(f => ({
          title: f.title,
          type: f.type,
          description: f.description || undefined,
          tags: f.tags.length > 0 ? f.tags : undefined,
          isPublic: f.isPublic,
          ...(autoLink && activityId && { activityId }),
          ...(autoLink && projectId && { projectId }),
          ...(autoLink && taskId && { taskId }),
          ...(autoLink && seminarId && { seminarId }),
        }));

        await uploadMultipleMutation.mutateAsync({
          files: filesArray,
          dataArray,
          onProgress: (progress) => {
            validFiles.forEach(f => {
              updateFileMeta(f.id, { progress, status: 'uploading' });
            });
          },
        });

        validFiles.forEach(f => {
          updateFileMeta(f.id, { status: 'success', progress: 100 });
        });
      }

      // Succ�s
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setFiles([]);
      }, 1000);

    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'upload');
      validFiles.forEach(f => {
        updateFileMeta(f.id, { status: 'error', error: error.message });
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  const contextLabel = activityId ? 'activit�' : projectId ? 'projet' : taskId ? 't�che' : seminarId ? 's�minaire' : '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ajouter des documents</h2>
            {autoLink && contextLabel && (
              <p className="text-sm text-gray-600 mt-1">
                Les documents seront automatiquement li�s � cette {contextLabel}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setCurrentTab('upload')}
            className={`flex-1 px-6 py-3 font-medium text-sm transition-colors ${
              currentTab === 'upload'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Importer nouveau
          </button>
          <button
            onClick={() => setCurrentTab('link')}
            className={`flex-1 px-6 py-3 font-medium text-sm transition-colors ${
              currentTab === 'link'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <File className="w-4 h-4 inline mr-2" />
            Lier existant
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentTab === 'upload' ? (
            <div className="space-y-6">
              {/* Dropzone */}
              {files.length < MAX_FILES_PER_UPLOAD && (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {isDragActive
                      ? 'D�posez les fichiers ici'
                      : 'Glissez-d�posez vos fichiers ici'}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">ou cliquez pour s�lectionner</p>
                  <p className="text-xs text-gray-500">
                    Maximum {MAX_FILES_PER_UPLOAD} fichiers " {formatDocumentSize(MAX_FILE_SIZE)} par fichier
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Formats: PDF, Word, Excel, Images, TXT, CSV
                  </p>
                </div>
              )}

              {/* Liste des fichiers */}
              {files.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">
                    Fichiers s�lectionn�s ({files.length})
                  </h3>

                  {files.map((fileData) => (
                    <div
                      key={fileData.id}
                      className="border border-gray-200 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <File className={`w-5 h-5 flex-shrink-0 ${
                            fileData.status === 'success' ? 'text-green-600' :
                            fileData.status === 'error' ? 'text-red-600' :
                            'text-gray-400'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <input
                              type="text"
                              value={fileData.title}
                              onChange={(e) => updateFileMeta(fileData.id, { title: e.target.value })}
                              placeholder="Titre du document"
                              className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              disabled={isUploading}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {fileData.file.name} " {formatDocumentSize(fileData.file.size)}
                            </p>
                          </div>
                        </div>
                        {!isUploading && fileData.status === 'pending' && (
                          <button
                            onClick={() => removeFile(fileData.id)}
                            className="text-red-600 hover:text-red-700 ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {fileData.status === 'success' && (
                          <CheckCircle className="w-5 h-5 text-green-600 ml-2" />
                        )}
                        {fileData.status === 'error' && (
                          <AlertCircle className="w-5 h-5 text-red-600 ml-2" />
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={fileData.type}
                          onChange={(e) => updateFileMeta(fileData.id, { type: e.target.value as DocumentType })}
                          className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          disabled={isUploading}
                        >
                          {DOCUMENT_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>

                        <label className="flex items-center text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={fileData.isPublic}
                            onChange={(e) => updateFileMeta(fileData.id, { isPublic: e.target.checked })}
                            className="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500"
                            disabled={isUploading}
                          />
                          Document public
                        </label>
                      </div>

                      <textarea
                        value={fileData.description}
                        onChange={(e) => updateFileMeta(fileData.id, { description: e.target.value })}
                        placeholder="Description (optionnel)"
                        rows={2}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        disabled={isUploading}
                      />

                      {/* Progress bar */}
                      {fileData.status === 'uploading' && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${fileData.progress}%` }}
                          />
                        </div>
                      )}

                      {/* Error message */}
                      {fileData.status === 'error' && fileData.error && (
                        <p className="text-xs text-red-600">{fileData.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Fonctionnalit� "Lier existant" � venir</p>
              <p className="text-sm text-gray-500">
                Permet de lier des documents d�j� upload�s � cette {contextLabel}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {files.length > 0 && currentTab === 'upload' && (
              <span>
                {files.filter(f => f.status !== 'error').length} fichier(s) pr�t(s)
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isUploading}
              className="border-gray-300 text-gray-700"
            >
              Annuler
            </Button>
            {currentTab === 'upload' && (
              <Button
                onClick={handleUpload}
                disabled={files.length === 0 || isUploading || files.every(f => f.status === 'error')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Upload en cours...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Uploader {files.length > 1 ? `${files.length} fichiers` : ''}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { UploadDocumentModal };
