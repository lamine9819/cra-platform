// src/routes/TechnicienRoutes.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TechnicienDashboard from '../pages/technicien/TechnicienDashboard';
{/*import TasksList from '../pages/technicien/TasksList';
import FormsList from '../pages/technicien/FormsList';
import CreateForm from '../pages/technicien/CreateForm';
import DataCollection from '../pages/technicien/DataCollection';
import DocumentsList from '../pages/technicien/DocumentsList';*/}

const TechnicienRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<TechnicienDashboard />} />
      {/* <Route path="tasks" element={<TasksList />} />
      <Route path="forms">
        <Route index element={<FormsList />} />
        <Route path="create" element={<CreateForm />} />
        <Route path="mine" element={<FormsList />} />
        <Route path="responses" element={<div>Réponses</div>} />
      </Route>
      <Route path="data-collection" element={<DataCollection />} />
      <Route path="documents">
        <Route index element={<DocumentsList />} />
        <Route path="mine" element={<DocumentsList />} />
        <Route path="upload" element={<div>Upload</div>} />
        <Route path="download" element={<div>Download</div>} />
      </Route>*/}
    </Routes>
  );
};

export default TechnicienRoutes;