// src/types/convention.types.ts

export enum ConventionType {
  BILATERALE = 'BILATERALE',
  MULTILATERALE = 'MULTILATERALE',
  PARTENARIAT_PUBLIC_PRIVE = 'PARTENARIAT_PUBLIC_PRIVE',
  COOPERATION_INTERNATIONALE = 'COOPERATION_INTERNATIONALE',
  SOUS_TRAITANCE = 'SOUS_TRAITANCE'
}

export enum ConventionStatus {
  EN_NEGOCIATION = 'EN_NEGOCIATION',
  SIGNEE = 'SIGNEE',
  EN_COURS = 'EN_COURS',
  CLOTUREE = 'CLOTUREE',
  SUSPENDUE = 'SUSPENDUE',
  RESILIEE = 'RESILIEE'
}

export const ConventionTypeLabels: Record<ConventionType, string> = {
  [ConventionType.BILATERALE]: 'Bilatérale',
  [ConventionType.MULTILATERALE]: 'Multilatérale',
  [ConventionType.PARTENARIAT_PUBLIC_PRIVE]: 'Partenariat Public-Privé',
  [ConventionType.COOPERATION_INTERNATIONALE]: 'Coopération Internationale',
  [ConventionType.SOUS_TRAITANCE]: 'Sous-traitance'
};

export const ConventionStatusLabels: Record<ConventionStatus, string> = {
  [ConventionStatus.EN_NEGOCIATION]: 'En négociation',
  [ConventionStatus.SIGNEE]: 'Signée',
  [ConventionStatus.EN_COURS]: 'En cours',
  [ConventionStatus.CLOTUREE]: 'Clôturée',
  [ConventionStatus.SUSPENDUE]: 'Suspendue',
  [ConventionStatus.RESILIEE]: 'Résiliée'
};

export interface Convention {
  id: string;
  title: string;
  description?: string;
  type: ConventionType;
  status: ConventionStatus;
  contractNumber?: string;
  signatureDate?: string;
  startDate?: string;
  endDate?: string;
  totalBudget?: number;
  currency: string;
  documentPath?: string;
  mainPartner: string;
  otherPartners: string[];
  responsibleUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  _count?: {
    activities: number;
    projects: number;
    fundings: number;
  };
}

export interface CreateConventionRequest {
  title: string;
  description?: string;
  type: ConventionType;
  status?: ConventionStatus;
  contractNumber?: string;
  signatureDate?: string;
  startDate?: string;
  endDate?: string;
  totalBudget?: number;
  currency?: string;
  documentPath?: string;
  mainPartner: string;
  otherPartners?: string[];
  responsibleUserId: string;
}

export interface UpdateConventionRequest {
  title?: string;
  description?: string;
  type?: ConventionType;
  status?: ConventionStatus;
  contractNumber?: string;
  signatureDate?: string;
  startDate?: string;
  endDate?: string;
  totalBudget?: number;
  documentPath?: string;
  mainPartner?: string;
  otherPartners?: string[];
  responsibleUserId?: string;
}

export interface ConventionListQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: ConventionType;
  status?: ConventionStatus;
  responsibleId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ConventionListResponse {
  conventions: Convention[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
