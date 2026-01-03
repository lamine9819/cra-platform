// src/services/indexedDBService.ts - Service pour gérer IndexedDB (photos et fichiers volumineux)

const DB_NAME = 'CRA_OfflineDB';
const DB_VERSION = 1;
const PHOTOS_STORE = 'photos';
const METADATA_STORE = 'metadata';

interface PhotoRecord {
  id: string;
  formId: string;
  fieldId: string;
  responseIndex: number;
  blob: Blob;
  filename: string;
  mimeType: string;
  takenAt: Date;
  latitude?: number;
  longitude?: number;
  caption?: string;
  size: number;
}

interface MetadataRecord {
  key: string;
  value: any;
  timestamp: Date;
}

class IndexedDBService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  /**
   * Initialiser la base de données IndexedDB
   */
  private async initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Erreur ouverture IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store pour les photos
        if (!db.objectStoreNames.contains(PHOTOS_STORE)) {
          const photosStore = db.createObjectStore(PHOTOS_STORE, { keyPath: 'id' });
          photosStore.createIndex('formId', 'formId', { unique: false });
          photosStore.createIndex('responseIndex', 'responseIndex', { unique: false });
          photosStore.createIndex('takenAt', 'takenAt', { unique: false });
        }

        // Store pour les métadonnées
        if (!db.objectStoreNames.contains(METADATA_STORE)) {
          db.createObjectStore(METADATA_STORE, { keyPath: 'key' });
        }
      };
    });

    return this.dbPromise;
  }

  /**
   * Sauvegarder une photo dans IndexedDB
   */
  async savePhoto(photo: Omit<PhotoRecord, 'id' | 'size'>): Promise<string> {
    const db = await this.initDB();
    const id = `photo_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const photoRecord: PhotoRecord = {
      ...photo,
      id,
      size: photo.blob.size,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PHOTOS_STORE], 'readwrite');
      const store = transaction.objectStore(PHOTOS_STORE);
      const request = store.add(photoRecord);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Récupérer une photo par ID
   */
  async getPhoto(id: string): Promise<PhotoRecord | null> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PHOTOS_STORE], 'readonly');
      const store = transaction.objectStore(PHOTOS_STORE);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Récupérer toutes les photos d'un formulaire
   */
  async getPhotosByFormId(formId: string): Promise<PhotoRecord[]> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PHOTOS_STORE], 'readonly');
      const store = transaction.objectStore(PHOTOS_STORE);
      const index = store.index('formId');
      const request = index.getAll(formId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Supprimer une photo
   */
  async deletePhoto(id: string): Promise<void> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PHOTOS_STORE], 'readwrite');
      const store = transaction.objectStore(PHOTOS_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Supprimer toutes les photos d'un formulaire
   */
  async deletePhotosByFormId(formId: string): Promise<void> {
    const photos = await this.getPhotosByFormId(formId);
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PHOTOS_STORE], 'readwrite');
      const store = transaction.objectStore(PHOTOS_STORE);

      photos.forEach((photo) => {
        store.delete(photo.id);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Convertir base64 en Blob
   */
  base64ToBlob(base64: string, mimeType: string): Blob {
    // Retirer le préfixe data:image/...;base64, si présent
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
    const byteCharacters = atob(base64Data);
    const byteArrays = [];

    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays.push(byteCharacters.charCodeAt(i));
    }

    return new Blob([new Uint8Array(byteArrays)], { type: mimeType });
  }

  /**
   * Convertir Blob en base64
   */
  async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Obtenir les statistiques de stockage
   */
  async getStorageStats(): Promise<{
    totalPhotos: number;
    totalSize: number;
    photosByForm: Record<string, number>;
  }> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PHOTOS_STORE], 'readonly');
      const store = transaction.objectStore(PHOTOS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const photos = request.result || [];
        const totalSize = photos.reduce((sum, photo) => sum + photo.size, 0);
        const photosByForm: Record<string, number> = {};

        photos.forEach((photo) => {
          photosByForm[photo.formId] = (photosByForm[photo.formId] || 0) + 1;
        });

        resolve({
          totalPhotos: photos.length,
          totalSize,
          photosByForm,
        });
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Sauvegarder des métadonnées
   */
  async saveMetadata(key: string, value: any): Promise<void> {
    const db = await this.initDB();

    const metadata: MetadataRecord = {
      key,
      value,
      timestamp: new Date(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([METADATA_STORE], 'readwrite');
      const store = transaction.objectStore(METADATA_STORE);
      const request = store.put(metadata);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Récupérer des métadonnées
   */
  async getMetadata(key: string): Promise<any | null> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([METADATA_STORE], 'readonly');
      const store = transaction.objectStore(METADATA_STORE);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Vider toute la base de données
   */
  async clearAll(): Promise<void> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PHOTOS_STORE, METADATA_STORE], 'readwrite');

      transaction.objectStore(PHOTOS_STORE).clear();
      transaction.objectStore(METADATA_STORE).clear();

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Vérifier si IndexedDB est disponible
   */
  static isAvailable(): boolean {
    return typeof indexedDB !== 'undefined';
  }
}

// Export singleton
export const indexedDBService = new IndexedDBService();
export default indexedDBService;
