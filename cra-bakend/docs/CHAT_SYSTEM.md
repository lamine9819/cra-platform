# Système de Chat/Forum - Plateforme CRA

## Vue d'ensemble

Le système de chat/forum est un module de communication en temps réel qui permet aux utilisateurs de la plateforme CRA de discuter dans des canaux organisés. C'est une évolution moderne du système de commentaires existant.

## Fonctionnalités principales

### 1. Canaux de discussion (Channels)

Les canaux sont des espaces de discussion organisés par :
- **Canaux généraux** : Accessibles à tous les utilisateurs
- **Canaux de projets** : Liés à des projets spécifiques
- **Canaux de thèmes** : Organisés par thème de recherche
- **Canaux privés** : Discussions privées entre groupes d'utilisateurs
- **Canaux d'annonces** : Pour les communications officielles

### 2. Messages en temps réel

- **Envoi de messages** : Texte, fichiers, images
- **Édition de messages** : Les utilisateurs peuvent modifier leurs messages
- **Suppression de messages** : Soft delete pour garder l'historique
- **Threading** : Répondre à des messages spécifiques
- **Mentions** : Mentionner des utilisateurs avec @
- **Réactions** : Ajouter des emojis aux messages

### 3. Fonctionnalités temps réel (WebSocket)

- **Indicateur de saisie** : Voir quand quelqu'un tape un message
- **Notifications instantanées** : Recevoir les nouveaux messages en temps réel
- **Statut de lecture** : Suivre les messages lus/non lus
- **Présence utilisateur** : Voir qui est connecté

## Architecture technique

### Modèles de données

#### Channel
```typescript
{
  id: string
  name: string
  description?: string
  type: ChannelType // GENERAL, PROJECT, THEME, PRIVATE, ANNOUNCEMENT
  isPrivate: boolean
  isArchived: boolean
  icon?: string
  color?: string
  projectId?: string
  themeId?: string
  creatorId: string
}
```

#### ChatMessage
```typescript
{
  id: string
  content: string
  type: MessageType // TEXT, FILE, IMAGE, SYSTEM
  isEdited: boolean
  isDeleted: boolean
  fileUrl?: string
  authorId: string
  channelId: string
  parentMessageId?: string // Pour les réponses
}
```

#### ChannelMember
```typescript
{
  id: string
  role: ChannelMemberRole // OWNER, ADMIN, MODERATOR, MEMBER
  isMuted: boolean
  lastReadAt?: Date
  notificationsEnabled: boolean
  channelId: string
  userId: string
}
```

### API Endpoints

#### Canaux

- `POST /api/chat/channels` - Créer un canal
- `GET /api/chat/channels` - Lister les canaux
- `GET /api/chat/channels/:channelId` - Obtenir un canal
- `PATCH /api/chat/channels/:channelId` - Modifier un canal
- `DELETE /api/chat/channels/:channelId` - Supprimer un canal

#### Membres

- `POST /api/chat/channels/:channelId/members` - Ajouter des membres
- `GET /api/chat/channels/:channelId/members` - Lister les membres
- `PATCH /api/chat/channels/:channelId/members/:userId` - Modifier le rôle
- `DELETE /api/chat/channels/:channelId/members/:userId` - Retirer un membre
- `POST /api/chat/channels/:channelId/leave` - Quitter un canal
- `POST /api/chat/channels/:channelId/read` - Marquer comme lu

#### Messages

- `POST /api/chat/channels/:channelId/messages` - Envoyer un message
- `GET /api/chat/channels/:channelId/messages` - Lister les messages
- `PATCH /api/chat/messages/:messageId` - Modifier un message
- `DELETE /api/chat/messages/:messageId` - Supprimer un message

#### Réactions

- `POST /api/chat/messages/:messageId/reactions` - Ajouter une réaction
- `DELETE /api/chat/messages/:messageId/reactions` - Retirer une réaction

#### Statistiques

- `GET /api/chat/stats` - Statistiques globales
- `GET /api/chat/unread` - Messages non lus

### Événements WebSocket

Le client doit se connecter via Socket.IO et s'authentifier avec un JWT.

#### Événements émis par le client

- `chat:join_channel` - Rejoindre un canal
- `chat:leave_channel` - Quitter un canal
- `chat:typing_start` - Commencer à taper
- `chat:typing_stop` - Arrêter de taper

#### Événements reçus du serveur

