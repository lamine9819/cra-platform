# ✅ Fonctions Manquantes - Implémentation Complète

## 📋 Résumé

Toutes les fonctions manquantes ont été implémentées dans le service `formService.ts` et intégrées dans le hook `useForms.ts`.

---

## 🎯 Fonctions Implémentées

### **1. Duplication de Formulaire** ✅

**Méthode:** `duplicateForm(formId: string, newTitle?: string): Promise<Form>`

**Implémentation:**
- Récupère le formulaire source
- Crée une copie avec un nouveau titre (ou ajoute "(Copie)" au titre)
- Le nouveau formulaire est désactivé par défaut pour éviter les confusions
- Conserve le schéma, la description et l'activité du formulaire source

**Utilisation:**
```typescript
const { duplicateForm } = useFormActions();

// Dupliquer avec un titre personnalisé
const newForm = await duplicateForm('form-id', 'Mon Nouveau Titre');

// Dupliquer avec le titre par défaut
const newForm = await duplicateForm('form-id');
```

---

### **2. Statistiques des Formulaires** ✅

**Méthode:** `getFormStats(): Promise<FormStats>`

**Implémentation:**
- Récupère tous les formulaires (limite: 1000)
- Calcule les statistiques en temps réel :
  - Total de formulaires
  - Formulaires actifs/inactifs
  - Formulaires publics
  - Total des réponses
  - Total des photos

**Note:** Certaines statistiques nécessiteraient des endpoints backend dédiés :
- `sharedWithMe` - formulaires partagés avec moi
- `myResponses` - mes propres réponses
- `offlineResponses` - réponses en attente de sync

**Utilisation:**
```typescript
const { stats, loading, error, refetch } = useFormStats();

// stats contient:
// {
//   total: 25,
//   active: 20,
//   inactive: 5,
//   myForms: 25,
//   publicForms: 8,
//   totalResponses: 142,
//   totalPhotos: 56,
//   ...
// }
```

---

### **3. Basculer le Statut d'un Formulaire** ✅

**Méthode:** `toggleFormStatus(formId: string): Promise<Form>`

**Implémentation:**
- Récupère le formulaire actuel
- Inverse le statut `isActive`
- Retourne le formulaire mis à jour

**Utilisation:**
```typescript
const { toggleFormStatus } = useFormActions();

// Activer/Désactiver un formulaire
const updatedForm = await toggleFormStatus('form-id');
```

---

### **4. Gestion des Templates** ✅

#### **4.1. Obtenir les Templates**

**Méthode:** `getTemplates(): Promise<Form[]>`

**Implémentation:**
- Récupère tous les formulaires
- Filtre ceux contenant "Template" ou "Modèle" dans le titre
- **Note:** Une solution temporaire en attendant un endpoint dédié

**Alternative future:** Endpoint backend `/forms/templates`

#### **4.2. Créer un Template**

**Méthode:** `createTemplate(name: string, description: string, schema: any, category?: string): Promise<Form>`

**Implémentation:**
- Crée un formulaire avec le préfixe `[Template]` dans le titre
- Ajoute la catégorie dans la description
- Le template est désactivé par défaut

**Utilisation:**
```typescript
const { templates, createTemplate } = useFormTemplates();

// Créer un template
const template = await createTemplate(
  'Enquête Satisfaction',
  'Template pour enquêtes de satisfaction client',
  schema,
  'Enquêtes'
);

// Obtenir tous les templates
console.log(templates); // Liste des formulaires avec [Template] ou Template/Modèle
```

---

### **5. Gestion des Commentaires** ⚠️

#### **5.1. Mettre à Jour un Commentaire**

**Méthode:** `updateComment(commentId: string, content: string): Promise<FormComment>`

**Statut:** ⚠️ **Nécessite un endpoint backend**

**Implémentation actuelle:**
- Lance une erreur : "La modification de commentaires n'est pas encore disponible"
- **À implémenter dans le backend:** `PATCH /forms/comments/:id`

#### **5.2. Supprimer un Commentaire**

**Méthode:** `deleteComment(commentId: string): Promise<void>`

**Statut:** ⚠️ **Nécessite un endpoint backend**

