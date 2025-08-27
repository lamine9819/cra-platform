// src/types/document.types.ts
export interface UploadFileRequest {
  title: string;
  description?: string;
  type: 'RAPPORT' | 'FICHE_ACTIVITE' | 'FICHE_TECHNIQUE' | 'DONNEES_EXPERIMENTALES' | 'FORMULAIRE' | 'IMAGE' | 'AUTRE';
  tags?: string[];
  isPublic?: boolean;
  projectId?: string;
  activityId?: string;
  taskId?: string;
  seminarId?: string;
}

export interface ShareDocumentRequest {
  userIds: string[];
  canEdit?: boolean;
  canDelete?: boolean;
}

export interface DocumentListQuery {
  page?: number;
  limit?: number;
  type?: 'RAPPORT' | 'FICHE_ACTIVITE' | 'FICHE_TECHNIQUE' | 'DONNEES_EXPERIMENTALES' | 'FORMULAIRE' | 'IMAGE' | 'AUTRE';
  ownerId?: string;
  projectId?: string;
  activityId?: string;
  taskId?: string;
  search?: string;
  tags?: string[];
  isPublic?: boolean;
  mimeType?: string;
}

export interface DocumentResponse {
  id: string;
  title: string;
  filename: string;
  filepath: string;
  mimeType: string;
  size: number;
  type: string;
  description?: string | null; // Accepte null de Prisma
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  project?: {
    id: string;
    title: string;
  } | null; // Accepte null de Prisma
  activity?: {
    id: string;
    title: string;
  } | null; // Accepte null de Prisma
  task?: {
    id: string;
    title: string;
  } | null; // Accepte null de Prisma
  seminar?: {
    id: string;
    title: string;
  } | null; // Accepte null de Prisma
  shares?: {
    id: string;
    canEdit: boolean;
    canDelete: boolean;
    sharedAt: Date;
    sharedWith: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }[];
}