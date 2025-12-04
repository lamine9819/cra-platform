// src/types/publication.types.ts

// =============================================
// ENUMS
// =============================================

export enum PublicationType {
  ARTICLE_JOURNAL = 'ARTICLE_JOURNAL',
  COMMUNICATION_CONFERENCE = 'COMMUNICATION_CONFERENCE',
  CHAPITRE_LIVRE = 'CHAPITRE_LIVRE',
  LIVRE = 'LIVRE',
  RAPPORT_TECHNIQUE = 'RAPPORT_TECHNIQUE',
  THESE = 'THESE',
  MEMOIRE = 'MEMOIRE',
  POSTER = 'POSTER',
  AUTRE = 'AUTRE'
}

export const PublicationTypeLabels: Record<PublicationType, string> = {
  [PublicationType.ARTICLE_JOURNAL]: 'Article de Journal',
  [PublicationType.COMMUNICATION_CONFERENCE]: 'Communication de Conférence',
  [PublicationType.CHAPITRE_LIVRE]: 'Chapitre de Livre',
  [PublicationType.LIVRE]: 'Livre',
  [PublicationType.RAPPORT_TECHNIQUE]: 'Rapport Technique',
  [PublicationType.THESE]: 'Thèse',
  [PublicationType.MEMOIRE]: 'Mémoire',
  [PublicationType.POSTER]: 'Poster',
  [PublicationType.AUTRE]: 'Autre'
};

export const PublicationTypeColors: Record<PublicationType, string> = {
  [PublicationType.ARTICLE_JOURNAL]: 'bg-blue-100 text-blue-800',
  [PublicationType.COMMUNICATION_CONFERENCE]: 'bg-purple-100 text-purple-800',
  [PublicationType.CHAPITRE_LIVRE]: 'bg-indigo-100 text-indigo-800',
  [PublicationType.LIVRE]: 'bg-violet-100 text-violet-800',
  [PublicationType.RAPPORT_TECHNIQUE]: 'bg-orange-100 text-orange-800',
  [PublicationType.THESE]: 'bg-pink-100 text-pink-800',
  [PublicationType.MEMOIRE]: 'bg-rose-100 text-rose-800',
  [PublicationType.POSTER]: 'bg-cyan-100 text-cyan-800',
  [PublicationType.AUTRE]: 'bg-gray-100 text-gray-800'
};

export enum PublicationStatus {
  SOUMIS = 'SOUMIS',
  ACCEPTE = 'ACCEPTE',
  PUBLIE = 'PUBLIE'
}

export const PublicationStatusLabels: Record<PublicationStatus, string> = {
  [PublicationStatus.SOUMIS]: 'Soumis',
  [PublicationStatus.ACCEPTE]: 'Accepté',
  [PublicationStatus.PUBLIE]: 'Publié'
};

export const PublicationStatusColors: Record<PublicationStatus, string> = {
  [PublicationStatus.SOUMIS]: 'bg-yellow-100 text-yellow-800',
  [PublicationStatus.ACCEPTE]: 'bg-green-100 text-green-800',
  [PublicationStatus.PUBLIE]: 'bg-blue-100 text-blue-800'
};

export enum Quartile {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4'
}

export const QuartileLabels: Record<Quartile, string> = {
  [Quartile.Q1]: 'Q1 (Top 25%)',
  [Quartile.Q2]: 'Q2 (25-50%)',
  [Quartile.Q3]: 'Q3 (50-75%)',
  [Quartile.Q4]: 'Q4 (75-100%)'
};

export const QuartileColors: Record<Quartile, string> = {
  [Quartile.Q1]: 'bg-emerald-100 text-emerald-800',
  [Quartile.Q2]: 'bg-green-100 text-green-800',
  [Quartile.Q3]: 'bg-yellow-100 text-yellow-800',
  [Quartile.Q4]: 'bg-orange-100 text-orange-800'
};

