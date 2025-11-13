// src/pages/chercheur/SeminarDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Edit2,
  Trash2,
  UserPlus,
  UserMinus,
  FileText,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Download,
  Upload,
  Eye,
  UserCheck,
  UserX,
  X
} from 'lucide-react';

import seminarsApi from '../../services/seminarsApi';
import { SeminarResponse } from '../../types/seminar.types';

const SeminarDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [seminar, setSeminar] = useState<SeminarResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loadingActions, setLoadingActions] = useState<{ [key: string]: boolean }>({});
  
  // Tab actuel
  const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'documents' | 'agenda'>('overview');

  // Données utilisateur
  const userData = JSON.parse(localStorage.getItem('cra_user_data') || '{}');
  const userRole = userData.role;

  // =============================================
  // EFFETS ET CHARGEMENT DES DONNÉES
  // =============================================

  useEffect(() => {
    if (id) {
      loadSeminar();
    }
  }, [id]);

  const loadSeminar = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const seminarData = await seminarsApi.getSeminarById(id);
      setSeminar(seminarData);
      
    } catch (err: any) {
      console.error('❌ Erreur lors du chargement du séminaire:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =============================================
  // ACTIONS SUR LE SÉMINAIRE
  // =============================================

  const handleRegister = async () => {
    if (!seminar) return;
    
    try {
      setLoadingActions(prev => ({ ...prev, register: true }));
      
      await seminarsApi.registerToSeminar(seminar.id);
      setSuccessMessage('Inscription réussie au séminaire');
      
      // Recharger les données
      loadSeminar();
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingActions(prev => ({ ...prev, register: false }));
    }
  };

  const handleUnregister = async () => {
    if (!seminar) return;
    
    try {
      setLoadingActions(prev => ({ ...prev, unregister: true }));
      
      await seminarsApi.unregisterFromSeminar(seminar.id);
      setSuccessMessage('Désinscription réussie du séminaire');
      
      // Recharger les données
      loadSeminar();
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingActions(prev => ({ ...prev, unregister: false }));
    }
  };

  const handleMarkAttendance = async (participantId: string) => {
    if (!seminar) return;
    
    try {
      setLoadingActions(prev => ({ ...prev, [`attendance-${participantId}`]: true }));
      
      await seminarsApi.markAttendance(seminar.id, participantId);
      setSuccessMessage('Présence marquée avec succès');
      
      // Recharger les données
      loadSeminar();
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingActions(prev => ({ ...prev, [`attendance-${participantId}`]: false }));
    }
  };

  const handleDelete = async () => {
    if (!seminar) return;
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce séminaire ?')) {
      return;
    }

    try {
      setLoadingActions(prev => ({ ...prev, delete: true }));
      
      await seminarsApi.deleteSeminar(seminar.id);
      setSuccessMessage('Séminaire supprimé avec succès');
      
      // Rediriger vers la liste
      setTimeout(() => navigate('/chercheur/seminars'), 1000);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingActions(prev => ({ ...prev, delete: false }));
    }
  };

  // =============================================
  // FONCTIONS UTILITAIRES
  // =============================================

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PLANIFIE':
        return <Clock className="h-5 w-5" />;
      case 'EN_COURS':
        return <AlertCircle className="h-5 w-5" />;
      case 'TERMINE':
        return <CheckCircle className="h-5 w-5" />;
      case 'ANNULE':
        return <XCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case 'PLANIFIE':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'EN_COURS':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'TERMINE':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'ANNULE':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const canUserEditSeminar = (): boolean => {
    return seminar?.organizer.id === userData.id || userRole === 'ADMINISTRATEUR';
  };

  const canUserDeleteSeminar = (): boolean => {
    return canUserEditSeminar() && seminar?.status !== 'EN_COURS' && seminar?.status !== 'TERMINE';
  };

  const canMarkAttendance = (): boolean => {
    return canUserEditSeminar() && (seminar?.status === 'EN_COURS' || seminar?.status === 'TERMINE');
  };

  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (startDate: Date | string, endDate?: Date | string | null): string => {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    
    if (!endDate) {
      return formatDate(start);
    }
    
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    // Si même jour
    if (start.toDateString() === end.toDateString()) {
      const startTime = start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const endTime = end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      return `${formatDate(start).split(' à ')[0]} de ${startTime} à ${endTime}`;
    }
    
    // Jours différents
    return `Du ${formatDate(start)} au ${formatDate(end)}`;
  };

  // =============================================
  // RENDU
  // =============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Chargement du séminaire...</span>
      </div>
    );
  }

  if (error || !seminar) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
        <p className="text-gray-600 mb-4">{error || 'Séminaire non trouvé'}</p>
        <Link
          to="/chercheur/seminars"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux séminaires
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bouton retour */}
      <div>
        <Link
          to="/chercheur/seminars"
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux séminaires
        </Link>
      </div>

      {/* Messages de succès/erreur */}
      {successMessage && (
        <div className="rounded-md bg-green-50 p-4 border border-green-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                {successMessage}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setSuccessMessage(null)}
                className="inline-flex text-green-400 hover:text-green-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                {error}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="inline-flex text-red-400 hover:text-red-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* En-tête du séminaire */}
      <div className="bg-white rounded-lg border border-gray-200 shadow">
        <div className="px-6 py-6">
          <div className="flex justify-between items-start">
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">{seminar.title}</h1>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="h-4 w-4 mr-1" />
                      Organisé par {seminar.organizer.firstName} {seminar.organizer.lastName}
                    </div>
                    {seminar.location && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {seminar.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={getStatusBadge(seminar.status)}>
                  {getStatusIcon(seminar.status)}
                  <span className="ml-2">
                    {seminar.status === 'PLANIFIE' ? 'Planifié' :
                     seminar.status === 'EN_COURS' ? 'En cours' :
                     seminar.status === 'TERMINE' ? 'Terminé' :
                     seminar.status === 'ANNULE' ? 'Annulé' : seminar.status}
                  </span>
                </span>
                
                {seminar.isRegistered && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <UserCheck className="h-4 w-4 mr-1" />
                    Inscrit
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {/* Actions d'inscription */}
              {seminar.isRegistered ? (
                <button
                  onClick={handleUnregister}
                  disabled={loadingActions.unregister}
                  className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                >
                  {loadingActions.unregister ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                  ) : (
                    <UserMinus className="h-4 w-4 mr-2" />
                  )}
                  Se désinscrire
                </button>
              ) : seminar.canRegister ? (
                <button
                  onClick={handleRegister}
                  disabled={loadingActions.register}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {loadingActions.register ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                  )}
                  S'inscrire
                </button>
              ) : null}

              {/* Actions de modification */}
              {canUserEditSeminar() && (
                <Link
                  to={`/chercheur/seminars/${seminar.id}/edit`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Modifier
                </Link>
              )}

              {/* Action de suppression */}
              {canUserDeleteSeminar() && (
                <button
                  onClick={handleDelete}
                  disabled={loadingActions.delete}
                  className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                >
                  {loadingActions.delete ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Informations principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Détails du séminaire */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Détails du séminaire</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              {/* Description */}
              {seminar.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{seminar.description}</p>
                </div>
              )}

              {/* Dates */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Dates et horaires</h3>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {formatDuration(seminar.startDate, seminar.endDate)}
                </div>
              </div>

              {/* Agenda */}
              {seminar.agenda && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Agenda</h3>
                  <div className="text-gray-600 text-sm whitespace-pre-line">
                    {seminar.agenda}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar avec statistiques */}
        <div className="space-y-6">
          {/* Statistiques */}
          <div className="bg-white rounded-lg border border-gray-200 shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Statistiques</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Participants</span>
                </div>
                <span className="text-sm text-gray-600">
                  {seminar._count?.participants || 0}
                  {seminar.maxParticipants && ` / ${seminar.maxParticipants}`}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Documents</span>
                </div>
                <span className="text-sm text-gray-600">
                  {seminar._count?.documents || 0}
                </span>
              </div>

              {seminar.maxParticipants && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Taux de remplissage</span>
                    <span className="text-gray-900">
                      {Math.round(((seminar._count?.participants || 0) / seminar.maxParticipants) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ 
                        width: `${Math.min(((seminar._count?.participants || 0) / seminar.maxParticipants) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Organisateur */}
          <div className="bg-white rounded-lg border border-gray-200 shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Organisateur</h2>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {seminar.organizer.firstName} {seminar.organizer.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{seminar.organizer.email}</p>
                  <p className="text-sm text-gray-500">
                    {seminar.organizer.role} 
                    {seminar.organizer.specialization && ` • ${seminar.organizer.specialization}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets pour les détails */}
      <div className="bg-white rounded-lg border border-gray-200 shadow">
        {/* Navigation des onglets */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: 'participants', label: 'Participants', count: seminar._count?.participants || 0 },
              { key: 'documents', label: 'Documents', count: seminar._count?.documents || 0 }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="px-6 py-6">
          {activeTab === 'participants' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Participants ({seminar._count?.participants || 0})
                </h3>
                {canMarkAttendance() && (
                  <span className="text-sm text-gray-500">
                    Cliquez pour marquer la présence
                  </span>
                )}
              </div>

              {seminar.participants && seminar.participants.length > 0 ? (
                <div className="grid gap-3">
                  {seminar.participants.map((participant) => (
                    <div 
                      key={participant.id} 
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {participant.participant.firstName} {participant.participant.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {participant.participant.role}
                            {participant.participant.department && ` • ${participant.participant.department}`}
                          </p>
                          <p className="text-xs text-gray-400">
                            Inscrit le {new Date(participant.registeredAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {participant.attendedAt ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Présent
                          </span>
                        ) : canMarkAttendance() ? (
                          <button
                            onClick={() => handleMarkAttendance(participant.participant.id)}
                            disabled={loadingActions[`attendance-${participant.participant.id}`]}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                          >
                            {loadingActions[`attendance-${participant.participant.id}`] ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                            ) : (
                              <UserCheck className="h-3 w-3 mr-1" />
                            )}
                            Marquer présent
                          </button>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <UserX className="h-3 w-3 mr-1" />
                            Absent
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Aucun participant</h3>
                  <p className="text-sm text-gray-500">
                    Aucun participant n'est encore inscrit à ce séminaire.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Documents ({seminar._count?.documents || 0})
                </h3>
                {canUserEditSeminar() && (
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    <Upload className="h-4 w-4 mr-2" />
                    Ajouter un document
                  </button>
                )}
              </div>

              {seminar.documents && seminar.documents.length > 0 ? (
                <div className="grid gap-3">
                  {seminar.documents.map((document) => (
                    <div 
                      key={document.id} 
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <FileText className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">{document.title}</p>
                          <p className="text-sm text-gray-500">{document.filename}</p>
                          <p className="text-xs text-gray-400">
                            Ajouté le {new Date(document.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                          <Eye className="h-3 w-3 mr-1" />
                          Voir
                        </button>
                        <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                          <Download className="h-3 w-3 mr-1" />
                          Télécharger
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Aucun document</h3>
                  <p className="text-sm text-gray-500">
                    Aucun document n'a encore été ajouté à ce séminaire.
                  </p>
                  {canUserEditSeminar() && (
                    <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                      <Upload className="h-4 w-4 mr-2" />
                      Ajouter le premier document
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeminarDetail;