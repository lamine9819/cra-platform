# API Documentation - Dashboard Administrateur

## Vue d'ensemble

Le dashboard administrateur fournit une vue complète du système CRA avec des statistiques, métriques, alertes et graphiques en temps réel.

## Authentification

Toutes les routes nécessitent:
1. Un token JWT valide dans le header `Authorization: Bearer <token>`
2. Le rôle utilisateur `ADMINISTRATEUR`

## Endpoints

### 1. Dashboard Complet

```
GET /api/admin/dashboard
```

Récupère toutes les données du dashboard en une seule requête.

#### Query Parameters (optionnels)

| Paramètre | Type | Description |
|-----------|------|-------------|
| startDate | ISO 8601 | Date de début pour filtrer les activités |
| endDate | ISO 8601 | Date de fin pour filtrer les activités |
| themeId | string | ID du thème pour filtrer les activités |
| stationId | string | ID de la station pour filtrer les activités |

#### Exemple de requête

```bash
GET /api/admin/dashboard
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Avec filtres
GET /api/admin/dashboard?startDate=2024-01-01T00:00:00Z&endDate=2024-12-31T23:59:59Z
```

#### Exemple de réponse

```json
{
  "success": true,
  "data": {
    "summary": {
      "users": {
        "total": 150,
        "active": 142,
        "inactive": 8,
        "byRole": {
          "CHERCHEUR": 120,
          "COORDONATEUR_PROJET": 25,
          "ADMINISTRATEUR": 5
        }
      },
      "activities": {
        "total": 450,
        "byType": {
          "RECHERCHE": 200,
          "FORMATION": 150,
          "VULGARISATION": 100
        },
        "byStatus": {
          "EN_COURS": 250,
          "PLANIFIE": 100,
          "TERMINE": 80,
          "ANNULE": 20
        },
        "byTheme": [
          {
            "themeId": "theme123",
            "themeName": "Agriculture durable",
            "count": 120
          }
        ],
        "newVsReconducted": {
          "new": 300,
          "reconducted": 150
        },
        "withProjects": 320,
        "withoutProjects": 130
      },
      "projects": {
        "total": 85,
        "byStatus": {
          "EN_COURS": 45,
          "PLANIFIE": 20,
          "TERMINE": 15,
          "ANNULE": 5
        }
      },
      "themes": {
        "total": 25,
        "active": 22,
        "topThemes": [
          {
            "id": "theme123",
            "name": "Agriculture durable",
            "activityCount": 120
          }
        ]
      },
      "stations": {
        "total": 12,
        "topStations": [
          {
            "id": "station456",
            "name": "Station de Bambey",
            "activityCount": 85
          }
        ]
      },
      "transfers": {
        "total": 200,
        "byType": {
          "FORMATION": 80,
          "PUBLICATION": 60,
          "DEMONSTRATION": 60
        }
      },
      "notifications": {
        "total": 5000,
        "read": 4200,
        "unread": 800,
        "readRate": 84
      }
    },
    "recentActivity": [
      {
        "id": "log123",
        "action": "CREATE",
        "entityType": "activity",
        "entityId": "act456",
        "userId": "user789",
        "userName": "Jean Dupont",
        "userEmail": "jean.dupont@cra.sn",
        "timestamp": "2024-01-15T10:30:00Z",
        "details": {
          "activityTitle": "Formation en agroécologie"
        },
        "level": "INFO"
      }
    ],
    "alerts": [
      {
        "type": "error",
        "title": "Projets en retard",
        "message": "5 projet(s) ont dépassé leur date de fin",
        "count": 5,
        "entityIds": ["proj1", "proj2", "proj3", "proj4", "proj5"],
        "priority": 1
      },
      {
        "type": "warning",
        "title": "Utilisateurs inactifs",
        "message": "8 utilisateur(s) n'ont pas été actifs depuis plus de 90 jours",
        "count": 8,
        "entityIds": ["user1", "user2"],
        "priority": 2
      }
    ],
    "charts": {
      "activitiesPerMonth": [
        { "month": "2024-01", "count": 45 },
        { "month": "2024-02", "count": 52 },
        { "month": "2024-03", "count": 48 }
      ],
      "usersPerMonth": [
        { "month": "2024-01", "count": 12 },
        { "month": "2024-02", "count": 8 },
        { "month": "2024-03", "count": 15 }
      ],
      "projectsPerMonth": [
        { "month": "2024-01", "count": 8 },
        { "month": "2024-02", "count": 10 },
        { "month": "2024-03", "count": 7 }
      ],
      "taskCompletionRate": [
        { "week": "2024-W01", "rate": 75 },
        { "week": "2024-W02", "rate": 82 },
        { "week": "2024-W03", "rate": 78 }
      ],
      "transfersPerMonth": [
        { "month": "2024-01", "count": 15 },
        { "month": "2024-02", "count": 20 },
        { "month": "2024-03", "count": 18 }
      ]
    },
    "generatedAt": "2024-01-15T10:35:00Z"
  }
}
```

---

### 2. Statistiques Uniquement

```
GET /api/admin/dashboard/stats
```

Récupère uniquement le résumé des statistiques globales (sans alertes ni graphiques).

#### Query Parameters

Mêmes paramètres que l'endpoint principal.

#### Exemple de réponse

