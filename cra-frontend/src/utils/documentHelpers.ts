// src/utils/documentHelpers.ts
import { DocumentResponse, DocumentType } from '../types/document.types';
import { differenceInDays, differenceInHours, format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Vérifie si l'utilisateur peut éditer un document
 */
export const canEdit = (
  document: DocumentResponse,
  userId: string,
  userRole: string
): boolean => {
  // Propriétaire du document
  if (document.owner.id === userId) {
    return true;
  }

  // Administrateur
  if (userRole === 'ADMINISTRATEUR') {
    return true;
  }

  // Utilisateur avec qui c'est partagé ET permission canEdit
  const share = document.shares?.find(s => s.sharedWith.id === userId);
  if (share && share.canEdit) {
    return true;
  }

  return false;
};

/**
 * Vérifie si l'utilisateur peut supprimer un document
 */
export const canDelete = (
  document: DocumentResponse,
  userId: string,
  userRole: string
): boolean => {
  // Propriétaire du document
  if (document.owner.id === userId) {
    return true;
  }

  // Administrateur
  if (userRole === 'ADMINISTRATEUR') {
    return true;
  }

  // Utilisateur avec permission canDelete
  const share = document.shares?.find(s => s.sharedWith.id === userId);
  if (share && share.canDelete) {
    return true;
  }

  return false;
};

/**
 * Vérifie si l'utilisateur peut partager un document
 */
export const canShare = (
  document: DocumentResponse,
  userId: string,
  userRole: string
): boolean => {
  // Seul le propriétaire peut partager
  if (document.owner.id === userId) {
    return true;
  }

  // Les admins peuvent aussi partager
  if (userRole === 'ADMINISTRATEUR') {
    return true;
  }

  return false;
};

/**
 * Vérifie si l'utilisateur peut délier un document d'une entité
 */
export const canUnlink = (
  document: DocumentResponse,
  userId: string,
  userRole: string,
  entityContext?: { type: string; responsibleId?: string; creatorId?: string }
): boolean => {
  // Propriétaire du document
  if (document.owner.id === userId) {
    return true;
  }

  // Administrateur
  if (userRole === 'ADMINISTRATEUR') {
    return true;
  }

  // Responsable de l'entité
  if (entityContext) {
    if (entityContext.responsibleId === userId || entityContext.creatorId === userId) {
      return true;
    }
  }

  // Utilisateur avec permission d'édition
  const share = document.shares?.find(s => s.sharedWith.id === userId);
  if (share && share.canEdit) {
    return true;
  }

  return false;
};

/**
 * Vérifie si l'utilisateur peut télécharger un document
 */
export const canDownload = (
  document: DocumentResponse,
  userId: string,
  userRole: string
): boolean => {
  // Si l'utilisateur peut voir le document, il peut le télécharger
  return canView(document, userId, userRole);
};

/**
 * Vérifie si l'utilisateur peut voir un document
 */
export const canView = (
  document: DocumentResponse,
  userId: string,
  userRole: string
): boolean => {
  // Propriétaire
  if (document.owner.id === userId) {
    return true;
  }

  // Administrateur
  if (userRole === 'ADMINISTRATEUR') {
    return true;
  }

  // Document public
  if (document.isPublic) {
    return true;
  }

  // Partagé avec l'utilisateur
  if (document.shares?.some(s => s.sharedWith.id === userId)) {
    return true;
  }

  // Participant du projet lié
  if (document.project?.participants?.some(p => p.userId === userId && p.isActive)) {
    return true;
  }

  // Participant de l'activité liée (via le projet)
  if (document.activity?.project?.participants?.some(p => p.userId === userId && p.isActive)) {
    return true;
  }

  // Créateur ou assigné à une tâche liée
  if (document.task) {
    if (document.task.creatorId === userId || document.task.assigneeId === userId) {
      return true;
    }
  }

  return false;
};

/**
 * Obtient toutes les permissions d'un utilisateur sur un document
 */
export const getPermissions = (
  document: DocumentResponse,
  userId: string,
  userRole: string,
  entityContext?: { type: string; responsibleId?: string; creatorId?: string }
) => {
  return {
    canView: canView(document, userId, userRole),
    canDownload: canDownload(document, userId, userRole),
    canEdit: canEdit(document, userId, userRole),
    canDelete: canDelete(document, userId, userRole),
    canShare: canShare(document, userId, userRole),
    canUnlink: canUnlink(document, userId, userRole, entityContext),
    isOwner: document.owner.id === userId,
    isAdmin: userRole === 'ADMINISTRATEUR',
    isShared: document.shares?.some(s => s.sharedWith.id === userId) ?? false
  };
};

/**
 * Formate une date de manière lisible
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isToday(dateObj)) {
    return `Aujourd'hui à ${format(dateObj, 'HH:mm', { locale: fr })}`;
  }

  if (isYesterday(dateObj)) {
    return `Hier à ${format(dateObj, 'HH:mm', { locale: fr })}`;
  }

  const daysDiff = differenceInDays(new Date(), dateObj);

  if (daysDiff < 7) {
    return format(dateObj, 'EEEE à HH:mm', { locale: fr });
  }

  return format(dateObj, 'dd MMM yyyy à HH:mm', { locale: fr });
};

/**
 * Formate une date de manière relative (il y a X temps)
 */
export const formatRelativeDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();

  const hours = differenceInHours(now, dateObj);
  const days = differenceInDays(now, dateObj);

  if (hours < 1) {
    return 'À l\'instant';
  }

  if (hours < 24) {
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  }

  if (days < 7) {
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  }

  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
  }

  if (days < 365) {
    const months = Math.floor(days / 30);
    return `Il y a ${months} mois`;
  }

  const years = Math.floor(days / 365);
  return `Il y a ${years} an${years > 1 ? 's' : ''}`;
};

