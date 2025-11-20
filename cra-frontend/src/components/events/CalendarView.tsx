import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Calendar, momentLocalizer, View, SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-custom.css';
import { CalendarEvent, Seminar } from '../../types/event.types';
import eventsApi from '../../services/eventsApi';
import toast from 'react-hot-toast';

moment.locale('fr');
const localizer = momentLocalizer(moment);

interface CalendarViewProps {
  onSelectEvent?: (event: CalendarEvent | Seminar) => void;
  onSelectSlot?: (slotInfo: SlotInfo) => void;
  onCreateEvent?: (start: Date, end: Date) => void;
  showSeminars?: boolean;
  userId?: string;
}

interface CalendarEventItem {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: CalendarEvent | Seminar;
  color?: string;
  type: 'event' | 'seminar';
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onSelectEvent,
  onSelectSlot,
  onCreateEvent,
  showSeminars = true,
  userId
}) => {
  const [currentView, setCurrentView] = useState<View>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [loading, setLoading] = useState(false);

  // Charger les événements
  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const startOfMonth = moment(currentDate).startOf('month').toDate();
      const endOfMonth = moment(currentDate).endOf('month').toDate();

      const eventsData = await eventsApi.getEventsInRange(startOfMonth, endOfMonth, userId ? { creatorId: userId } : {});
      setEvents(eventsData);

      if (showSeminars) {
        const seminarsData = await eventsApi.listSeminars({
          startDate: startOfMonth.toISOString(),
          endDate: endOfMonth.toISOString(),
          ...(userId && { organizerId: userId })
        });
        setSeminars(seminarsData);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  }, [currentDate, showSeminars, userId]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Convertir les événements au format react-big-calendar
  const calendarEvents: CalendarEventItem[] = useMemo(() => {
    const eventItems: CalendarEventItem[] = events.map(event => ({
      id: event.id,
      title: event.title,
      start: new Date(event.startDate),
      end: event.endDate ? new Date(event.endDate) : new Date(event.startDate),
      allDay: event.isAllDay,
      resource: event,
      color: event.color || eventsApi.getEventTypeColor(event.type),
      type: 'event' as const
    }));

    if (showSeminars) {
      const seminarItems: CalendarEventItem[] = seminars.map(seminar => ({
        id: seminar.id,
        title: `[Séminaire] ${seminar.title}`,
        start: new Date(seminar.startDate),
        end: seminar.endDate ? new Date(seminar.endDate) : new Date(seminar.startDate),
        allDay: false,
        resource: seminar,
        color: '#8b5cf6',
        type: 'seminar' as const
      }));

      return [...eventItems, ...seminarItems];
    }

    return eventItems;
  }, [events, seminars, showSeminars]);

  const handleSelectEvent = useCallback((event: CalendarEventItem) => {
    if (onSelectEvent) {
      onSelectEvent(event.resource);
    }
  }, [onSelectEvent]);

  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    if (onSelectSlot) {
      onSelectSlot(slotInfo);
    }
    if (onCreateEvent) {
      onCreateEvent(slotInfo.start, slotInfo.end);
    }
  }, [onSelectSlot, onCreateEvent]);

  const handleNavigate = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  const handleViewChange = useCallback((view: View) => {
    setCurrentView(view);
  }, []);

  // Personnalisation de l'affichage des événements
  const eventStyleGetter = useCallback((event: CalendarEventItem) => {
    const style: React.CSSProperties = {
      backgroundColor: event.color || '#3b82f6',
      borderRadius: '4px',
      opacity: 0.9,
      color: 'white',
      border: '0px',
      display: 'block',
      fontSize: '0.85em',
      padding: '2px 5px'
    };

    return { style };
  }, []);

  const messages = {
    allDay: 'Journée',
    previous: 'Précédent',
    next: 'Suivant',
    today: 'Aujourd\'hui',
    month: 'Mois',
    week: 'Semaine',
    day: 'Jour',
    agenda: 'Agenda',
    date: 'Date',
    time: 'Heure',
    event: 'Événement',
    noEventsInRange: 'Aucun événement dans cette période',
    showMore: (total: number) => `+ ${total} autre(s)`
  };

  return (
    <div className="calendar-container" style={{ height: '700px' }}>
      {loading && (
        <div className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg z-10">
          Chargement...
        </div>
      )}
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        view={currentView}
        onView={handleViewChange}
        date={currentDate}
        onNavigate={handleNavigate}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        eventPropGetter={eventStyleGetter}
        messages={messages}
        popup
        views={['month', 'week', 'day', 'agenda']}
      />
    </div>
  );
};

export default CalendarView;
