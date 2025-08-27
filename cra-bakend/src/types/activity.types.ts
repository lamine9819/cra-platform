// src/types/activity.types.ts
export interface CreateActivityRequest {
  title: string;
  description?: string;
  objectives: string[];
  methodology?: string;
  location?: string;
  startDate?: string; // Changé de Date à string pour correspondre à la validation Zod
  endDate?: string;   // Changé de Date à string pour correspondre à la validation Zod
  projectId: string;
}

// ✅ CORRECTION PRINCIPALE - Ajouter projectId comme optionnel
export interface UpdateActivityRequest {
  title?: string;
  description?: string;
  objectives?: string[];
  methodology?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  results?: string;
  conclusions?: string;
  projectId?: string; // ✅ AJOUT - Permettre la modification du projet
}

export interface ActivityListQuery {
  page?: number;
  limit?: number;
  projectId?: string;
  search?: string;
  startDate?: string; // Changé de Date à string
  endDate?: string;   // Changé de Date à string
  hasResults?: boolean;
}

export interface LinkFormRequest {
  formId: string;
}

export interface LinkDocumentRequest {
  documentId: string;
}

export interface ActivityResponse {
  id: string;
  title: string;
  description?: string;
  objectives: string[];
  methodology?: string;
  location?: string;
  startDate?: Date;   // Les réponses gardent Date car c'est ce que retourne la DB
  endDate?: Date;     // Les réponses gardent Date car c'est ce que retourne la DB
  results?: string;
  conclusions?: string;
  createdAt: Date;
  updatedAt: Date;
  project: {
    id: string;
    title: string;
    status: string;
    creator: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
  tasks?: {
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate?: Date;
    assignee?: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }[];
  documents?: {
    id: string;
    title: string;
    filename: string;
    type: string;
    size: bigint;
    createdAt: Date;
    owner: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }[];
  forms?: {
    id: string;
    title: string;
    description?: string;
    isActive: boolean;
    createdAt: Date;
    creator: {
      id: string;
      firstName: string;
      lastName: string;
    };
    _count: {
      responses: number;
    };
  }[];
  _count?: {
    tasks: number;
    documents: number;
    forms: number;
    comments: number;
  };
}