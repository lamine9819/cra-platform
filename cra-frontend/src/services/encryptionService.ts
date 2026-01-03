// src/services/encryptionService.ts - Service de chiffrement pour données sensibles

const ENCRYPTION_KEY_NAME = 'cra_encryption_key';
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits pour AES-GCM

interface EncryptedData {
  ciphertext: string; // Base64
  iv: string; // Base64
  version: number;
}

class EncryptionService {
  private keyPromise: Promise<CryptoKey> | null = null;

  /**
   * Générer ou récupérer la clé de chiffrement
   */
  private async getEncryptionKey(): Promise<CryptoKey> {
    if (this.keyPromise) {
      return this.keyPromise;
    }

    this.keyPromise = (async () => {
      // Vérifier si une clé existe déjà
      const storedKeyData = localStorage.getItem(ENCRYPTION_KEY_NAME);

      if (storedKeyData) {
        try {
          const keyData = JSON.parse(storedKeyData);
          const rawKey = this.base64ToArrayBuffer(keyData.key);

          return await crypto.subtle.importKey(
            'raw',
            rawKey,
            { name: ALGORITHM, length: KEY_LENGTH },
            true,
            ['encrypt', 'decrypt']
          );
        } catch (error) {
          console.error('Erreur import clé existante:', error);
          // Générer nouvelle clé en cas d'erreur
        }
      }

      // Générer nouvelle clé
      const key = await crypto.subtle.generateKey(
        { name: ALGORITHM, length: KEY_LENGTH },
        true, // extractable
        ['encrypt', 'decrypt']
      );

      // Sauvegarder la clé pour réutilisation
      const exportedKey = await crypto.subtle.exportKey('raw', key);
      const keyData = {
        key: this.arrayBufferToBase64(exportedKey),
        created: new Date().toISOString(),
        version: 1,
      };

      localStorage.setItem(ENCRYPTION_KEY_NAME, JSON.stringify(keyData));

      return key;
    })();

    return this.keyPromise;
  }

  /**
   * Chiffrer des données
   */
  async encrypt(data: string): Promise<EncryptedData> {
    try {
      const key = await this.getEncryptionKey();

      // Générer IV aléatoire
      const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

      // Encoder les données en ArrayBuffer
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);

      // Chiffrer
      const ciphertext = await crypto.subtle.encrypt(
        { name: ALGORITHM, iv },
        key,
        dataBuffer
      );

      return {
        ciphertext: this.arrayBufferToBase64(ciphertext),
        iv: this.arrayBufferToBase64(iv),
        version: 1,
      };
    } catch (error) {
      console.error('Erreur chiffrement:', error);
      throw new Error('Échec du chiffrement des données');
    }
  }

  /**
   * Déchiffrer des données
   */
  async decrypt(encryptedData: EncryptedData): Promise<string> {
    try {
      const key = await this.getEncryptionKey();

      // Décoder les données
      const ciphertext = this.base64ToArrayBuffer(encryptedData.ciphertext);
      const iv = this.base64ToArrayBuffer(encryptedData.iv);

      // Déchiffrer
      const decrypted = await crypto.subtle.decrypt(
        { name: ALGORITHM, iv },
        key,
        ciphertext
      );

      // Décoder en string
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Erreur déchiffrement:', error);
      throw new Error('Échec du déchiffrement des données');
    }
  }

  /**
   * Chiffrer un objet JSON
   */
  async encryptObject<T>(obj: T): Promise<EncryptedData> {
    const jsonString = JSON.stringify(obj);
    return this.encrypt(jsonString);
  }

  /**
   * Déchiffrer un objet JSON
   */
  async decryptObject<T>(encryptedData: EncryptedData): Promise<T> {
    const jsonString = await this.decrypt(encryptedData);
    return JSON.parse(jsonString);
  }

  /**
   * Chiffrer des données sensibles dans un objet
   * @param obj Objet contenant des données
   * @param sensitiveFields Liste des champs à chiffrer
   */
  async encryptSensitiveFields<T extends Record<string, any>>(
    obj: T,
    sensitiveFields: (keyof T)[]
  ): Promise<T & { _encrypted: string[] }> {
    const result = { ...obj, _encrypted: [] as string[] };

    for (const field of sensitiveFields) {
      if (obj[field] !== undefined && obj[field] !== null) {
        const value = typeof obj[field] === 'string'
          ? obj[field]
          : JSON.stringify(obj[field]);

        const encrypted = await this.encrypt(value);
        (result as any)[field] = encrypted;
        result._encrypted.push(field as string);
      }
    }

    return result;
  }

  /**
   * Déchiffrer des champs sensibles dans un objet
   */
  async decryptSensitiveFields<T extends Record<string, any>>(
    obj: T & { _encrypted?: string[] }
  ): Promise<T> {
    const result = { ...obj };
    const encryptedFields = obj._encrypted || [];

    for (const field of encryptedFields) {
      if ((obj as any)[field]) {
        try {
          const decrypted = await this.decrypt((obj as any)[field]);

          // Essayer de parser si c'était un objet
          try {
            (result as any)[field] = JSON.parse(decrypted);
          } catch {
            (result as any)[field] = decrypted;
          }
        } catch (error) {
          console.error(`Erreur déchiffrement du champ ${field}:`, error);
          // Garder la valeur chiffrée en cas d'erreur
        }
      }
    }

    delete result._encrypted;
    return result;
  }

  /**
   * Réinitialiser la clé de chiffrement
   * ATTENTION: Toutes les données chiffrées deviennent inutilisables
   */
  async resetEncryptionKey(): Promise<void> {
    localStorage.removeItem(ENCRYPTION_KEY_NAME);
    this.keyPromise = null;
    console.warn('Clé de chiffrement réinitialisée. Les données chiffrées existantes sont inutilisables.');
  }

  /**
   * Exporter la clé de chiffrement (pour backup)
   */
  async exportKey(): Promise<string> {
    const keyData = localStorage.getItem(ENCRYPTION_KEY_NAME);
    if (!keyData) {
      throw new Error('Aucune clé de chiffrement trouvée');
    }
    return keyData;
  }

  /**
   * Importer une clé de chiffrement (depuis backup)
   */
  async importKey(keyData: string): Promise<void> {
    try {
      // Valider le format
      const parsed = JSON.parse(keyData);
      if (!parsed.key || !parsed.version) {
        throw new Error('Format de clé invalide');
      }

      localStorage.setItem(ENCRYPTION_KEY_NAME, keyData);
      this.keyPromise = null; // Force reload

      // Tester la clé
      await this.getEncryptionKey();
      console.log('Clé de chiffrement importée avec succès');
    } catch (error) {
      console.error('Erreur import clé:', error);
      throw new Error('Impossible d\'importer la clé de chiffrement');
    }
  }

  /**
   * Utilitaires de conversion
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Vérifier si le chiffrement est disponible
   */
  static isAvailable(): boolean {
    return typeof crypto !== 'undefined' &&
           typeof crypto.subtle !== 'undefined' &&
           typeof crypto.subtle.encrypt === 'function';
  }

  /**
   * Vérifier si une donnée est chiffrée
   */
  static isEncrypted(data: any): data is EncryptedData {
    return data &&
           typeof data === 'object' &&
           'ciphertext' in data &&
           'iv' in data &&
           'version' in data;
  }
}

// Export singleton
export const encryptionService = new EncryptionService();
export default encryptionService;
export type { EncryptedData };
