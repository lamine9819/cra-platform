// src/routes/AssistantRoutes.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AssistantDashboard from '../pages/assistant/AssistantDashboard';
//import TasksList from '../pages/assistant/TasksList';
//import ProjectsList from '../pages/assistant/ProjectsList';
//import DocumentsList from '../pages/assistant/DocumentsList';
//import DataReceived from '../pages/assistant/DataReceived';
//import Communications from '../pages/assistant/Communications';

const AssistantRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<AssistantDashboard />} />
      {/*
      <Route path="tasks" element={<TasksList />} />
      <Route path="projects" element={<ProjectsList />} />
      <Route path="documents">
        <Route index element={<DocumentsList />} />
        <Route path="received" element={<DocumentsList />} />
        <Route path="sent" element={<DocumentsList />} />
        <Route path="upload" element={<div>Upload</div>} />
      </Route>
      <Route path="data" element={<DataReceived />} />
      <Route path="communications" element={<Communications />} />*/}
    </Routes>
  );
};

export default AssistantRoutes;