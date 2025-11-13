// src/components/reports/ReportDropdown.tsx - VERSION CORRIGÉE
import React, { useState } from 'react';
import { ChevronDown, Download, Eye, FileText, Activity, Users } from 'lucide-react';
import { useReports } from '../../hooks/useReports';

interface ReportDropdownProps {
  entityType: 'project' | 'activity';
  entityId: string;
  entityTitle: string;
  children?: React.ReactNode;
  className?: string;
}

const ReportDropdown: React.FC<ReportDropdownProps> = ({
  entityType,
  entityId,
  entityTitle,
  children,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { downloadReport, previewReport, loading } = useReports();

  // ✅ CORRECTION PRINCIPALE : Méthode unifiée pour récupérer l'utilisateur
  const getCurrentUserInfo = () => {
    console.log('🔍 ReportDropdown getCurrentUserInfo');
    
    try {
      // ✅ Utiliser la bonne clé localStorage comme dans api.ts
      const userStr = localStorage.getItem('cra_user_data');
      console.log('🔍 cra_user_data in dropdown:', userStr);
      
      if (userStr) {
        const user = JSON.parse(userStr);
        console.log('🔍 parsed user in dropdown:', user);
        
        if (user && user.id) {
          console.log('✅ Dropdown using cra_user_data:', user.id);
          return { 
            id: user.id, 
            name: user.name || `${user.firstName} ${user.lastName}` 
          };
        }
      }
    } catch (e) {
      console.error('❌ Error parsing cra_user_data in dropdown:', e);
    }
    
    // Fallback avec d'autres clés possibles
    const fallbackKeys = ['user', 'authUser', 'currentUser'];
    for (const key of fallbackKeys) {
      try {
        const userStr = localStorage.getItem(key);
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user && user.id) {
            console.log(`✅ Dropdown fallback found user in ${key}:`, user.id);
            return { 
              id: user.id, 
              name: user.name || `${user.firstName} ${user.lastName}` 
            };
          }
        }
      } catch (e) {
        console.warn(`❌ Error parsing ${key} in dropdown:`, e);
      }
    }
    
    console.error('❌ Dropdown: Aucune donnée utilisateur trouvée');
    return null;
  };

  const handleDownload = async (type: string) => {
    try {
      console.log(`🔍 ReportDropdown handleDownload - type: ${type}`);
      
      // Pour le rapport utilisateur, utiliser l'ID de l'utilisateur actuel
      if (type === 'user') {
        const userInfo = getCurrentUserInfo();
        console.log('🔍 User info for dropdown download:', userInfo);
        
        if (!userInfo?.id) {
          alert('Impossible de récupérer les informations utilisateur. Veuillez vous reconnecter.');
          return;
        }
        
        console.log(`🚀 Downloading user report for user: ${userInfo.id}`);
        await downloadReport(type, userInfo.id);
      } else {
        console.log(`🚀 Downloading ${type} report for entity: ${entityId}`);
        await downloadReport(type, entityId);
      }
      
      console.log('✅ Dropdown download successful');
      setIsOpen(false);
    } catch (err: any) {
      console.error('❌ Erreur téléchargement dropdown:', err);
      alert(`Erreur lors du téléchargement: ${err.message || 'Erreur inconnue'}`);
    }
  };

  const handlePreview = async (type: string) => {
    try {
      console.log(`🔍 ReportDropdown handlePreview - type: ${type}`);
      
      if (type === 'user') {
        const userInfo = getCurrentUserInfo();
        console.log('🔍 User info for dropdown preview:', userInfo);
        
        if (!userInfo?.id) {
          alert('Impossible de récupérer les informations utilisateur. Veuillez vous reconnecter.');
          return;
        }
        
        console.log(`🚀 Previewing user report for user: ${userInfo.id}`);
        await previewReport(type, userInfo.id);
      } else {
        console.log(`🚀 Previewing ${type} report for entity: ${entityId}`);
        await previewReport(type, entityId);
      }
      
      console.log('✅ Dropdown preview successful');
      setIsOpen(false);
    } catch (err: any) {
      console.error('❌ Erreur prévisualisation dropdown:', err);
      alert(`Erreur lors de la prévisualisation: ${err.message || 'Erreur inconnue'}`);
    }
  };

  // Types de rapports disponibles avec typage correct
  type ReportOption = {
    type: 'project' | 'activity' | 'user';
    label: string;
    icon: any;
    description: string;
  };

  const reportOptions: ReportOption[] = [
    {
      type: entityType,
      label: entityType === 'project' ? 'Rapport de projet' : 'Rapport d\'activité',
      icon: entityType === 'project' ? FileText : Activity,
      description: 'Rapport complet avec toutes les informations'
    }
  ];

  // Si c'est un projet, ajouter le rapport utilisateur
  if (entityType === 'project') {
    const currentUserInfo = getCurrentUserInfo();
    if (currentUserInfo?.id) {
      reportOptions.push({
        type: 'user' as const,
        label: 'Mon rapport d\'activité',
        icon: Users,
        description: 'Votre rapport d\'activité personnel'
      });
    }
  }

  return (
    <div className={`relative inline-block text-left ${className}`}>
      {children ? (
        <div onClick={() => setIsOpen(!isOpen)}>
          {children}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FileText className="h-4 w-4" />
          Rapports
          <ChevronDown className="h-4 w-4" />
        </button>
      )}

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute right-0 z-20 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="p-3 border-b border-gray-100">
              <h4 className="font-medium text-gray-900 truncate">
                {entityTitle}
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Sélectionnez un type de rapport
              </p>

            </div>
            
            <div className="py-2">
              {reportOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div key={option.type} className="px-3 py-2">
                    <div className="flex items-start gap-3">
                      <Icon className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-medium text-gray-900">
                          {option.label}
                        </h5>
                        <p className="text-xs text-gray-500 mt-1">
                          {option.description}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handlePreview(option.type)}
                            disabled={loading}
                            className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                          >
                            <Eye className="h-3 w-3 inline mr-1" />
                            Prévisualiser
                          </button>
                          <button
                            onClick={() => handleDownload(option.type)}
                            disabled={loading}
                            className="text-xs text-green-600 hover:text-green-800 disabled:opacity-50"
                          >
                            <Download className="h-3 w-3 inline mr-1" />
                            Télécharger
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="p-2 border-t border-gray-100 text-center">
              <button
                onClick={() => {
                  // Rediriger vers la page rapports complète
                  window.location.href = '/chercheur/reports';
                }}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Voir tous les rapports →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export { ReportDropdown };