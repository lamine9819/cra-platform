// src/types/chat.types.ts

// =============================================
// INTERFACES DE REQUÊTE
// =============================================

export interface CreateMessageRequest {
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
}

export interface UpdateMessageRequest {
  content: string;
}

export interface AddReactionRequest {
  emoji: string;
}

export interface MessageListQuery {
  page?: number;
  limit?: number;
  search?: string;
  authorId?: string;
  startDate?: string;
  endDate?: string;
}

// =============================================
// INTERFACES DE RÉPONSE
// =============================================

export interface UserBasicInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profileImage?: string | null;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: UserBasicInfo[];
  currentUserReacted: boolean;
}

export interface Message {
  id: string;
  content: string;
  isEdited: boolean;
  editedAt?: Date | null;
  isDeleted: boolean;
  deletedAt?: Date | null;

  // Fichier attaché
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  fileMimeType?: string | null;

  // Relations
  author: UserBasicInfo;

  // Réactions
  reactions: MessageReaction[];

  // Permissions
  canEdit: boolean;
  canDelete: boolean;

  // Métadonnées
  createdAt: Date;
  updatedAt: Date;
}

// =============================================
// INTERFACES DE PAGINATION
// =============================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedMessagesResponse {
  messages: Message[];
  pagination: PaginationMeta;
}

// =============================================
// STATE MANAGEMENT
// =============================================

export interface ChatState {
  messages: Message[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export type ChatAction =
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'PREPEND_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: Message }
  | { type: 'REMOVE_MESSAGE'; payload: string }
  | { type: 'SET_IS_CONNECTED'; payload: boolean }
  | { type: 'SET_IS_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// =============================================
// INTERFACES WEBSOCKET
// =============================================

export interface WebSocketMessage {
  type: 'new_message' | 'message_updated' | 'message_deleted' |
        'reaction_added' | 'reaction_removed';
  data: any;
  timestamp: Date;
}
