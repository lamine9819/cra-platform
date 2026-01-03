// src/pages/chercheur/CreatePublication.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, X, Save, BookOpen, Upload, Users, Link as LinkIcon, ChevronRight, ChevronLeft } from 'lucide-react';
import { publicationsApi } from '../../services/publicationsApi';
import { usersApi } from '../../services/usersApi';
import { projectsApi } from '../../services/projectsApi';
import { activitiesApi } from '../../services/activitiesApi';
import toast from 'react-hot-toast';
import {
  PublicationType,
  PublicationStatus,
  Quartile,
  PublicationTypeLabels,
  PublicationStatusLabels,
  QuartileLabels
} from '../../types/publication.types';
import type {
  CreatePublicationRequest,
  UpdatePublicationRequest,
  Publication,
  CreatePublicationAuthorRequest
} from '../../types/publication.types';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
}

interface Project {
  id: string;
  title: string;
  code?: string;
}

interface Activity {
  id: string;
  title: string;
  code?: string;
}

const CreatePublication: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [currentStep, setCurrentStep] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<CreatePublicationRequest>({
    title: '',
    type: PublicationType.ARTICLE_JOURNAL,
    journal: '',
    isbn: '',
    doi: '',
    url: '',
    volume: '',
    issue: '',
    pages: '',
    publisher: '',
    impactFactor: undefined,
    quartile: undefined,
    citationsCount: 0,
    isOpenAccess: false,
    submissionDate: '',
    acceptanceDate: '',
    publicationDate: '',
    status: PublicationStatus.PUBLIE,
    isInternational: false,
    language: 'fr',
    abstract: '',
    keywords: [],
    authors: [],
    linkedProjectIds: [],
    linkedActivityIds: []
  });

  const [newKeyword, setNewKeyword] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');
  const [externalAuthorName, setExternalAuthorName] = useState('');
  const [externalAuthorEmail, setExternalAuthorEmail] = useState('');
  const [externalAuthorAffiliation, setExternalAuthorAffiliation] = useState('');

  const steps = [
    { title: 'Informations de base', icon: BookOpen },
    { title: 'Détails de publication', icon: BookOpen },
    { title: 'Dates importantes', icon: BookOpen },
    { title: 'Auteurs', icon: Users },
    { title: 'Mots-clés', icon: BookOpen },
    { title: 'Liens', icon: LinkIcon },
    { title: 'Document', icon: Upload }
  ];

  useEffect(() => {
    loadInitialData();
  }, [id]);

  const loadInitialData = async () => {
    try {
      // Charger les utilisateurs pour les auteurs
      const usersResponse = await usersApi.listUsers({ limit: 100 });
      setUsers(usersResponse.users || []);

      // Charger les projets
      const projectsResponse = await projectsApi.listProjects({ limit: 100 });
      setProjects(projectsResponse.projects || []);

      // Charger les activités
      const activitiesResponse = await activitiesApi.listActivities({ limit: 100 });
      setActivities(activitiesResponse.activities || []);

      // Si mode édition, charger la publication
      if (isEditMode && id) {
        setLoadingData(true);
        const publication = await publicationsApi.getPublicationById(id);

        // Convertir les données de la publication en formData
        setFormData({
          title: publication.title,
          type: publication.type,
          journal: publication.journal || '',
          isbn: publication.isbn || '',
          doi: publication.doi || '',
          url: publication.url || '',
          volume: publication.volume || '',
          issue: publication.issue || '',
          pages: publication.pages || '',
          publisher: publication.publisher || '',
          impactFactor: publication.impactFactor,
          quartile: publication.quartile,
          citationsCount: publication.citationsCount,
          isOpenAccess: publication.isOpenAccess,
          submissionDate: publication.submissionDate ? new Date(publication.submissionDate).toISOString().split('T')[0] : '',
          acceptanceDate: publication.acceptanceDate ? new Date(publication.acceptanceDate).toISOString().split('T')[0] : '',
          publicationDate: publication.publicationDate ? new Date(publication.publicationDate).toISOString().split('T')[0] : '',
          status: publication.status,
          isInternational: publication.isInternational,
          language: publication.language,
          abstract: publication.abstract || '',
          keywords: publication.keywords || [],
          authors: publication.authors.map(a => ({
            userId: a.userId,
            authorOrder: a.authorOrder,
            isCorresponding: a.isCorresponding,
            affiliation: a.affiliation
          })),
          linkedProjectIds: publication.linkedProjects?.map(p => p.id) || [],
          linkedActivityIds: publication.linkedActivities?.map(a => a.id) || []
        });
        setLoadingData(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des données');
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('Le titre est requis');
      setCurrentStep(0);
      return;
    }

    if (formData.authors.length === 0) {
      toast.error('Au moins un auteur est requis');
      setCurrentStep(3);
      return;
    }

    try {
      setLoading(true);

      // Convertir les dates au format ISO datetime si elles existent
      const dataToSend = {
        ...formData,
        submissionDate: formData.submissionDate && formData.submissionDate.trim()
          ? new Date(formData.submissionDate + 'T00:00:00Z').toISOString()
          : undefined,
        acceptanceDate: formData.acceptanceDate && formData.acceptanceDate.trim()
          ? new Date(formData.acceptanceDate + 'T00:00:00Z').toISOString()
          : undefined,
        publicationDate: formData.publicationDate && formData.publicationDate.trim()
          ? new Date(formData.publicationDate + 'T00:00:00Z').toISOString()
          : undefined
      };

      let publicationId: string;

      if (isEditMode && id) {
        // Mode édition
        const updated = await publicationsApi.updatePublication(id, dataToSend as UpdatePublicationRequest);
        publicationId = updated.id;
        toast.success('Publication mise à jour avec succès');
      } else {
        // Mode création
        const created = await publicationsApi.createPublication(dataToSend);
        publicationId = created.id;
        toast.success('Publication créée avec succès');
      }

      // Upload du document si présent
      if (uploadedFile) {
        try {
          await publicationsApi.uploadDocument(publicationId, uploadedFile);
          toast.success('Document uploadé avec succès');
        } catch (error: any) {
          toast.error('Erreur lors de l\'upload du document');
        }
      }

      navigate('/chercheur/publications');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAuthor = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    // Vérifier si l'auteur n'est pas déjà ajouté
    if (formData.authors.some(a => a.userId === userId)) {
      toast.error('Cet auteur est déjà ajouté');
      return;
    }

    const newAuthor: CreatePublicationAuthorRequest = {
      userId: user.id,
      authorOrder: formData.authors.length + 1,
      isCorresponding: formData.authors.length === 0, // Premier auteur = corresponding par défaut
      affiliation: user.department
    };

    setFormData({
      ...formData,
      authors: [...formData.authors, newAuthor]
    });
    setSearchAuthor('');
  };

  const handleAddExternalAuthor = () => {
    if (!externalAuthorName.trim()) {
      toast.error('Le nom de l\'auteur est requis');
      return;
    }

    const newAuthor: CreatePublicationAuthorRequest = {
      externalName: externalAuthorName.trim(),
      externalEmail: externalAuthorEmail.trim() || undefined,
      authorOrder: formData.authors.length + 1,
      isCorresponding: formData.authors.length === 0,
      affiliation: externalAuthorAffiliation.trim() || undefined
    };

    setFormData({
      ...formData,
      authors: [...formData.authors, newAuthor]
    });

    // Réinitialiser le formulaire
    setExternalAuthorName('');
    setExternalAuthorEmail('');
    setExternalAuthorAffiliation('');
  };

  const handleRemoveAuthor = (index: number) => {
    const newAuthors = formData.authors
      .filter((_, i) => i !== index)
      .map((a, idx) => ({ ...a, authorOrder: idx + 1 }));

    setFormData({
      ...formData,
      authors: newAuthors
    });
  };

  const handleMoveAuthor = (index: number, direction: 'up' | 'down') => {
    const newAuthors = [...formData.authors];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newAuthors.length) return;

    [newAuthors[index], newAuthors[targetIndex]] = [newAuthors[targetIndex], newAuthors[index]];

    // Réajuster les ordres
    newAuthors.forEach((author, idx) => {
      author.authorOrder = idx + 1;
    });

    setFormData({
      ...formData,
      authors: newAuthors
    });
  };

  const handleToggleCorresponding = (index: number) => {
    const newAuthors = formData.authors.map((a, idx) => ({
      ...a,
      isCorresponding: idx === index ? !a.isCorresponding : a.isCorresponding
    }));

    setFormData({
      ...formData,
      authors: newAuthors
    });
  };

  const handleAddKeyword = () => {
    const keywords = formData.keywords || [];
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setFormData({
        ...formData,
        keywords: [...keywords, newKeyword.trim()]
      });
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      keywords: (formData.keywords || []).filter(k => k !== keyword)
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setSlideDirection('right');
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setSlideDirection('left');
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    setSlideDirection(step > currentStep ? 'right' : 'left');
    setCurrentStep(step);
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchAuthor.toLowerCase();
    return (
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });

  const getUserById = (userId: string) => users.find(u => u.id === userId);

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/chercheur/publications')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour aux publications
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-green-600" />
            {isEditMode ? 'Modifier la publication' : 'Nouvelle publication'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditMode
              ? 'Modifiez les informations de votre publication scientifique'
              : 'Créez une nouvelle publication scientifique'
            }
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={index} className="flex-1 flex items-center">
                <button
                  type="button"
                  onClick={() => goToStep(index)}
                  className={`flex flex-col items-center gap-2 ${
                    index === currentStep
                      ? 'text-green-600'
                      : index < currentStep
                      ? 'text-green-500'
                      : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      index === currentStep
                        ? 'bg-green-600 text-white ring-4 ring-green-100'
                        : index < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index < currentStep ? '✓' : index + 1}
                  </div>
                  <span className="text-xs font-medium hidden md:block">{step.title}</span>
                </button>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Slides Container */}
          <div className="relative overflow-hidden">
            <div
              className={`transition-all duration-500 ease-in-out ${
                slideDirection === 'right'
                  ? 'animate-slide-in-right'
                  : 'animate-slide-in-left'
              }`}
              key={currentStep}
            >
              {/* Step 0: Informations de base */}
              {currentStep === 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Informations de base
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Titre <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Titre de la publication"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value as PublicationType })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                          {Object.entries(PublicationTypeLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Statut
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as PublicationStatus })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                          {Object.entries(PublicationStatusLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Résumé / Abstract
                      </label>
                      <textarea
                        value={formData.abstract}
                        onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                        rows={5}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Résumé de la publication"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Détails de publication */}
              {currentStep === 1 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Détails de publication
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Journal / Conférence
                      </label>
                      <input
                        type="text"
                        value={formData.journal}
                        onChange={(e) => setFormData({ ...formData, journal: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Nom du journal ou de la conférence"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Éditeur
                      </label>
                      <input
                        type="text"
                        value={formData.publisher}
                        onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Nom de l'éditeur"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        DOI
                      </label>
                      <input
                        type="text"
                        value={formData.doi}
                        onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="10.xxxx/xxxxx"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ISBN
                      </label>
                      <input
                        type="text"
                        value={formData.isbn}
                        onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="ISBN"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL
                      </label>
                      <input
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Langue
                      </label>
                      <select
                        value={formData.language}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="fr">Français</option>
                        <option value="en">Anglais</option>
                        <option value="es">Espagnol</option>
                        <option value="de">Allemand</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Volume
                      </label>
                      <input
                        type="text"
                        value={formData.volume}
                        onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Volume"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Numéro / Issue
                      </label>
                      <input
                        type="text"
                        value={formData.issue}
                        onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Numéro"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pages
                      </label>
                      <input
                        type="text"
                        value={formData.pages}
                        onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Ex: 1-10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Impact Factor
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        value={formData.impactFactor || ''}
                        onChange={(e) => setFormData({ ...formData, impactFactor: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Impact Factor"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quartile
                      </label>
                      <select
                        value={formData.quartile || ''}
                        onChange={(e) => setFormData({ ...formData, quartile: e.target.value as Quartile || undefined })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Aucun</option>
                        {Object.entries(QuartileLabels).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre de citations
                      </label>
                      <input
                        type="number"
                        value={formData.citationsCount}
                        onChange={(e) => setFormData({ ...formData, citationsCount: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isInternational}
                        onChange={(e) => setFormData({ ...formData, isInternational: e.target.checked })}
                        className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Publication internationale
                      </span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isOpenAccess}
                        onChange={(e) => setFormData({ ...formData, isOpenAccess: e.target.checked })}
                        className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Open Access
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Step 2: Dates */}
              {currentStep === 2 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Dates importantes
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date de soumission
                      </label>
                      <input
                        type="date"
                        value={formData.submissionDate}
                        onChange={(e) => setFormData({ ...formData, submissionDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date d'acceptation
                      </label>
                      <input
                        type="date"
                        value={formData.acceptanceDate}
                        onChange={(e) => setFormData({ ...formData, acceptanceDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date de publication
                      </label>
                      <input
                        type="date"
                        value={formData.publicationDate}
                        onChange={(e) => setFormData({ ...formData, publicationDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      💡 Astuce: Les dates ne sont pas obligatoires. Vous pouvez les remplir plus tard si nécessaire.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Auteurs */}
              {currentStep === 3 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Auteurs <span className="text-red-500">*</span>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Recherche d'auteur interne */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ajouter un chercheur interne
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={searchAuthor}
                          onChange={(e) => setSearchAuthor(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="Rechercher un chercheur..."
                        />
                        {searchAuthor && filteredUsers.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {filteredUsers.slice(0, 10).map(user => (
                              <button
                                key={user.id}
                                type="button"
                                onClick={() => handleAddAuthor(user.id)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                              >
                                <div>
                                  <div className="font-medium">{user.firstName} {user.lastName}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                  {user.department && (
                                    <div className="text-xs text-gray-400">{user.department}</div>
                                  )}
                                </div>
                                <Plus className="h-4 w-4 text-gray-400" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Formulaire auteur externe */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ajouter un auteur externe
                      </label>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={externalAuthorName}
                          onChange={(e) => setExternalAuthorName(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="Nom complet *"
                        />
                        <input
                          type="email"
                          value={externalAuthorEmail}
                          onChange={(e) => setExternalAuthorEmail(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="Email (optionnel)"
                        />
                        <input
                          type="text"
                          value={externalAuthorAffiliation}
                          onChange={(e) => setExternalAuthorAffiliation(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="Affiliation (optionnel)"
                        />
                        <button
                          type="button"
                          onClick={handleAddExternalAuthor}
                          className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Ajouter
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Liste des auteurs */}
                  {formData.authors.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Aucun auteur ajouté. Ajoutez au moins un auteur.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {formData.authors.map((author, index) => {
                        const user = author.userId ? getUserById(author.userId) : null;
                        const displayName = user
                          ? `${user.firstName} ${user.lastName}`
                          : author.externalName || 'Auteur externe';
                        const displayEmail = user?.email || author.externalEmail;
                        const displayAffiliation = author.affiliation || user?.department;

                        return (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex flex-col gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveAuthor(index, 'up')}
                                disabled={index === 0}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveAuthor(index, 'down')}
                                disabled={index === formData.authors.length - 1}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                              >
                                ▼
                              </button>
                            </div>

                            <div className="flex-1">
                              <div className="font-medium flex items-center gap-2">
                                {author.authorOrder}. {displayName}
                                {!author.userId && (
                                  <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-800 rounded">
                                    Externe
                                  </span>
                                )}
                              </div>
                              {displayEmail && (
                                <div className="text-sm text-gray-500">{displayEmail}</div>
                              )}
                              {displayAffiliation && (
                                <div className="text-xs text-gray-400">{displayAffiliation}</div>
                              )}
                            </div>

                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={author.isCorresponding}
                                onChange={() => handleToggleCorresponding(index)}
                                className="w-4 h-4 text-green-600 rounded"
                              />
                              <span className="text-gray-700">Correspondant</span>
                            </label>

                            <button
                              type="button"
                              onClick={() => handleRemoveAuthor(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Mots-clés */}
              {currentStep === 4 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Mots-clés
                  </h2>

                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Ajouter un mot-clé"
                    />
                    <button
                      type="button"
                      onClick={handleAddKeyword}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter
                    </button>
                  </div>

                  {(formData.keywords || []).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {(formData.keywords || []).map((keyword, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2"
                        >
                          {keyword}
                          <button
                            type="button"
                            onClick={() => handleRemoveKeyword(keyword)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Aucun mot-clé ajouté. Les mots-clés aident à catégoriser votre publication.
                    </div>
                  )}
                </div>
              )}

              {/* Step 5: Liens */}
              {currentStep === 5 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <LinkIcon className="h-5 w-5" />
                    Liens avec projets et activités
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Projets liés
                      </label>
                      <select
                        multiple
                        value={formData.linkedProjectIds}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value);
                          setFormData({ ...formData, linkedProjectIds: selected });
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        size={5}
                      >
                        {projects.map(project => (
                          <option key={project.id} value={project.id}>
                            {project.code} - {project.title}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Maintenez Ctrl/Cmd pour sélectionner plusieurs projets
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Activités liées
                      </label>
                      <select
                        multiple
                        value={formData.linkedActivityIds}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value);
                          setFormData({ ...formData, linkedActivityIds: selected });
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        size={5}
                      >
                        {activities.map(activity => (
                          <option key={activity.id} value={activity.id}>
                            {activity.code} - {activity.title}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Maintenez Ctrl/Cmd pour sélectionner plusieurs activités
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Document */}
              {currentStep === 6 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Document PDF
                  </h2>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="document-upload"
                    />
                    <label
                      htmlFor="document-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="h-12 w-12 text-gray-400" />
                      <span className="text-gray-600">
                        {uploadedFile ? uploadedFile.name : 'Cliquez pour uploader un document PDF'}
                      </span>
                      {uploadedFile && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setUploadedFile(null);
                          }}
                          className="text-red-600 text-sm hover:underline"
                        >
                          Retirer le fichier
                        </button>
                      )}
                    </label>
                  </div>

                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      💡 Astuce: Le document PDF n'est pas obligatoire. Vous pouvez l'ajouter plus tard.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="mt-8 flex gap-4 justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </button>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/chercheur/publications')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>

              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {isEditMode ? 'Mettre à jour' : 'Créer la publication'}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CreatePublication;
