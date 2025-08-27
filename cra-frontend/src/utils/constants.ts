// src/utils/constants.ts
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    REFRESH: '/auth/refresh',
  },
  USERS: '/users',
  PROJECTS: '/projects',
  ACTIVITIES: '/activities',
  TASKS: '/tasks',
  DOCUMENTS: '/documents',
  FORMS: '/forms',
  SEMINARS: '/seminars',
  NOTIFICATIONS: '/notifications',
  REPORTS: '/reports',
  COMMENTS: '/comments',
  DASHBOARD: '/dashboard',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'cra_auth_token',
  REFRESH_TOKEN: 'cra_refresh_token',
  USER_DATA: 'cra_user_data',
  REMEMBER_ME: 'cra_remember_me',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  ADMIN: '/admin',
  CHERCHEUR: '/chercheur',
  ASSISTANT: '/assistant',
  TECHNICIEN: '/technicien',
} as const;