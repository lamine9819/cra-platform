// src/services/offlineFormService.ts - Service pour la gestion offline des formulaires

import {
  Form,
  FormSchema,
  SubmitFormResponseRequest,
  LocalFormData,
  PhotoData,
  SyncSummary,
} from '../types/form.types';
import formApi from './formApi';
import indexedDBService from './indexedDBService';
import encryptionService, { EncryptedData } from './encryptionService';

const OFFLINE_STORAGE_KEY = 'offline_forms';
const DEVICE_ID_KEY = 'device_id';
const STORAGE_VERSION_KEY = 'offline_storage_version';
const CURRENT_STORAGE_VERSION = 1; // Incrémenter lors de changements majeurs
const MAX_RESPONSES_PER_FORM = 100; // Limite de réponses par formulaire
const MAX_PHOTOS_PER_RESPONSE = 10; // Limite de photos par réponse
const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2MB par photo
const SYNC_CONCURRENCY = 3; // Nombre de requêtes simultanées lors de la sync

// =============================================
// GESTION DU DEVICE ID
// =============================================

function getDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

// =============================================
// VERSIONING DU STOCKAGE
// =============================================

function checkAndMigrateStorage(): void {
  const currentVersion = parseInt(localStorage.getItem(STORAGE_VERSION_KEY) || '0', 10);

  if (currentVersion === 0) {
    // Première installation, définir la version
    localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_STORAGE_VERSION.toString());
    return;
  }

  if (currentVersion < CURRENT_STORAGE_VERSION) {
    console.log(`Migration du stockage de v${currentVersion} vers v${CURRENT_STORAGE_VERSION}`);

    // Logique de migration ici selon les versions
    try {
      const rawData = localStorage.getItem(OFFLINE_STORAGE_KEY);
      const storage = rawData ? JSON.parse(rawData) : {};

      // Ajouter des métadonnées de version à chaque formulaire si manquantes
      Object.values(storage).forEach((formData: any) => {
        if (!formData.version) {
          formData.version = CURRENT_STORAGE_VERSION;
        }
      });

      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(storage));
      localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_STORAGE_VERSION.toString());
      console.log('Migration réussie');
    } catch (error) {
      console.error('Erreur lors de la migration:', error);
      // En cas d'erreur critique, on peut choisir de vider le cache
      // localStorage.removeItem(OFFLINE_STORAGE_KEY);
    }
  }
}

// =============================================
// STOCKAGE LOCAL
// =============================================

function getOfflineStorage(): Record<string, LocalFormData> {
  try {
    // Vérifier et migrer si nécessaire
    checkAndMigrateStorage();

    const data = localStorage.getItem(OFFLINE_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Erreur lecture stockage offline:', error);
    return {};
  }
}

function saveOfflineStorage(data: Record<string, LocalFormData>): void {
  try {
    const jsonData = JSON.stringify(data);
    const estimatedSize = new Blob([jsonData]).size;
    const maxSize = 5 * 1024 * 1024; // 5MB limite recommandée pour localStorage

    if (estimatedSize > maxSize) {
      throw new Error(`Taille des données (${(estimatedSize / 1024 / 1024).toFixed(2)}MB) dépasse la limite de ${maxSize / 1024 / 1024}MB. Veuillez synchroniser vos données ou supprimer des formulaires.`);
    }

    localStorage.setItem(OFFLINE_STORAGE_KEY, jsonData);
  } catch (error: any) {
    console.error('Erreur sauvegarde stockage offline:', error);

    // Gestion spécifique de QuotaExceededError
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      throw new Error('Espace de stockage insuffisant. Veuillez synchroniser vos données en ligne ou libérer de l\'espace.');
    }

    // Propager l'erreur custom si déjà formatée
    if (error.message && error.message.includes('dépasse la limite')) {
      throw error;
    }

    throw new Error('Erreur lors de la sauvegarde des données offline');
  }
}

