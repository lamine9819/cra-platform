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

const OFFLINE_STORAGE_KEY = 'offline_forms';
const DEVICE_ID_KEY = 'device_id';

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
// STOCKAGE LOCAL
// =============================================

function getOfflineStorage(): Record<string, LocalFormData> {
  try {
    const data = localStorage.getItem(OFFLINE_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Erreur lecture stockage offline:', error);
    return {};
  }
}

function saveOfflineStorage(data: Record<string, LocalFormData>): void {
  try {
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Erreur sauvegarde stockage offline:', error);
    throw new Error('Espace de stockage insuffisant');
  }
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

    formData.responses.push({
      ...response,
      isOffline: true,
      deviceId: getDeviceId(),
    });

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
   * Synchroniser toutes les réponses offline
   */
  syncAllOfflineData: async (): Promise<SyncSummary> => {
    const storage = getOfflineStorage();
    const deviceId = getDeviceId();
    const results: any[] = [];
    let successful = 0;
    let failed = 0;

    for (const formId in storage) {
      const formData = storage[formId];

      if (formData.responses.length === 0) continue;

      for (const response of formData.responses) {
        try {
          await formApi.submitFormResponse(formId, response);
          successful++;
          results.push({
            syncId: `${formId}_${Date.now()}`,
            success: true,
          });
        } catch (error) {
          failed++;
          results.push({
            syncId: `${formId}_${Date.now()}`,
            success: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue',
          });
        }
      }

      // Vider les réponses synchronisées
      if (failed === 0) {
        formData.responses = [];
        formData.lastSync = new Date();
      }
    }

    saveOfflineStorage(storage);

    return {
      totalProcessed: successful + failed,
      successful,
      failed,
      results,
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
