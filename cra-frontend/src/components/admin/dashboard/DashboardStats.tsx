// src/components/admin/dashboard/DashboardStats.tsx

import {
  Users,
  Activity,
  Folder,
  Bell,
  BookOpen,
  MapPin,
  Share2,
  TrendingUp,
} from 'lucide-react';
import { StatsCard } from './StatsCard';
import { DashboardSummary } from '../../../types/admin.types';

interface DashboardStatsProps {
  summary: DashboardSummary;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ summary }) => {
  // Calculer le taux d'activité des utilisateurs
  const activityRate =
    summary.users.total > 0
      ? Math.round((summary.users.active / summary.users.total) * 100)
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Utilisateurs */}
      <StatsCard
        title="Utilisateurs"
        value={summary.users.total}
        subtitle={`${summary.users.active} actifs, ${summary.users.inactive} inactifs`}
        icon={Users}
        color="blue"
      />

      {/* Activités */}
      <StatsCard
        title="Activités"
        value={summary.activities.total}
        subtitle={`${summary.activities.withProjects} avec projet`}
        icon={Activity}
        color="green"
      />

      {/* Projets */}
      <StatsCard
        title="Projets"
        value={summary.projects.total}
        subtitle={`${summary.projects.byStatus.EN_COURS || 0} en cours`}
        icon={Folder}
        color="orange"
      />

      {/* Notifications non lues */}
      <StatsCard
        title="Notifications"
        value={summary.notifications.unread}
        subtitle={`${summary.notifications.readRate}% taux de lecture`}
        icon={Bell}
        color="red"
      />

      {/* Thèmes de recherche */}
      <StatsCard
        title="Thèmes"
        value={summary.themes.total}
        subtitle={`${summary.themes.active} actifs`}
        icon={BookOpen}
        color="purple"
      />

      {/* Stations */}
      <StatsCard
        title="Stations"
        value={summary.stations.total}
        subtitle={`${summary.stations.topStations.length} avec activités`}
        icon={MapPin}
        color="cyan"
      />

      {/* Transferts d'acquis */}
      <StatsCard
        title="Transferts"
        value={summary.transfers.total}
        subtitle="Transferts d'acquis"
        icon={Share2}
        color="green"
      />

      {/* Taux d'activité */}
      <StatsCard
        title="Taux d'activité"
        value={`${activityRate}%`}
        subtitle={`${summary.users.active}/${summary.users.total} utilisateurs actifs`}
        icon={TrendingUp}
        color="blue"
      />
    </div>
  );
};
