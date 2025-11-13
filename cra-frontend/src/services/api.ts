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

// Intercepteur pour gérer les erreurs et refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('cra_refresh_token');
        if (refreshToken) {
          const response = await api.post('/auth/refresh', {
            refreshToken
          });

          const { token, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('cra_auth_token', token);
          if (newRefreshToken) {
            localStorage.setItem('cra_refresh_token', newRefreshToken);
          }

          // Retry la requête originale avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Échec du refresh, déconnecter l'utilisateur
        localStorage.removeItem('cra_auth_token');
        localStorage.removeItem('cra_refresh_token');
        localStorage.removeItem('cra_user_data');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