- `chat:new_message` - Nouveau message
- `chat:message_updated` - Message modifié
- `chat:message_deleted` - Message supprimé
- `chat:reaction_added` - Réaction ajoutée
- `chat:reaction_removed` - Réaction retirée
- `chat:user_typing` - Utilisateur en train de taper
- `chat:user_joined` - Utilisateur a rejoint le canal
- `chat:user_left` - Utilisateur a quitté le canal
- `chat:channel_updated` - Canal modifié
- `chat:mention` - Mention reçue

## Permissions et sécurité

### Rôles dans les canaux

- **OWNER** : Créateur du canal, tous les droits
- **ADMIN** : Peut gérer les membres et le canal
- **MODERATOR** : Peut supprimer les messages
- **MEMBER** : Peut envoyer des messages

### Règles de permissions

1. **Créer un canal** :
   - Canaux généraux : Administrateurs uniquement
   - Autres canaux : Membres des projets/thèmes

2. **Modifier un canal** :
   - Propriétaire ou administrateurs du canal

3. **Supprimer un canal** :
   - Propriétaire uniquement

4. **Envoyer des messages** :
   - Membres du canal
   - Canaux d'annonces : Admins/Modérateurs uniquement

5. **Modifier/Supprimer des messages** :
   - Auteur du message
   - Administrateurs et modérateurs

## Utilisation côté client

### Connexion WebSocket

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: {
    token: 'votre-jwt-token'
  }
});

socket.on('connect', () => {
  console.log('Connecté au chat');
});
```

### Rejoindre un canal

```typescript
socket.emit('chat:join_channel', { channelId: 'channel-id' });
```

### Écouter les nouveaux messages

```typescript
socket.on('chat:new_message', (data) => {
  console.log('Nouveau message:', data.data);
});
```

### Indicateur de saisie

```typescript
// Commencer à taper
socket.emit('chat:typing_start', {
  channelId: 'channel-id',
  userName: 'John Doe'
});

// Arrêter de taper
socket.emit('chat:typing_stop', {
  channelId: 'channel-id'
});

// Écouter les autres utilisateurs
socket.on('chat:user_typing', (data) => {
  console.log(`${data.userName} est en train de taper...`);
});
```

### Envoyer un message

```typescript
const response = await fetch('/api/chat/channels/channel-id/messages', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: 'Bonjour tout le monde!',
    mentionedUserIds: ['user-id-1', 'user-id-2']
  })
});
```

## Bonnes pratiques

### Performance

1. **Pagination** : Toujours paginer les listes de messages
2. **Lazy loading** : Charger les messages à la demande
3. **Debouncing** : Pour l'indicateur de saisie (300ms)

### UX

1. **Optimistic updates** : Afficher immédiatement les messages envoyés
2. **Retry logic** : Réessayer en cas d'échec réseau
3. **Reconnexion automatique** : Gérer les déconnexions
4. **Notifications** : Informer l'utilisateur des nouveaux messages

### Sécurité

1. **Validation** : Valider tout le contenu côté client et serveur
2. **Sanitization** : Nettoyer le contenu HTML
3. **Rate limiting** : Limiter le nombre de messages par minute
4. **Permissions** : Vérifier les permissions avant chaque action

## Migration depuis les commentaires

Le nouveau système de chat peut coexister avec l'ancien système de commentaires. Les commentaires restent attachés à des entités spécifiques (projets, tâches) tandis que le chat permet des discussions plus libres.

## Maintenance

### Nettoyage

- **Messages supprimés** : Archivés mais jamais complètement supprimés
- **Canaux inactifs** : Archiver après X mois d'inactivité
- **Fichiers** : Implémenter une politique de rétention

### Monitoring

- Surveiller le nombre de connexions WebSocket actives
- Tracker les erreurs de connexion
- Monitorer la latence des messages

## Support et dépannage

### Problèmes courants

1. **WebSocket ne se connecte pas** :
   - Vérifier le token JWT
   - Vérifier les CORS
   - Vérifier la configuration du proxy

2. **Messages non reçus en temps réel** :
   - Vérifier la connexion WebSocket
   - Rejoindre le canal avec `chat:join_channel`

3. **Permissions refusées** :
   - Vérifier le rôle de l'utilisateur
   - Vérifier l'appartenance au canal

## Évolutions futures

- [ ] Support des threads (conversations imbriquées)
- [ ] Recherche avancée dans les messages
- [ ] Messages vocaux
- [ ] Appels vidéo
- [ ] Partage d'écran
- [ ] Bots et intégrations
- [ ] Export des conversations
- [ ] Chiffrement end-to-end pour les canaux privés
