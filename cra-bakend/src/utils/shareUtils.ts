// src/utils/shareUtils.ts - Utilitaires pour la gestion du partage
import crypto from 'crypto';

/**
 * Générer un token de partage sécurisé
 */
export function generateShareToken(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Valider un token de partage
 */
export function isValidShareToken(token: string): boolean {
  return /^[a-f0-9]{32}$/.test(token);
}

/**
 * Générer un ID d'appareil unique
 */
export function generateDeviceId(): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(8).toString('hex');
  return `${timestamp}-${random}`;
}