// =============================================
// INTERFACES DE DONNÉES
// =============================================

export interface PublicationAuthor {
  id: string;
  userId?: string;
  publicationId: string;
  authorOrder: number;
  isCorresponding: boolean;
  affiliation?: string;
  externalName?: string;
  externalEmail?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    department?: string;
    discipline?: string;
  };
}

export interface PublicationDocument {
  id: string;
  title: string;
  filename: string;
  filepath: string;
  mimeType: string;
  size: number | bigint;
  type: string;
  ownerId: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LinkedProject {
  id: string;
  title: string;
  code: string;
  status?: string;
}

export interface LinkedActivity {
  id: string;
  title: string;
  code: string;
  type?: string;
}

export interface Publication {
  id: string;
  title: string;
  type: PublicationType;
  journal?: string;
  isbn?: string;
  doi?: string;
  url?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  impactFactor?: number;
  quartile?: Quartile;
  citationsCount: number;
  isOpenAccess: boolean;
  submissionDate?: string;
  acceptanceDate?: string;
  publicationDate?: string;
  status: PublicationStatus;
  isInternational: boolean;
  language: string;
  abstract?: string;
  keywords: string[];
  documentId?: string;
  createdAt: string;
  updatedAt: string;
  authors: PublicationAuthor[];
  linkedProjects?: LinkedProject[];
  linkedActivities?: LinkedActivity[];
  document?: PublicationDocument;
}

// =============================================
// REQUÊTES API
// =============================================

export interface CreatePublicationAuthorRequest {
  userId?: string; // Pour les auteurs internes (utilisateurs de la base)
  externalName?: string; // Pour les auteurs externes
  externalEmail?: string; // Email de l'auteur externe
  authorOrder: number;
  isCorresponding?: boolean;
  affiliation?: string;
}

export interface CreatePublicationRequest {
  title: string;
  type: PublicationType;
  journal?: string;
  isbn?: string;
  doi?: string;
  url?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  impactFactor?: number;
  quartile?: Quartile;
  citationsCount?: number;
  isOpenAccess?: boolean;
  submissionDate?: string;
  acceptanceDate?: string;
  publicationDate?: string;
  status?: PublicationStatus;
  isInternational?: boolean;
  language?: string;
  abstract?: string;
  keywords?: string[];
  authors: CreatePublicationAuthorRequest[];
  linkedProjectIds?: string[];
  linkedActivityIds?: string[];
}

export interface UpdatePublicationRequest {
  title?: string;
  type?: PublicationType;
  journal?: string;
  isbn?: string;
  doi?: string;
  url?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  impactFactor?: number;
  quartile?: Quartile;
  citationsCount?: number;
  isOpenAccess?: boolean;
  submissionDate?: string;
  acceptanceDate?: string;
  publicationDate?: string;
  status?: PublicationStatus;
  isInternational?: boolean;
  language?: string;
  abstract?: string;
  keywords?: string[];
  authors?: CreatePublicationAuthorRequest[];
  linkedProjectIds?: string[];
  linkedActivityIds?: string[];
}

export interface PublicationQuery {
  page?: number;
  limit?: number;
  type?: PublicationType;
  year?: number;
  authorId?: string;
  status?: PublicationStatus;
  isInternational?: boolean;
  quartile?: Quartile;
  search?: string;
}

export interface PublicationListResponse {
  publications: Publication[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// =============================================
// STATISTIQUES
// =============================================

export interface PublicationStats {
  total: number;
  byType: Array<{
    type: PublicationType;
    _count: number;
  }>;
  byYear: {
    [year: string]: number;
  };
  byQuartile: Array<{
    quartile: Quartile;
    _count: number;
  }>;
  international: number;
  nationalRate: string;
  internationalRate: string;
}

// =============================================
// RAPPORT
// =============================================

export interface GenerateReportQuery {
  researcherId: string;
  year: number;
  format?: 'pdf' | 'docx';
}
