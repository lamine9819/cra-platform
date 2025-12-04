// src/pages/chercheur/FormsPage.tsx - Page principale des formulaires

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormsList from '../../components/forms/FormsList';
import { Form } from '../../types/form.types';
import { FileText, Database, WifiOff } from 'lucide-react';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { toast } from 'react-hot-toast';

export const FormsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isOnline, pendingCount, isSyncing, syncNow, storageStats } = useOfflineSync();

  const handleCreateForm = () => {
    navigate('/chercheur/forms/create');
  };

  const handleEditForm = (form: Form) => {
    navigate(`/chercheur/forms/${form.id}/edit`);
  };

  const handleSyncOfflineData = async () => {
    try {
      await syncNow();
    } catch (err) {
      toast.error('Erreur lors de la synchronisation');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bannière de synchronisation offline */}
      {(!isOnline || pendingCount > 0) && (
        <div className={`${isOnline ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} border-b`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {!isOnline ? (
                  <>
                    <WifiOff className="w-5 h-5 text-orange-600 mr-2" />
                    <span className="text-orange-800">
                      Mode offline actif
                      {pendingCount > 0 && ` - ${pendingCount} réponse(s) en attente`}
                    </span>
                  </>
                ) : (
                  <>
                    <Database className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-blue-800">
                      {pendingCount} réponse(s) en attente de synchronisation
                    </span>
                  </>
                )}
              </div>

              {isOnline && pendingCount > 0 && (
                <button
                  onClick={handleSyncOfflineData}
                  disabled={isSyncing}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm"
                >
                  {isSyncing ? 'Synchronisation...' : 'Synchroniser maintenant'}
                </button>
              )}
            </div>

            {/* Statistiques de stockage */}
            {storageStats.totalResponses > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                {storageStats.totalForms} formulaire(s) téléchargé(s) •{' '}
                {storageStats.totalResponses} réponse(s) stockée(s) •{' '}
                {(storageStats.estimatedSize / 1024 / 1024).toFixed(2)} MB utilisés
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <FormsList
        onCreateForm={handleCreateForm}
        onEditForm={handleEditForm}
      />
    </div>
  );
};

export default FormsPage;
