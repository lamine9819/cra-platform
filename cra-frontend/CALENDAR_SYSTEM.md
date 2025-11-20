# Système de Calendrier et Événements

## Vue d'ensemble

Le nouveau système de calendrier remplace l'ancien système de séminaires et offre une solution complète pour gérer tous les types d'événements de la plateforme CRA.

## Fonctionnalités

### 1. Calendrier Dynamique
- Vue mensuelle, hebdomadaire, journalière et agenda
- Affichage en temps réel des événements et séminaires
- Navigation fluide entre les dates
- Interface similaire à Google Calendar
- Codes couleur par type d'événement

### 2. Types d'Événements Supportés
- Réunions
- Séminaires
- Formations
- Missions terrain
- Conférences
- Ateliers
- Démonstrations
- Visites
- Soutenances
- Autres

### 3. Gestion des Événements
- Création rapide d'événements depuis le calendrier (cliquer sur une date)
- Modification et suppression d'événements
- Événements d'une journée ou avec plage de dates
- Association à des stations, projets ou activités
- Ajout de documents aux événements

### 4. Gestion des Séminaires
- Création de séminaires avec ordre du jour
- Nombre maximum de participants configurable
- Statut du séminaire (Planifié, En cours, Terminé, Annulé)
- Ajout de documents aux séminaires

## Architecture Technique

### Backend
- **Routes**: `/api/events` et `/api/events/seminars`
- **Contrôleur**: `event.controller.ts`
- **Service**: `event.service.ts`
- **Types**: `event.types.ts`

### Frontend

#### Types
- `src/types/event.types.ts` - Définitions TypeScript pour événements et séminaires

#### Services
- `src/services/eventsApi.ts` - Service API pour communiquer avec le backend

#### Composants
- `src/components/events/CalendarView.tsx` - Composant calendrier principal
- `src/components/events/EventFormModal.tsx` - Modal de création/modification d'événements
- `src/components/events/SeminarFormModal.tsx` - Modal de création/modification de séminaires
- `src/components/events/EventDetailModal.tsx` - Modal d'affichage des détails

#### Pages
- `src/pages/chercheur/CalendarPage.tsx` - Page principale du calendrier

#### Routes
- Chercheur: `/chercheur/calendar`
- Coordinateur: `/coordonateur/calendar`

## Utilisation

### Créer un Événement
1. Accéder à la page calendrier
2. Cliquer sur "Nouvel événement" ou cliquer sur une date dans le calendrier
3. Remplir le formulaire
4. Cliquer sur "Créer"

### Créer un Séminaire
1. Accéder à la page calendrier
2. Cliquer sur "Nouveau séminaire"
3. Remplir le formulaire avec l'ordre du jour et le nombre de participants
4. Cliquer sur "Créer"

### Modifier un Événement/Séminaire
1. Cliquer sur l'événement dans le calendrier
2. Cliquer sur l'icône d'édition dans le modal de détails
3. Modifier les informations
4. Cliquer sur "Modifier"

### Supprimer un Événement/Séminaire
1. Cliquer sur l'événement dans le calendrier
2. Cliquer sur l'icône de suppression dans le modal de détails
3. Confirmer la suppression

## API Endpoints

### Événements
- `POST /api/events` - Créer un événement
- `GET /api/events` - Lister les événements (avec filtres)
- `GET /api/events/:id` - Obtenir un événement
- `PUT /api/events/:id` - Mettre à jour un événement
- `DELETE /api/events/:id` - Supprimer un événement
- `POST /api/events/:id/documents` - Ajouter un document
- `GET /api/events/statistics` - Statistiques des événements
- `GET /api/events/report` - Générer un rapport (PDF/DOCX)

### Séminaires
- `POST /api/events/seminars` - Créer un séminaire
- `GET /api/events/seminars` - Lister les séminaires (avec filtres)
- `GET /api/events/seminars/:id` - Obtenir un séminaire
- `PUT /api/events/seminars/:id` - Mettre à jour un séminaire
- `DELETE /api/events/seminars/:id` - Supprimer un séminaire
- `POST /api/events/seminars/:id/documents` - Ajouter un document

## Dépendances Ajoutées

```json
{
  "react-big-calendar": "^1.x.x",
  "@types/react-big-calendar": "^1.x.x",
  "moment": "^2.x.x"
}
```

## Personnalisation

### Couleurs par Type d'Événement
Les couleurs sont définies dans `eventsApi.getEventTypeColor()`:
- Réunion: Bleu (#3b82f6)
- Séminaire: Violet (#8b5cf6)
- Formation: Orange (#f59e0b)
- Mission terrain: Vert (#10b981)
- Conférence: Rose (#ec4899)
- Atelier: Turquoise (#14b8a6)
- Démonstration: Orange foncé (#f97316)
- Visite: Cyan (#06b6d4)
- Soutenance: Indigo (#6366f1)
- Autre: Gris (#6b7280)

### Styles CSS
Le fichier `calendar-custom.css` contient tous les styles personnalisés du calendrier.

## Migration depuis l'Ancien Système

Les fichiers suivants ont été supprimés:
- `src/services/seminarsApi.ts`
- `src/types/seminar.types.ts`
- `src/utils/seminarValidation.ts`
- `src/pages/chercheur/CreateSeminar.tsx`
- `src/pages/chercheur/EditSeminar.tsx`
- `src/pages/chercheur/SeminarDetail.tsx`
- `src/pages/chercheur/SeminarsList.tsx`

Le nouveau système unifie les événements et les séminaires dans une interface cohérente.

## Notes de Développement

- Le calendrier utilise `react-big-calendar` avec `moment` comme localisateur
- Toutes les dates sont gérées au format ISO 8601
- Les événements sont rafraîchis automatiquement après chaque modification
- Le système supporte les événements récurrents via `recurrenceRule` (format RRULE)
- Les permissions sont gérées côté backend (créateur/coordinateur)

## Support

Pour toute question ou problème:
1. Vérifier que le backend est bien démarré
2. Vérifier que les routes `/api/events` sont accessibles
3. Consulter les logs du navigateur pour les erreurs frontend
4. Consulter les logs du serveur pour les erreurs backend
