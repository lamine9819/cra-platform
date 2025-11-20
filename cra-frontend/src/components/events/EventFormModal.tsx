import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { CalendarEvent, CreateEventDto, UpdateEventDto, EventType, EventStatus } from '../../types/event.types';
import eventsApi from '../../services/eventsApi';
import toast from 'react-hot-toast';
import './FormStyles.css';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  event?: CalendarEvent;
  initialDate?: Date;
}

export const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  event,
  initialDate
}) => {
  const [loading, setLoading] = useState(false);
  const isEdit = !!event;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreateEventDto | UpdateEventDto>({
    defaultValues: event ? {
      title: event.title,
      description: event.description || '',
      type: event.type,
      status: event.status,
      startDate: new Date(event.startDate).toISOString().slice(0, 16),
      endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
      location: event.location || '',
      isAllDay: event.isAllDay,
      color: event.color || ''
    } : {
      title: '',
      description: '',
      type: EventType.REUNION,
      startDate: initialDate ? new Date(initialDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      endDate: '',
      location: '',
      isAllDay: false,
      color: ''
    }
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      // Convertir les dates en format ISO
      const formattedData = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined
      };

      if (isEdit && event) {
        await eventsApi.updateEvent(event.id, formattedData);
        toast.success('Événement modifié avec succès');
      } else {
        await eventsApi.createEvent(formattedData);
        toast.success('Événement créé avec succès');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform shadow-xl rounded-xl event-form-modal">
          <div className="modal-header">
            <h3 className="modal-title">
              {isEdit ? 'Modifier l\'événement' : 'Créer un événement'}
            </h3>
            <button onClick={onClose} className="modal-close">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="modal-body">
            <div className="space-y-1">
              <div className="form-group">
                <label className="form-label form-label-required">
                  Titre
                </label>
                <input
                  type="text"
                  {...register('title', { required: 'Le titre est requis' })}
                  className="form-input"
                  placeholder="Ex: Réunion d'équipe, Conférence..."
                />
                {errors.title && <p className="form-error">{errors.title.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="form-textarea"
                  placeholder="Décrivez brièvement l'événement..."
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label form-label-required">
                    Type
                  </label>
                  <select
                    {...register('type', { required: 'Le type est requis' })}
                    className="form-select"
                  >
                    <option value={EventType.REUNION}>Réunion</option>
                    <option value={EventType.SEMINAIRE}>Séminaire</option>
                    <option value={EventType.FORMATION}>Formation</option>
                    <option value={EventType.MISSION_TERRAIN}>Mission terrain</option>
                    <option value={EventType.CONFERENCE}>Conférence</option>
                    <option value={EventType.ATELIER}>Atelier</option>
                    <option value={EventType.DEMONSTRATION}>Démonstration</option>
                    <option value={EventType.VISITE}>Visite</option>
                    <option value={EventType.SOUTENANCE}>Soutenance</option>
                    <option value={EventType.AUTRE}>Autre</option>
                  </select>
                </div>

                {isEdit && (
                  <div>
                    <label className="form-label">Statut</label>
                    <select
                      {...register('status')}
                      className="form-input"
                    >
                      <option value={EventStatus.PLANIFIE}>Planifié</option>
                      <option value={EventStatus.EN_COURS}>En cours</option>
                      <option value={EventStatus.TERMINE}>Terminé</option>
                      <option value={EventStatus.ANNULE}>Annulé</option>
                      <option value={EventStatus.REPORTE}>Reporté</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label form-label-required">
                    Date de début
                  </label>
                  <input
                    type="datetime-local"
                    {...register('startDate', { required: 'La date de début est requise' })}
                    className="form-input"
                  />
                  {errors.startDate && <p className="form-error">{errors.startDate.message}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Date de fin</label>
                  <input
                    type="datetime-local"
                    {...register('endDate')}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Lieu</label>
                <input
                  type="text"
                  {...register('location')}
                  className="form-input"
                  placeholder="Ex: Salle de conférence A, Bureau principal..."
                />
              </div>

              <div className="form-checkbox-group">
                <input
                  type="checkbox"
                  {...register('isAllDay')}
                  className="form-checkbox"
                  id="isAllDay"
                />
                <label htmlFor="isAllDay" className="form-checkbox-label">Toute la journée</label>
              </div>

              <div className="form-group">
                <label className="form-label">Couleur personnalisée</label>
                <input
                  type="color"
                  {...register('color')}
                  className="form-color-input"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn-cancel"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? 'Enregistrement...' : isEdit ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventFormModal;