// =============================================
// RETRY AVEC BACKOFF EXPONENTIEL
// =============================================

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Erreur inconnue');

      // Ne pas retry si c'est une erreur client (4xx)
      if (error && typeof error === 'object' && 'response' in error) {
        const status = (error as any).response?.status;
        if (status && status >= 400 && status < 500) {
          throw error; // Erreur client, pas de retry
        }
      }

      // Dernier essai, lancer l'erreur
      if (attempt === maxRetries - 1) {
        break;
      }

      // Calculer le délai avec backoff exponentiel et jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      console.log(`Tentative ${attempt + 1}/${maxRetries} échouée. Nouvelle tentative dans ${Math.round(delay)}ms...`);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Échec après plusieurs tentatives');
}

// =============================================
// POOL DE CONCURRENCE POUR LIMITER LES REQUÊTES PARALLÈLES
// =============================================

async function runWithConcurrencyLimit<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  concurrency: number
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = [];
  const executing: Promise<void>[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const promise = fn(item, i).then(
      (value) => {
        results[i] = { status: 'fulfilled', value };
      },
      (reason) => {
        results[i] = { status: 'rejected', reason };
      }
    );

    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
      executing.splice(executing.findIndex(p => p === promise), 1);
    }
  }

  await Promise.all(executing);
  return results;
}

// =============================================
// COMPRESSION DES PHOTOS
// =============================================

async function compressPhoto(
  base64: string,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas non supporté'));
        return;
      }

      // Redimensionner si trop grande
      let width = img.width;
      let height = img.height;
      const maxDimension = 1920;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = (height / width) * maxDimension;
          width = maxDimension;
        } else {
          width = (width / height) * maxDimension;
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Compresser
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };
    img.onerror = () => reject(new Error('Erreur chargement image'));
    img.src = base64;
  });
}

// =============================================
// CAPTURE DE PHOTOS
// =============================================

/**
 * Capture une photo en utilisant la caméra de l'appareil avec prévisualisation
 * Utilise l'API MediaDevices pour un contrôle complet de la caméra
 */
