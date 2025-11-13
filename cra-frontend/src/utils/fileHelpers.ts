// src/utils/fileHelpers.ts
import {
  FileText,
  Image as FileImage,
  Sheet as FileSpreadsheet,
  Video as FileVideo,
  Music as FileAudio,
  Archive as FileArchive,
  File as FileIcon,
  FileCode,
  Presentation
} from 'lucide-react';

/**
 * Formate la taille d'un fichier en octets vers une chaîne lisible
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Obtient l'icône Lucide appropriée selon le type MIME
 */
export const getFileIcon = (mimeType: string): typeof FileIcon => {
  // PDF
  if (mimeType === 'application/pdf') {
    return FileText;
  }

  // Images
  if (mimeType.startsWith('image/')) {
    return FileImage;
  }

  // Documents texte
  if (
    mimeType.includes('word') ||
    mimeType === 'application/vnd.oasis.opendocument.text' ||
    mimeType === 'text/plain' ||
    mimeType === 'text/rtf'
  ) {
    return FileText;
  }

  // Feuilles de calcul
  if (
    mimeType.includes('excel') ||
    mimeType.includes('spreadsheet') ||
    mimeType === 'text/csv'
  ) {
    return FileSpreadsheet;
  }

  // Présentations
  if (
    mimeType.includes('powerpoint') ||
    mimeType.includes('presentation')
  ) {
    return Presentation;
  }

  // Vidéos
  if (mimeType.startsWith('video/')) {
    return FileVideo;
  }

  // Audio
  if (mimeType.startsWith('audio/')) {
    return FileAudio;
  }

  // Archives
  if (
    mimeType === 'application/zip' ||
    mimeType === 'application/x-rar-compressed' ||
    mimeType === 'application/x-7z-compressed' ||
    mimeType === 'application/x-tar' ||
    mimeType === 'application/gzip'
  ) {
    return FileArchive;
  }

  // Code source
  if (
    mimeType === 'application/json' ||
    mimeType === 'application/javascript' ||
    mimeType === 'text/html' ||
    mimeType === 'text/css' ||
    mimeType.includes('xml')
  ) {
    return FileCode;
  }

  // Défaut
  return FileIcon;
};

/**
 * Obtient la couleur de l'icône selon le type MIME
 */
export const getFileIconColor = (mimeType: string): string => {
  if (mimeType === 'application/pdf') return 'text-red-600';
  if (mimeType.startsWith('image/')) return 'text-purple-600';
  if (mimeType.includes('word') || mimeType === 'text/plain') return 'text-blue-600';
  if (mimeType.includes('excel') || mimeType === 'text/csv') return 'text-green-600';
  if (mimeType.includes('powerpoint')) return 'text-orange-600';
  if (mimeType.startsWith('video/')) return 'text-pink-600';
  if (mimeType.startsWith('audio/')) return 'text-indigo-600';
  if (mimeType.includes('zip') || mimeType.includes('rar')) return 'text-yellow-600';
  if (mimeType.includes('json') || mimeType.includes('javascript')) return 'text-cyan-600';

  return 'text-gray-600';
};

/**
 * Obtient l'extension d'un fichier depuis son nom
 */
export const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
};

/**
 * Vérifie si un fichier est une image
 */
export const isImageFile = (mimeType: string): boolean => {
  return mimeType.startsWith('image/');
};

/**
 * Vérifie si un fichier est un PDF
 */
export const isPdfFile = (mimeType: string): boolean => {
  return mimeType === 'application/pdf';
};

/**
 * Vérifie si un fichier est une vidéo
 */
export const isVideoFile = (mimeType: string): boolean => {
  return mimeType.startsWith('video/');
};

/**
 * Vérifie si un fichier peut être prévisualisé dans le navigateur
 */
export const canPreviewInBrowser = (mimeType: string): boolean => {
  return (
    isImageFile(mimeType) ||
    isPdfFile(mimeType) ||
    isVideoFile(mimeType) ||
    mimeType.startsWith('audio/') ||
    mimeType === 'text/plain'
  );
};

/**
 * Valide la taille d'un fichier
 */
export const validateFileSize = (
  file: File,
  maxSizeInBytes: number = 50 * 1024 * 1024 // 50MB par défaut
): { valid: boolean; error?: string } => {
  if (file.size > maxSizeInBytes) {
    return {
      valid: false,
      error: `Le fichier "${file.name}" dépasse la taille maximale autorisée (${formatFileSize(maxSizeInBytes)})`
    };
  }

  return { valid: true };
};

/**
 * Valide le type d'un fichier
 */
export const validateFileType = (
  file: File,
  allowedTypes: string[] = []
): { valid: boolean; error?: string } => {
  // Si aucun type spécifié, tout est autorisé
  if (allowedTypes.length === 0) {
    return { valid: true };
  }

  // Vérifier le type MIME
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Le type de fichier "${file.type}" n'est pas autorisé pour "${file.name}"`
    };
  }

  return { valid: true };
};

/**
 * Valide l'extension d'un fichier
 */