/**
 * Vérifie si un document est récent (< 24h)
 */
export const isRecent = (document: DocumentResponse): boolean => {
  const hours = differenceInHours(new Date(), new Date(document.createdAt));
  return hours < 24;
};

/**
 * Vérifie si un document est nouveau (< 7 jours)
 */
export const isNew = (document: DocumentResponse): boolean => {
  const days = differenceInDays(new Date(), new Date(document.createdAt));
  return days < 7;
};

/**
 * Obtient le contexte d'un document (projet, activité, tâche, etc.)
 */
export const getDocumentContext = (document: DocumentResponse): {
  type: 'project' | 'activity' | 'task' | 'seminar' | 'training' | 'internship' | 'supervision' | 'knowledge-transfer' | 'event' | null;
  id: string | null;
  title: string | null;
} => {
  if (document.project) {
    return {
      type: 'project',
      id: document.project.id,
      title: document.project.title
    };
  }

  if (document.activity) {
    return {
      type: 'activity',
      id: document.activity.id,
      title: document.activity.title
    };
  }

  if (document.task) {
    return {
      type: 'task',
      id: document.task.id,
      title: document.task.title
    };
  }

  if (document.seminar) {
    return {
      type: 'seminar',
      id: document.seminar.id,
      title: document.seminar.title
    };
  }

  if ((document as any).training) {
    return {
      type: 'training',
      id: (document as any).training.id,
      title: (document as any).training.title
    };
  }

  if ((document as any).internship) {
    return {
      type: 'internship',
      id: (document as any).internship.id,
      title: (document as any).internship.title
    };
  }

  if ((document as any).supervision) {
    return {
      type: 'supervision',
      id: (document as any).supervision.id,
      title: (document as any).supervision.title
    };
  }

  if ((document as any).knowledgeTransfer) {
    return {
      type: 'knowledge-transfer',
      id: (document as any).knowledgeTransfer.id,
      title: (document as any).knowledgeTransfer.title
    };
  }

  if ((document as any).event) {
    return {
      type: 'event',
      id: (document as any).event.id,
      title: (document as any).event.title
    };
  }

  return { type: null, id: null, title: null };
};

/**
 * Obtient le libellé d'un type de document
 */
export const getDocumentTypeLabel = (type: DocumentType | string): string => {
  const labels: Record<string, string> = {
    RAPPORT: 'Rapport',
    FICHE_ACTIVITE: 'Fiche d\'activité',
    FICHE_TECHNIQUE: 'Fiche technique',
    FICHE_INDIVIDUELLE: 'Fiche individuelle',
    DONNEES_EXPERIMENTALES: 'Données expérimentales',
    FORMULAIRE: 'Formulaire',
    PUBLICATION_SCIENTIFIQUE: 'Publication scientifique',
    MEMOIRE: 'Mémoire',
    THESE: 'Thèse',
    IMAGE: 'Image',
    PRESENTATION: 'Présentation',
    AUTRE: 'Autre'
  };

  return labels[type] || type;
};

/**
 * Obtient la couleur du badge selon le type de document
 */
export const getDocumentTypeBadgeColor = (type: DocumentType | string): string => {
  const colors: Record<string, string> = {
    RAPPORT: 'bg-blue-100 text-blue-800',
    FICHE_ACTIVITE: 'bg-green-100 text-green-800',
    FICHE_TECHNIQUE: 'bg-purple-100 text-purple-800',
    FICHE_INDIVIDUELLE: 'bg-yellow-100 text-yellow-800',
    DONNEES_EXPERIMENTALES: 'bg-pink-100 text-pink-800',
    FORMULAIRE: 'bg-indigo-100 text-indigo-800',
    PUBLICATION_SCIENTIFIQUE: 'bg-red-100 text-red-800',
    MEMOIRE: 'bg-orange-100 text-orange-800',
    THESE: 'bg-teal-100 text-teal-800',
    IMAGE: 'bg-purple-100 text-purple-800',
    PRESENTATION: 'bg-cyan-100 text-cyan-800',
    AUTRE: 'bg-gray-100 text-gray-800'
  };

  return colors[type] || 'bg-gray-100 text-gray-800';
};

