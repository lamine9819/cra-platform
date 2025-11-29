// src/routes/CoordinateurRoutes.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import des pages du chercheur (le coordonateur aura accès aux mêmes fonctionnalités)
import ChercheurDashboard from '../pages/chercheur/ChercheurDashboard';
import ProjectsList from '../pages/chercheur/ProjectsList';
import ProjectDetail from '../pages/chercheur/ProjectDetail';
import CreateProject from '../pages/chercheur/CreateProject';
import EditProject from '../pages/chercheur/EditProject';
import ActivitiesList from '../pages/chercheur/ActivitiesList';
import ActivityDetail from '../pages/chercheur/ActivityDetail';
import CreateActivity from '../pages/chercheur/CreateActivity';
import EditActivity from '../pages/chercheur/EditActivity';
import TasksList from '../pages/chercheur/TasksList';
import CreateTask from '../pages/chercheur/CreateTask';
import EditTask from '../pages/chercheur/EditTask';
import CalendarPage from '../pages/chercheur/CalendarPage';

const CoordinateurRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ChercheurDashboard />} />

      {/* Projets */}
      <Route path="projects">
        <Route index element={<ProjectsList />} />
        <Route path="new" element={<CreateProject />} />
        <Route path=":id" element={<ProjectDetail />} />
        <Route path=":id/edit" element={<EditProject />} />
      </Route>

      {/* Activités */}
      <Route path="activities">
        <Route index element={<ActivitiesList />} />
        <Route path="new" element={<CreateActivity />} />
        <Route path=":id" element={<ActivityDetail />} />
        <Route path=":id/edit" element={<EditActivity />} />
      </Route>

      {/* Tâches */}
      <Route path="tasks">
        <Route index element={<TasksList />} />
        <Route path="new" element={<CreateTask />} />
        <Route path=":id/edit" element={<EditTask />} />
      </Route>

      {/* Calendrier - Événements et Séminaires */}
      <Route path="calendar" element={<CalendarPage />} />

      {/* Documents */}
      <Route path="documents">
        <Route index element={<div>Documents</div>} />
        <Route path="mine" element={<div>Mes documents</div>} />
        <Route path="upload" element={<div>Upload</div>} />
        <Route path="download" element={<div>Download</div>} />
      </Route>

      {/* Collecte de données */}
      <Route path="data-collection" element={<div>Collecte de données</div>} />

      {/* Équipes */}
      <Route path="teams" element={<div>Gestion des équipes</div>} />

      {/* Redirect par défaut */}
      <Route path="*" element={<Navigate to="/coordonateur" replace />} />
    </Routes>
  );
};

export default CoordinateurRoutes;
