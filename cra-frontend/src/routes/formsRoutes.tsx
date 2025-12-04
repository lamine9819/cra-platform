// src/routes/formsRoutes.tsx - Routes pour le système de formulaires

import React from 'react';
import { Route } from 'react-router-dom';

// Pages chercheur
import FormsPage from '../pages/chercheur/FormsPage';
import FormCreatePage from '../pages/chercheur/FormCreatePage';
import FormEditPage from '../pages/chercheur/FormEditPage';
import FormDetailPage from '../pages/chercheur/FormDetailPage';

// Page publique
import PublicFormPage from '../pages/PublicFormPage';

/**
 * Routes pour les chercheurs (protégées par authentification)
 * À intégrer dans votre Layout chercheur
 */
export const chercheurFormsRoutes = (
  <>
    {/* Liste des formulaires */}
    <Route path="/chercheur/forms" element={<FormsPage />} />

    {/* Créer un nouveau formulaire */}
    <Route path="/chercheur/forms/create" element={<FormCreatePage />} />

    {/* Détails d'un formulaire avec tous les onglets */}
    <Route path="/chercheur/forms/:id" element={<FormDetailPage />} />

    {/* Éditer un formulaire */}
    <Route path="/chercheur/forms/:id/edit" element={<FormEditPage />} />
  </>
);

/**
 * Route publique (accessible sans authentification)
 * À intégrer dans vos routes publiques
 */
export const publicFormsRoutes = (
  <>
    {/* Formulaire partagé via lien public */}
    <Route path="/forms/public/:shareToken" element={<PublicFormPage />} />
  </>
);

export default {
  chercheurFormsRoutes,
  publicFormsRoutes,
};
