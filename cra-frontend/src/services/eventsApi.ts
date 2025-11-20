import api from './api';
import {
  CalendarEvent,
  Seminar,
  CreateEventDto,
  UpdateEventDto,
  CreateSeminarDto,
  UpdateSeminarDto,
  EventFilterDto,
  SeminarFilterDto,
  EventStatistics,
  SeminarStatistics
} from '../types/event.types';

class EventsApiService {
  private baseUrl = '/events';

  // ==================== ÉVÉNEMENTS DU CALENDRIER ====================

  async createEvent(data: CreateEventDto): Promise<CalendarEvent> {
    try {
      const response = await api.post(this.baseUrl, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création de l\'événement');
    }
  }

  async listEvents(filters: EventFilterDto = {}): Promise<CalendarEvent[]> {
    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`${this.baseUrl}?${params.toString()}`);
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des événements');
    }
  }

  async getEventById(id: string): Promise<CalendarEvent> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de l\'événement');
    }
  }

  async updateEvent(id: string, data: UpdateEventDto): Promise<CalendarEvent> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de l\'événement');
    }
  }

  async deleteEvent(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de l\'événement');
    }
  }

  async addDocumentToEvent(id: string, file: File, title?: string, description?: string, type?: string): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (title) formData.append('title', title);
      if (description) formData.append('description', description);
      if (type) formData.append('type', type);

      const response = await api.post(`${this.baseUrl}/${id}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'ajout du document');
    }
  }

  async getEventStatistics(): Promise<EventStatistics> {
    try {
      const response = await api.get(`${this.baseUrl}/statistics`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des statistiques');
    }
  }

  async generateEventReport(filters: EventFilterDto & { format: 'pdf' | 'docx' }): Promise<Blob> {
    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`${this.baseUrl}/report?${params.toString()}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la génération du rapport');
    }
  }

  // ==================== SÉMINAIRES ====================

  async createSeminar(data: CreateSeminarDto): Promise<Seminar> {
    try {
      const response = await api.post(`${this.baseUrl}/seminars`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du séminaire');
    }
  }

  async listSeminars(filters: SeminarFilterDto = {}): Promise<Seminar[]> {
    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`${this.baseUrl}/seminars?${params.toString()}`);
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des séminaires');
    }
  }

  async getSeminarById(id: string): Promise<Seminar> {
    try {
      const response = await api.get(`${this.baseUrl}/seminars/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du séminaire');
    }
  }

  async updateSeminar(id: string, data: UpdateSeminarDto): Promise<Seminar> {
    try {
      const response = await api.put(`${this.baseUrl}/seminars/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du séminaire');
    }
  }

  async deleteSeminar(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/seminars/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du séminaire');
    }
  }

  async addDocumentToSeminar(id: string, file: File, title?: string, description?: string, type?: string): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (title) formData.append('title', title);
      if (description) formData.append('description', description);
      if (type) formData.append('type', type);

      const response = await api.post(`${this.baseUrl}/seminars/${id}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'ajout du document');
    }
  }

  // ==================== MÉTHODES UTILITAIRES ====================

  async getUpcomingEvents(filters: Omit<EventFilterDto, 'startDate' | 'endDate'> = {}): Promise<CalendarEvent[]> {
    const now = new Date().toISOString();
    return this.listEvents({ ...filters, startDate: now });
  }

  async getUpcomingSeminars(filters: Omit<SeminarFilterDto, 'startDate' | 'endDate'> = {}): Promise<Seminar[]> {
    const now = new Date().toISOString();
    return this.listSeminars({ ...filters, startDate: now });
  }

  async getEventsInRange(startDate: Date | string, endDate: Date | string, filters: EventFilterDto = {}): Promise<CalendarEvent[]> {
    return this.listEvents({
      ...filters,
      startDate: typeof startDate === 'string' ? startDate : startDate.toISOString(),
      endDate: typeof endDate === 'string' ? endDate : endDate.toISOString()
    });
  }

  // Formater une date pour l'affichage
  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Formater la durée
  formatDuration(startDate: Date | string, endDate?: Date | string | null): string {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;

    if (!endDate) {
      return this.formatDate(start);
    }

    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    const startStr = start.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const endStr = end.toLocaleDateString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    if (start.toDateString() === end.toDateString()) {
      return `${startStr} - ${endStr}`;
    }

    return `${startStr} - ${this.formatDate(end)}`;
  }

  // Obtenir le badge de statut pour un événement
  getEventStatusBadge(status: string): {
    label: string;
    variant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary';
  } {
    switch (status) {
      case 'PLANIFIE':
        return { label: 'Planifié', variant: 'default' };
      case 'EN_COURS':
        return { label: 'En cours', variant: 'warning' };
      case 'TERMINE':
        return { label: 'Terminé', variant: 'success' };
      case 'ANNULE':
        return { label: 'Annulé', variant: 'destructive' };
      case 'REPORTE':
        return { label: 'Reporté', variant: 'secondary' };
      default:
        return { label: status, variant: 'secondary' };
    }
  }

  // Obtenir le label du type d'événement
  getEventTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      REUNION: 'Réunion',
      SEMINAIRE: 'Séminaire',
      FORMATION: 'Formation',
      MISSION_TERRAIN: 'Mission terrain',
      CONFERENCE: 'Conférence',
      ATELIER: 'Atelier',
      DEMONSTRATION: 'Démonstration',
      VISITE: 'Visite',
      SOUTENANCE: 'Soutenance',
      AUTRE: 'Autre'
    };
    return labels[type] || type;
  }

  // Obtenir la couleur par défaut pour un type d'événement
  getEventTypeColor(type: string): string {
    const colors: Record<string, string> = {
      REUNION: '#3b82f6',
      SEMINAIRE: '#8b5cf6',
      FORMATION: '#f59e0b',
      MISSION_TERRAIN: '#10b981',
      CONFERENCE: '#ec4899',
      ATELIER: '#14b8a6',
      DEMONSTRATION: '#f97316',
      VISITE: '#06b6d4',
      SOUTENANCE: '#6366f1',
      AUTRE: '#6b7280'
    };
    return colors[type] || '#6b7280';
  }
}

export const eventsApi = new EventsApiService();
export default eventsApi;
