import { CreateCommentRequest, UpdateCommentRequest, CommentListQuery, CommentResponse, CommentStatsResponse } from '../types/comment.types';
export declare class CommentService {
    createComment(commentData: CreateCommentRequest, authorId: string, authorRole: string): Promise<CommentResponse>;
    listComments(userId: string, userRole: string, query: CommentListQuery): Promise<{
        comments: CommentResponse[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    getCommentById(commentId: string, userId: string, userRole: string): Promise<CommentResponse>;
    updateComment(commentId: string, updateData: UpdateCommentRequest, userId: string, userRole: string): Promise<CommentResponse>;
    deleteComment(commentId: string, userId: string, userRole: string): Promise<void>;
    getCommentStats(userId: string, userRole: string, targetType?: string, targetId?: string): Promise<CommentStatsResponse>;
    private validateTargetAccess;
    private buildAccessFilters;
    private getTargetTypeAndId;
    private checkDeletePermissions;
    private groupCommentsByDay;
    private getCommentIncludes;
    private formatCommentResponse;
}
//# sourceMappingURL=comment.service.d.ts.map