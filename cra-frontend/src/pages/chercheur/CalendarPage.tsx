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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CalendarIcon className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Calendrier des événements</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Gérez vos événements, séminaires et réunions
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleOpenEventForm}
                className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Nouvel événement
              </button>
              <button
                onClick={handleOpenSeminarForm}
                className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Nouveau séminaire
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <CalendarView
            key={refreshKey}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            onCreateEvent={handleCreateEvent}
            showSeminars={true}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Événements généraux</p>
                <p className="text-xs text-gray-500">Réunions, conférences, etc.</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-600">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-green-600"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Séminaires</p>
                <p className="text-xs text-gray-500">Séminaires et formations</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-700">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-green-700"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Missions terrain</p>
                <p className="text-xs text-gray-500">Déplacements et visites</p>
              </div>
            </div>
          </div>
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
    </div>
  );
};

export default CalendarPage;
