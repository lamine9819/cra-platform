// src/routes/ChercheurRoutes.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ChercheurDashboard from '../pages/chercheur/ChercheurDashboard';
import ProjectsList from '../pages/chercheur/ProjectsList';
import ProjectDetail from '../pages/chercheur/ProjectDetail';
import CreateProject from '../pages/chercheur/CreateProject';
import ActivitiesList from '../pages/chercheur/ActivitiesList';
import ActivityDetail from '../pages/chercheur/ActivityDetail';
import CreateActivity from '../pages/chercheur/CreateActivity';
import EditActivity from '../pages/chercheur/EditActivity';
import { DocumentsHub } from '../pages/chercheur/DocumentsHub';

{/* import TeamManagement from '../pages/chercheur/TeamManagement';
import SeminarsList from '../pages/chercheur/SeminarsList';
import ReportsList from '../pages/chercheur/ReportsList'; */}

const ChercheurRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ChercheurDashboard />} />
      <Route path="projects">
        <Route index element={<ProjectsList />} />
        <Route path="active" element={<ProjectsList />} />
        <Route path="new" element={<CreateProject />} />
        <Route path=":id" element={<ProjectDetail />} />
      </Route>
      <Route path="activities" element={<ActivitiesList />} />
      <Route path="activities/create" element={<CreateActivity />} />
      <Route path="activities/:id" element={<ActivityDetail />} />
      <Route path="activities/:id/edit" element={<EditActivity />} />
      <Route path="documents" element={<DocumentsHub />} />
      {/*<Route path="tasks" element={<TasksList />} />
      <Route path="team" element={<TeamManagement />} />
      <Route path="seminars" element={<SeminarsList />} />
      <Route path="reports" element={<ReportsList />} />
      <Route path="discussions" element={<div>Discussions</div>} />*/}
    </Routes>
  );
};

export default ChercheurRoutes;