// src/utils/documentUtils.ts
import { DocumentType } from '../types/document.types';

// =============================================
// MAPPING DES TYPES MIME
// =============================================

const MIME_TO_DOCUMENT_TYPE: { [key: string]: DocumentType } = {
  // Documents PDF
  'application/pdf': DocumentType.RAPPORT,
  
  // Documents Word
  'application/msword': DocumentType.RAPPORT,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': DocumentType.RAPPORT,
  
  // Feuilles de calcul
  'application/vnd.ms-excel': DocumentType.DONNEES_EXPERIMENTALES,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': DocumentType.DONNEES_EXPERIMENTALES,
  'text/csv': DocumentType.DONNEES_EXPERIMENTALES,
  
  // Présentations
  'application/vnd.ms-powerpoint': DocumentType.RAPPORT,
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': DocumentType.RAPPORT,
  
  // Images
  'image/jpeg': DocumentType.IMAGE,
  'image/jpg': DocumentType.IMAGE,
  'image/png': DocumentType.IMAGE,
  'image/gif': DocumentType.IMAGE,
  'image/webp': DocumentType.IMAGE,
  'image/svg+xml': DocumentType.IMAGE,
  
  // Texte
  'text/plain': DocumentType.FICHE_TECHNIQUE,
  'text/markdown': DocumentType.FICHE_TECHNIQUE,
  'text/html': DocumentType.FICHE_TECHNIQUE,
  
  // Archives
  'application/zip': DocumentType.AUTRE,
  'application/x-rar-compressed': DocumentType.AUTRE,
  'application/x-7z-compressed': DocumentType.AUTRE,
  
  // JSON/XML (pour les formulaires ou données)
  'application/json': DocumentType.FORMULAIRE,
  'application/xml': DocumentType.FORMULAIRE,
  'text/xml': DocumentType.FORMULAIRE,
};

// =============================================
// FONCTIONS UTILITAIRES
// =============================================

/**
 * Convertit un type MIME en type de document sécurisé
 * @param mimeType - Le type MIME du fichier
 * @returns Le type de document correspondant ou AUTRE par défaut
 */
export const getDocumentTypeFromMime = (mimeType: string): DocumentType => {
  return MIME_TO_DOCUMENT_TYPE[mimeType] || DocumentType.AUTRE;
};

/**
 * Vérifie si un type MIME est autorisé
 * @param mimeType - Le type MIME à vérifier
 * @returns true si le type est autorisé
 */
export const isAllowedMimeType = (mimeType: string): boolean => {
  const allowedTypes = [
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    
    // Texte
    'text/plain',
    'text/csv',
    'text/markdown',
    
    // Archives
    'application/zip',
    'application/x-rar-compressed',
    
    // Données
    'application/json',
    'application/xml',
    'text/xml'
  ];
  
  return allowedTypes.includes(mimeType);
};

/**
 * Obtient l'icône appropriée pour un type MIME
 * @param mimeType - Le type MIME
 * @returns L'emoji/icône correspondant
 */
export const getFileIconFromMime = (mimeType: string): string => {
  const mimeTypeIcons: { [key: string]: string } = {
    // Documents
    'application/pdf': '',
    'application/msword': '',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '',
    
    // Feuilles de calcul
    'application/vnd.ms-excel': '',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '',
    'text/csv': '',
    
    // Présentations
    'application/vnd.ms-powerpoint': '',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '',
    
    // Images
    'image/jpeg': '',
    'image/jpg': '',
    'image/png': '',
    'image/gif': '',
    'image/webp': '',
    
    // Texte
    'text/plain': '',
    'text/markdown': '',
    'text/html': '',
    
    // Archives
    'application/zip': '🗜️',
    'application/x-rar-compressed': '🗜️',
    'application/x-7z-compressed': '🗜️',
    
    // Données/JSON
    'application/json': '',
    'application/xml': '',
    'text/xml': ''
  };
  
  return mimeTypeIcons[mimeType] || '📎';
};

/**
 * Formate la taille d'un fichier en octets vers une chaîne lisible
 * @param bytes - La taille en octets
 * @returns La taille formatée (ex: "1.2 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Valide un fichier avant upload
 * @param file - Le fichier à valider
 * @param maxSize - Taille maximale autorisée en octets
 * @returns Un message d'erreur ou null si valide
 */
export const validateFile = (file: File, maxSize: number = 50 * 1024 * 1024): string | null => {
  // Vérifier la taille
  if (file.size > maxSize) {
    return `Le fichier "${file.name}" est trop volumineux (max: ${formatFileSize(maxSize)})`;
  }
  
  // Vérifier le type MIME
  if (!isAllowedMimeType(file.type)) {
    return `Le type de fichier "${file.name}" n'est pas autorisé`;
  }
  
  // Vérifier l'extension (sécurité supplémentaire)
  const allowedExtensions = [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.jpg', '.jpeg', '.png', '.gif', '.webp',
    '.txt', '.csv', '.md',
    '.zip', '.rar', '.7z',
    '.json', '.xml'
  ];
  
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!allowedExtensions.includes(fileExtension)) {
    return `L'extension du fichier "${file.name}" n'est pas autorisée`;
  }
  
  return null;
};

/**
 * Génère un nom de fichier sûr pour le stockage
 * @param originalName - Le nom original du fichier
 * @returns Un nom sécurisé
 */
export const generateSafeFileName = (originalName: string): string => {
  // Remplacer les caractères spéciaux et espaces
  const safeName = originalName
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
    
  // Ajouter un timestamp pour éviter les collisions
  const timestamp = Date.now();
  const extension = safeName.split('.').pop();
  const nameWithoutExtension = safeName.replace(`.${extension}`, '');
  
  return `${nameWithoutExtension}_${timestamp}.${extension}`;
};

/**
 * Obtient les métadonnées d'un fichier
 * @param file - Le fichier à analyser
 * @returns Les métadonnées du fichier
 */
export const getFileMetadata = (file: File) => {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: new Date(file.lastModified),
    documentType: getDocumentTypeFromMime(file.type),
    icon: getFileIconFromMime(file.type),
    isAllowed: isAllowedMimeType(file.type),
    formattedSize: formatFileSize(file.size)
  };
};

/**
 * Nettoie et valide les tags d'un document
 * @param tags - Les tags à nettoyer
 * @returns Les tags nettoyés et validés
 */
export const cleanTags = (tags: string[]): string[] => {
  return tags
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0 && tag.length <= 50)
    .filter((tag, index, array) => array.indexOf(tag) === index) // Supprimer les doublons
    .slice(0, 10); // Limiter à 10 tags maximum
};

export default {
  getDocumentTypeFromMime,
  isAllowedMimeType,
  getFileIconFromMime,
  formatFileSize,
  validateFile,
  generateSafeFileName,
  getFileMetadata,
  cleanTags
};