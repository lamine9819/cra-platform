// =============================================
// 7. UTILITAIRES ET HELPERS SUPPLÉMENTAIRES
// =============================================

// src/hooks/useAuth.ts (mise à jour avec redirection automatique)
import { useAuth as useAuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export const useAuth = () => {
  return useAuthContext();
};

// Hook pour redirection automatique après login
export const useAuthRedirect = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && user) {
      const redirectPath = {
        ADMINISTRATEUR: '/admin',
        CHERCHEUR: '/chercheur',
        COORDONATEUR_PROJET: '/coordonateur',
      }[user.role];

      if (redirectPath) {
        navigate(redirectPath, { replace: true });
      }
    }
  }, [isAuthenticated, user, isLoading, navigate]);
};