// =============================================
// src/pages/chercheur/EditForm.tsx - Page d'édition
// =============================================

import React from 'react';
import CreateForm from './CreateForm';

// La page d'édition utilise le même composant que la création
// La logique est gérée dans CreateForm via useParams
const EditForm: React.FC = () => {
  return <CreateForm />;
};

export default EditForm;