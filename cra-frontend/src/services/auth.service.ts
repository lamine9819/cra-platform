// src/services/auth.service.ts
import api from './api';
import { LoginCredentials, AuthResponse, User } from '../types/auth.types';
import { AxiosResponse } from 'axios';

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Le backend définira automatiquement le cookie HttpOnly
      const response: AxiosResponse<{ success: boolean; data: { user: User; message: string } }> = await api.post('/auth/login', credentials);

      if (response.data.success) {
        const { user } = response.data.data;

        // Stocker uniquement les données utilisateur (pas le token)
        localStorage.setItem('cra_user_data', JSON.stringify(user));

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
          token: '' // Le token n'est plus exposé au frontend
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
      // Le backend supprimera automatiquement le cookie HttpOnly
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

  isAuthenticated(): boolean {
    // Vérifier uniquement si l'utilisateur est stocké
    // Le cookie HttpOnly sera automatiquement envoyé avec les requêtes
    const user = this.getStoredUser();
    return !!user;
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
    // Nettoyer uniquement les données utilisateur locales
    // Le cookie HttpOnly sera supprimé par le backend
    localStorage.removeItem('cra_user_data');
    localStorage.removeItem('cra_remember_me');
  }

  getRoleBasedRedirectPath(role: string): string {
    const roleRoutes = {
      ADMINISTRATEUR: '/admin',
      CHERCHEUR: '/chercheur',
      COORDONATEUR_PROJET: '/chercheur' // Coordinateurs utilisent le même espace que chercheurs
    };

    return roleRoutes[role as keyof typeof roleRoutes] || '/dashboard';
  }
}

export const authService = new AuthService();