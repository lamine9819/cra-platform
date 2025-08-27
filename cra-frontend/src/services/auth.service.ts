// src/services/auth.service.ts
import api from './api';
import { LoginCredentials, AuthResponse, User } from '../types/auth.types';
import { AxiosResponse } from 'axios';
export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', credentials);
      
      if (response.data.success) {
        const { user, token, refreshToken } = response.data.data;
        
        // Stocker les données d'authentification
        localStorage.setItem('cra_auth_token', token);
        localStorage.setItem('cra_user_data', JSON.stringify(user));
        
        if (refreshToken) {
          localStorage.setItem('cra_refresh_token', refreshToken);
        }
        
        // Remember me
        if (credentials.rememberMe) {
          localStorage.setItem('cra_remember_me', 'true');
        }
      }
      
      return response.data;
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

  private clearAuthData(): void {
    localStorage.removeItem('cra_auth_token');
    localStorage.removeItem('cra_refresh_token');
    localStorage.removeItem('cra_user_data');
    localStorage.removeItem('cra_remember_me');
  }

  getRoleBasedRedirectPath(role: string): string {
    const roleRoutes = {
      ADMINISTRATEUR: '/admin',
      CHERCHEUR: '/chercheur',
      ASSISTANT_CHERCHEUR: '/assistant',
      TECHNICIEN_SUPERIEUR: '/technicien'
    };
    
    return roleRoutes[role as keyof typeof roleRoutes] || '/dashboard';
  }
}

export const authService = new AuthService();