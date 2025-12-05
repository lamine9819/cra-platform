import { CreateChannelRequest, UpdateChannelRequest, CreateMessageRequest, UpdateMessageRequest, ChannelListQuery, MessageListQuery, ChannelResponse, MessageResponse, ChannelMemberResponse, ChannelStatsResponse, UnreadMessagesResponse, ChannelMemberRole, PaginationMeta } from '../types/chat.types';
export declare class ChatService {
    createChannel(channelData: CreateChannelRequest, creatorId: string, creatorRole: string): Promise<ChannelResponse>;
    listChannels(userId: string, userRole: string, query: ChannelListQuery): Promise<{
        channels: ChannelResponse[];
        pagination: PaginationMeta;
    }>;
    getChannelById(channelId: string, userId: string, userRole: string): Promise<ChannelResponse>;
    updateChannel(channelId: string, updateData: UpdateChannelRequest, userId: string, userRole: string): Promise<ChannelResponse>;
    deleteChannel(channelId: string, userId: string, userRole: string): Promise<void>;
    addMembersToChannel(channelId: string, userIds: string[], requesterId: string, role?: ChannelMemberRole): Promise<ChannelMemberResponse[]>;
    removeMemberFromChannel(channelId: string, userIdToRemove: string, requesterId: string, requesterRole: string): Promise<void>;
    updateMemberRole(channelId: string, userIdToUpdate: string, newRole: ChannelMemberRole, requesterId: string, requesterRole: string): Promise<ChannelMemberResponse>;
    getChannelMembers(channelId: string, userId: string, userRole: string): Promise<ChannelMemberResponse[]>;
    markChannelAsRead(channelId: string, userId: string): Promise<void>;
    sendMessage(channelId: string, messageData: CreateMessageRequest, authorId: string, userRole: string): Promise<MessageResponse>;
    listMessages(channelId: string, userId: string, userRole: string, query: MessageListQuery): Promise<{
        messages: MessageResponse[];
        pagination: PaginationMeta;
    }>;
    updateMessage(messageId: string, updateData: UpdateMessageRequest, userId: string, userRole: string): Promise<MessageResponse>;
    deleteMessage(messageId: string, userId: string, userRole: string): Promise<void>;
    addReaction(messageId: string, emoji: string, userId: string): Promise<void>;
    removeReaction(messageId: string, emoji: string, userId: string): Promise<void>;
    getChannelStats(userId: string, userRole: string): Promise<ChannelStatsResponse>;
    getUnreadMessages(userId: string): Promise<UnreadMessagesResponse>;
    private checkChannelAccess;
    private buildAccessWhere;
    private getChannelIncludes;
    private getMessageIncludes;
    private getUserSelect;
    private formatChannelResponse;
    private formatMessageResponse;
    private formatChannelMemberResponse;
}
//# sourceMappingURL=chat.service.d.ts.map