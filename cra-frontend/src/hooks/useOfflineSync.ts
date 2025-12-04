// src/hooks/useOfflineSync.ts - Hook pour la synchronisation offline

import { useState, useEffect, useCallback } from 'react';
import { SyncSummary } from '../types/form.types';
import offlineFormService from '../services/offlineFormService';
import { toast } from 'react-hot-toast';

interface UseOfflineSyncResult {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncResult: SyncSummary | null;
  syncNow: () => Promise<void>;
  storageStats: {
    totalForms: number;
    totalResponses: number;
    estimatedSize: number;
  };
}

export function useOfflineSync(): UseOfflineSyncResult {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncSummary | null>(null);
  const [storageStats, setStorageStats] = useState({
    totalForms: 0,
    totalResponses: 0,
    estimatedSize: 0,
  });

  // Mettre à jour le compteur de réponses en attente
  const updatePendingCount = useCallback(() => {
    const count = offlineFormService.getPendingSyncCount();
    setPendingCount(count);

    const stats = offlineFormService.getStorageStats();
    setStorageStats(stats);
  }, []);

  // Écouter les changements de connexion
  useEffect(() => {
    const unsubscribe = offlineFormService.onConnectionChange((online) => {
      setIsOnline(online);

      if (online) {
        toast.success('Connexion rétablie');
        // Auto-sync si des données en attente
        const pending = offlineFormService.getPendingSyncCount();
        if (pending > 0) {
          toast.info(`${pending} réponse(s) en attente de synchronisation`);
        }
      } else {
        toast.error('Connexion perdue - Mode offline activé');
      }
    });

    return unsubscribe;
  }, []);

  // Mettre à jour le compteur régulièrement
  useEffect(() => {
    updatePendingCount();

    const interval = setInterval(() => {
      updatePendingCount();
    }, 5000); // Toutes les 5 secondes

    return () => clearInterval(interval);
  }, [updatePendingCount]);

  // Synchroniser maintenant
  const syncNow = useCallback(async () => {
    if (!isOnline) {
      toast.error('Impossible de synchroniser hors ligne');
      return;
    }

    if (isSyncing) {
      toast.info('Synchronisation déjà en cours');
      return;
    }

    try {
      setIsSyncing(true);
      toast.loading('Synchronisation en cours...');

      const result = await offlineFormService.syncAllOfflineData();
      setLastSyncResult(result);

      toast.dismiss();

      if (result.failed === 0) {
        toast.success(`${result.successful} réponse(s) synchronisée(s) avec succès`);
      } else {
        toast.warning(
          `${result.successful} réussie(s), ${result.failed} échouée(s)`
        );
      }

      updatePendingCount();
    } catch (err) {
      toast.dismiss();
      const message = err instanceof Error ? err.message : 'Erreur de synchronisation';
      toast.error(message);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, updatePendingCount]);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    lastSyncResult,
    syncNow,
    storageStats,
  };
}
