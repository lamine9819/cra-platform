// =============================================
// 2. COMPOSANTS COMMUNS (HEADER, SIDEBAR)
// =============================================

// src/components/layout/Header.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Menu,
  X,
  Check,
  CheckCheck,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { getRoleLabel } from '../../utils/auth.utils';

interface HeaderProps {
  title: string;
  onMenuToggle?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, onMenuToggle, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    removeNotification
  } = useNotifications();

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const getProfileImageUrl = () => {
    if (!user?.profileImage) return null;
    if (user.profileImage.startsWith('http')) return user.profileImage;
    const fullUrl = `${API_BASE_URL}${user.profileImage}`;
    console.log('Header - User profileImage:', user.profileImage);
    console.log('Header - Full URL:', fullUrl);
    return fullUrl;
  };

  const getInitials = () => {
    return `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();
  };

  // Réinitialiser l'erreur d'image quand le user change
  React.useEffect(() => {
    setImageError(false);
  }, [user?.profileImage]);

  // Gérer le clic sur une notification
  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    if (notification.actionUrl) {
      setIsNotificationOpen(false);
      navigate(notification.actionUrl);
    }
  };

  // Formater la date de la notification
  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;

    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  // Obtenir l'icône selon le type de notification
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'PROJECT_ADDED':
        return '📁';
      case 'ACTIVITY_ADDED':
        return '🎯';
      case 'CHAT_MESSAGE':
        return '💬';
      case 'CHAT_MENTION':
        return '📢';
      case 'DOCUMENT_SHARED':
        return '📄';
      default:
        return '🔔';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-4">
        {/* Gauche: Menu toggle + Titre */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {isSidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
          
          <div>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500">
              {getRoleLabel(user?.role || 'CHERCHEUR' as any)}
            </p>
          </div>
        </div>

        {/* Droite: Notifications + Profil */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex items-center justify-center min-w-[20px] h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[600px] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Notifications {unreadCount > 0 && `(${unreadCount})`}
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await markAllAsRead();
                      }}
                      className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                      title="Tout marquer comme lu"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>Tout lire</span>
                    </button>
                  )}
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1">
                  {loading && notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      Chargement...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500">Aucune notification</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-4 cursor-pointer transition-colors ${
                            notification.isRead
                              ? 'bg-white hover:bg-gray-50'
                              : 'bg-blue-50 hover:bg-blue-100'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            {/* Icon */}
                            <div className="flex-shrink-0 text-2xl">
                              {getNotificationIcon(notification.type)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <p className={`text-sm font-medium ${
                                  notification.isRead ? 'text-gray-900' : 'text-gray-900 font-semibold'
                                }`}>
                                  {notification.title}
                                </p>
                                {!notification.isRead && (
                                  <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500">
                                  {formatNotificationDate(notification.createdAt)}
                                </span>
                                <div className="flex items-center space-x-2">
                                  {!notification.isRead && (
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        await markAsRead(notification.id);
                                      }}
                                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                                      title="Marquer comme lu"
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                  )}
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      await removeNotification(notification.id);
                                    }}
                                    className="text-xs text-red-600 hover:text-red-700"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 10 && (
                  <div className="p-3 border-t border-gray-200 text-center">
                    <button
                      onClick={() => {
                        setIsNotificationOpen(false);
                        navigate(`/${user?.role?.toLowerCase().replace('_', '-')}/notifications`);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Voir toutes les notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profil utilisateur */}
          <div className="relative">
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center overflow-hidden">
                {getProfileImageUrl() && !imageError ? (
                  <img
                    src={getProfileImageUrl()!}
                    alt="Photo de profil"
                    className="w-full h-full object-cover"
                    onError={() => {
                      console.error('Failed to load image:', getProfileImageUrl());
                      setImageError(true);
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully:', getProfileImageUrl());
                      setImageError(false);
                    }}
                  />
                ) : (
                  <span className="text-white text-sm font-medium">
                    {getInitials()}
                  </span>
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center overflow-hidden">
                      {getProfileImageUrl() && !imageError ? (
                        <img
                          src={getProfileImageUrl()!}
                          alt="Photo de profil"
                          className="w-full h-full object-cover"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <span className="text-white font-medium">
                          {getInitials()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="py-2">
                  <Link
                    to={`/${user?.role?.toLowerCase().replace('_', '-')}/profile`}
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <User className="w-4 h-4 mr-3" />
                    Mon profil
                  </Link>
                  <Link
                    to={`/${user?.role?.toLowerCase().replace('_', '-')}/settings`}
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Paramètres
                  </Link>
                </div>
                
                <div className="border-t border-gray-200 py-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