/**
 * Filtre les documents selon des critères de recherche
 */
export const filterDocuments = (
  documents: DocumentResponse[],
  searchTerm: string
): DocumentResponse[] => {
  if (!searchTerm || searchTerm.trim() === '') {
    return documents;
  }

  const search = searchTerm.toLowerCase().trim();

  return documents.filter(doc => {
    // Recherche dans le titre
    if (doc.title.toLowerCase().includes(search)) {
      return true;
    }

    // Recherche dans la description
    if (doc.description?.toLowerCase().includes(search)) {
      return true;
    }

    // Recherche dans le nom du fichier
    if (doc.filename.toLowerCase().includes(search)) {
      return true;
    }

    // Recherche dans les tags
    if (doc.tags.some(tag => tag.toLowerCase().includes(search))) {
      return true;
    }

    // Recherche dans le nom du propriétaire
    const ownerName = `${doc.owner.firstName} ${doc.owner.lastName}`.toLowerCase();
    if (ownerName.includes(search)) {
      return true;
    }

    // Recherche dans le contexte
    const context = getDocumentContext(doc);
    if (context.title?.toLowerCase().includes(search)) {
      return true;
    }

    return false;
  });
};

/**
 * Trie les documents
 */
export const sortDocuments = (
  documents: DocumentResponse[],
  sortBy: 'title' | 'createdAt' | 'updatedAt' | 'size' | 'type',
  order: 'asc' | 'desc' = 'asc'
): DocumentResponse[] => {
  const sorted = [...documents].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title, 'fr');
        break;

      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;

      case 'updatedAt':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;

      case 'size':
        comparison = a.size - b.size;
        break;

      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;

      default:
        comparison = 0;
    }

    return order === 'asc' ? comparison : -comparison;
  });

  return sorted;
};

/**
 * Groupe les documents par type
 */
export const groupDocumentsByType = (
  documents: DocumentResponse[]
): Record<string, DocumentResponse[]> => {
  return documents.reduce((groups, doc) => {
    const type = doc.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(doc);
    return groups;
  }, {} as Record<string, DocumentResponse[]>);
};

/**
 * Groupe les documents par date (aujourd'hui, hier, cette semaine, etc.)
 */
export const groupDocumentsByDate = (
  documents: DocumentResponse[]
): Record<string, DocumentResponse[]> => {
  const groups: Record<string, DocumentResponse[]> = {
    "Aujourd'hui": [],
    "Hier": [],
    "Cette semaine": [],
    "Ce mois-ci": [],
    "Plus ancien": []
  };

  documents.forEach(doc => {
    const date = new Date(doc.createdAt);
    const days = differenceInDays(new Date(), date);

    if (isToday(date)) {
      groups["Aujourd'hui"].push(doc);
    } else if (isYesterday(date)) {
      groups["Hier"].push(doc);
    } else if (days < 7) {
      groups["Cette semaine"].push(doc);
    } else if (days < 30) {
      groups["Ce mois-ci"].push(doc);
    } else {
      groups["Plus ancien"].push(doc);
    }
  });

  // Retirer les groupes vides
  Object.keys(groups).forEach(key => {
    if (groups[key].length === 0) {
      delete groups[key];
    }
  });

  return groups;
};

/**
 * Calcule des statistiques sur un ensemble de documents
 */
export const calculateDocumentStats = (documents: DocumentResponse[]) => {
  const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0);

  const byType = documents.reduce((acc, doc) => {
    acc[doc.type] = (acc[doc.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const publicCount = documents.filter(d => d.isPublic).length;
  const sharedCount = documents.filter(d => d.shares && d.shares.length > 0).length;

  const contextCount = documents.reduce((acc, doc) => {
    const context = getDocumentContext(doc);
    if (context.type) {
      acc[context.type] = (acc[context.type] || 0) + 1;
    } else {
      acc.standalone = (acc.standalone || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return {
    total: documents.length,
    totalSize,
    byType,
    publicCount,
    sharedCount,
    contextCount,
    averageSize: documents.length > 0 ? totalSize / documents.length : 0
  };
};

/**
 * Génère un slug unique pour un document (pour URLs)
 */
export const generateDocumentSlug = (document: DocumentResponse): string => {
  const titleSlug = document.title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .replace(/[^a-z0-9]+/g, '-') // Remplacer les caractères spéciaux par -
    .replace(/^-+|-+$/g, ''); // Enlever les - au début et à la fin

  return `${titleSlug}-${document.id.slice(0, 8)}`;
};

export default {
  canEdit,
  canDelete,
  canShare,
  canUnlink,
  canDownload,
  canView,
  getPermissions,
  formatDate,
  formatRelativeDate,
  isRecent,
  isNew,
  getDocumentContext,
  getDocumentTypeLabel,
  getDocumentTypeBadgeColor,
  filterDocuments,
  sortDocuments,
  groupDocumentsByType,
  groupDocumentsByDate,
  calculateDocumentStats,
  generateDocumentSlug
};
