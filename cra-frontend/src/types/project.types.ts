// src/types/project.types.ts

export enum ProjectStatus {
  PLANIFIE = 'PLANIFIE',
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE',
  SUSPENDU = 'SUSPENDU',
  ANNULE = 'ANNULE',
}

export const ProjectStatusLabels: Record<ProjectStatus, string> = {
  [ProjectStatus.PLANIFIE]: 'Planifié',
  [ProjectStatus.EN_COURS]: 'En cours',
  [ProjectStatus.TERMINE]: 'Terminé',
  [ProjectStatus.SUSPENDU]: 'Suspendu',
  [ProjectStatus.ANNULE]: 'Annulé',
};

export const ProjectStatusColors: Record<ProjectStatus, string> = {
  [ProjectStatus.PLANIFIE]: 'bg-blue-100 text-blue-800',
  [ProjectStatus.EN_COURS]: 'bg-green-100 text-green-800',
  [ProjectStatus.TERMINE]: 'bg-gray-100 text-gray-800',
  [ProjectStatus.SUSPENDU]: 'bg-yellow-100 text-yellow-800',
  [ProjectStatus.ANNULE]: 'bg-red-100 text-red-800',
};

export interface ProjectUser {
  id: string;
  nom: string;
  prenom: string;
  email: string;
}

export interface ProjectTheme {
  id: string;
  code: string;
  name: string;
}

export interface ProjectParticipant {
  id: string;
  role: string;
  joinedAt: string;
  leftAt?: string;
  isActive: boolean;
  user: ProjectUser;
}

export interface ProjectPartner {
  id: string;
  partnerType: string;
  contribution?: string;
  benefits?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  partner: {
    id: string;
    name: string;
    type: string;
    category?: string;
  };
}

export interface Project {
  id: string;
  code: string;
  title: string;
  description?: string;
  objectives: string[];
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  budget?: number;
  keywords: string[];
  strategicPlan?: string;
  strategicAxis?: string;
  subAxis?: string;
  program?: string;
  createdAt: string;
  updatedAt: string;
  creator: ProjectUser;
  theme: ProjectTheme;
  participants?: ProjectParticipant[];
  partnerships?: ProjectPartner[];
  _count?: {
    activities: number;
    tasks: number;
    documents: number;
    comments: number;
  };
}

export interface CreateProjectData {
  code: string;
  title: string;
  description?: string;
  objectives?: string[];
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
  budget?: number;
  keywords?: string[];
  strategicPlan?: string;
  strategicAxis?: string;
  subAxis?: string;
  program?: string;
  themeId: string;
  researchProgramId?: string;
  conventionId?: string;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {}

export interface ProjectListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProjectStatus;
  themeId?: string;
  creatorId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ProjectListResponse {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProjectStatistics {
  total: number;
  byStatus: Record<ProjectStatus, number>;
  byTheme: Array<{ themeId: string; themeName: string; count: number }>;
  totalBudget: number;
  activitiesCount: number;
  participantsCount: number;
}

export interface AddParticipantData {
  userId: string;
  role: string;
}

export interface UpdateParticipantData {
  userId: string;
  role?: string;
  isActive?: boolean;
}

export interface AddPartnershipData {
  partnerId: string;
  partnerType: string;
  contribution?: string;
  benefits?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdatePartnershipData {
  partnershipId: string;
  partnerType?: string;
  contribution?: string;
  benefits?: string;
  endDate?: string;
  isActive?: boolean;
}
