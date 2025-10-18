// src/types/partner.types.ts

export enum PartnerType {
  UNIVERSITE = 'UNIVERSITE',
  INSTITUT_RECHERCHE = 'INSTITUT_RECHERCHE',
  ENTREPRISE_PRIVEE = 'ENTREPRISE_PRIVEE',
  ONG = 'ONG',
  ORGANISME_PUBLIC = 'ORGANISME_PUBLIC',
  ORGANISATION_INTERNATIONALE = 'ORGANISATION_INTERNATIONALE',
  COOPERATIVE = 'COOPERATIVE',
  ASSOCIATION = 'ASSOCIATION'
}

export const PartnerTypeLabels: Record<PartnerType, string> = {
  [PartnerType.UNIVERSITE]: 'Université',
  [PartnerType.INSTITUT_RECHERCHE]: 'Institut de Recherche',
  [PartnerType.ENTREPRISE_PRIVEE]: 'Entreprise Privée',
  [PartnerType.ONG]: 'ONG',
  [PartnerType.ORGANISME_PUBLIC]: 'Organisme Public',
  [PartnerType.ORGANISATION_INTERNATIONALE]: 'Organisation Internationale',
  [PartnerType.COOPERATIVE]: 'Coopérative',
  [PartnerType.ASSOCIATION]: 'Association'
};

export enum PartnershipType {
  TECHNIQUE = 'TECHNIQUE',
  FINANCIER = 'FINANCIER',
  LOGISTIQUE = 'LOGISTIQUE',
  SCIENTIFIQUE = 'SCIENTIFIQUE',
  FORMATION = 'FORMATION',
  EQUIPEMENT = 'EQUIPEMENT',
  CONSEIL = 'CONSEIL',
  RECHERCHE_COLLABORATIVE = 'RECHERCHE_COLLABORATIVE',
  TRANSFERT_TECHNOLOGIQUE = 'TRANSFERT_TECHNOLOGIQUE',
  DISSEMINATION = 'DISSEMINATION'
}

export const PartnershipTypeLabels: Record<PartnershipType, string> = {
  [PartnershipType.TECHNIQUE]: 'Technique',
  [PartnershipType.FINANCIER]: 'Financier',
  [PartnershipType.LOGISTIQUE]: 'Logistique',
  [PartnershipType.SCIENTIFIQUE]: 'Scientifique',
  [PartnershipType.FORMATION]: 'Formation',
  [PartnershipType.EQUIPEMENT]: 'Équipement',
  [PartnershipType.CONSEIL]: 'Conseil',
  [PartnershipType.RECHERCHE_COLLABORATIVE]: 'Recherche Collaborative',
  [PartnershipType.TRANSFERT_TECHNOLOGIQUE]: 'Transfert Technologique',
  [PartnershipType.DISSEMINATION]: 'Dissémination'
};

export interface Partner {
  id: string;
  name: string;
  type: PartnerType;
  category?: string;
  description?: string;

  // Informations de contact
  address?: string;
  phone?: string;
  email?: string;
  website?: string;

  // Représentant
  contactPerson?: string;
  contactTitle?: string;
  contactEmail?: string;
  contactPhone?: string;

  // Domaines de compétence
  expertise: string[];
  services: string[];

  // Relations
  projectPartnerships?: ProjectPartnership[];
  activityPartnerships?: ActivityPartnership[];

  createdAt: string;
  updatedAt: string;
}

export interface ProjectPartnership {
  id: string;
  projectId: string;
  partnerId: string;
  partnerType: PartnershipType;
  contribution?: string;
  benefits?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityPartnership {
  id: string;
  activityId: string;
  partnerId: string;
  partnerType: PartnershipType;
  contribution?: string;
  benefits?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePartnerRequest {
  name: string;
  type: PartnerType;
  category?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  contactPerson?: string;
  contactTitle?: string;
  contactEmail?: string;
  contactPhone?: string;
  expertise?: string[];
  services?: string[];
}

export interface UpdatePartnerRequest {
  name?: string;
  type?: PartnerType;
  category?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  contactPerson?: string;
  contactTitle?: string;
  contactEmail?: string;
  contactPhone?: string;
  expertise?: string[];
  services?: string[];
}

export interface PartnerListQuery {
  page?: number;
  limit?: number;
  type?: PartnerType;
  category?: string;
  search?: string;
}

export interface PartnerListResponse {
  partners: Partner[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
