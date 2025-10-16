// src/utils/fileHelpers.ts - Version mise à jour
import crypto from 'crypto';
import fs from 'fs';

export const generateFileHash = (filepath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filepath);
    
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
};

export const getFileSize = (filepath: string): number => {
  const stats = fs.statSync(filepath);
  return stats.size;
};

export const deleteFile = (filepath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.unlink(filepath, (err) => {
      if (err && err.code !== 'ENOENT') {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

export const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-zA-Z0-9\-_\.]/g, '_');
};

// Mapper les types MIME vers les types de documents du schéma Prisma
export const getFileTypeFromMime = (mimeType: string): string => {
  const mimeToType: Record<string, string> = {
    // Rapports et documents
    'application/pdf': 'RAPPORT',
    'application/msword': 'RAPPORT',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'RAPPORT',
    
    // Données expérimentales
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'DONNEES_EXPERIMENTALES',
    'application/vnd.ms-excel': 'DONNEES_EXPERIMENTALES',
    'text/csv': 'DONNEES_EXPERIMENTALES',
    'application/vnd.oasis.opendocument.spreadsheet': 'DONNEES_EXPERIMENTALES',
    
    // Images
    'image/jpeg': 'IMAGE',
    'image/jpg': 'IMAGE',
    'image/png': 'IMAGE',
    'image/gif': 'IMAGE',
    'image/webp': 'IMAGE',
    'image/svg+xml': 'IMAGE',
    'image/bmp': 'IMAGE',
    'image/tiff': 'IMAGE',
    
    // Présentations
    'application/vnd.ms-powerpoint': 'PRESENTATION',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PRESENTATION',
    'application/vnd.oasis.opendocument.presentation': 'PRESENTATION',
    
    // Fichiers texte (formulaires, fiches techniques)
    'text/plain': 'FICHE_TECHNIQUE',
    'text/html': 'FICHE_TECHNIQUE',
    'application/json': 'FORMULAIRE',
    'application/xml': 'FORMULAIRE',
    'text/xml': 'FORMULAIRE',
    
    // Archives
    'application/zip': 'AUTRE',
    'application/x-rar-compressed': 'AUTRE',
    'application/x-7z-compressed': 'AUTRE',
  };
  
  return mimeToType[mimeType] || 'AUTRE';
};

// Vérifier si un fichier existe
export const fileExists = (filepath: string): boolean => {
  try {
    return fs.existsSync(filepath);
  } catch {
    return false;
  }
};

// Obtenir les informations d'un fichier
export const getFileInfo = (filepath: string): {
  size: number;
  createdAt: Date;
  modifiedAt: Date;
} | null => {
  try {
    const stats = fs.statSync(filepath);
    return {
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
    };
  } catch {
    return null;
  }
};

// Formater la taille d'un fichier en format lisible
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Vérifier si le type MIME est autorisé
export const isAllowedMimeType = (mimeType: string, allowedTypes?: string[]): boolean => {
  if (!allowedTypes || allowedTypes.length === 0) {
    return true; // Aucune restriction
  }
  
  return allowedTypes.some(allowed => {
    if (allowed.endsWith('/*')) {
      // Wildcard type (ex: image/*)
      const baseType = allowed.split('/')[0];
      return mimeType.startsWith(baseType + '/');
    }
    return mimeType === allowed;
  });
};

// Extraire l'extension d'un fichier
export const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

// Vérifier si un fichier est une image
export const isImage = (mimeType: string): boolean => {
  return mimeType.startsWith('image/');
};

// Vérifier si un fichier est un document
export const isDocument = (mimeType: string): boolean => {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];
  
  return documentTypes.includes(mimeType);
};