import { CreateMessageRequest, UpdateMessageRequest, AddReactionRequest, MessageListQuery, MessageResponse, PaginationMeta } from '../types/chat.types';
export declare class ChatService {
    sendMessage(messageData: CreateMessageRequest, authorId: string, _userRole: string): Promise<MessageResponse>;
    listMessages(query: MessageListQuery, _userId: string, // Parameter kept for compatibility but not used
    _userRole: string): Promise<{
        messages: MessageResponse[];
        pagination: PaginationMeta;
    }>;
    updateMessage(messageId: string, updateData: UpdateMessageRequest, userId: string, _userRole: string): Promise<MessageResponse>;
    deleteMessage(messageId: string, userId: string, userRole: string): Promise<void>;
    addReaction(messageId: string, data: AddReactionRequest, userId: string): Promise<void>;
    removeReaction(messageId: string, data: AddReactionRequest, userId: string): Promise<void>;
    private formatMessageResponse;
    private groupReactions;
    private formatUserBasicInfo;
}
export declare const getChatService: () => ChatService;
//# sourceMappingURL=chat.service.d.ts.map