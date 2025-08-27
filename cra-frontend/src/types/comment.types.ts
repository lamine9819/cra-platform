// src/types/comment.types.ts

export interface CreateCommentRequest {
  content: string;
  targetType: 'project' | 'activity' | 'task';
  targetId: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface CommentListQuery {
  page?: number;
  limit?: number;
  targetType?: 'project' | 'activity' | 'task';
  targetId?: string;
  authorId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface CommentAuthor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profileImage?: string | null;
}

export interface CommentTarget {
  id: string;
  title: string;
  type: 'project' | 'activity' | 'task';
}

export interface CommentResponse {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author: CommentAuthor;
  targetType: 'project' | 'activity' | 'task';
  targetId: string;
  target: CommentTarget | null;
  canEdit: boolean;
  canDelete: boolean;
  isEdited: boolean;
}

export interface CommentListResponse {
  comments: CommentResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CommentStatsResponse {
  totalComments: number;
  byTargetType: {
    project: number;
    activity: number;
    task: number;
  };
  byAuthor: Array<{
    authorId: string;
    authorName: string;
    count: number;
  }>;
  recentActivity: Array<{
    date: string;
    count: number;
  }>;
}