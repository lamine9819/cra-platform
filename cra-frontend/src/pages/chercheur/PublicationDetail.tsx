// src/pages/chercheur/PublicationDetail.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Edit2,
  Trash2,
  Download,
  ExternalLink,
  Calendar,
  Users,
  Award,
  Globe,
  FileText,
  Tag,
  Link as LinkIcon,
  AlertCircle,
  Upload
} from 'lucide-react';
import { publicationsApi } from '../../services/publicationsApi';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  PublicationTypeLabels,
  PublicationTypeColors,
  PublicationStatusLabels,
  PublicationStatusColors,
  QuartileColors
} from '../../types/publication.types';
import type { Publication } from '../../types/publication.types';

const PublicationDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [publication, setPublication] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);

  useEffect(() => {
    if (id) {
      loadPublication();
    }
  }, [id]);

  const loadPublication = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await publicationsApi.getPublicationById(id);
      setPublication(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement de la publication');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await publicationsApi.deletePublication(id);
      toast.success('Publication supprimée avec succès');
      navigate('/chercheur/publications');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression');
    }
  };

  const handleDownload = async () => {
    if (!id) return;

    try {
      await publicationsApi.downloadDocument(id);
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors du téléchargement');
    }
  };

  const handleUploadDocument = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!id || !event.target.files?.[0]) return;

    const file = event.target.files[0];

    if (file.type !== 'application/pdf') {
      toast.error('Seuls les fichiers PDF sont acceptés');
      return;
    }

    try {
      setUploadingDocument(true);
      await publicationsApi.uploadDocument(id, file);
      toast.success('Document uploadé avec succès');
      loadPublication(); // Recharger pour afficher le nouveau document
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'upload');
    } finally {
      setUploadingDocument(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !publication) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/chercheur/publications')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour aux publications
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-red-900">Erreur</h3>
              <p className="text-red-700">{error || 'Publication non trouvée'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vérifier si l'utilisateur peut modifier la publication
  // L'utilisateur peut modifier s'il est l'un des auteurs OU s'il est administrateur
  const canManagePublication =
    publication.authors.some(author => author.userId === user?.id) ||
    user?.role === 'ADMINISTRATEUR';

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

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {publication.title}
              </h1>
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${PublicationTypeColors[publication.type]}`}>
                  {PublicationTypeLabels[publication.type]}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${PublicationStatusColors[publication.status]}`}>
                  {PublicationStatusLabels[publication.status]}
                </span>
                {publication.quartile && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${QuartileColors[publication.quartile]}`}>
                    {publication.quartile}
                  </span>
                )}
                {publication.isInternational && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    International
                  </span>
                )}
                {publication.isOpenAccess && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Open Access
                  </span>
                )}
              </div>
            </div>

            {canManagePublication && (
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => navigate(`/chercheur/publications/${id}/edit`)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Modifier"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Supprimer"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contenu principal */}
        <div className="space-y-6">
          {/* Informations générales */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informations générales
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {publication.journal && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Journal / Conférence</div>
                    <div className="font-medium text-gray-900">{publication.journal}</div>
                  </div>
                </div>
              )}

              {publication.publisher && (
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Éditeur</div>
                    <div className="font-medium text-gray-900">{publication.publisher}</div>
                  </div>
                </div>
              )}

              {publication.publicationDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Date de publication</div>
                    <div className="font-medium text-gray-900">{formatDate(publication.publicationDate)}</div>
                  </div>
                </div>
              )}

              {publication.impactFactor && (
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Impact Factor</div>
                    <div className="font-medium text-gray-900">{publication.impactFactor}</div>
                  </div>
                </div>
              )}

              {publication.doi && (
                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">DOI</div>
                    <div className="font-medium text-gray-900">{publication.doi}</div>
                  </div>
                </div>
              )}

              {publication.isbn && (
                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">ISBN</div>
                    <div className="font-medium text-gray-900">{publication.isbn}</div>
                  </div>
                </div>
              )}

              {publication.volume && (
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Volume</div>
                    <div className="font-medium text-gray-900">{publication.volume}</div>
                  </div>
                </div>
              )}

              {publication.issue && (
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Numéro / Issue</div>
                    <div className="font-medium text-gray-900">{publication.issue}</div>
                  </div>
                </div>
              )}

              {publication.pages && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Pages</div>
                    <div className="font-medium text-gray-900">{publication.pages}</div>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Award className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Citations</div>
                  <div className="font-medium text-gray-900">{publication.citationsCount}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Langue</div>
                  <div className="font-medium text-gray-900">
                    {publication.language === 'fr' ? 'Français' :
                     publication.language === 'en' ? 'Anglais' :
                     publication.language === 'es' ? 'Espagnol' :
                     publication.language === 'de' ? 'Allemand' : publication.language}
                  </div>
                </div>
              </div>

              {publication.url && (
                <div className="flex items-start gap-3">
                  <ExternalLink className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Lien externe</div>
                    <a
                      href={publication.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Ouvrir
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          {(publication.submissionDate || publication.acceptanceDate) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Chronologie
              </h2>

              <div className="space-y-3">
                {publication.submissionDate && (
                  <div className="flex items-center gap-3">
                    <div className="w-32 text-sm text-gray-500">Soumission</div>
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <div className="font-medium text-gray-900">{formatDate(publication.submissionDate)}</div>
                  </div>
                )}
                {publication.acceptanceDate && (
                  <div className="flex items-center gap-3">
                    <div className="w-32 text-sm text-gray-500">Acceptation</div>
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <div className="font-medium text-gray-900">{formatDate(publication.acceptanceDate)}</div>
                  </div>
                )}
                {publication.publicationDate && (
                  <div className="flex items-center gap-3">
                    <div className="w-32 text-sm text-gray-500">Publication</div>
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <div className="font-medium text-gray-900">{formatDate(publication.publicationDate)}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Abstract */}
          {publication.abstract && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Résumé
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {publication.abstract}
              </p>
            </div>
          )}

          {/* Auteurs */}
          {publication.authors && publication.authors.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Auteurs ({publication.authors.length})
              </h2>

              <div className="space-y-3">
                {publication.authors
                  .sort((a, b) => a.authorOrder - b.authorOrder)
                  .map((author) => (
                    <div
                      key={author.id}
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-semibold flex-shrink-0">
                        {author.authorOrder}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {author.user ? (
                            `${author.user.firstName} ${author.user.lastName}`
                          ) : (
                            <>
                              {author.externalName || 'Auteur inconnu'}
                              <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                                Externe
                              </span>
                            </>
                          )}
                          {author.isCorresponding && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                              Correspondant
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {author.user ? author.user.email : author.externalEmail || 'Email non renseigné'}
                        </div>
                        {(author.affiliation || (author.user && author.user.department)) && (
                          <div className="text-sm text-gray-500">
                            {author.affiliation || (author.user && author.user.department)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Mots-clés */}
          {publication.keywords && publication.keywords.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Mots-clés
              </h2>
              <div className="flex flex-wrap gap-2">
                {publication.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Projets et activités liés */}
          {((publication.linkedProjects && publication.linkedProjects.length > 0) ||
            (publication.linkedActivities && publication.linkedActivities.length > 0)) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Liens avec projets et activités
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {publication.linkedProjects && publication.linkedProjects.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Projets liés</h3>
                    <div className="space-y-2">
                      {publication.linkedProjects.map(project => (
                        <Link
                          key={project.id}
                          to={`/chercheur/projects/${project.id}`}
                          className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <div className="font-medium text-blue-900">{project.code}</div>
                          <div className="text-sm text-blue-700">{project.title}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {publication.linkedActivities && publication.linkedActivities.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Activités liées</h3>
                    <div className="space-y-2">
                      {publication.linkedActivities.map(activity => (
                        <Link
                          key={activity.id}
                          to={`/chercheur/activities/${activity.id}`}
                          className="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <div className="font-medium text-green-900">{activity.code}</div>
                          <div className="text-sm text-green-700">{activity.title}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Document */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document PDF
            </h2>

            {publication.document ? (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-red-600" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {publication.document.filename}
                    </div>
                    <div className="text-sm text-gray-500">
                      {typeof publication.document.size === 'bigint'
                        ? `${(Number(publication.document.size) / 1024 / 1024).toFixed(2)} MB`
                        : `${(publication.document.size / 1024 / 1024).toFixed(2)} MB`
                      }
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Télécharger
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">Aucun document attaché</p>
                {canManagePublication && (
                  <>
                    <label
                      htmlFor="upload-document"
                      className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer ${
                        uploadingDocument ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {uploadingDocument ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Upload en cours...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Uploader un document PDF
                        </>
                      )}
                    </label>
                    <input
                      id="upload-document"
                      type="file"
                      accept=".pdf"
                      onChange={handleUploadDocument}
                      disabled={uploadingDocument}
                      className="hidden"
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cette publication ? Cette action est irréversible.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicationDetail;
