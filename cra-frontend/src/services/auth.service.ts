// src/services/auth.service.ts
import api, { setAuthToken } from './api';
import { LoginCredentials, AuthResponse, User } from '../types/auth.types';
import { AxiosResponse } from 'axios';

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { user: User; token: string; message: string } }> = await api.post('/auth/login', credentials);

      if (response.data.success) {
        const { user, token } = response.data.data;

        // Stocker les données d'authentification
        localStorage.setItem('cra_auth_token', token);
        localStorage.setItem('cra_user_data', JSON.stringify(user));

        // Mettre à jour le header Authorization de l'instance Axios
        setAuthToken(token);

        // Remember me
        if (credentials.rememberMe) {
          localStorage.setItem('cra_remember_me', 'true');
        }
      }

      // Adapter la réponse au format AuthResponse attendu
      return {
        success: response.data.success,
        message: response.data.data.message,
        data: {
          user: response.data.data.user,
          token: response.data.data.token
        }
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
        'Erreur lors de la connexion. Veuillez réessayer.'
      );
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Erreur lors de la déconnexion côté serveur:', error);
    } finally {
      // Nettoyer le localStorage dans tous les cas
      this.clearAuthData();
    }
  }

  async getProfile(): Promise<User> {
    try {
      const response: AxiosResponse<{ data: User }> = await api.get('/auth/profile');
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Erreur lors de la récupération du profil'
      );
    }
  }

  getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem('cra_user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erreur lors du parsing des données utilisateur:', error);
      return null;
    }
  }

  getStoredToken(): string | null {
    return localStorage.getItem('cra_auth_token');
  }

  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    return !!(token && user);
  }

  async changePassword(passwordData: ChangePasswordRequest): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { message: string } }> = await api.post('/auth/change-password', passwordData);

      return {
        message: response.data.data.message || 'Mot de passe modifié avec succès'
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
        'Erreur lors du changement de mot de passe'
      );
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem('cra_auth_token');
    localStorage.removeItem('cra_refresh_token');
    localStorage.removeItem('cra_user_data');
    localStorage.removeItem('cra_remember_me');

    // Supprimer le header Authorization de l'instance Axios
    setAuthToken(null);
  }

  getRoleBasedRedirectPath(role: string): string {
    const roleRoutes = {
      ADMINISTRATEUR: '/admin',
      CHERCHEUR: '/chercheur',
      COORDONATEUR_PROJET: '/coordonateur'
    };

    return roleRoutes[role as keyof typeof roleRoutes] || '/dashboard';
  }
}

export const authService = new AuthService();