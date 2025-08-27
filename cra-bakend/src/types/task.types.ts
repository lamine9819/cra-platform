// src/types/task.types.ts
export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE';
  dueDate?: string; // Changé de Date à string pour correspondre à la validation Zod
  assigneeId?: string;
  projectId?: string;
  activityId?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'A_FAIRE' | 'EN_COURS' | 'EN_REVISION' | 'TERMINEE' | 'ANNULEE';
  priority?: 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE';
  dueDate?: string; // Changé de Date à string
  assigneeId?: string;
  progress?: number;
}

export interface TaskListQuery {
  page?: number;
  limit?: number;
  status?: 'A_FAIRE' | 'EN_COURS' | 'EN_REVISION' | 'TERMINEE' | 'ANNULEE';
  priority?: 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE';
  assigneeId?: string;
  creatorId?: string;
  projectId?: string;
  activityId?: string;
  search?: string;
  dueDate?: string; // Changé de Date à string
  overdue?: boolean;
}

export interface TaskResponse {
  id: string;
  title: string;
  description?: string | null; // Accepte null de Prisma
  status: string;
  priority: string;
  dueDate?: Date | null; // Accepte null de Prisma
  completedAt?: Date | null; // Accepte null de Prisma
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    specialization?: string | null; // Accepte null de Prisma
  } | null; // Accepte null de Prisma
  project?: {
    id: string;
    title: string;
    status: string;
    creator: {
      id: string;
      firstName: string;
      lastName: string;
    };
  } | null; // Accepte null de Prisma
  activity?: {
    id: string;
    title: string;
    project: {
      id: string;
      title: string;
    };
  } | null; // Accepte null de Prisma
  documents?: {
    id: string;
    title: string;
    filename: string;
    type: string;
    createdAt: Date;
  }[];
  _count?: {
    documents: number;
    comments: number;
  };
}

export interface TaskStatsResponse {
  total: number;
  byStatus: {
    A_FAIRE: number;
    EN_COURS: number;
    EN_REVISION: number;
    TERMINEE: number;
    ANNULEE: number;
  };
  byPriority: {
    BASSE: number;
    NORMALE: number;
    HAUTE: number;
    URGENTE: number;
  };
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
}