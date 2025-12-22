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
export interface UserBasicInfo {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    profileImage?: string | null;
}
export interface MessageReactionResponse {
    emoji: string;
    count: number;
    users: UserBasicInfo[];
    currentUserReacted: boolean;
}
export interface MessageResponse {
    id: string;
    content: string;
    isEdited: boolean;
    editedAt?: Date | null;
    isDeleted: boolean;
    deletedAt?: Date | null;
    fileUrl?: string | null;
    fileName?: string | null;
    fileSize?: bigint | null;
    fileMimeType?: string | null;
    author: UserBasicInfo;
    reactions: MessageReactionResponse[];
    canEdit: boolean;
    canDelete: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export interface PaginatedMessagesResponse {
    messages: MessageResponse[];
    pagination: PaginationMeta;
}
export interface WebSocketMessage {
    type: 'new_message' | 'message_updated' | 'message_deleted' | 'reaction_added' | 'reaction_removed';
    data: any;
    timestamp: Date;
}
//# sourceMappingURL=chat.types.d.ts.map