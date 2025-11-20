import React, { useState } from 'react';
import { X, MapPin, Calendar, Clock, Users, FileText, Trash2, Edit } from 'lucide-react';
import { CalendarEvent, Seminar } from '../../types/event.types';
import eventsApi from '../../services/eventsApi';
import toast from 'react-hot-toast';

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: CalendarEvent | Seminar;
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
}

const isSeminar = (event: CalendarEvent | Seminar): event is Seminar => {
  return 'organizer' in event && 'agenda' in event;
};

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  isOpen,
  onClose,
  event,
  onEdit,
  onDelete,
  canEdit = false
}) => {
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !event) return null;

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      return;
    }

    setDeleting(true);
    try {
      if (isSeminar(event)) {
        await eventsApi.deleteSeminar(event.id);
        toast.success('Séminaire supprimé avec succès');
      } else {
        await eventsApi.deleteEvent(event.id);
        toast.success('Événement supprimé avec succès');
      }

      if (onDelete) {
        onDelete();
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const seminar = isSeminar(event) ? event : null;
  const calendarEvent = !isSeminar(event) ? event : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                {seminar && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Séminaire
                  </span>
                )}
                {calendarEvent && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {eventsApi.getEventTypeLabel(calendarEvent.type)}
                  </span>
                )}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  event.status === 'PLANIFIE' ? 'bg-gray-100 text-gray-800' :
                  event.status === 'EN_COURS' ? 'bg-yellow-100 text-yellow-800' :
                  event.status === 'TERMINE' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {eventsApi.getEventStatusBadge(event.status).label}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canEdit && (
                <>
                  <button
                    onClick={onEdit}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Modifier"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    disabled={deleting}
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              )}
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="px-6 py-4 space-y-4">
            {event.description && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                <p className="text-sm text-gray-600">{event.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Date de début</p>
                  <p className="text-sm text-gray-600">
                    {new Date(event.startDate).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {event.endDate && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Date de fin</p>
                    <p className="text-sm text-gray-600">
                      {new Date(event.endDate).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}

              {event.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Lieu</p>
                    <p className="text-sm text-gray-600">{event.location}</p>
                  </div>
                </div>
              )}

              {seminar && seminar.maxParticipants && (
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Participants</p>
                    <p className="text-sm text-gray-600">
                      {seminar._count?.participants || 0} / {seminar.maxParticipants}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {seminar && seminar.agenda && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Ordre du jour
                </h4>
                <p className="text-sm text-gray-600 whitespace-pre-line">{seminar.agenda}</p>
              </div>
            )}

            {seminar?.organizer && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Organisateur</h4>
                <p className="text-sm text-gray-600">
                  {seminar.organizer.firstName} {seminar.organizer.lastName}
                  {seminar.organizer.email && ` (${seminar.organizer.email})`}
                </p>
              </div>
            )}

            {calendarEvent?.creator && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Créateur</h4>
                <p className="text-sm text-gray-600">
                  {calendarEvent.creator.firstName} {calendarEvent.creator.lastName}
                  {calendarEvent.creator.email && ` (${calendarEvent.creator.email})`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;
