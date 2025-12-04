// src/components/chat/ChatProviderWrapper.tsx
import React, { ReactNode } from 'react';
import { ChatProvider } from '../../contexts/ChatContext';
import { useAuth } from '../../hooks/useAuth';

interface ChatProviderWrapperProps {
  children: ReactNode;
}

const ChatProviderWrapper: React.FC<ChatProviderWrapperProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  // Si l'utilisateur n'est pas authentifié, ne pas initialiser le chat
  if (!isAuthenticated || !user) {
    return <>{children}</>;
  }

  // Le token est stocké dans les cookies HttpOnly
  // Le WebSocket utilisera automatiquement les cookies pour l'authentification
  return (
    <ChatProvider>
      {children}
    </ChatProvider>
  );
};

export default ChatProviderWrapper;
