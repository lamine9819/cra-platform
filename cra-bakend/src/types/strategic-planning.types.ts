// src/types/strategic-planning.types.ts

export interface CreateStrategicPlanRequest {
  name: string;
  description?: string;
  startYear: number;
  endYear: number;
  isActive?: boolean;
}

export interface UpdateStrategicPlanRequest extends Partial<CreateStrategicPlanRequest> {}

export interface CreateStrategicAxisRequest {
  name: string;
  description?: string;
  code?: string;
  order?: number;
  strategicPlanId: string;
}

export interface UpdateStrategicAxisRequest extends Partial<Omit<CreateStrategicAxisRequest, 'strategicPlanId'>> {}

export interface CreateStrategicSubAxisRequest {
  name: string;
  description?: string;
  code?: string;
  order?: number;
  strategicAxisId: string;
}

export interface UpdateStrategicSubAxisRequest extends Partial<Omit<CreateStrategicSubAxisRequest, 'strategicAxisId'>> {}

export interface CreateResearchProgramRequest {
  name: string;
  description?: string;
  code?: string;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  strategicSubAxisId: string;
  coordinatorId: string;
}

export interface UpdateResearchProgramRequest extends Partial<Omit<CreateResearchProgramRequest, 'strategicSubAxisId'>> {}

export interface CreateResearchThemeRequest {
  name: string;
  description?: string;
  objectives?: string[];
  code?: string;
  order?: number;
  isActive?: boolean;
  programId: string;
}

export interface UpdateResearchThemeRequest extends Partial<Omit<CreateResearchThemeRequest, 'programId'>> {}

export interface CreateResearchStationRequest {
  name: string;
  location: string;
  surface?: number;
  description?: string;
  isActive?: boolean;
}

export interface UpdateResearchStationRequest extends Partial<CreateResearchStationRequest> {}

// Types pour les réponses complètes avec relations
export interface StrategicPlanWithRelations {
  id: string;
  name: string;
  description?: string;
  startYear: number;
  endYear: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  axes: StrategicAxisWithRelations[];
}

export interface StrategicAxisWithRelations {
  id: string;
  name: string;
  description?: string;
  code?: string;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
  strategicPlan: {
    id: string;
    name: string;
  };
  subAxes: StrategicSubAxisWithRelations[];
}

export interface StrategicSubAxisWithRelations {
  id: string;
  name: string;
  description?: string;
  code?: string;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
  strategicAxis: {
    id: string;
    name: string;
  };
  programs: ResearchProgramWithRelations[];
}

export interface ResearchProgramWithRelations {
  id: string;
  name: string;
  description?: string;
  code?: string;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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

export interface ResearchThemeWithRelations {
  id: string;
  name: string;
  description?: string;
  objectives: string[];
  code?: string;
  order?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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

export interface ResearchStationWithRelations {
  id: string;
  name: string;
  location: string;
  surface?: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  activities: Array<{
    id: string;
    title: string;
    status: string;
  }>;
  events: Array<{
    id: string;
    title: string;
    startDate: Date;
  }>;
}