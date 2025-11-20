import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Seminar, CreateSeminarDto, UpdateSeminarDto, SeminarStatus } from '../../types/event.types';
import eventsApi from '../../services/eventsApi';
import toast from 'react-hot-toast';
import './FormStyles.css';

interface SeminarFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  seminar?: Seminar;
  initialDate?: Date;
}

export const SeminarFormModal: React.FC<SeminarFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  seminar,
  initialDate
}) => {
  const [loading, setLoading] = useState(false);
  const isEdit = !!seminar;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreateSeminarDto | UpdateSeminarDto>({
    defaultValues: seminar ? {
      title: seminar.title,
      description: seminar.description || '',
      location: seminar.location || '',
      startDate: new Date(seminar.startDate).toISOString().slice(0, 16),
      endDate: seminar.endDate ? new Date(seminar.endDate).toISOString().slice(0, 16) : '',
      agenda: seminar.agenda || '',
      maxParticipants: seminar.maxParticipants || undefined,
      status: seminar.status
    } : {
      title: '',
      description: '',
      location: '',
      startDate: initialDate ? new Date(initialDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      endDate: '',
      agenda: '',
      maxParticipants: undefined
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
      const formattedData = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
        maxParticipants: data.maxParticipants ? parseInt(data.maxParticipants) : undefined
      };

      if (isEdit && seminar) {
        await eventsApi.updateSeminar(seminar.id, formattedData);
        toast.success('Séminaire modifié avec succès');
      } else {
        await eventsApi.createSeminar(formattedData);
        toast.success('Séminaire créé avec succès');
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
              {isEdit ? 'Modifier le séminaire' : 'Créer un séminaire'}
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
                  placeholder="Ex: Séminaire sur les techniques agricoles..."
                />
                {errors.title && <p className="form-error">{errors.title.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="form-textarea"
                  placeholder="Décrivez brièvement le séminaire..."
                />
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
                  placeholder="Ex: Salle de conférence, Centre de recherche..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nombre maximum de participants</label>
                <input
                  type="number"
                  {...register('maxParticipants')}
                  min="1"
                  className="form-input"
                  placeholder="Ex: 50"
                />
              </div>

              {isEdit && (
                <div className="form-group">
                  <label className="form-label">Statut</label>
                  <select
                    {...register('status')}
                    className="form-select"
                  >
                    <option value={SeminarStatus.PLANIFIE}>Planifié</option>
                    <option value={SeminarStatus.EN_COURS}>En cours</option>
                    <option value={SeminarStatus.TERMINE}>Terminé</option>
                    <option value={SeminarStatus.ANNULE}>Annulé</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Ordre du jour</label>
                <textarea
                  {...register('agenda')}
                  rows={4}
                  placeholder="Décrivez l'ordre du jour du séminaire..."
                  className="form-textarea"
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

export default SeminarFormModal;
