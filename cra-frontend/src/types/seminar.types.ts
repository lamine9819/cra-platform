// src/types/seminar.types.ts
export interface CreateSeminarRequest {
  title: string;
  description?: string;
  location?: string;
  startDate: string; // Format ISO string pour les dates
  endDate?: string;  // Format ISO string pour les dates
  agenda?: string;
  maxParticipants?: number;
}

export interface UpdateSeminarRequest {
  title?: string;
  description?: string;
  location?: string;
  startDate?: string; // Format ISO string pour les dates
  endDate?: string;   // Format ISO string pour les dates
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
  startDate?: string; // Format ISO string pour les dates
  endDate?: string;   // Format ISO string pour les dates
  timeFilter?: 'past' | 'upcoming' | 'current' | 'all';
  location?: string;
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'startDate';
  sortOrder?: 'asc' | 'desc';
}

export interface SeminarRegistrationRequest {
  userId?: string; // Pour qu'un admin inscrive quelqu'un d'autre
}

export interface SeminarResponse {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startDate: Date;
  endDate?: Date | null;
  status: string;
  agenda?: string | null;
  maxParticipants?: number | null;
  createdAt: Date;
  updatedAt: Date;
  organizer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    specialization?: string | null;
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
  isRegistered?: boolean;
  canRegister?: boolean;
  registrationStatus?: 'open' | 'full' | 'closed' | 'ended';
}

export interface SeminarParticipantResponse {
  id: string;
  registeredAt: Date;
  attendedAt?: Date | null;
  participant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    specialization?: string | null;
    department?: string | null;
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

// Types pour les filtres (alias pour la compatibilité)
export interface SeminarFilters extends SeminarListQuery {}

// Types pour les réponses API
export interface SeminarListResponse {
  seminars: SeminarResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface RegistrationResponse {
  id: string;
  registeredAt: Date;
  participant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  seminar: {
    id: string;
    title: string;
    startDate: Date;
    location?: string;
  };
  message: string;
}

// Types pour les statuts
export type SeminarStatus = 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'ANNULE';
export type RegistrationStatus = 'open' | 'full' | 'closed' | 'ended';
export type TimeFilter = 'past' | 'upcoming' | 'current' | 'all';

// Type pour les actions possibles
export type SeminarAction = 'view' | 'edit' | 'delete' | 'register' | 'unregister' | 'mark_attendance';

// Type pour les permissions
export interface SeminarPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canRegister: boolean;
  canUnregister: boolean;
  canMarkAttendance: boolean;
  canManageDocuments: boolean;
}

// Type pour l'état d'un séminaire vis-à-vis de l'utilisateur
export interface SeminarUserState {
  isRegistered: boolean;
  canRegister: boolean;
  registrationStatus: RegistrationStatus;
  hasAttended?: boolean;
  isOrganizer: boolean;
  permissions: SeminarPermissions;
}

// Types pour les erreurs de validation
export interface SeminarValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface SeminarFormErrors {
  title?: string;
  description?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  agenda?: string;
  maxParticipants?: string;
  status?: string;
  general?: string;
}