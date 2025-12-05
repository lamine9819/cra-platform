export declare enum ChannelType {
    GENERAL = "GENERAL",
    PROJECT = "PROJECT",
    THEME = "THEME",
    PRIVATE = "PRIVATE",
    ANNOUNCEMENT = "ANNOUNCEMENT"
}
export declare enum ChannelMemberRole {
    OWNER = "OWNER",
    ADMIN = "ADMIN",
    MODERATOR = "MODERATOR",
    MEMBER = "MEMBER"
}
export declare enum MessageType {
    TEXT = "TEXT",
    FILE = "FILE",
    IMAGE = "IMAGE",
    SYSTEM = "SYSTEM"
}
export interface CreateChannelRequest {
    name: string;
    description?: string;
    type: ChannelType;
    isPrivate?: boolean;
    icon?: string;
    color?: string;
    projectId?: string;
    themeId?: string;
    memberIds?: string[];
}
export interface UpdateChannelRequest {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
    isArchived?: boolean;
}
export interface CreateMessageRequest {
    content: string;
    type?: MessageType;
    parentMessageId?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    fileMimeType?: string;
    mentionedUserIds?: string[];
}
export interface UpdateMessageRequest {
    content: string;
}
export interface AddChannelMembersRequest {
    userIds: string[];
    role?: ChannelMemberRole;
}
export interface UpdateMemberRoleRequest {
    role: ChannelMemberRole;
}
export interface AddReactionRequest {
    emoji: string;
}
export interface ChannelListQuery {
    page?: number;
    limit?: number;
    type?: ChannelType;
    search?: string;
    includeArchived?: boolean;
    projectId?: string;
    themeId?: string;
}
export interface MessageListQuery {
    page?: number;
    limit?: number;
    search?: string;
    authorId?: string;
    startDate?: string;
    endDate?: string;
    parentMessageId?: string;
}
export interface UserBasicInfo {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    profileImage?: string | null;
}
export interface ChannelMemberResponse {
    id: string;
    role: ChannelMemberRole;
    isMuted: boolean;
    lastReadAt?: Date | null;
    lastReadMessageId?: string | null;
    notificationsEnabled: boolean;
    joinedAt: Date;
    user: UserBasicInfo;
}
export interface ChannelResponse {
    id: string;
    name: string;
    description?: string | null;
    type: ChannelType;
    isPrivate: boolean;
    isArchived: boolean;
    icon?: string | null;
    color?: string | null;
    projectId?: string | null;
    themeId?: string | null;
    creator: UserBasicInfo;
    createdAt: Date;
    updatedAt: Date;
    memberCount: number;
    unreadCount?: number;
    lastMessage?: MessageResponse | null;
    currentUserRole?: ChannelMemberRole;
    currentUserIsMember: boolean;
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
    type: MessageType;
    isEdited: boolean;
    editedAt?: Date | null;
    isDeleted: boolean;
    deletedAt?: Date | null;
    fileUrl?: string | null;
    fileName?: string | null;
    fileSize?: bigint | null;
    fileMimeType?: string | null;
    author: UserBasicInfo;
    channelId: string;
    parentMessageId?: string | null;
    mentions: UserBasicInfo[];
    reactions: MessageReactionResponse[];
    replyCount: number;
    canEdit: boolean;
    canDelete: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface ChannelStatsResponse {
    totalChannels: number;
    byType: {
        [key in ChannelType]: number;
    };
    totalMessages: number;
    totalMembers: number;
    activeChannels: number;
    mostActiveChannels: Array<{
        channelId: string;
        channelName: string;
        messageCount: number;
    }>;
}
export interface UnreadMessagesResponse {
    totalUnread: number;
    byChannel: Array<{
        channelId: string;
        channelName: string;
        unreadCount: number;
        lastMessage?: MessageResponse;
    }>;
}
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export interface PaginatedChannelsResponse {
    channels: ChannelResponse[];
    pagination: PaginationMeta;
}
export interface PaginatedMessagesResponse {
    messages: MessageResponse[];
    pagination: PaginationMeta;
}
export interface WebSocketMessage {
    type: 'new_message' | 'message_updated' | 'message_deleted' | 'reaction_added' | 'reaction_removed' | 'user_typing' | 'user_joined' | 'user_left' | 'channel_updated';
    channelId: string;
    data: any;
    timestamp: Date;
}
export interface TypingIndicator {
    channelId: string;
    userId: string;
    userName: string;
    isTyping: boolean;
}
//# sourceMappingURL=chat.types.d.ts.map