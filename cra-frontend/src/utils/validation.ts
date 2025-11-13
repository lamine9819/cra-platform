// src/utils/validation.ts - Utilitaires de validation
export function isValidCuid(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  return /^[cC][^\s-]{8,}$/.test(value);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Fonction pour nettoyer les données avant envoi à l'API
export function sanitizeFormData(data: any): any {
  const sanitized = { ...data };
  
  // Si activityId est une chaîne vide ou null, le supprimer
  if (!sanitized.activityId || sanitized.activityId === '' || sanitized.activityId === 'null') {
    delete sanitized.activityId;
  }
  
  // Vérifier que activityId est un CUID valide si présent
  if (sanitized.activityId && !isValidCuid(sanitized.activityId)) {
    console.warn('Invalid activityId format, removing it:', sanitized.activityId);
    delete sanitized.activityId;
  }
  
  return sanitized;
}