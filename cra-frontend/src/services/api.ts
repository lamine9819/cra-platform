// =============================================
// 2. SERVICES API
// =============================================

// src/services/api.ts
import axios, {  AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Instance Axios configurée avec support des cookies HttpOnly
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: envoie automatiquement les cookies
});

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Si erreur 401 et que ce n'est pas déjà une tentative de retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Ne pas déconnecter automatiquement sur les routes d'authentification
      const isAuthRoute = originalRequest.url?.includes('/auth/login') ||
                         originalRequest.url?.includes('/auth/register');

      if (!isAuthRoute) {
        // Token invalide ou expiré dans le cookie, nettoyer les données utilisateur et rediriger
        localStorage.removeItem('cra_user_data');
        localStorage.removeItem('cra_remember_me');

        // Éviter les redirections multiples
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;