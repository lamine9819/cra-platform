// src/utils/fileUrl.ts

// URL de base de l'API (sans /api)
const API_SERVER_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3001';

/**
 * Convertit un chemin de fichier relatif en URL absolue
 * @param path - Chemin relatif du fichier (ex: "/uploads/chat/file.jpg")
 * @returns URL absolue du fichier
 */
export function getFileUrl(path: string | undefined | null): string {
  if (!path) return '';

  // Si le chemin est déjà une URL complète, le retourner tel quel
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Sinon, construire l'URL complète
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_SERVER_URL}${cleanPath}`;
}

/**
 * Formatte la taille d'un fichier en unités lisibles
 * @param bytes - Taille en bytes
 * @returns Taille formatée (ex: "1.5 MB")
 */
export function formatFileSize(bytes: number | bigint): string {
  const size = typeof bytes === 'bigint' ? Number(bytes) : bytes;

  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
