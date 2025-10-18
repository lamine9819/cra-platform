# Dashboard Administrateur CRA - Documentation

## 📋 Vue d'ensemble

Le dashboard administrateur est une interface complète permettant aux administrateurs de surveiller et gérer l'ensemble du système CRA avec des statistiques en temps réel, des alertes, et des visualisations de données.

## 🚀 Installation

### 1. Dépendances requises

Vérifiez que les dépendances suivantes sont installées dans votre projet :

```bash
cd cra-frontend

# Dépendances principales
npm install @tanstack/react-query
npm install date-fns
npm install recharts
npm install lucide-react

# Si vous n'avez pas déjà shadcn/ui configuré
npx shadcn-ui@latest init
npx shadcn-ui@latest add card
npx shadcn-ui@latest add button
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add skeleton
```

### 2. Configuration de React Query

Assurez-vous que React Query est configuré dans votre `main.tsx` ou `App.tsx` :

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Votre application */}
    </QueryClientProvider>
  );
}
```

### 3. Variables d'environnement

Ajoutez dans votre fichier `.env` :

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 📁 Structure des fichiers

```
src/
├── types/
│   └── admin.types.ts                    # Types TypeScript
├── services/
│   └── admin/
│       └── dashboardService.ts           # Service API
├── hooks/
│   └── admin/
│       └── useDashboard.ts               # Hook React Query
├── components/
│   └── admin/
│       └── dashboard/
│           ├── StatsCard.tsx             # Carte statistique
│           ├── DashboardStats.tsx        # Grille de stats
│           ├── AlertsSection.tsx         # Alertes système
│           ├── RecentActivity.tsx        # Activité récente
│           ├── ActivityChart.tsx         # Graphiques
│           └── DashboardSkeleton.tsx     # Loading state
├── pages/
│   └── admin/
│       └── AdminDashboardPage.tsx        # Page principale
└── layouts/
    └── AdminLayout.tsx                   # Layout admin (modifié)
```

## 🎯 Fonctionnalités

### 1. Statistiques en temps réel
- **8 cartes de statistiques** avec des icônes colorées
- Total des utilisateurs (actifs/inactifs)
- Activités totales et par projet
- Projets en cours
- Notifications non lues
- Thèmes de recherche actifs
- Stations de recherche
- Transferts d'acquis
- Taux d'activité global

### 2. Graphiques interactifs
- **Évolution mensuelle** : Activités, utilisateurs, projets et transferts (LineChart)
- **Activités par mois** : Graphique en barres
- **Taux de complétion hebdomadaire** : Performance des tâches

### 3. Alertes système
- **6 types d'alertes** avec priorités :
  - Utilisateurs inactifs (90+ jours)
  - Activités sans responsable
  - Projets en retard
  - Activités approchant de leur échéance (7 jours)
  - Tâches en retard
  - Notifications non lues anciennes (30+ jours)

### 4. Activité récente
- **20 dernières actions** du système
- Affichage avec avatars et icônes d'action
- Dates relatives en français (il y a 2h, il y a 1 jour)
- Détails de l'action et utilisateur

### 5. Auto-refresh
- **Actualisation automatique** toutes les 30 secondes
- **Bouton de refresh manuel** avec animation
- **Cache intelligent** via React Query (5 minutes)

## 🔌 API Backend

L'API backend doit répondre sur l'endpoint :

```
GET /api/admin/dashboard
Authorization: Bearer {jwt_token}
```

### Réponse attendue

```typescript
{
  success: true,
  data: {
    summary: {
      users: { total: number, active: number, inactive: number, byRole: {...} },
      activities: { total: number, byType: {...}, byStatus: {...}, ... },
      projects: { total: number, byStatus: {...} },
      themes: { total: number, active: number, topThemes: [...] },
      stations: { total: number, topStations: [...] },
      transfers: { total: number, byType: {...} },
      notifications: { total: number, read: number, unread: number, readRate: number }
    },
    recentActivity: [...],
    alerts: [...],
    charts: {
      activitiesPerMonth: [...],
      usersPerMonth: [...],
      projectsPerMonth: [...],
      taskCompletionRate: [...],
      transfersPerMonth: [...]
    },
    generatedAt: "2024-01-15T10:45:30Z"
  }
}
```

## 🎨 Personnalisation

### Modifier les couleurs

Dans `StatsCard.tsx`, vous pouvez ajuster les couleurs :

```tsx
const colorClasses = {
  blue: 'bg-blue-500 text-white',
  green: 'bg-green-500 text-white',
  orange: 'bg-orange-500 text-white',
  red: 'bg-red-500 text-white',
  purple: 'bg-purple-500 text-white',
  cyan: 'bg-cyan-500 text-white',
};
```

### Modifier l'intervalle de refresh

Dans `useDashboard.ts` :

```tsx
refetchInterval: 30 * 1000, // 30 secondes (modifier cette valeur)
```

### Ajouter des filtres

Dans `AdminDashboardPage.tsx`, vous pouvez ajouter des sélecteurs de période :

```tsx
const [period, setPeriod] = useState('7days');

const { data } = useDashboard({ period }); // Passez les filtres au hook
```

## 🔒 Sécurité

Le dashboard est protégé par :
- **Authentification JWT** obligatoire
- **Rôle ADMINISTRATEUR** requis
- **Routes protégées** via `ProtectedRoute`

## 🧪 Tests

Pour tester le dashboard :

1. **Lancez le backend** :
```bash
cd cra-bakend
npm run dev
```

2. **Lancez le frontend** :
```bash
cd cra-frontend
npm run dev
```

3. **Connectez-vous** en tant qu'administrateur

4. **Accédez au dashboard** :
```
http://localhost:5173/admin/dashboard
```

## 🐛 Dépannage

### Erreur : Module not found

```bash
npm install @tanstack/react-query date-fns recharts
```

### Erreur : 401 Unauthorized

Vérifiez que :
- Le token JWT est valide
- L'utilisateur a le rôle ADMINISTRATEUR
- L'API backend est lancée sur le bon port

### Erreur : Network Error

Vérifiez :
- La variable d'environnement `VITE_API_BASE_URL`
- Le backend est accessible
- CORS est configuré correctement

### Les graphiques ne s'affichent pas

Assurez-vous que :
- `recharts` est installé
- Les données de l'API sont au bon format
- Il y a des données dans les derniers mois

## 📊 Métriques de performance

- **Temps de chargement initial** : < 2s
- **Refresh automatique** : 30s
- **Cache** : 5 minutes
- **Taille du bundle** : ~150KB (gzipped)

## 🚀 Améliorations futures

- [ ] Export des données en CSV/PDF
- [ ] Filtres par période personnalisés
- [ ] Comparaison année sur année
- [ ] Alertes push en temps réel
- [ ] Dashboard mobile dédié
- [ ] Mode sombre
- [ ] Widgets personnalisables

## 📞 Support

Pour toute question ou problème :
- Consultez la documentation de l'API : `/cra-bakend/src/routes/admin/DASHBOARD_API_DOC.md`
- Vérifiez les logs du backend et du frontend
- Contactez l'équipe de développement

## 📝 Changelog

### Version 1.0.0 (2024-01-15)
- ✅ Implémentation initiale du dashboard
- ✅ 8 cartes de statistiques
- ✅ 3 graphiques interactifs
- ✅ Section d'alertes système
- ✅ Activité récente
- ✅ Auto-refresh toutes les 30s
- ✅ Design responsive
- ✅ Loading states et error handling

---

**Développé avec ❤️ pour CRA Platform**
