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
  startDate?: string; // Changé de Date à string pour correspondre à la validation Zod
  endDate?: string;   // Changé de Date à string pour correspondre à la validation Zod
}

export interface CommentResponse {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    profileImage?: string | null; // Accepte null de Prisma
  };
  targetType: 'project' | 'activity' | 'task';
  targetId: string;
  target?: {
    id: string;
    title: string;
    type: string;
  } | null; // Accepte null
  canEdit: boolean;
  canDelete: boolean;
  isEdited: boolean;
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