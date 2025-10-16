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

export interface ConventionResponse {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  contractNumber?: string;
  signatureDate?: Date;
  startDate?: Date;
  endDate?: Date;
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
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  _count?: {
    activities: number;
    projects: number;
    fundings: number;
  };
}

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