**Implémentation actuelle:**
- Lance une erreur : "La suppression de commentaires n'est pas encore disponible"
- **À implémenter dans le backend:** `DELETE /forms/comments/:id`

**Utilisation future:**
```typescript
const { updateComment, deleteComment } = useFormComments('form-id');

// Modifier un commentaire (nécessite backend)
await updateComment('comment-id', 'Nouveau contenu');

// Supprimer un commentaire (nécessite backend)
await deleteComment('comment-id');
```

---

### **6. Recherche dans les Commentaires** ✅

**Méthode:** `searchFormComments(formId: string, searchTerm: string): Promise<{ comments, pagination }>`

**Implémentation:**
- Récupère tous les commentaires du formulaire
- Filtre localement par terme de recherche
- Recherche dans :
  - Le contenu du commentaire
  - Le prénom de l'auteur
  - Le nom de l'auteur

**Utilisation:**
```typescript
const { searchComments } = useFormComments('form-id');

// Rechercher "bug" dans les commentaires
const results = await searchComments('bug');
```

---

### **7. Recherche de Formulaires** ✅

**Méthode:** `searchForms(query: string, limit?: number): Promise<Form[]>`

**Implémentation:**
- Utilise le paramètre `search` de `listForms`
- Tri par date de modification (plus récent en premier)
- Limite configurable (défaut: 10)

**Utilisation:**
```typescript
const { searchTerm, setSearchTerm, results, loading } = useFormSearch();

// Recherche en temps réel avec debounce (300ms par défaut)
setSearchTerm('enquête');
// results contiendra automatiquement les résultats
```

---

### **8. Formulaires par Activité** ✅

**Méthode:** `getFormsByActivity(activityId: string): Promise<Form[]>`

**Implémentation:**
- Utilise `listForms` avec le filtre `activityId`
- Limite: 100 formulaires
- Tri par date de création (plus récent en premier)

**Utilisation:**
```typescript
const { forms, loading, error } = useActivityForms('activity-id');

// forms contient tous les formulaires de l'activité
```

---

### **9. Validation de Schéma** ✅

**Méthode:** `validateFormSchema(schema: any): Promise<{ isValid: boolean; errors?: string[] }>`

**Implémentation:**
- Validation côté client du schéma de formulaire
- Vérifie :
  - Présence du titre
  - Au moins un champ
  - Chaque champ a un ID, type et libellé
  - Les champs select/radio/checkbox ont des options

**Utilisation:**
```typescript
const { validateSchema } = useFormValidation();

const result = await validateSchema(mySchema);

if (!result.isValid) {
  console.log('Erreurs:', result.errors);
  // ['Le titre est requis', 'Le champ #2 doit avoir un libellé', ...]
}
```

---

## 📊 Tableau Récapitulatif

| Fonction | Statut | Type d'Implémentation |
|----------|--------|----------------------|
| `duplicateForm` | ✅ Complet | Utilise endpoints existants |
| `getFormStats` | ✅ Complet | Calcul côté client |
| `toggleFormStatus` | ✅ Complet | Utilise endpoints existants |
| `getTemplates` | ✅ Temporaire | Filtrage côté client |
| `createTemplate` | ✅ Temporaire | Formulaire avec préfixe |
| `updateComment` | ⚠️ À venir | Nécessite endpoint backend |
| `deleteComment` | ⚠️ À venir | Nécessite endpoint backend |
| `searchFormComments` | ✅ Complet | Filtrage côté client |
| `searchForms` | ✅ Complet | Utilise endpoints existants |
| `getFormsByActivity` | ✅ Complet | Utilise endpoints existants |
| `validateFormSchema` | ✅ Complet | Validation côté client |

---

## 🚀 Endpoints Backend à Créer (Optionnel)

Pour améliorer certaines fonctionnalités, voici les endpoints backend recommandés :

### **1. Gestion des Commentaires**
```typescript
PATCH /api/forms/comments/:commentId
DELETE /api/forms/comments/:commentId
```

### **2. Templates Dédiés**
```typescript
GET    /api/forms/templates              // Lister les templates
POST   /api/forms/templates              // Créer un template
GET    /api/forms/templates/:id          // Obtenir un template
PATCH  /api/forms/templates/:id          // Modifier un template
DELETE /api/forms/templates/:id          // Supprimer un template
POST   /api/forms/:id/create-from-template  // Créer depuis template
```

