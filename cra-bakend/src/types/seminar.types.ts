// src/types/seminar.types.ts
export interface CreateSeminarRequest {
  title: string;
  description?: string;
  location?: string;
  startDate: string; // Changé de Date à string pour correspondre à la validation Zod
  endDate?: string;  // Changé de Date à string pour correspondre à la validation Zod
  agenda?: string;
  maxParticipants?: number;
}

export interface UpdateSeminarRequest {
  title?: string;
  description?: string;
  location?: string;
  startDate?: string; // Changé de Date à string
  endDate?: string;   // Changé de Date à string
  status?: 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'ANNULE';
  agenda?: string;
  maxParticipants?: number;
}

export interface SeminarListQuery {
  page?: number;
  limit?: number;
  status?: 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'ANNULE';
  organizerId?: string;
  search?: string;
  startDate?: string; // Changé de Date à string
  endDate?: string;   // Changé de Date à string
  timeFilter?: 'past' | 'upcoming' | 'current' | 'all';
  location?: string;
}

export interface SeminarRegistrationRequest {
  userId?: string; // Pour qu'un admin inscrive quelqu'un d'autre
}

export interface SeminarResponse {
  id: string;
  title: string;
  description?: string | null; // Accepte null de Prisma
  location?: string | null;    // Accepte null de Prisma
  startDate: Date;
  endDate?: Date | null;       // Accepte null de Prisma
  status: string;
  agenda?: string | null;      // Accepte null de Prisma
  maxParticipants?: number | null; // Accepte null de Prisma
  createdAt: Date;
  updatedAt: Date;
  organizer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    specialization?: string | null; // Accepte null de Prisma
  };
  participants?: SeminarParticipantResponse[];
  documents?: {
    id: string;
    title: string;
    filename: string;
    type: string;
    createdAt: Date;
  }[];
  _count?: {
    participants: number;
    documents: number;
  };
  isRegistered?: boolean; // Si l'utilisateur connecté est inscrit
  canRegister?: boolean; // Si l'utilisateur peut s'inscrire
  registrationStatus?: 'open' | 'full' | 'closed' | 'ended';
}

export interface SeminarParticipantResponse {
  id: string;
  registeredAt: Date;
  attendedAt?: Date | null; // Accepte null de Prisma
  participant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    specialization?: string | null; // Accepte null de Prisma
    department?: string | null;     // Accepte null de Prisma
  };
}

export interface SeminarStatsResponse {
  totalSeminars: number;
  byStatus: {
    PLANIFIE: number;
    EN_COURS: number;
    TERMINE: number;
    ANNULE: number;
  };
  byTimeframe: {
    past: number;
    current: number;
    upcoming: number;
  };
  totalParticipations: number;
  averageParticipants: number;
}