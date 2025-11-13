// src/routes/formRoutes.tsx - Configuration des routes pour les formulaires
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicFormPage from '../pages/public/PublicFormPage';
import FormDetail from '../pages/chercheur/FormDetail';
import FormsList from '../pages/chercheur/FormsList';
import CreateForm from '../pages/chercheur/CreateForm';

// Routes publiques pour les formulaires
export const PublicFormRoutes: React.FC = () => (
  <Routes>
    <Route path="/forms/:id/submit" element={<PublicFormPage />} />
    <Route path="/forms/:id/preview" element={<PublicFormPage />} />
  </Routes>
);

// Routes privées pour la gestion des formulaires (chercheurs)
export const PrivateFormRoutes: React.FC = () => (
  <Routes>
    <Route path="/chercheur/forms" element={<FormsList />} />
    <Route path="/chercheur/forms/new" element={<CreateForm />} />
    <Route path="/chercheur/forms/:id" element={<FormDetail />} />
    <Route path="/chercheur/forms/:id/edit" element={<CreateForm />} />
  </Routes>
);