### **3. Statistiques Avancées**
```typescript
GET /api/forms/stats                     // Stats globales
GET /api/forms/stats/my-responses        // Mes réponses
GET /api/forms/stats/shared-with-me      // Formulaires partagés avec moi
```

### **4. Duplication Optimisée**
```typescript
POST /api/forms/:id/duplicate            // Dupliquer un formulaire
```

---

## 💡 Exemples d'Utilisation Complète

### **Exemple 1: Dashboard avec Statistiques**

```typescript
import { useFormStats } from '../hooks/useForms';

function FormDashboard() {
  const { stats, loading, error } = useFormStats();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card>
        <h3>Total</h3>
        <p className="text-3xl">{stats.total}</p>
      </Card>
      <Card>
        <h3>Actifs</h3>
        <p className="text-3xl">{stats.active}</p>
      </Card>
      <Card>
        <h3>Réponses</h3>
        <p className="text-3xl">{stats.totalResponses}</p>
      </Card>
      <Card>
        <h3>Photos</h3>
        <p className="text-3xl">{stats.totalPhotos}</p>
      </Card>
    </div>
  );
}
```

### **Exemple 2: Dupliquer un Formulaire**

```typescript
import { useFormActions } from '../hooks/useForms';

function FormCard({ form }) {
  const { duplicateForm, loading } = useFormActions();

  const handleDuplicate = async () => {
    const newForm = await duplicateForm(form.id);
    if (newForm) {
      toast.success(`Formulaire dupliqué: ${newForm.title}`);
      // Rediriger vers le nouveau formulaire
      navigate(`/chercheur/forms/${newForm.id}/edit`);
    }
  };

  return (
    <Card>
      <h3>{form.title}</h3>
      <Button onClick={handleDuplicate} disabled={loading}>
        <Copy size={16} /> Dupliquer
      </Button>
    </Card>
  );
}
```

### **Exemple 3: Recherche en Temps Réel**

```typescript
import { useFormSearch } from '../hooks/useForms';

function FormSearch() {
  const { searchTerm, setSearchTerm, results, loading } = useFormSearch(300);

  return (
    <div>
      <Input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Rechercher un formulaire..."
      />

      {loading && <LoadingSpinner />}

      {results.length > 0 && (
        <div className="search-results">
          {results.map(form => (
            <SearchResult key={form.id} form={form} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### **Exemple 4: Templates de Formulaires**

```typescript
import { useFormTemplates } from '../hooks/useForms';

function TemplatesPage() {
  const { templates, loading, createTemplate } = useFormTemplates();

  const handleCreateFromTemplate = async (template) => {
    // Dupliquer le template pour créer un nouveau formulaire
    const newForm = await duplicateForm(template.id, 'Mon Nouveau Formulaire');
    if (newForm) {
      navigate(`/chercheur/forms/${newForm.id}/edit`);
    }
  };

  return (
    <div>
      <h1>Templates de Formulaires</h1>
      <div className="grid grid-cols-3 gap-4">
        {templates.map(template => (
          <Card key={template.id}>
            <h3>{template.title}</h3>
            <p>{template.description}</p>
            <Button onClick={() => handleCreateFromTemplate(template)}>
              Utiliser ce template
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

## ✅ Checklist de Vérification

Avant de déployer, vérifiez que :

- [x] Toutes les méthodes sont implémentées dans `formService.ts`
- [x] Le hook `useForms.ts` utilise les nouvelles méthodes
- [x] Les erreurs sont gérées correctement
- [x] Les fonctions temporaires sont documentées (avec TODO)
- [x] Les fonctions nécessitant un backend sont identifiées
- [ ] Tests manuels effectués pour chaque fonction
- [ ] Documentation utilisateur mise à jour
- [ ] Endpoints backend créés (si nécessaire)

---

## 📞 Support

Pour toute question sur l'implémentation :
1. Consulter ce document
2. Vérifier les commentaires dans `formService.ts`
3. Consulter les exemples d'utilisation ci-dessus

---

**Date d'implémentation:** Novembre 2024
**Version:** 1.0.0
**Statut:** ✅ Toutes les fonctions côté client sont implémentées
