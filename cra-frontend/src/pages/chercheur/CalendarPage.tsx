import React, { useState } from 'react';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { SlotInfo } from 'react-big-calendar';
import CalendarView from '../../components/events/CalendarView';
import EventFormModal from '../../components/events/EventFormModal';
import SeminarFormModal from '../../components/events/SeminarFormModal';
import EventDetailModal from '../../components/events/EventDetailModal';
import { CalendarEvent, Seminar } from '../../types/event.types';

const CalendarPage: React.FC = () => {
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [seminarFormOpen, setSeminarFormOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | Seminar | undefined>();
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>();
  const [editingSeminar, setEditingSeminar] = useState<Seminar | undefined>();
  const [initialDate, setInitialDate] = useState<Date | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);
  const [createType, setCreateType] = useState<'event' | 'seminar'>('event');

  const handleSelectEvent = (event: CalendarEvent | Seminar) => {
    setSelectedEvent(event);
    setDetailModalOpen(true);
  };

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setInitialDate(slotInfo.start);
  };

  const handleCreateEvent = (start: Date, end: Date) => {
    setInitialDate(start);
  };

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
    setEditingEvent(undefined);
    setEditingSeminar(undefined);
    setSelectedEvent(undefined);
  };

  const handleEdit = () => {
    if (selectedEvent) {
      if ('organizer' in selectedEvent && 'agenda' in selectedEvent) {
        setEditingSeminar(selectedEvent as Seminar);
        setSeminarFormOpen(true);
      } else {
        setEditingEvent(selectedEvent as CalendarEvent);
        setEventFormOpen(true);
      }
      setDetailModalOpen(false);
    }
  };

  const handleDelete = () => {
    setDetailModalOpen(false);
    setRefreshKey(prev => prev + 1);
  };

  const handleOpenEventForm = () => {
    setCreateType('event');
    setEditingEvent(undefined);
    setEventFormOpen(true);
  };

  const handleOpenSeminarForm = () => {
    setCreateType('seminar');
    setEditingSeminar(undefined);
    setSeminarFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header épuré */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg">
                <CalendarIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Calendrier</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Gérez vos événements et séminaires
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleOpenEventForm}
                className="group relative inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-xl transform hover:-translate-y-0.5 whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Événement</span>
              </button>
              <button
                onClick={handleOpenSeminarForm}
                className="group relative inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-xl transform hover:-translate-y-0.5 whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Séminaire</span>
              </button>
            </div>
          </div>
        </div>

        {/* Calendrier épuré avec légende intégrée */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Barre de légende discrète en haut */}
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
                  <span className="text-sm font-medium text-gray-700">Événements</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-600 shadow-sm"></div>
                  <span className="text-sm font-medium text-gray-700">Séminaires</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-700 shadow-sm"></div>
                  <span className="text-sm font-medium text-gray-700">Missions</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 hidden md:block">
                Cliquez sur un jour pour créer un événement
              </div>
            </div>
          </div>

          {/* Calendrier */}
          <div className="p-6">
            <CalendarView
              key={refreshKey}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              onCreateEvent={handleCreateEvent}
              showSeminars={true}
            />
          </div>
        </div>

        {/* Info subtile en bas */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            💡 Astuce : Double-cliquez sur un événement pour voir les détails
          </p>
        </div>
      </div>

      <EventFormModal
        isOpen={eventFormOpen}
        onClose={() => {
          setEventFormOpen(false);
          setEditingEvent(undefined);
          setInitialDate(undefined);
        }}
        onSuccess={handleSuccess}
        event={editingEvent}
        initialDate={initialDate}
      />

      <SeminarFormModal
        isOpen={seminarFormOpen}
        onClose={() => {
          setSeminarFormOpen(false);
          setEditingSeminar(undefined);
          setInitialDate(undefined);
        }}
        onSuccess={handleSuccess}
        seminar={editingSeminar}
        initialDate={initialDate}
      />

      <EventDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedEvent(undefined);
        }}
        event={selectedEvent}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canEdit={true}
      />

      <style>{`
        /* Amélioration des styles du calendrier */
        .rbc-calendar {
          font-family: inherit;
        }

        .rbc-header {
          padding: 12px 8px;
          font-weight: 600;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
          background: linear-gradient(to bottom, #f9fafb, #ffffff);
        }

        .rbc-today {
          background-color: #f0fdf4 !important;
        }

        .rbc-date-cell {
          padding: 8px;
        }

        .rbc-date-cell.rbc-now {
          font-weight: 700;
        }

        .rbc-date-cell.rbc-now .rbc-button-link {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
        }

        .rbc-event {
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 0.875rem;
          font-weight: 500;
          border: none;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.2s;
        }

        .rbc-event:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-1px);
        }

        .rbc-event-label {
          font-size: 0.75rem;
          font-weight: 600;
        }

        .rbc-toolbar {
          margin-bottom: 20px;
          padding: 16px;
          background: linear-gradient(to right, #f9fafb, #ffffff);
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        .rbc-toolbar button {
          color: #374151;
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          background: white;
          font-weight: 500;
          transition: all 0.2s;
        }

        .rbc-toolbar button:hover {
          background: #f3f4f6;
          border-color: #22c55e;
          color: #16a34a;
        }

        .rbc-toolbar button:active,
        .rbc-toolbar button.rbc-active {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          border-color: #16a34a;
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
        }

        .rbc-toolbar-label {
          font-weight: 700;
          font-size: 1.25rem;
          color: #111827;
        }

        .rbc-month-view,
        .rbc-time-view {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
        }

        .rbc-day-bg + .rbc-day-bg {
          border-left: 1px solid #f3f4f6;
        }

        .rbc-month-row + .rbc-month-row {
          border-top: 1px solid #f3f4f6;
        }

        .rbc-off-range-bg {
          background: #fafafa;
        }

        .rbc-time-slot {
          border-top: 1px solid #f3f4f6;
        }

        /* Animation d'apparition des événements */
        .rbc-event {
          animation: eventFadeIn 0.3s ease-out;
        }

        @keyframes eventFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default CalendarPage;
