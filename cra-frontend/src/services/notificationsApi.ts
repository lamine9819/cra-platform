// src/services/notificationsApi.ts
import api from './api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  entityType?: string;
  entityId?: string;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    profileImage?: string;
  };
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  unreadCount: number;
}

// Récupérer toutes les notifications de l'utilisateur
export const getUserNotifications = async (
  page: number = 1,
  limit: number = 20,
  isRead?: boolean
): Promise<NotificationsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (isRead !== undefined) {
    params.append('isRead', isRead.toString());
  }

  const response = await api.get(`/notifications?${params.toString()}`);

  // Le backend retourne soit response.data directement, soit response.data.data
  if (response.data.notifications) {
    return response.data;
  } else if (response.data.data) {
    return {
      notifications: response.data.data,
      pagination: response.data.pagination,
      unreadCount: response.data.unreadCount
    };
  }

  return response.data;
};

// Récupérer le nombre de notifications non lues
export const getUnreadCount = async (): Promise<number> => {
  const response = await api.get('/notifications/unread-count');
  return response.data.count || response.data.data?.unreadCount || 0;
};

// Marquer une notification comme lue
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  await api.patch(`/notifications/${notificationId}/read`);
};

// Marquer toutes les notifications comme lues
export const markAllNotificationsAsRead = async (): Promise<void> => {
  await api.patch('/notifications/read-all');
};

// Supprimer une notification
export const deleteNotification = async (notificationId: string): Promise<void> => {
  await api.delete(`/notifications/${notificationId}`);
};

// Récupérer une notification spécifique
export const getNotificationById = async (notificationId: string): Promise<Notification> => {
  const response = await api.get(`/notifications/${notificationId}`);
  return response.data;
};