export const validateFileExtension = (
  file: File,
  allowedExtensions: string[] = []
): { valid: boolean; error?: string } => {
  // Si aucune extension spécifiée, tout est autorisé
  if (allowedExtensions.length === 0) {
    return { valid: true };
  }

  const extension = getFileExtension(file.name);

  if (!allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `L'extension ".${extension}" n'est pas autorisée pour "${file.name}"`
    };
  }

  return { valid: true };
};

/**
 * Valide un fichier (taille + type + extension)
 */
export const validateFile = (
  file: File,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Valider la taille
  const sizeValidation = validateFileSize(file, options.maxSize);
  if (!sizeValidation.valid && sizeValidation.error) {
    errors.push(sizeValidation.error);
  }

  // Valider le type MIME
  const typeValidation = validateFileType(file, options.allowedTypes);
  if (!typeValidation.valid && typeValidation.error) {
    errors.push(typeValidation.error);
  }

  // Valider l'extension
  const extensionValidation = validateFileExtension(file, options.allowedExtensions);
  if (!extensionValidation.valid && extensionValidation.error) {
    errors.push(extensionValidation.error);
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Valide plusieurs fichiers
 */
export const validateFiles = (
  files: File[],
  options: {
    maxSize?: number;
    maxFiles?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
    maxTotalSize?: number;
  } = {}
): { valid: boolean; errors: string[]; validFiles: File[] } => {
  const errors: string[] = [];
  const validFiles: File[] = [];

  // Vérifier le nombre de fichiers
  if (options.maxFiles && files.length > options.maxFiles) {
    errors.push(`Vous ne pouvez uploader que ${options.maxFiles} fichiers maximum`);
    return { valid: false, errors, validFiles: [] };
  }

  // Vérifier la taille totale
  if (options.maxTotalSize) {
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > options.maxTotalSize) {
      errors.push(
        `La taille totale des fichiers (${formatFileSize(totalSize)}) dépasse la limite (${formatFileSize(options.maxTotalSize)})`
      );
      return { valid: false, errors, validFiles: [] };
    }
  }

  // Valider chaque fichier individuellement
  files.forEach(file => {
    const validation = validateFile(file, {
      maxSize: options.maxSize,
      allowedTypes: options.allowedTypes,
      allowedExtensions: options.allowedExtensions
    });

    if (validation.valid) {
      validFiles.push(file);
    } else {
      errors.push(...validation.errors);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    validFiles
  };
};

/**
 * Crée un nom de fichier sûr (sans caractères spéciaux)
 */
export const sanitizeFilename = (filename: string): string => {
  // Remplacer les caractères spéciaux par des underscores
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_') // Remplacer plusieurs underscores par un seul
    .toLowerCase();
};

/**
 * Génère un nom de fichier unique avec timestamp
 */
export const generateUniqueFilename = (originalFilename: string): string => {
  const extension = getFileExtension(originalFilename);
  const nameWithoutExt = originalFilename.replace(`.${extension}`, '');
  const sanitized = sanitizeFilename(nameWithoutExt);
  const timestamp = Date.now();

  return extension
    ? `${sanitized}_${timestamp}.${extension}`
    : `${sanitized}_${timestamp}`;
};

/**
 * Convertit un fichier en Data URL (pour preview)
 */
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to data URL'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Types MIME autorisés par défaut
 */
export const DEFAULT_ALLOWED_MIME_TYPES = [
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.oasis.opendocument.text',

  // Feuilles de calcul
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.oasis.opendocument.spreadsheet',
  'text/csv',

  // Présentations
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.oasis.opendocument.presentation',

  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',

  // Texte
  'text/plain',
  'text/rtf',

  // Archives
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',

  // Autres
  'application/json'
];

/**
 * Extensions autorisées par défaut
 */
export const DEFAULT_ALLOWED_EXTENSIONS = [
  // Documents
  'pdf', 'doc', 'docx', 'odt',

  // Feuilles de calcul
  'xls', 'xlsx', 'ods', 'csv',

  // Présentations
  'ppt', 'pptx', 'odp',

  // Images
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',

  // Texte
  'txt', 'rtf',

  // Archives
  'zip', 'rar', '7z',

  // Autres
  'json'
];

/**
 * Taille maximale par défaut (50MB)
 */
export const DEFAULT_MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Nombre maximum de fichiers par défaut
 */
export const DEFAULT_MAX_FILES = 10;

/**
 * Taille maximale totale par défaut (200MB)
 */
export const DEFAULT_MAX_TOTAL_SIZE = 200 * 1024 * 1024;

export default {
  formatFileSize,
  getFileIcon,
  getFileIconColor,
  getFileExtension,
  isImageFile,
  isPdfFile,
  isVideoFile,
  canPreviewInBrowser,
  validateFileSize,
  validateFileType,
  validateFileExtension,
  validateFile,
  validateFiles,
  sanitizeFilename,
  generateUniqueFilename,
  fileToDataUrl,
  DEFAULT_ALLOWED_MIME_TYPES,
  DEFAULT_ALLOWED_EXTENSIONS,
  DEFAULT_MAX_FILE_SIZE,
  DEFAULT_MAX_FILES,
  DEFAULT_MAX_TOTAL_SIZE
};