export async function capturePhotoWithCamera(options?: {
  enableGPS?: boolean;
  quality?: number;
  facingMode?: 'user' | 'environment';
}): Promise<PhotoData> {
  return new Promise(async (resolve, reject) => {
    let stream: MediaStream | null = null;

    try {
      // Vérifier si l'API est disponible
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('API caméra non disponible sur cet appareil');
      }

      // Créer l'interface de capture
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 10000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      `;

      const video = document.createElement('video');
      video.style.cssText = `
        max-width: 90%;
        max-height: 70vh;
        border-radius: 8px;
      `;
      video.autoplay = true;
      video.playsInline = true;

      const buttonsContainer = document.createElement('div');
      buttonsContainer.style.cssText = `
        display: flex;
        gap: 16px;
        margin-top: 20px;
      `;

      const captureBtn = document.createElement('button');
      captureBtn.textContent = '📸 Prendre la photo';
      captureBtn.style.cssText = `
        padding: 16px 32px;
        font-size: 16px;
        background: #10b981;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
      `;

      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = '✕ Annuler';
      cancelBtn.style.cssText = `
        padding: 16px 32px;
        font-size: 16px;
        background: #ef4444;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
      `;

      buttonsContainer.appendChild(captureBtn);
      buttonsContainer.appendChild(cancelBtn);
      overlay.appendChild(video);
      overlay.appendChild(buttonsContainer);
      document.body.appendChild(overlay);

      // Démarrer la caméra
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: options?.facingMode || 'environment', // Caméra arrière par défaut
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      video.srcObject = stream;

      // Bouton Capturer
      captureBtn.onclick = async () => {
        try {
          // Créer un canvas pour capturer l'image
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            throw new Error('Impossible de créer le contexte canvas');
          }

          ctx.drawImage(video, 0, 0);

          // Convertir en base64
          let base64 = canvas.toDataURL('image/jpeg', options?.quality || 0.8);

          // Arrêter la caméra
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
          document.body.removeChild(overlay);

          const photoData: PhotoData = {
            type: 'photo',
            base64,
            filename: `photo_${Date.now()}.jpg`,
            mimeType: 'image/jpeg',
            takenAt: new Date(),
          };

          // Capturer GPS si demandé
          if (options?.enableGPS && navigator.geolocation) {
            try {
              const position = await new Promise<GeolocationPosition>((res, rej) => {
                navigator.geolocation.getCurrentPosition(res, rej, {
                  enableHighAccuracy: true,
                  timeout: 5000
                });
              });
              photoData.latitude = position.coords.latitude;
              photoData.longitude = position.coords.longitude;
            } catch (gpsError) {
              console.warn('Impossible de capturer la position GPS:', gpsError);
            }
          }

          resolve(photoData);
        } catch (error) {
          reject(error);
        }
      };

      // Bouton Annuler
      cancelBtn.onclick = () => {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        document.body.removeChild(overlay);
        reject(new Error('Capture annulée par l\'utilisateur'));
      };

    } catch (error) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      reject(error);
    }
  });
}

/**
 * Capture une photo en utilisant le sélecteur de fichiers (fallback)
 * Utilise l'attribut capture pour ouvrir la caméra sur mobile
 */
export async function capturePhoto(options?: {
  enableGPS?: boolean;
  quality?: number;
}): Promise<PhotoData> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Utiliser la caméra arrière

    input.onchange = async (event: any) => {
      const file = event.target.files?.[0];
      if (!file) {
        reject(new Error('Aucune photo sélectionnée'));
        return;
      }

      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          let base64 = e.target?.result as string;

          // Compresser la photo
          if (options?.quality) {
            base64 = await compressPhoto(base64, options.quality);
          }

          const photoData: PhotoData = {
            type: 'photo',
            base64,
            filename: file.name,
            mimeType: file.type,
            takenAt: new Date(),
          };

          // Capturer GPS si demandé
          if (options?.enableGPS && navigator.geolocation) {
            try {
              const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
              });
              photoData.latitude = position.coords.latitude;
              photoData.longitude = position.coords.longitude;
            } catch (gpsError) {
              console.warn('Impossible de capturer la position GPS:', gpsError);
            }
          }

          resolve(photoData);
        };
        reader.onerror = () => reject(new Error('Erreur lecture fichier'));
        reader.readAsDataURL(file);
      } catch (error) {
        reject(error);
      }
    };

    input.click();
  });
}

// =============================================
// GESTION DES PHOTOS AVEC INDEXEDDB
// =============================================

/**
 * Sauvegarder une photo dans IndexedDB (plus efficace que base64)
 */
async function savePhotoToIndexedDB(
  formId: string,
  fieldId: string,
  responseIndex: number,
  photoData: PhotoData
): Promise<string> {
  if (!indexedDBService.isAvailable()) {
    console.warn('IndexedDB non disponible, utilisation du stockage base64');
    return photoData.base64; // Fallback
  }

  try {
    // Convertir base64 en Blob pour stockage optimisé
    const blob = indexedDBService.base64ToBlob(photoData.base64, photoData.mimeType);

    const photoId = await indexedDBService.savePhoto({
      formId,
      fieldId,
      responseIndex,
      blob,
      filename: photoData.filename,
      mimeType: photoData.mimeType,
      takenAt: photoData.takenAt,
      latitude: photoData.latitude,
      longitude: photoData.longitude,
      caption: photoData.caption,
    });

    return photoId; // Retourne l'ID au lieu du base64
  } catch (error) {
    console.error('Erreur sauvegarde photo IndexedDB:', error);
    return photoData.base64; // Fallback sur base64
  }
}

/**
 * Récupérer une photo depuis IndexedDB et la convertir en PhotoData
 */
async function getPhotoFromIndexedDB(photoId: string): Promise<PhotoData | null> {
  if (!indexedDBService.isAvailable()) {
    return null;
  }

  try {
    const photo = await indexedDBService.getPhoto(photoId);
    if (!photo) return null;

    const base64 = await indexedDBService.blobToBase64(photo.blob);

    return {
      type: 'photo',
      base64,
      filename: photo.filename,
      mimeType: photo.mimeType,
      takenAt: photo.takenAt,
      latitude: photo.latitude,
      longitude: photo.longitude,
      caption: photo.caption,
      fieldId: photo.fieldId,
    };
  } catch (error) {
    console.error('Erreur récupération photo IndexedDB:', error);
    return null;
  }
}

// =============================================
// SERVICE OFFLINE
// =============================================

export const offlineFormService = {
  /**
   * Télécharger un formulaire pour utilisation offline
   */
  downloadFormForOffline: async (formId: string): Promise<void> => {
    const form = await formApi.getFormById(formId);
    const storage = getOfflineStorage();

    storage[formId] = {
      formId: form.id,
      schema: form.schema,
      responses: [],
      lastSync: new Date(),
    };

    saveOfflineStorage(storage);
  },

  /**
   * Vérifier si un formulaire est disponible offline
   */
  isFormAvailableOffline: (formId: string): boolean => {
    const storage = getOfflineStorage();
    return !!storage[formId];
  },

  /**
   * Obtenir un formulaire depuis le stockage offline
   */
  getOfflineForm: (formId: string): LocalFormData | null => {
    const storage = getOfflineStorage();
    return storage[formId] || null;
  },

  /**
   * Sauvegarder une réponse en mode offline
   */
  saveOfflineResponse: async (
    formId: string,
    response: SubmitFormResponseRequest,
    formSchema?: FormSchema
  ): Promise<void> => {
    const storage = getOfflineStorage();
    let formData = storage[formId];

    // Si le formulaire n'est pas disponible offline, le télécharger d'abord ou utiliser le schema fourni
    if (!formData) {
      if (formSchema) {
        // Utiliser le schema fourni
        formData = {
          formId: formId,
          schema: formSchema,
          responses: [],
          lastSync: new Date(),
        };
        storage[formId] = formData;
      } else {
        // Essayer de télécharger le formulaire
        try {
          await offlineFormService.downloadFormForOffline(formId);
          const updatedStorage = getOfflineStorage();
          formData = updatedStorage[formId];
        } catch (error) {
          console.error('Erreur lors du téléchargement du formulaire:', error);
          // Si on ne peut pas télécharger, créer une entrée minimale
          formData = {
            formId: formId,
            schema: { fields: [] } as any,
            responses: [],
            lastSync: new Date(),
          };
          storage[formId] = formData;
        }
      }
    }

    // Vérifier les limites
    if (formData.responses.length >= MAX_RESPONSES_PER_FORM) {
      throw new Error(`Limite atteinte : ${MAX_RESPONSES_PER_FORM} réponses maximum par formulaire. Veuillez synchroniser vos données.`);
    }

    // Vérifier le nombre de photos
    if (response.photos && response.photos.length > MAX_PHOTOS_PER_RESPONSE) {
      throw new Error(`Limite atteinte : ${MAX_PHOTOS_PER_RESPONSE} photos maximum par réponse.`);
    }

    // Vérifier la taille des photos
    if (response.photos) {
      for (const photo of response.photos) {
        const photoSize = photo.base64 ? new Blob([photo.base64]).size : 0;
        if (photoSize > MAX_PHOTO_SIZE) {
          throw new Error(`Photo trop volumineuse : ${(photoSize / 1024 / 1024).toFixed(2)}MB. Maximum autorisé : ${MAX_PHOTO_SIZE / 1024 / 1024}MB.`);
        }
      }
    }

    const responseIndex = formData.responses.length;

    // Sauvegarder les photos dans IndexedDB si disponible
    const photoIds: string[] = [];
    if (response.photos && indexedDBService.isAvailable()) {
      try {
        for (const photo of response.photos) {
          const photoId = await savePhotoToIndexedDB(
            formId,
            photo.fieldId || '',
            responseIndex,
            photo
          );
          photoIds.push(photoId);
        }
      } catch (error) {
        console.error('Erreur sauvegarde photos IndexedDB:', error);
        // Continue avec base64 si IndexedDB échoue
      }
    }

    // Chiffrer les données sensibles si le chiffrement est disponible
    let responseData: any = {
      ...response,
      isOffline: true,
      deviceId: getDeviceId(),
      offlineTimestamp: new Date().toISOString(),
      schemaVersion: (formSchema as any)?.version || formData.schema.version || CURRENT_STORAGE_VERSION,
    };

    // Si photos stockées dans IndexedDB, ne garder que les IDs
    if (photoIds.length > 0) {
      responseData.photoIds = photoIds;
      responseData.photos = []; // Vider les photos base64
      responseData.useIndexedDB = true;
    }

    // Chiffrer les champs sensibles (email, nom, données personnelles)
    if (encryptionService.isAvailable()) {
      try {
        // Définir les champs sensibles à chiffrer
        const sensitiveFields = ['collectorEmail', 'collectorName'];

        // Chiffrer aussi les données du formulaire si elles contiennent des emails
        if (responseData.data) {
          const dataKeys = Object.keys(responseData.data);
          dataKeys.forEach(key => {
            // Détecter les champs email ou personnels
            if (key.toLowerCase().includes('email') ||
                key.toLowerCase().includes('phone') ||
                key.toLowerCase().includes('telephone') ||
                key.toLowerCase().includes('nom') ||
                key.toLowerCase().includes('prenom')) {
              sensitiveFields.push(`data.${key}`);
            }
          });
        }

        responseData = await encryptionService.encryptSensitiveFields(
          responseData,
          sensitiveFields
        );
      } catch (error) {
        console.error('Erreur chiffrement données sensibles:', error);
        // Continue sans chiffrement si erreur
      }
    }

    // Ajouter métadonnées pour détection de conflits
    formData.responses.push(responseData);

    saveOfflineStorage(storage);
  },

  /**
   * Obtenir le nombre de réponses en attente de synchronisation
   */
  getPendingSyncCount: (): number => {
    const storage = getOfflineStorage();
    let count = 0;

    Object.values(storage).forEach((formData) => {
      count += formData.responses.length;
    });

    return count;
  },

  /**
   * Détecter les conflits potentiels (réponses trop anciennes ou schéma obsolète)
   */
  detectConflicts: (): {
    formId: string;
    responseIndex: number;
    issue: string;
  }[] => {
    const storage = getOfflineStorage();
    const conflicts: { formId: string; responseIndex: number; issue: string }[] = [];
    const maxAgeHours = 72; // 3 jours maximum

    Object.entries(storage).forEach(([formId, formData]) => {
      formData.responses.forEach((response: any, index: number) => {
        // Vérifier l'âge de la réponse
        if (response.offlineTimestamp) {
          const ageMs = Date.now() - new Date(response.offlineTimestamp).getTime();
          const ageHours = ageMs / (1000 * 60 * 60);

          if (ageHours > maxAgeHours) {
            conflicts.push({
              formId,
              responseIndex: index,
              issue: `Réponse vieille de ${Math.round(ageHours)}h (risque de conflit)`,
            });
          }
        }

        // Vérifier la version du schéma
        if (response.schemaVersion && response.schemaVersion < CURRENT_STORAGE_VERSION) {
          conflicts.push({
            formId,
            responseIndex: index,
            issue: `Version du schéma obsolète (v${response.schemaVersion} vs v${CURRENT_STORAGE_VERSION})`,
          });
        }
      });
    });

    return conflicts;
  },

  /**
   * Synchroniser toutes les réponses offline (optimisé avec concurrence limitée)
   */
  syncAllOfflineData: async (): Promise<SyncSummary> => {
    const storage = getOfflineStorage();
    const deviceId = getDeviceId();
    const allResults: any[] = [];
    let successful = 0;
    let failed = 0;

    for (const formId in storage) {
      const formData = storage[formId];

      if (formData.responses.length === 0) continue;

      // Synchroniser les réponses en parallèle avec limite de concurrence
      const syncResults = await runWithConcurrencyLimit(
        formData.responses,
        async (response: any, index) => {
          // Préparer la réponse pour envoi
          let preparedResponse = { ...response };

          // Déchiffrer les données sensibles si nécessaire
          if (preparedResponse._encrypted && encryptionService.isAvailable()) {
            try {
              preparedResponse = await encryptionService.decryptSensitiveFields(preparedResponse);
            } catch (error) {
              console.error('Erreur déchiffrement:', error);
              // Continue avec données chiffrées si erreur
            }
          }

          // Récupérer les photos depuis IndexedDB si nécessaire
          if (preparedResponse.useIndexedDB && preparedResponse.photoIds && indexedDBService.isAvailable()) {
            try {
              const photos = [];
              for (const photoId of preparedResponse.photoIds) {
                const photo = await getPhotoFromIndexedDB(photoId);
                if (photo) {
                  photos.push(photo);
                }
              }
              preparedResponse.photos = photos;
              delete preparedResponse.photoIds;
              delete preparedResponse.useIndexedDB;
            } catch (error) {
              console.error('Erreur récupération photos IndexedDB:', error);
              // Continue sans photos si erreur
            }
          }

          // Nettoyer les métadonnées offline (garder isOffline et deviceId car acceptés par le backend)
          delete preparedResponse.offlineTimestamp;
          delete preparedResponse.schemaVersion;
          delete preparedResponse._encrypted; // Supprimer le marqueur de chiffrement

          // Utiliser retry avec backoff exponentiel
          await retryWithBackoff(
            () => formApi.submitFormResponse(formId, preparedResponse),
            3, // 3 tentatives maximum
            1000 // 1s délai de base
          );

          // Supprimer les photos d'IndexedDB après sync réussie
          if (response.photoIds && indexedDBService.isAvailable()) {
            for (const photoId of response.photoIds) {
              try {
                await indexedDBService.deletePhoto(photoId);
              } catch (error) {
                console.error('Erreur suppression photo IndexedDB:', error);
              }
            }
          }

          return { response, index };
        },
        SYNC_CONCURRENCY
      );

      // Analyser les résultats et garder uniquement les réponses échouées
      const responsesToKeep: any[] = [];

      syncResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successful++;
          allResults.push({
            syncId: `${formId}_${Date.now()}_${index}`,
            success: true,
          });
        } else {
          failed++;
          allResults.push({
            syncId: `${formId}_${Date.now()}_${index}`,
            success: false,
            error: result.reason instanceof Error ? result.reason.message : 'Erreur inconnue',
          });
          // Garder cette réponse pour retry ultérieur
          responsesToKeep.push(formData.responses[index]);
        }
      });

      // Mettre à jour avec uniquement les réponses qui ont échoué
      formData.responses = responsesToKeep;
      formData.lastSync = new Date();
    }

    saveOfflineStorage(storage);

    return {
      totalProcessed: successful + failed,
      successful,
      failed,
      results: allResults,
    };
  },

  /**
   * Vider le cache offline
   */
  clearOfflineCache: (): void => {
    localStorage.removeItem(OFFLINE_STORAGE_KEY);
  },

  /**
   * Supprimer un formulaire du cache offline
   */
  removeOfflineForm: (formId: string): void => {
    const storage = getOfflineStorage();
    delete storage[formId];
    saveOfflineStorage(storage);
  },

  /**
   * Obtenir l'état de la connexion
   */
  isOnline: (): boolean => {
    return navigator.onLine;
  },

  /**
   * Écouter les changements de connexion
   */
  onConnectionChange: (callback: (isOnline: boolean) => void): () => void => {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  },

  /**
   * Obtenir des statistiques de stockage
   */
  getStorageStats: (): {
    totalForms: number;
    totalResponses: number;
    estimatedSize: number;
  } => {
    const storage = getOfflineStorage();
    const forms = Object.values(storage);

    let totalResponses = 0;
    forms.forEach((form) => {
      totalResponses += form.responses.length;
    });

    const estimatedSize = new Blob([JSON.stringify(storage)]).size;

    return {
      totalForms: forms.length,
      totalResponses,
      estimatedSize,
    };
  },
};

export default offlineFormService;
