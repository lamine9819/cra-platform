// src/hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import {
  getUserNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  Notification,
  NotificationsResponse
} from '../services/notificationsApi';
import { useAuth } from './useAuth';
import { io, Socket } from 'socket.io-client';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Charger les notifications
  const loadNotifications = useCallback(async (page: number = 1, limit: number = 20) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const response: NotificationsResponse = await getUserNotifications(page, limit);
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch (err: any) {
      console.error('Erreur lors du chargement des notifications:', err);
      setError(err.message || 'Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Charger le compteur de notifications non lues
  const loadUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (err: any) {
      console.error('Erreur lors du chargement du compteur:', err);
    }
  }, [user]);

  // Marquer une notification comme lue
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, isRead: true, readAt: new Date().toISOString() }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Erreur lors du marquage comme lu:', err);
      setError(err.message || 'Erreur lors du marquage comme lu');
    }
  }, []);

  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Erreur lors du marquage de toutes les notifications:', err);
      setError(err.message || 'Erreur lors du marquage de toutes les notifications');
    }
  }, []);

  // Supprimer une notification
  const removeNotification = useCallback(async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      const deletedNotif = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err);
      setError(err.message || 'Erreur lors de la suppression');
    }
  }, [notifications]);

  // Configurer WebSocket pour les notifications en temps réel
  useEffect(() => {
    if (!user) return;

    // Connexion WebSocket avec support des cookies HttpOnly
    const socketInstance = io(API_BASE_URL, {
      path: '/socket.io',
      withCredentials: true, // Important : envoie automatiquement les cookies HttpOnly
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('✅ Connecté au serveur de notifications WebSocket');
      // Demander le compteur actuel
      socketInstance.emit('get_unread_count');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Erreur de connexion WebSocket:', error);
    });

    // Écouter les nouvelles notifications
    socketInstance.on('new_notification', (notification: Notification) => {
      console.log('📨 Nouvelle notification reçue:', notification);
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    // Écouter les mises à jour du compteur
    socketInstance.on('unread_count_updated', (data: { count: number }) => {
      console.log('🔢 Compteur de notifications mis à jour:', data.count);
      setUnreadCount(data.count);
    });

    // Écouter la confirmation de lecture
    socketInstance.on('notification_read_confirmed', (data: { notificationId: string }) => {
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === data.notificationId
            ? { ...notif, isRead: true, readAt: new Date().toISOString() }
            : notif
        )
      );
    });

    setSocket(socketInstance);

    return () => {
      console.log('🔌 Déconnexion du serveur de notifications WebSocket');
      socketInstance.disconnect();
    };
  }, [user, API_BASE_URL]);

  // Charger les notifications au montage
  useEffect(() => {
    if (user) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [user, loadNotifications, loadUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    socket
  };
};
