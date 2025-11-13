// src/types/knowledgeTransfer.types.ts

// ❌ SUPPRIMER cette définition
/*
export enum TransferType {
  FICHE_TECHNIQUE = 'FICHE_TECHNIQUE',
  DEMONSTRATION = 'DEMONSTRATION',
  // ... etc
}
*/

// ✅ IMPORTER depuis Prisma
import { TransferType } from '@prisma/client';

export interface CreateKnowledgeTransferRequest {
  title: string;
  description?: string;
  type: TransferType;  // Utilise maintenant le type Prisma
  targetAudience: string[];
  location?: string;
  date: string;
  participants?: number;
  impact?: string;
  feedback?: string;
  organizerId: string;
  activityId?: string;
}

export interface UpdateKnowledgeTransferRequest {
  title?: string;
  description?: string;
  type?: TransferType;  // Utilise maintenant le type Prisma
  targetAudience?: string[];
  location?: string;
  date?: string;
  participants?: number;
  impact?: string;
  feedback?: string;
  organizerId?: string;
  activityId?: string;
}

export interface KnowledgeTransferListQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: TransferType;  // Utilise maintenant le type Prisma
  organizerId?: string;
  activityId?: string;
  startDate?: string;
  endDate?: string;
}

export interface KnowledgeTransferResponse {
  id: string;
  title: string;
  description?: string;
  type: string;
  targetAudience: string[];
  location?: string;
  date: Date;
  participants?: number;
  impact?: string;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
  
  organizer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  
  activity?: {
    id: string;
    title: string;
    code?: string;
  };
  
  documents?: any[];
  
  _count?: {
    documents: number;
  };
}

// ✅ Exporter le type importé pour pouvoir l'utiliser ailleurs
export { TransferType };