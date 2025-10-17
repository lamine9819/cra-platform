// src/types/strategic-planning.types.ts

export interface StrategicPlan {
  id: string;
  name: string;
  description?: string;
  startYear: number;
  endYear: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StrategicPlanWithRelations extends StrategicPlan {
  axes: StrategicAxisWithRelations[];
}

export interface StrategicAxis {
  id: string;
  name: string;
  description?: string;
  code?: string;
  order?: number;
  strategicPlanId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StrategicAxisWithRelations extends Omit<StrategicAxis, 'strategicPlanId'> {
  strategicPlan: {
    id: string;
    name: string;
  };
  subAxes: StrategicSubAxisWithRelations[];
}

export interface StrategicSubAxis {
  id: string;
  name: string;
  description?: string;
  code?: string;
  order?: number;
  strategicAxisId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StrategicSubAxisWithRelations extends Omit<StrategicSubAxis, 'strategicAxisId'> {
  strategicAxis: {
    id: string;
    name: string;
  };
  programs: ResearchProgramWithRelations[];
}

export interface ResearchProgram {
  id: string;
  name: string;
  description?: string;
  code?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  strategicSubAxisId: string;
  coordinatorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResearchProgramWithRelations extends Omit<ResearchProgram, 'strategicSubAxisId' | 'coordinatorId'> {
  strategicSubAxis: {
    id: string;
    name: string;
  };
  coordinator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  themes: ResearchThemeWithRelations[];
  projects: Array<{
    id: string;
    title: string;
    status: string;
  }>;
}

export interface ResearchTheme {
  id: string;
  name: string;
  description?: string;
  objectives: string[];
  code?: string;
  order?: number;
  isActive: boolean;
  programId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResearchThemeWithRelations extends Omit<ResearchTheme, 'programId'> {
  program: {
    id: string;
    name: string;
  };
  projects: Array<{
    id: string;
    title: string;
    status: string;
  }>;
  activities: Array<{
    id: string;
    title: string;
    status: string;
  }>;
}

export interface ResearchStation {
  id: string;
  name: string;
  location: string;
  surface?: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResearchStationWithRelations extends ResearchStation {
  activities: Array<{
    id: string;
    title: string;
    status: string;
  }>;
  events: Array<{
    id: string;
    title: string;
    startDate: string;
  }>;
}

// Types pour les requêtes de création
export interface CreateStrategicPlanRequest {
  name: string;
  description?: string;
  startYear: number;
  endYear: number;
  isActive?: boolean;
}

export interface CreateStrategicAxisRequest {
  name: string;
  description?: string;
  code?: string;
  order?: number;
  strategicPlanId: string;
}

export interface CreateStrategicSubAxisRequest {
  name: string;
  description?: string;
  code?: string;
  order?: number;
  strategicAxisId: string;
}

export interface CreateResearchProgramRequest {
  name: string;
  description?: string;
  code?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  strategicSubAxisId: string;
  coordinatorId: string;
}

export interface CreateResearchThemeRequest {
  name: string;
  description?: string;
  objectives?: string[];
  code?: string;
  order?: number;
  isActive?: boolean;
  programId: string;
}

export interface CreateResearchStationRequest {
  name: string;
  location: string;
  surface?: number;
  description?: string;
  isActive?: boolean;
}

// Types pour les requêtes de mise à jour
export type UpdateStrategicPlanRequest = Partial<CreateStrategicPlanRequest>;
export type UpdateStrategicAxisRequest = Partial<Omit<CreateStrategicAxisRequest, 'strategicPlanId'>>;
export type UpdateStrategicSubAxisRequest = Partial<Omit<CreateStrategicSubAxisRequest, 'strategicAxisId'>>;
export type UpdateResearchProgramRequest = Partial<Omit<CreateResearchProgramRequest, 'strategicSubAxisId'>>;
export type UpdateResearchThemeRequest = Partial<Omit<CreateResearchThemeRequest, 'programId'>>;
export type UpdateResearchStationRequest = Partial<CreateResearchStationRequest>;

// Types pour les filtres de recherche
export interface StrategicPlanFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface StrategicAxisFilters {
  search?: string;
  strategicPlanId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ResearchProgramFilters {
  search?: string;
  strategicSubAxisId?: string;
  coordinatorId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ResearchThemeFilters {
  search?: string;
  programId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ResearchStationFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Types pour les statistiques
export interface StrategicPlanningStats {
  totalPlans: number;
  activePlans: number;
  totalAxes: number;
  totalSubAxes: number;
  totalPrograms: number;
  activePrograms: number;
  totalThemes: number;
  activeThemes: number;
  totalStations: number;
  activeStations: number;
}

// Type pour les coordinateurs éligibles
export interface EligibleCoordinator {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  specialization?: string;
  department?: string;
}
