// =============================================
// 3. CONTEXTE D'AUTHENTIFICATION
// =============================================

// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState, UserRole } from '../types/auth.types';
import { authService } from '../services/auth.service';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Vérifier l'état d'authentification au chargement
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: 'AUTH_START' });

      try {
        const storedUser = authService.getStoredUser();
        const storedToken = authService.getStoredToken();

        if (storedUser && storedToken) {
          // Vérifier la validité du token en récupérant le profil
          try {
            const currentUser = await authService.getProfile();
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user: currentUser, token: storedToken }
            });
          } catch (error) {
            // Token invalide, nettoyer le stockage
            await authService.logout();
            dispatch({ type: 'AUTH_LOGOUT' });
          }
        } else {
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'auth:', error);
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe = false) => {
    dispatch({ type: 'AUTH_START' });

    try {
      const response = await authService.login({
        email,
        password,
        rememberMe
      });

      if (response.success) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data.user,
            token: response.data.token
          }
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.message || 'Erreur lors de la connexion'
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn('Erreur lors de la déconnexion:', error);
    } finally {
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const refreshProfile = async () => {
    if (!state.isAuthenticated) return;

    try {
      const updatedUser = await authService.getProfile();
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du profil:', error);
      // En cas d'erreur, déconnecter l'utilisateur
      await logout();
    }
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!state.user) return false;
    
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.includes(state.user.role);
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    refreshProfile,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};