```json
{
  "success": true,
  "data": {
    "summary": {
      // Même structure que ci-dessus
    },
    "generatedAt": "2024-01-15T10:35:00Z"
  }
}
```

---

### 3. Alertes Système

```
GET /api/admin/dashboard/alerts
```

Récupère uniquement les alertes système.

#### Exemple de réponse

```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "type": "error",
        "title": "Activités sans responsable",
        "message": "3 activité(s) n'ont pas de responsable assigné",
        "count": 3,
        "entityIds": ["act1", "act2", "act3"],
        "priority": 1
      }
    ],
    "generatedAt": "2024-01-15T10:35:00Z"
  }
}
```

#### Types d'alertes

| Type | Description | Priorité |
|------|-------------|----------|
| error | Problème critique nécessitant une action immédiate | 1 (haute) |
| warning | Problème important à surveiller | 2 (moyenne) |
| info | Information non critique | 3 (basse) |

---

### 4. Activité Récente

```
GET /api/admin/dashboard/recent
```

Récupère l'activité récente du système depuis les audit logs.

#### Query Parameters

| Paramètre | Type | Description | Défaut |
|-----------|------|-------------|--------|
| limit | number | Nombre d'entrées à retourner (max: 100) | 20 |

#### Exemple de réponse

```json
{
  "success": true,
  "data": {
    "recentActivity": [
      {
        "id": "log123",
        "action": "CREATE",
        "entityType": "activity",
        "entityId": "act456",
        "userId": "user789",
        "userName": "Jean Dupont",
        "userEmail": "jean.dupont@cra.sn",
        "timestamp": "2024-01-15T10:30:00Z",
        "details": {
          "activityTitle": "Formation en agroécologie"
        },
        "level": "INFO"
      },
      {
        "id": "log124",
        "action": "UPDATE",
        "entityType": "project",
        "entityId": "proj789",
        "userId": "user456",
        "userName": "Marie Martin",
        "userEmail": "marie.martin@cra.sn",
        "timestamp": "2024-01-15T10:25:00Z",
        "details": {
          "projectTitle": "Étude sur le mil",
          "changes": ["status"]
        },
        "level": "INFO"
      }
    ],
    "generatedAt": "2024-01-15T10:35:00Z"
  }
}
```

---

### 5. Données Graphiques

```
GET /api/admin/dashboard/charts
```

Récupère les données pour afficher les graphiques temporels.

#### Exemple de réponse

```json
{
  "success": true,
  "data": {
    "charts": {
      "activitiesPerMonth": [
        { "month": "2023-11", "count": 38 },
        { "month": "2023-12", "count": 42 },
        { "month": "2024-01", "count": 45 },
        { "month": "2024-02", "count": 52 },
        { "month": "2024-03", "count": 48 },
        { "month": "2024-04", "count": 55 }
      ],
      "usersPerMonth": [
        { "month": "2023-11", "count": 8 },
        { "month": "2023-12", "count": 10 },
        { "month": "2024-01", "count": 12 },
        { "month": "2024-02", "count": 8 },
        { "month": "2024-03", "count": 15 },
        { "month": "2024-04", "count": 18 }
      ],
      "projectsPerMonth": [
        { "month": "2023-11", "count": 5 },
        { "month": "2023-12", "count": 6 },
        { "month": "2024-01", "count": 8 },
        { "month": "2024-02", "count": 10 },
        { "month": "2024-03", "count": 7 },
        { "month": "2024-04", "count": 9 }
      ],
      "taskCompletionRate": [
        { "week": "2024-W01", "rate": 75 },
        { "week": "2024-W02", "rate": 82 },
        { "week": "2024-W03", "rate": 78 },
        { "week": "2024-W04", "rate": 85 }
      ],
      "transfersPerMonth": [
        { "month": "2023-11", "count": 12 },
        { "month": "2023-12", "count": 15 },
        { "month": "2024-01", "count": 15 },
        { "month": "2024-02", "count": 20 },
        { "month": "2024-03", "count": 18 },
        { "month": "2024-04", "count": 22 }
      ]
    },
    "generatedAt": "2024-01-15T10:35:00Z"
  }
}
```

---

## Codes d'erreur

| Code | Description |
|------|-------------|
| 401 | Non authentifié (token manquant ou invalide) |
| 403 | Accès refusé (rôle ADMINISTRATEUR requis) |
| 500 | Erreur serveur interne |

## Exemple d'erreur

```json
{
  "success": false,
  "error": {
    "message": "Accès refusé. Privilèges administrateur requis.",
    "code": "FORBIDDEN"
  }
}
```

---

## Notes d'implémentation

### Performance
- Les requêtes sont optimisées avec `Promise.all()` pour paralléliser les appels
- Utilisation de `groupBy` de Prisma pour les agrégations
- Cache recommandé (Redis) pour les endpoints les plus sollicités

### Filtrage
- Les filtres s'appliquent uniquement aux statistiques des activités
- Les autres statistiques (users, projects, etc.) restent globales

### Limites
- L'endpoint `/recent` est limité à 100 entrées maximum
- Les graphiques couvrent les 6 derniers mois (configurable dans le service)
- Le taux de complétion des tâches couvre les 4 dernières semaines

### Sécurité
- Authentification JWT obligatoire
- Vérification du rôle ADMINISTRATEUR sur toutes les routes
- Aucune donnée sensible (mots de passe, tokens) n'est retournée
