// Types pour les événements et séminaires

export enum EventType {
  REUNION = 'REUNION',
  SEMINAIRE = 'SEMINAIRE',
  FORMATION = 'FORMATION',
  MISSION_TERRAIN = 'MISSION_TERRAIN',
  CONFERENCE = 'CONFERENCE',
  ATELIER = 'ATELIER',
  DEMONSTRATION = 'DEMONSTRATION',
  VISITE = 'VISITE',
  SOUTENANCE = 'SOUTENANCE',
  AUTRE = 'AUTRE'
}

export enum EventStatus {
  PLANIFIE = 'PLANIFIE',
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE',
  ANNULE = 'ANNULE',
  REPORTE = 'REPORTE'
}

export enum SeminarStatus {
  PLANIFIE = 'PLANIFIE',
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE',
  ANNULE = 'ANNULE'
}

// Interfaces pour les événements du calendrier

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  status: EventStatus;
  startDate: Date | string;
  endDate?: Date | string | null;
  location?: string;
  isAllDay: boolean;
  isRecurring: boolean;
  recurrenceRule?: string | null;
  color?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  creatorId: string;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  station?: {
    id: string;
    name: string;
  };
  project?: {
    id: string;
    title: string;
  };
  activity?: {
    id: string;
    title: string;
  };
  documents?: EventDocument[];
  _count?: {
    documents: number;
  };
}

export interface EventDocument {
  id: string;
  title: string;
  filename: string;
  filepath: string;
  mimeType: string;
  size: number;
  type: string;
  description?: string;
  createdAt: Date | string;
  uploadedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// Interfaces pour les séminaires

export interface Seminar {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startDate: Date | string;
  endDate?: Date | string | null;
  status: SeminarStatus;
  agenda?: string | null;
  maxParticipants?: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  organizerId: string;
  organizer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    specialization?: string | null;
  };
  participants?: SeminarParticipant[];
  documents?: SeminarDocument[];
  calendarEvent?: CalendarEvent;
  calendarEventId?: string | null;
  _count?: {
    participants: number;
    documents: number;
  };
  isRegistered?: boolean;
  canRegister?: boolean;
  registrationStatus?: 'open' | 'full' | 'closed' | 'ended';
}

export interface SeminarParticipant {
  id: string;
  registeredAt: Date | string;
  attendedAt?: Date | string | null;
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

export interface SeminarDocument {
  id: string;
  title: string;
  filename: string;
  filepath: string;
  mimeType: string;
  size: number;
  type: string;
  description?: string;
  createdAt: Date | string;
  uploadedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// DTOs pour la création et modification

export interface CreateEventDto {
  title: string;
  description?: string;
  type: EventType;
  startDate: Date | string;
  endDate?: Date | string;
  location?: string;
  isAllDay?: boolean;
  isRecurring?: boolean;
  recurrenceRule?: string;
  color?: string;
  stationId?: string;
  projectId?: string;
  activityId?: string;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  type?: EventType;
  status?: EventStatus;
  startDate?: Date | string;
  endDate?: Date | string;
  location?: string;
  isAllDay?: boolean;
  isRecurring?: boolean;
  recurrenceRule?: string;
  color?: string;
  stationId?: string;
  projectId?: string;
  activityId?: string;
}

export interface CreateSeminarDto {
  title: string;
  description?: string;
  location?: string;
  startDate: Date | string;
  endDate?: Date | string;
  agenda?: string;
  maxParticipants?: number;
  calendarEventId?: string;
}

export interface UpdateSeminarDto {
  title?: string;
  description?: string;
  location?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  status?: SeminarStatus;
  agenda?: string;
  maxParticipants?: number;
}

// Filtres

export interface EventFilterDto {
  startDate?: Date | string;
  endDate?: Date | string;
  type?: EventType;
  status?: EventStatus;
  creatorId?: string;
  stationId?: string;
  projectId?: string;
  activityId?: string;
}

export interface SeminarFilterDto {
  status?: SeminarStatus;
  organizerId?: string;
  startDate?: Date | string;
  endDate?: Date | string;
}

// Statistiques

export interface EventStatistics {
  totalEvents: number;
  byType: Record<EventType, number>;
  byStatus: Record<EventStatus, number>;
  upcoming: number;
  past: number;
  today: number;
}

export interface SeminarStatistics {
  totalSeminars: number;
  byStatus: Record<SeminarStatus, number>;
  totalParticipations: number;
  averageParticipants: number;
  upcoming: number;
  past: number;
}

// Réponses API

export interface EventResponse {
  success: boolean;
  message?: string;
  data?: CalendarEvent | CalendarEvent[];
  count?: number;
}

export interface SeminarResponse {
  success: boolean;
  message?: string;
  data?: Seminar | Seminar[];
  count?: number;
}

// Types pour le calendrier

export interface CalendarEventDisplay extends CalendarEvent {
  start: Date;
  end: Date;
  allDay: boolean;
  resource?: any;
}

export interface CalendarView {
  view: 'month' | 'week' | 'day' | 'agenda';
  date: Date;
}
