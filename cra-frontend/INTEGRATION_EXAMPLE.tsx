// INTEGRATION_EXAMPLE.tsx - Exemple d'intégration des routes formulaires dans App.tsx
// Copiez et adaptez ce code dans votre fichier App.tsx existant

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import ChercheurLayout from './layouts/ChercheurLayout';
import PublicLayout from './layouts/PublicLayout';

// Pages de formulaires
import FormsPage from './pages/chercheur/FormsPage';
import FormCreatePage from './pages/chercheur/FormCreatePage';
import FormEditPage from './pages/chercheur/FormEditPage';
import FormDetailPage from './pages/chercheur/FormDetailPage';
import PublicFormPage from './pages/PublicFormPage';

// Autres pages existantes (exemples)
// import Dashboard from './pages/chercheur/Dashboard';
// import ProjectsList from './pages/chercheur/ProjectsList';
// etc...

function App() {
  return (
    <BrowserRouter>
      {/* Notifications toast (requis pour le système de formulaires) */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        {/* ========================================
            ROUTES PUBLIQUES (sans authentification)
            ======================================== */}

        {/* Formulaire partagé via lien public */}
        <Route path="/forms/public/:shareToken" element={<PublicFormPage />} />

        {/* Autres routes publiques */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ========================================
            ROUTES CHERCHEUR (avec authentification)
            ======================================== */}

        <Route path="/chercheur" element={<ChercheurLayout />}>
          {/* Dashboard */}
          <Route index element={<Navigate to="/chercheur/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* ===== FORMULAIRES - NOUVELLES ROUTES ===== */}

          {/* Liste des formulaires */}
          <Route path="forms" element={<FormsPage />} />

          {/* Créer un nouveau formulaire */}
          <Route path="forms/create" element={<FormCreatePage />} />

          {/* Détails d'un formulaire (avec onglets : Collecter, Réponses, Partages, Commentaires) */}
          <Route path="forms/:id" element={<FormDetailPage />} />

          {/* Éditer un formulaire */}
          <Route path="forms/:id/edit" element={<FormEditPage />} />

          {/* ===== FIN FORMULAIRES ===== */}

          {/* Vos autres routes existantes */}
          <Route path="projects" element={<ProjectsList />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="activities" element={<ActivitiesList />} />
          <Route path="activities/:id" element={<ActivityDetail />} />
          {/* etc... */}
        </Route>

        {/* ========================================
            AUTRES ROUTES
            ======================================== */}

        {/* Route par défaut */}
        <Route path="*" element={<Navigate to="/chercheur/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

// ============================================
// EXEMPLE D'AJOUT DANS LE MENU DE NAVIGATION
// ============================================

/*
// Dans votre composant ChercheurLayout ou Sidebar

import { FileText } from 'lucide-react';

const menuItems = [
  {
    to: '/chercheur/dashboard',
    icon: Home,
    label: 'Tableau de bord'
  },
  {
    to: '/chercheur/projects',
    icon: Briefcase,
    label: 'Projets'
  },
  {
    to: '/chercheur/activities',
    icon: Activity,
    label: 'Activités'
  },
  // ===== NOUVEAU : Formulaires =====
  {
    to: '/chercheur/forms',
    icon: FileText,
    label: 'Formulaires',
    badge: pendingFormsCount // Optionnel : nombre de formulaires en attente
  },
  // ===== FIN =====
  {
    to: '/chercheur/publications',
    icon: BookOpen,
    label: 'Publications'
  },
];
*/

// ============================================
// EXEMPLE D'UTILISATION DANS UNE ACTIVITÉ
// ============================================

/*
// Dans votre page ActivityDetail.tsx

import { Link } from 'react-router-dom';
import { FileText, Plus } from 'lucide-react';

function ActivityDetail({ activity }) {
  return (
    <div>
      <h1>{activity.title}</h1>

      // Section Formulaires de collecte
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Formulaires de collecte</h2>
          <Link
            to={`/chercheur/forms/create?activityId=${activity.id}`}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Créer un formulaire
          </Link>
        </div>

        // Liste des formulaires liés à cette activité
        {activity.forms?.map(form => (
          <Link
            key={form.id}
            to={`/chercheur/forms/${form.id}`}
            className="block p-4 border rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-indigo-600 mr-3" />
                <div>
                  <h3 className="font-medium">{form.title}</h3>
                  <p className="text-sm text-gray-600">
                    {form._count.responses} réponse(s)
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-sm ${
                form.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {form.isActive ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
*/

// ============================================
// EXEMPLE D'UTILISATION DES HOOKS
// ============================================

/*
import { useForms } from '../hooks/useForms';
import { useForm } from '../hooks/useForm';
import { useOfflineSync } from '../hooks/useOfflineSync';

function MyCustomComponent() {
  // Récupérer la liste des formulaires
  const { forms, loading, refreshForms } = useForms();

  // Récupérer un formulaire spécifique
  const { form, updateForm, deleteForm, shares } = useForm(formId);

  // Gérer la synchronisation offline
  const { isOnline, pendingCount, syncNow } = useOfflineSync();

  return (
    <div>
      <h2>Mes formulaires</h2>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <ul>
          {forms.map(f => (
            <li key={f.id}>{f.title}</li>
          ))}
        </ul>
      )}

      {pendingCount > 0 && (
        <div className="alert">
          {pendingCount} réponse(s) en attente de synchronisation
          <button onClick={syncNow}>Synchroniser</button>
        </div>
      )}
    </div>
  );
}
*/

// ============================================
// CONFIGURATION REQUISE
// ============================================

/*
1. Installer les dépendances (si pas déjà fait) :
   npm install react-router-dom react-hot-toast lucide-react

2. Configurer .env :
   REACT_APP_API_URL=http://localhost:5000

3. S'assurer que le backend tourne sur le port 5000

4. Vérifier que les routes backend sont enregistrées :
   app.use('/api/forms', formRoutes);
*/
