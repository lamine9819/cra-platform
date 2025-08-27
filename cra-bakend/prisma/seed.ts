import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // Nettoyage des données existantes (optionnel)
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.seminarParticipant.deleteMany();
  await prisma.seminar.deleteMany();
  await prisma.formResponse.deleteMany();
  await prisma.form.deleteMany();
  await prisma.documentShare.deleteMany();
  await prisma.document.deleteMany();
  await prisma.task.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.projectParticipant.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Mot de passe hashé par défaut
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Création des utilisateurs
  console.log('👥 Création des utilisateurs...');
  
  // Administrateur
  const admin = await prisma.user.create({
    data: {
      email: 'admin@cra-saintlouis.sn',
      password: hashedPassword,
      firstName: 'Amadou',
      lastName: 'Diallo',
      role: 'ADMINISTRATEUR',
      phoneNumber: '+221 77 123 45 67',
      department: 'Administration',
      isActive: true,
    },
  });

  // Chercheurs
  const chercheur1 = await prisma.user.create({
    data: {
      email: 'dr.ndiaye@cra-saintlouis.sn',
      password: hashedPassword,
      firstName: 'Mamadou',
      lastName: 'Ndiaye',
      role: 'CHERCHEUR',
      phoneNumber: '+221 77 234 56 78',
      specialization: 'Sélection variétale du riz',
      department: 'Amélioration génétique',
      isActive: true,
    },
  });

  const chercheur2 = await prisma.user.create({
    data: {
      email: 'dr.fall@cra-saintlouis.sn',
      password: hashedPassword,
      firstName: 'Aissatou',
      lastName: 'Fall',
      role: 'CHERCHEUR',
      phoneNumber: '+221 77 345 67 89',
      specialization: 'Pathologie végétale',
      department: 'Protection des cultures',
      isActive: true,
    },
  });

  const chercheur3 = await prisma.user.create({
    data: {
      email: 'dr.ba@cra-saintlouis.sn',
      password: hashedPassword,
      firstName: 'Ousmane',
      lastName: 'Ba',
      role: 'CHERCHEUR',
      phoneNumber: '+221 77 456 78 90',
      specialization: 'Gestion des sols',
      department: 'Ressources naturelles',
      isActive: true,
    },
  });

  // Assistants de recherche
  const assistant1 = await prisma.user.create({
    data: {
      email: 'a.sow@cra-saintlouis.sn',
      password: hashedPassword,
      firstName: 'Aminata',
      lastName: 'Sow',
      role: 'ASSISTANT_CHERCHEUR',
      phoneNumber: '+221 77 567 89 01',
      specialization: 'Analyse statistique',
      department: 'Amélioration génétique',
      supervisorId: chercheur1.id,
      isActive: true,
    },
  });

  const assistant2 = await prisma.user.create({
    data: {
      email: 'i.diop@cra-saintlouis.sn',
      password: hashedPassword,
      firstName: 'Ibrahim',
      lastName: 'Diop',
      role: 'ASSISTANT_CHERCHEUR',
      phoneNumber: '+221 77 678 90 12',
      specialization: 'Entomologie',
      department: 'Protection des cultures',
      supervisorId: chercheur2.id,
      isActive: true,
    },
  });

  // Techniciens supérieurs
  const technicien1 = await prisma.user.create({
    data: {
      email: 'f.sarr@cra-saintlouis.sn',
      password: hashedPassword,
      firstName: 'Fatou',
      lastName: 'Sarr',
      role: 'TECHNICIEN_SUPERIEUR',
      phoneNumber: '+221 77 789 01 23',
      specialization: 'Collecte de données terrain',
      department: 'Amélioration génétique',
      supervisorId: assistant1.id,
      isActive: true,
    },
  });

  const technicien2 = await prisma.user.create({
    data: {
      email: 'm.ndoye@cra-saintlouis.sn',
      password: hashedPassword,
      firstName: 'Moussa',
      lastName: 'Ndoye',
      role: 'TECHNICIEN_SUPERIEUR',
      phoneNumber: '+221 77 890 12 34',
      specialization: 'Analyse phytosanitaire',
      department: 'Protection des cultures',
      supervisorId: assistant2.id,
      isActive: true,
    },
  });

  // 2. Création des projets
  console.log('📋 Création des projets...');
  
  const projet1 = await prisma.project.create({
    data: {
      title: 'Développement de variétés de riz ISRIZ résistantes à la sécheresse',
      description: 'Sélection et amélioration de variétés de riz adaptées aux conditions climatiques changeantes de la vallée du fleuve Sénégal',
      objectives: [
        'Développer 3 nouvelles variétés de riz résistantes à la sécheresse',
        'Évaluer la performance agronomique en conditions réelles',
        'Former les producteurs aux nouvelles techniques culturales'
      ],
      status: 'EN_COURS',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2026-12-31'),
      budget: 150000000, // 150 millions FCFA
      keywords: ['riz', 'sécheresse', 'ISRIZ', 'sélection variétale', 'adaptation climatique'],
      creatorId: chercheur1.id,
    },
  });

  const projet2 = await prisma.project.create({
    data: {
      title: 'Lutte intégrée contre les ravageurs du blé',
      description: 'Développement de stratégies de protection phytosanitaire pour la culture du blé dans la vallée',
      objectives: [
        'Identifier les principaux ravageurs du blé',
        'Développer des méthodes de lutte biologique',
        'Réduire l\'utilisation de pesticides de 40%'
      ],
      status: 'EN_COURS',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2025-08-31'),
      budget: 80000000, // 80 millions FCFA
      keywords: ['blé', 'ravageurs', 'lutte intégrée', 'protection phytosanitaire'],
      creatorId: chercheur2.id,
    },
  });

  const projet3 = await prisma.project.create({
    data: {
      title: 'Amélioration de la fertilité des sols salés',
      description: 'Étude et développement de techniques pour la réhabilitation des sols salés de la vallée',
      objectives: [
        'Cartographier les zones de salinité',
        'Tester des amendements organiques',
        'Développer un guide technique pour les producteurs'
      ],
      status: 'PLANIFIE',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2026-05-31'),
      budget: 120000000, // 120 millions FCFA
      keywords: ['sols', 'salinité', 'fertilité', 'amendements', 'réhabilitation'],
      creatorId: chercheur3.id,
    },
  });

  // 3. Participants aux projets
  console.log('👥 Ajout des participants aux projets...');
  
  await prisma.projectParticipant.createMany({
    data: [
      { projectId: projet1.id, userId: assistant1.id, role: 'Assistant de recherche principal' },
      { projectId: projet1.id, userId: technicien1.id, role: 'Technicien de terrain' },
      { projectId: projet2.id, userId: assistant2.id, role: 'Assistant de recherche principal' },
      { projectId: projet2.id, userId: technicien2.id, role: 'Technicien laboratoire' },
      { projectId: projet3.id, userId: assistant1.id, role: 'Consultant statistique' },
    ],
  });

  // 4. Création des activités
  console.log('📋 Création des activités...');
  
  const activite1 = await prisma.activity.create({
    data: {
      title: 'Essai variétal riz saison hivernale 2024',
      description: 'Évaluation de 15 lignées de riz en conditions pluviales',
      objectives: [
        'Évaluer le rendement de 15 lignées',
        'Mesurer la résistance à la sécheresse',
        'Sélectionner les 5 meilleures lignées'
      ],
      methodology: 'Dispositif en blocs complets randomisés avec 3 répétitions',
      location: 'Station expérimentale de Fanaye',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-11-30'),
      results: 'Lignées R15, R23 et R31 montrent une bonne résistance à la sécheresse',
      conclusions: 'Poursuite des essais avec les 3 meilleures lignées',
      projectId: projet1.id,
    },
  });

  const activite2 = await prisma.activity.create({
    data: {
      title: 'Inventaire des ravageurs du blé',
      description: 'Prospection et identification des principaux ravageurs dans 5 zones de production',
      objectives: [
        'Identifier les ravageurs présents',
        'Évaluer leur niveau d\'infestation',
        'Cartographier leur distribution'
      ],
      methodology: 'Échantillonnage aléatoire stratifié dans 5 zones',
      location: 'Zones de Rosso, Dagana, Podor, Matam et Bakel',
      startDate: new Date('2024-04-15'),
      endDate: new Date('2024-08-15'),
      projectId: projet2.id,
    },
  });

  // 5. Création des tâches
  console.log('✅ Création des tâches...');
  
  await prisma.task.createMany({
    data: [
      {
        title: 'Préparation du terrain d\'essai',
        description: 'Labour, hersage et préparation des parcelles expérimentales',
        status: 'TERMINEE',
        priority: 'NORMALE',
        dueDate: new Date('2024-06-30'),
        completedAt: new Date('2024-06-28'),
        progress: 100,
        creatorId: chercheur1.id,
        assigneeId: technicien1.id,
        projectId: projet1.id,
        activityId: activite1.id,
      },
      {
        title: 'Semis des lignées de riz',
        description: 'Semis des 15 lignées selon le dispositif expérimental',
        status: 'TERMINEE',
        priority: 'HAUTE',
        dueDate: new Date('2024-07-15'),
        completedAt: new Date('2024-07-10'),
        progress: 100,
        creatorId: assistant1.id,
        assigneeId: technicien1.id,
        projectId: projet1.id,
        activityId: activite1.id,
      },
      {
        title: 'Collecte de données biométriques',
        description: 'Mesure de la hauteur, nombre de talles et date de floraison',
        status: 'EN_COURS',
        priority: 'NORMALE',
        dueDate: new Date('2024-09-30'),
        progress: 70,
        creatorId: assistant1.id,
        assigneeId: technicien1.id,
        projectId: projet1.id,
        activityId: activite1.id,
      },
      {
        title: 'Prospection ravageurs zone Rosso',
        description: 'Identification et comptage des ravageurs dans 10 champs',
        status: 'TERMINEE',
        priority: 'NORMALE',
        dueDate: new Date('2024-05-15'),
        completedAt: new Date('2024-05-12'),
        progress: 100,
        creatorId: chercheur2.id,
        assigneeId: assistant2.id,
        projectId: projet2.id,
        activityId: activite2.id,
      },
      {
        title: 'Analyse des échantillons de sol',
        description: 'Analyse physico-chimique des sols salés',
        status: 'A_FAIRE',
        priority: 'HAUTE',
        dueDate: new Date('2024-08-31'),
        progress: 0,
        creatorId: chercheur3.id,
        assigneeId: assistant1.id,
        projectId: projet3.id,
      },
    ],
  });

  // 6. Création des documents
  console.log('📄 Création des documents...');
  
  const doc1 = await prisma.document.create({
    data: {
      title: 'Protocole essai variétal riz 2024',
      filename: 'protocole_essai_riz_2024.pdf',
      filepath: '/documents/protocoles/protocole_essai_riz_2024.pdf',
      mimeType: 'application/pdf',
      size: BigInt(2500000), // 2.5 MB
      type: 'FICHE_TECHNIQUE',
      description: 'Protocole détaillé pour l\'essai variétal de riz saison 2024',
      tags: ['protocole', 'riz', 'essai', 'variétal'],
      isPublic: false,
      ownerId: chercheur1.id,
      projectId: projet1.id,
      activityId: activite1.id,
    },
  });

  const doc2 = await prisma.document.create({
    data: {
      title: 'Données biométriques riz - Juillet 2024',
      filename: 'donnees_biometriques_riz_juillet_2024.xlsx',
      filepath: '/documents/donnees/donnees_biometriques_riz_juillet_2024.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: BigInt(1800000), // 1.8 MB
      type: 'DONNEES_EXPERIMENTALES',
      description: 'Données de croissance et développement des lignées de riz',
      tags: ['données', 'biométrie', 'riz', 'croissance'],
      isPublic: false,
      ownerId: assistant1.id,
      projectId: projet1.id,
      activityId: activite1.id,
    },
  });

  const doc3 = await prisma.document.create({
    data: {
      title: 'Rapport inventaire ravageurs blé',
      filename: 'rapport_inventaire_ravageurs_ble_2024.pdf',
      filepath: '/documents/rapports/rapport_inventaire_ravageurs_ble_2024.pdf',
      mimeType: 'application/pdf',
      size: BigInt(3200000), // 3.2 MB
      type: 'RAPPORT',
      description: 'Rapport de l\'inventaire des ravageurs du blé dans la vallée',
      tags: ['rapport', 'ravageurs', 'blé', 'inventaire'],
      isPublic: true,
      ownerId: chercheur2.id,
      projectId: projet2.id,
      activityId: activite2.id,
    },
  });

  // 7. Partage de documents
  console.log('🔄 Création des partages de documents...');
  
  await prisma.documentShare.createMany({
    data: [
      {
        documentId: doc1.id,
        sharedWithId: assistant1.id,
        canEdit: true,
        canDelete: false,
      },
      {
        documentId: doc2.id,
        sharedWithId: chercheur1.id,
        canEdit: false,
        canDelete: false,
      },
      {
        documentId: doc3.id,
        sharedWithId: assistant2.id,
        canEdit: true,
        canDelete: false,
      },
    ],
  });

  // 8. Création des formulaires
  console.log('📝 Création des formulaires...');
  
  const form1 = await prisma.form.create({
    data: {
      title: 'Fiche de collecte - Données biométriques riz',
      description: 'Formulaire pour la collecte des données biométriques des plants de riz',
      schema: {
        type: 'object',
        properties: {
          variete: {
            type: 'string',
            title: 'Variété',
            enum: ['ISRIZ-1', 'ISRIZ-2', 'ISRIZ-3', 'Local']
          },
          parcelle: {
            type: 'string',
            title: 'Numéro de parcelle'
          },
          date_observation: {
            type: 'string',
            format: 'date',
            title: 'Date d\'observation'
          },
          hauteur_plant: {
            type: 'number',
            title: 'Hauteur du plant (cm)'
          },
          nombre_talles: {
            type: 'integer',
            title: 'Nombre de talles'
          },
          stade_phenologique: {
            type: 'string',
            title: 'Stade phénologique',
            enum: ['Germination', 'Tallage', 'Montaison', 'Épiaison', 'Floraison', 'Maturation']
          },
          observations: {
            type: 'string',
            title: 'Observations particulières'
          }
        },
        required: ['variete', 'parcelle', 'date_observation', 'hauteur_plant', 'nombre_talles', 'stade_phenologique']
      },
      isActive: true,
      creatorId: technicien1.id,
      activityId: activite1.id,
    },
  });

  const form2 = await prisma.form.create({
    data: {
      title: 'Fiche d\'inventaire des ravageurs',
      description: 'Formulaire pour l\'inventaire des ravageurs du blé',
      schema: {
        type: 'object',
        properties: {
          localite: {
            type: 'string',
            title: 'Localité'
          },
          coordonnees_gps: {
            type: 'string',
            title: 'Coordonnées GPS'
          },
          date_prospection: {
            type: 'string',
            format: 'date',
            title: 'Date de prospection'
          },
          espece_ravageur: {
            type: 'string',
            title: 'Espèce de ravageur'
          },
          niveau_infestation: {
            type: 'string',
            title: 'Niveau d\'infestation',
            enum: ['Faible', 'Modéré', 'Élevé', 'Très élevé']
          },
          stade_culture: {
            type: 'string',
            title: 'Stade de la culture',
            enum: ['Germination', 'Tallage', 'Montaison', 'Épiaison', 'Maturation']
          },
          degats_observes: {
            type: 'string',
            title: 'Dégâts observés'
          }
        },
        required: ['localite', 'date_prospection', 'espece_ravageur', 'niveau_infestation', 'stade_culture']
      },
      isActive: true,
      creatorId: technicien2.id,
      activityId: activite2.id,
    },
  });

  // 9. Réponses aux formulaires
  console.log('💬 Création des réponses aux formulaires...');
  
  await prisma.formResponse.createMany({
    data: [
      {
        formId: form1.id,
        respondentId: technicien1.id,
        data: {
          variete: 'ISRIZ-1',
          parcelle: 'P001',
          date_observation: '2024-08-15',
          hauteur_plant: 65,
          nombre_talles: 8,
          stade_phenologique: 'Tallage',
          observations: 'Croissance normale, bon développement'
        },
      },
      {
        formId: form1.id,
        respondentId: technicien1.id,
        data: {
          variete: 'ISRIZ-2',
          parcelle: 'P002',
          date_observation: '2024-08-15',
          hauteur_plant: 58,
          nombre_talles: 6,
          stade_phenologique: 'Tallage',
          observations: 'Légère chlorose des feuilles'
        },
      },
      {
        formId: form2.id,
        respondentId: assistant2.id,
        data: {
          localite: 'Rosso',
          coordonnees_gps: '16.5167° N, 15.8000° W',
          date_prospection: '2024-05-10',
          espece_ravageur: 'Criquet pèlerin',
          niveau_infestation: 'Modéré',
          stade_culture: 'Tallage',
          degats_observes: 'Défoliation partielle des feuilles'
        },
      },
    ],
  });

  // 10. Création des séminaires
  console.log('🎓 Création des séminaires...');
  
  const seminar1 = await prisma.seminar.create({
    data: {
      title: 'Atelier sur les nouvelles variétés de riz ISRIZ',
      description: 'Présentation des résultats des essais variétaux et formation des producteurs',
      location: 'Salle de conférences CRA Saint-Louis',
      startDate: new Date('2024-09-15T09:00:00'),
      endDate: new Date('2024-09-15T17:00:00'),
      status: 'PLANIFIE',
      agenda: 'Présentation des résultats - Formation technique - Échanges avec les producteurs',
      maxParticipants: 50,
      organizerId: chercheur1.id,
    },
  });

  const seminar2 = await prisma.seminar.create({
    data: {
      title: 'Journée de formation sur la lutte intégrée',
      description: 'Formation des agents de vulgarisation sur les méthodes de lutte intégrée',
      location: 'Centre de formation agricole de Dagana',
      startDate: new Date('2024-08-20T08:00:00'),
      endDate: new Date('2024-08-20T16:00:00'),
      status: 'TERMINE',
      agenda: 'Théorie lutte intégrée - Pratique terrain - Évaluation',
      maxParticipants: 30,
      organizerId: chercheur2.id,
    },
  });

  // 11. Participants aux séminaires
  console.log('👥 Ajout des participants aux séminaires...');
  
  await prisma.seminarParticipant.createMany({
    data: [
      {
        seminarId: seminar1.id,
        participantId: assistant1.id,
        attendedAt: null, // Pas encore assisté
      },
      {
        seminarId: seminar1.id,
        participantId: technicien1.id,
        attendedAt: null,
      },
      {
        seminarId: seminar2.id,
        participantId: assistant2.id,
        attendedAt: new Date('2024-08-20T08:30:00'),
      },
      {
        seminarId: seminar2.id,
        participantId: technicien2.id,
        attendedAt: new Date('2024-08-20T08:30:00'),
      },
    ],
  });

  // 12. Création des commentaires
  console.log('💬 Création des commentaires...');
  
  await prisma.comment.createMany({
    data: [
      {
        content: 'Excellent travail sur la préparation du terrain. Les parcelles sont bien délimitées.',
        authorId: chercheur1.id,
        projectId: projet1.id,
        activityId: activite1.id,
      },
      {
        content: 'Les données collectées sont cohérentes. Je suggère d\'augmenter la fréquence des observations.',
        authorId: assistant1.id,
        projectId: projet1.id,
        activityId: activite1.id,
      },
      {
        content: 'Nécessité de revoir la méthodologie pour la zone de Matam en raison des contraintes d\'accès.',
        authorId: chercheur2.id,
        projectId: projet2.id,
        activityId: activite2.id,
      },
      {
        content: 'Les résultats préliminaires montrent une forte présence de pucerons. À surveiller.',
        authorId: assistant2.id,
        projectId: projet2.id,
      },
    ],
  });

  // 13. Création des notifications
  console.log('🔔 Création des notifications...');
  
  await prisma.notification.createMany({
    data: [
      {
        title: 'Nouvelle tâche assignée',
        message: 'Vous avez été assigné à la tâche "Collecte de données biométriques"',
        type: 'task_assigned',
        isRead: false,
        senderId: assistant1.id,
        receiverId: technicien1.id,
        entityType: 'task',
        entityId: '3', // ID de la tâche
        actionUrl: '/tasks/3',
      },
      {
        title: 'Séminaire à venir',
        message: 'Rappel: Atelier sur les nouvelles variétés de riz ISRIZ dans 7 jours',
        type: 'seminar_reminder',
        isRead: false,
        senderId: admin.id,
        receiverId: assistant1.id,
        entityType: 'seminar',
        entityId: seminar1.id,
        actionUrl: `/seminars/${seminar1.id}`,
      },
      {
        title: 'Document partagé',
        message: 'Le document "Protocole essai variétal riz 2024" a été partagé avec vous',
        type: 'document_shared',
        isRead: true,
        readAt: new Date('2024-07-20T10:30:00'),
        senderId: chercheur1.id,
        receiverId: assistant1.id,
        entityType: 'document',
        entityId: doc1.id,
        actionUrl: `/documents/${doc1.id}`,
      },
      {
        title: 'Projet mis à jour',
        message: 'Le projet "Développement de variétés de riz ISRIZ" a été mis à jour',
        type: 'project_update',
        isRead: false,
        senderId: chercheur1.id,
        receiverId: assistant1.id,
        entityType: 'project',
        entityId: projet1.id,
        actionUrl: `/projects/${projet1.id}`,
      },
    ],
  });

  // 14. Création des logs d'audit
  console.log('📊 Création des logs d\'audit...');
  
  await prisma.auditLog.createMany({
    data: [
      {
        action: 'LOGIN',
        level: 'INFO',
        userId: chercheur1.id,
        entityType: 'user',
        entityId: chercheur1.id,
        details: {
          title: 'Connexion utilisateur',
          description: 'Connexion réussie'
        },
        metadata: {
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          source: 'web_app'
        },
      },
      {
        action: 'CREATE',
        level: 'INFO',
        userId: chercheur1.id,
        entityType: 'project',
        entityId: projet1.id,
        details: {
          title: 'Création projet',
          description: 'Nouveau projet créé: Développement de variétés de riz ISRIZ'
        },
        metadata: {
          ip: '192.168.1.100',
          source: 'web_app'
        },
      },
      {
        action: 'UPDATE',
        level: 'INFO',
        userId: assistant1.id,
        entityType: 'task',
        entityId: '2',
        details: {
          title: 'Mise à jour tâche',
          description: 'Progression mise à jour: 70%'
        },
        changes: {
          before: { progress: 50 },
          after: { progress: 70 },
          fields: ['progress']
        },
        metadata: {
          ip: '192.168.1.101',
          source: 'web_app'
        },
      },
      {
        action: 'DELETE',
        level: 'WARNING',
        userId: admin.id,
        entityType: 'user',
        entityId: 'temp_user_id',
        details: {
          title: 'Suppression utilisateur',
          description: 'Utilisateur temporaire supprimé'
        },
        metadata: {
          ip: '192.168.1.50',
          source: 'admin_panel'
        },
      },
      {
        action: 'EXPORT',
        level: 'INFO',
        userId: chercheur2.id,
        entityType: 'document',
        entityId: doc2.id,
        details: {
          title: 'Export document',
          description: 'Export des données biométriques en format Excel'
        },
        metadata: {
          ip: '192.168.1.102',
          source: 'web_app',
          exportFormat: 'xlsx'
        },
      },
      {
        action: 'SHARE',
        level: 'INFO',
        userId: chercheur1.id,
        entityType: 'document',
        entityId: doc1.id,
        details: {
          title: 'Partage document',
          description: 'Document partagé avec assistant de recherche'
        },
        metadata: {
          ip: '192.168.1.100',
          source: 'web_app',
          sharedWith: assistant1.id
        },
      },
      {
        action: 'FORM_SUBMIT',
        level: 'INFO',
        userId: technicien1.id,
        entityType: 'form',
        entityId: form1.id,
        details: {
          title: 'Soumission formulaire',
          description: 'Données biométriques soumises pour parcelle P001'
        },
        metadata: {
          ip: '192.168.1.103',
          source: 'mobile_app'
        },
      },
      {
        action: 'BACKUP',
        level: 'INFO',
        userId: admin.id,
        entityType: 'system',
        entityId: null,
        details: {
          title: 'Sauvegarde système',
          description: 'Sauvegarde automatique des données'
        },
        metadata: {
          ip: '192.168.1.50',
          source: 'system_cron',
          backupSize: '250MB'
        },
      },
      {
        action: 'ERROR',
        level: 'ERROR',
        userId: null,
        entityType: 'system',
        entityId: null,
        details: {
          title: 'Erreur connexion base',
          description: 'Timeout connexion base de données'
        },
        metadata: {
          ip: null,
          source: 'system',
          errorCode: 'DB_TIMEOUT_001'
        },
      },
    ],
  });

  console.log('✅ Seeding terminé avec succès !');
  console.log('');
  console.log('📊 Résumé des données créées :');
  console.log(`👥 Utilisateurs: ${await prisma.user.count()}`);
  console.log(`📋 Projets: ${await prisma.project.count()}`);
  console.log(`🎯 Activités: ${await prisma.activity.count()}`);
  console.log(`✅ Tâches: ${await prisma.task.count()}`);
  console.log(`📄 Documents: ${await prisma.document.count()}`);
  console.log(`📝 Formulaires: ${await prisma.form.count()}`);
  console.log(`💬 Réponses formulaires: ${await prisma.formResponse.count()}`);
  console.log(`🎓 Séminaires: ${await prisma.seminar.count()}`);
  console.log(`💬 Commentaires: ${await prisma.comment.count()}`);
  console.log(`🔔 Notifications: ${await prisma.notification.count()}`);
  console.log(`📊 Logs d'audit: ${await prisma.auditLog.count()}`);
  console.log('');
  console.log('🔑 Comptes de test créés :');
  console.log('👤 Administrateur: admin@cra-saintlouis.sn / password123');
  console.log('🔬 Chercheur 1: dr.ndiaye@cra-saintlouis.sn / password123');
  console.log('🔬 Chercheur 2: dr.fall@cra-saintlouis.sn / password123');
  console.log('🔬 Chercheur 3: dr.ba@cra-saintlouis.sn / password123');
  console.log('🎓 Assistant 1: a.sow@cra-saintlouis.sn / password123');
  console.log('🎓 Assistant 2: i.diop@cra-saintlouis.sn / password123');
  console.log('🔧 Technicien 1: f.sarr@cra-saintlouis.sn / password123');
  console.log('🔧 Technicien 2: m.ndoye@cra-saintlouis.sn / password123');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });