// =============================================
// 2. SERVICES API
// =============================================

// src/services/api.ts
import axios, {  AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Instance Axios configurée
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cra_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
        // Token invalide ou expiré, nettoyer et rediriger
        localStorage.removeItem('cra_auth_token');
        localStorage.removeItem('cra_refresh_token');
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

// Fonction pour mettre à jour le token d'authentification
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;
