// src/types/activity.types.ts

export enum ActivityType {
  RECHERCHE_EXPERIMENTALE = 'RECHERCHE_EXPERIMENTALE',
  RECHERCHE_DEVELOPPEMENT = 'RECHERCHE_DEVELOPPEMENT',
  PRODUCTION_SEMENCES = 'PRODUCTION_SEMENCES',
  FORMATION_DISPENSEE = 'FORMATION_DISPENSEE',
  FORMATION_RECUE = 'FORMATION_RECUE',
  STAGE = 'STAGE',
  ENCADREMENT = 'ENCADREMENT',
  TRANSFERT_ACQUIS = 'TRANSFERT_ACQUIS',
  SEMINAIRE = 'SEMINAIRE',
  ATELIER = 'ATELIER',
  CONFERENCE = 'CONFERENCE',
  DEMONSTRATION = 'DEMONSTRATION',
  AUTRE = 'AUTRE',
}

export enum ActivityLifecycleStatus {
  NOUVELLE = 'NOUVELLE',
  RECONDUITE = 'RECONDUITE',
  CLOTUREE = 'CLOTUREE',
}

export const ActivityTypeLabels: Record<ActivityType, string> = {
  [ActivityType.RECHERCHE_EXPERIMENTALE]: 'Recherche expérimentale',
  [ActivityType.RECHERCHE_DEVELOPPEMENT]: 'Recherche & développement',
  [ActivityType.PRODUCTION_SEMENCES]: 'Production de semences',
  [ActivityType.FORMATION_DISPENSEE]: 'Formation dispensée',
  [ActivityType.FORMATION_RECUE]: 'Formation reçue',
  [ActivityType.STAGE]: 'Stage',
  [ActivityType.ENCADREMENT]: 'Encadrement',
  [ActivityType.TRANSFERT_ACQUIS]: 'Transfert d\'acquis',
  [ActivityType.SEMINAIRE]: 'Séminaire',
  [ActivityType.ATELIER]: 'Atelier',
  [ActivityType.CONFERENCE]: 'Conférence',
  [ActivityType.DEMONSTRATION]: 'Démonstration',
  [ActivityType.AUTRE]: 'Autre',
};

export const ActivityLifecycleStatusLabels: Record<ActivityLifecycleStatus, string> = {
  [ActivityLifecycleStatus.NOUVELLE]: 'Nouvelle',
  [ActivityLifecycleStatus.RECONDUITE]: 'Reconduite',
  [ActivityLifecycleStatus.CLOTUREE]: 'Clôturée',
};

export const ActivityTypeColors: Record<ActivityType, string> = {
  [ActivityType.RECHERCHE_EXPERIMENTALE]: 'bg-blue-100 text-blue-800',
  [ActivityType.RECHERCHE_DEVELOPPEMENT]: 'bg-indigo-100 text-indigo-800',
  [ActivityType.PRODUCTION_SEMENCES]: 'bg-green-100 text-green-800',
  [ActivityType.FORMATION_DISPENSEE]: 'bg-yellow-100 text-yellow-800',
  [ActivityType.FORMATION_RECUE]: 'bg-orange-100 text-orange-800',
  [ActivityType.STAGE]: 'bg-purple-100 text-purple-800',
  [ActivityType.ENCADREMENT]: 'bg-pink-100 text-pink-800',
  [ActivityType.TRANSFERT_ACQUIS]: 'bg-teal-100 text-teal-800',
  [ActivityType.SEMINAIRE]: 'bg-cyan-100 text-cyan-800',
  [ActivityType.ATELIER]: 'bg-lime-100 text-lime-800',
  [ActivityType.CONFERENCE]: 'bg-violet-100 text-violet-800',
  [ActivityType.DEMONSTRATION]: 'bg-emerald-100 text-emerald-800',
  [ActivityType.AUTRE]: 'bg-gray-100 text-gray-800',
};

export interface ActivityUser {
  id: string;
  nom: string;
  prenom: string;
  email: string;
}

export interface ActivityProject {
  id: string;
  code: string;
  title: string;
  status: string;
}

export interface ActivityTheme {
  id: string;
  code: string;
  name: string;
}

export interface ActivityStation {
  id: string;
  name: string;
  code: string;
}

export interface ActivityParticipant {
  id: string;
  role: string;
  joinedAt: string;
  user: ActivityUser;
}

export interface Activity {
  id: string;
  code?: string;
  title: string;
  description?: string;
  type: ActivityType;
  objectives: string[];
  methodology?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  results?: string;
  conclusions?: string;
  interventionRegion?: string;
  strategicPlan?: string;
  strategicAxis?: string;
  subAxis?: string;
  lifecycleStatus: ActivityLifecycleStatus;
  createdAt: string;
  updatedAt: string;
  creator: ActivityUser;
  responsible?: ActivityUser;
  project?: ActivityProject;
  theme?: ActivityTheme;
  station?: ActivityStation;
  participants?: ActivityParticipant[];
  _count?: {
    tasks: number;
    documents: number;
    comments: number;
    partners: number;
  };
}

export interface CreateActivityData {
  code?: string;
  title: string;
  description?: string;
  type: ActivityType;
  objectives?: string[];
  methodology?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  results?: string;
  conclusions?: string;
  interventionRegion?: string;
  strategicPlan?: string;
  strategicAxis?: string;
  subAxis?: string;
  lifecycleStatus?: ActivityLifecycleStatus;
  projectId?: string;
  themeId?: string;
  stationId?: string;
  responsibleId?: string;
}

export interface UpdateActivityData extends Partial<CreateActivityData> {}

export interface ActivityListQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: ActivityType;
  lifecycleStatus?: ActivityLifecycleStatus;
  projectId?: string;
  themeId?: string;
  stationId?: string;
  responsibleId?: string;
  creatorId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ActivityListResponse {
  activities: Activity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ActivityStatistics {
  total: number;
  byType: Record<ActivityType, number>;
  byLifecycleStatus: Record<ActivityLifecycleStatus, number>;
  byTheme: Array<{ themeId: string; themeName: string; count: number }>;
  byStation: Array<{ stationId: string; stationName: string; count: number }>;
  withProject: number;
  withoutProject: number;
}

export interface ActivityDashboard {
  stats: ActivityStatistics;
  recentActivities: Activity[];
  upcomingActivities: Activity[];
  activitiesNeedingAttention: Activity[];
}
