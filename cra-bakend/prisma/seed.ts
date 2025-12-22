import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding pour le CRA Saint-Louis...');

  // Nettoyage des données existantes (ordre important pour respecter les contraintes de clés étrangères)
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
  await prisma.activityParticipant.deleteMany();
  await prisma.activityFunding.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.projectParticipant.deleteMany();
  await prisma.project.deleteMany();
  await prisma.researchTheme.deleteMany();
  await prisma.researchProgram.deleteMany(); // Supprimer AVANT user car coordinatorId fait référence à user
  await prisma.individualProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.strategicSubAxis.deleteMany();
  await prisma.strategicAxis.deleteMany();
  await prisma.strategicPlan.deleteMany();
  await prisma.researchStation.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // === STRUCTURE STRATÉGIQUE ===
  
  console.log('📋 Création de la structure stratégique...');
  
  const psd20182022 = await prisma.strategicPlan.create({
    data: {
      name: 'PSD-2018-2022',
      description: 'Plan Stratégique de Développement 2018-2022',
      startYear: 2018,
      endYear: 2022,
      isActive: true,
    },
  });

  const axe1 = await prisma.strategicAxis.create({
    data: {
      name: 'Promotion de systèmes de production performants, résilients et compétitifs et durables',
      code: 'AXE1',
      order: 1,
      strategicPlanId: psd20182022.id,
    },
  });

  const sousAxe1 = await prisma.strategicSubAxis.create({
    data: {
      name: 'Vulnérabilité, adaptation et résilience aux effets du changement climatique',
      code: 'SA1-1',
      order: 1,
      strategicAxisId: axe1.id,
    },
  });

  const sousAxe2 = await prisma.strategicSubAxis.create({
    data: {
      name: 'Amélioration de la productivité agricole et nutritionnelle',
      code: 'SA1-2',
      order: 2,
      strategicAxisId: axe1.id,
    },
  });

  const sousAxe3 = await prisma.strategicSubAxis.create({
    data: {
      name: 'Exploitation durable des ressources naturelles/GRN et biodiversité',
      code: 'SA1-3',
      order: 3,
      strategicAxisId: axe1.id,
    },
  });

  // === STATIONS DE RECHERCHE ===
  
  console.log('🏢 Création des stations de recherche...');
  
  const stationJES = await prisma.researchStation.create({
    data: {
      name: 'Jardin d\'Essai de Sor (JES)',
      location: 'Saint-Louis',
      surface: 25,
      description: 'Station principale avec laboratoires et bureaux',
      isActive: true,
    },
  });

  const stationNdiol = await prisma.researchStation.create({
    data: {
      name: 'Station Serigne Moustapha Bassirou MBACKE de Ndiol',
      location: 'Ndiol',
      surface: 119,
      description: 'Production de semences d\'arachide et verger',
      isActive: true,
    },
  });

  const stationFanaye = await prisma.researchStation.create({
    data: {
      name: 'Station de Fanaye',
      location: 'Fanaye',
      surface: 117,
      description: 'Production de semences de riz et de blé',
      isActive: true,
    },
  });

  // === UTILISATEURS ===
  
  console.log('👥 Création des utilisateurs...');
  
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
  const mameFarmaNdiaye = await prisma.user.create({
    data: {
      email: 'mame.ndiaye@cra-saintlouis.sn',
      password: hashedPassword,
      firstName: 'Mame Farma',
      lastName: 'Ndiaye',
      role: 'CHERCHEUR',
      phoneNumber: '+221 77 234 56 78',
      specialization: 'Agroécologie',
      department: 'Systèmes de production',
      dateOfBirth: new Date('1976-03-03'),
      dateOfHire: new Date('2010-09-01'),
      diploma: 'DOCTORAT',
      isActive: true,
    },
  });

  await prisma.individualProfile.create({
    data: {
      userId: mameFarmaNdiaye.id,
      matricule: '921108/A',
      grade: '7',
      classe: '1',
      dateNaissance: new Date('1976-03-03'),
      dateRecrutement: new Date('2010-09-01'),
      localite: 'Saint-Louis',
      diplome: 'DOCTORAT',
      tempsRecherche: 50,
      tempsEnseignement: 0,
      tempsFormation: 10,
      tempsConsultation: 0,
      tempsGestionScientifique: 20,
      tempsAdministration: 20,
    },
  });

  const omarFaye = await prisma.user.create({
    data: {
      email: 'omar.faye@cra-saintlouis.sn',
      password: hashedPassword,
      firstName: 'Omar Ndaw',
      lastName: 'Faye',
      role: 'CHERCHEUR',
      phoneNumber: '+221 77 345 67 89',
      specialization: 'Amélioration variétale riz',
      department: 'Sélection variétale',
      dateOfBirth: new Date('1970-02-02'),
      dateOfHire: new Date('2008-10-23'),
      diploma: 'DOCTORAT',
      isActive: true,
    },
  });

  await prisma.individualProfile.create({
    data: {
      userId: omarFaye.id,
      matricule: '920024/E',
      grade: '7',
      classe: '1',
      dateNaissance: new Date('1970-02-02'),
      dateRecrutement: new Date('2008-10-23'),
      localite: 'Saint-Louis',
      diplome: 'DOCTORAT',
      tempsRecherche: 40,
      tempsEnseignement: 10,
      tempsFormation: 5,
      tempsConsultation: 10,
      tempsGestionScientifique: 30,
      tempsAdministration: 5,
    },
  });

  const moussaDieng = await prisma.user.create({
    data: {
      email: 'moussa.dieng@cra-saintlouis.sn',
      password: hashedPassword,
      firstName: 'Moussa',
      lastName: 'Dieng',
      role: 'CHERCHEUR',
      phoneNumber: '+221 77 456 78 90',
      specialization: 'Foresterie/Télédétection',
      department: 'Gestion des ressources naturelles',
      diploma: 'DOCTORAT',
      isActive: true,
    },
  });

  await prisma.individualProfile.create({
    data: {
      userId: moussaDieng.id,
      matricule: '929.243/O',
      grade: 'CR',
      classe: '6.3',
      dateNaissance: new Date('1980-01-01'),
      dateRecrutement: new Date('2017-07-24'),
      localite: 'Saint-Louis',
      diplome: 'DOCTORAT',
      tempsRecherche: 40,
      tempsEnseignement: 5,
      tempsFormation: 1,
      tempsConsultation: 4,
      tempsGestionScientifique: 35,
      tempsAdministration: 15,
    },
  });

  const amadouSall = await prisma.user.create({
    data: {
      email: 'amadou.sall@cra-saintlouis.sn',
      password: hashedPassword,
      firstName: 'Amadou Tidiane',
      lastName: 'Sall',
      role: 'CHERCHEUR',
      phoneNumber: '+221 77 567 89 01',
      specialization: 'Amélioration variétale blé',
      department: 'Sélection variétale',
      dateOfBirth: new Date('1985-03-01'),
      dateOfHire: new Date('2018-07-01'),
      diploma: 'DOCTORAT',
      isActive: true,
    },
  });

  await prisma.individualProfile.create({
    data: {
      userId: amadouSall.id,
      matricule: '932411/D',
      grade: 'CR',
      classe: '6.2',
      dateNaissance: new Date('1985-03-01'),
      dateRecrutement: new Date('2018-07-01'),
      localite: 'Saint-Louis',
      diplome: 'DOCTORAT',
      tempsRecherche: 58,
      tempsEnseignement: 5,
      tempsFormation: 2,
      tempsConsultation: 5,
      tempsGestionScientifique: 20,
      tempsAdministration: 10,
    },
  });

  const rahimiMballo = await prisma.user.create({
    data: {
      email: 'rahimi.mballo@cra-saintlouis.sn',
      password: hashedPassword,
      firstName: 'Rahimi',
      lastName: 'Mballo',
      role: 'CHERCHEUR',
      phoneNumber: '+221 77 678 90 12',
      specialization: 'Malherbologie',
      department: 'Défense des cultures',
      dateOfBirth: new Date('1982-08-08'),
      dateOfHire: new Date('2019-05-21'),
      diploma: 'DOCTORAT',
      isActive: true,
    },
  });

  await prisma.individualProfile.create({
    data: {
      userId: rahimiMballo.id,
      matricule: '932.184/K',
      grade: 'CR',
      classe: '6.3',
      dateNaissance: new Date('1982-08-08'),
      dateRecrutement: new Date('2019-05-21'),
      localite: 'Saint-Louis',
      diplome: 'DOCTORAT',
      tempsRecherche: 60,
      tempsEnseignement: 3,
      tempsFormation: 5,
      tempsConsultation: 2,
      tempsGestionScientifique: 20,
      tempsAdministration: 10,
    },
  });

  const mameSokhnaSarr = await prisma.user.create({
    data: {
      email: 'sokhna.sarr@cra-saintlouis.sn',
      password: hashedPassword,
      firstName: 'Mame Sokhna',
      lastName: 'Sarr',
      role: 'CHERCHEUR',
      phoneNumber: '+221 77 789 01 23',
      specialization: 'Foresterie/Ecophysiologie',
      department: 'Gestion des ressources naturelles',
      dateOfBirth: new Date('1980-08-28'),
      dateOfHire: new Date('2010-10-01'),
      diploma: 'DOCTORAT',
      isActive: true,
    },
  });

  // Assistants et techniciens
  const babacarKane = await prisma.user.create({
    data: {
      email: 'babacar.kane@cra-saintlouis.sn',
      password: hashedPassword,
      firstName: 'Babacar',
      lastName: 'Kane',
      role: 'CHERCHEUR',
      phoneNumber: '+221 77 890 12 34',
      specialization: 'Agronomie',
      department: 'Systèmes de production',
      dateOfBirth: new Date('1989-01-15'),
      dateOfHire: new Date('2023-01-24'),
      diploma: 'MASTER',
      supervisorId: mameFarmaNdiaye.id,
      isActive: true,
    },
  });

  const djibrilTall = await prisma.user.create({
    data: {
      email: 'djibril.tall@cra-saintlouis.sn',
      password: hashedPassword,
      firstName: 'Djibril',
      lastName: 'Tall',
      role: 'CHERCHEUR',
      phoneNumber: '+221 77 901 23 45',
      specialization: 'Sélection variétale',
      department: 'Amélioration génétique',
      supervisorId: omarFaye.id,
      isActive: true,
    },
  });

  
  // === PROGRAMME DE RECHERCHE ===
  
  console.log('📊 Création du programme de recherche...');
  
  const programmeVFS = await prisma.researchProgram.create({
    data: {
      name: 'Systèmes de production et Gestion des ressources naturelles dans la vallée du fleuve Sénégal',
      code: 'PROG-VFS',
      description: 'Programme de recherche pour le développement agricole durable dans la VFS',
      startDate: new Date('2018-01-01'),
      isActive: true,
      strategicSubAxisId: sousAxe1.id,
      coordinatorId: mameFarmaNdiaye.id,
    },
  });

  // === THÈMES DE RECHERCHE ===
  
  console.log('🔬 Création des thèmes de recherche...');
  
  const themeRiziculture = await prisma.researchTheme.create({
    data: {
      name: 'Intensification de la riziculture',
      code: 'THEME-RIZ',
      description: 'Amélioration de la productivité et de la qualité du riz',
      objectives: [
        'Développer des variétés de riz performantes',
        'Améliorer les techniques culturales',
        'Maîtriser les bioagresseurs',
      ],
      order: 1,
      isActive: true,
      programId: programmeVFS.id,
    },
  });

  const themeDiversification = await prisma.researchTheme.create({
    data: {
      name: 'Diversification des cultures',
      code: 'THEME-DIV',
      description: 'Promotion de cultures alternatives pour la sécurisation des revenus',
      objectives: [
        'Développer la culture du blé',
        'Améliorer les productions maraîchères',
        'Introduire de nouvelles cultures',
      ],
      order: 2,
      isActive: true,
      programId: programmeVFS.id,
    },
  });

  const themeSystemes = await prisma.researchTheme.create({
    data: {
      name: 'Amélioration des systèmes de production',
      code: 'THEME-SYS',
      description: 'Optimisation des systèmes de production agricole',
      objectives: [
        'Développer des pratiques agroécologiques',
        'Améliorer la gestion de la fertilité des sols',
        'Optimiser l\'utilisation de l\'eau',
      ],
      order: 3,
      isActive: true,
      programId: programmeVFS.id,
    },
  });

  const themeGRN = await prisma.researchTheme.create({
    data: {
      name: 'Gestion durable des ressources naturelles et des espaces ruraux',
      code: 'THEME-GRN',
      description: 'Préservation et valorisation des ressources naturelles',
      objectives: [
        'Caractériser et cartographier les ressources',
        'Développer des techniques de récupération des terres dégradées',
        'Promouvoir l\'agroforesterie',
      ],
      order: 4,
      isActive: true,
      programId: programmeVFS.id,
    },
  });

  // === PROJETS ===
  
  console.log('📋 Création des projets...');
  
  const projetSRI = await prisma.project.create({
    data: {
      code: 'PROJ-SRI-2025',
      title: 'Diffusion des hybrides F1 de riz irrigué par la pratique du Système de Riziculture Intensive (SRI)',
      description: 'Amélioration de la production du riz par l\'utilisation d\'hybrides F1 et la pratique du SRI en Afrique de l\'Ouest',
      objectives: [
        'Diffuser les variétés de riz hybride avec la pratique de SRI',
        'Améliorer les rendements grains du riz chez les petits producteurs',
        'Former les acteurs sur les techniques de production',
      ],
      status: 'EN_COURS',
      startDate: new Date('2024-08-01'),
      endDate: new Date('2027-07-31'),
      budget: 26320000,
      keywords: ['riz', 'hybride', 'SRI', 'Afrique de l\'Ouest', 'semences'],
      creatorId: omarFaye.id,
      themeId: themeRiziculture.id,
      researchProgramId: programmeVFS.id,
    },
  });

  const projetCIRAWA = await prisma.project.create({
    data: {
      code: 'PROJ-CIRAWA-2024',
      title: 'Stratégies agro-écologiques pour une agriculture résiliente en Afrique de l\'Ouest',
      description: 'Développement de pratiques climato-résilientes pour une intensification durable',
      objectives: [
        'Co-concevoir des pratiques agroécologiques adaptées',
        'Améliorer l\'efficience de l\'irrigation',
        'Optimiser la gestion intégrée de la fertilité des sols',
      ],
      status: 'EN_COURS',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2026-12-31'),
      budget: 49910000,
      keywords: ['agroécologie', 'résilience', 'irrigation', 'fertilité'],
      creatorId: mameFarmaNdiaye.id,
      themeId: themeSystemes.id,
      researchProgramId: programmeVFS.id,
    },
  });

  const projetBle = await prisma.project.create({
    data: {
      code: 'PROJ-BLE-2024',
      title: 'Diffusion de la culture blé dans la vallée du fleuve Sénégal',
      description: 'Test de démonstration pour l\'adoption de huit variétés adaptées',
      objectives: [
        'Informer et sensibiliser les acteurs sur les variétés de blé',
        'Former les producteurs sur les techniques de production',
        'Formuler des recommandations pour la mise en place de la filière blé',
      ],
      status: 'EN_COURS',
      startDate: new Date('2022-01-01'),
      endDate: new Date('2025-12-31'),
      budget: 18644000,
      keywords: ['blé', 'diffusion', 'démonstration', 'variétés'],
      creatorId: amadouSall.id,
      themeId: themeDiversification.id,
      researchProgramId: programmeVFS.id,
    },
  });

  const projetSantesTerritoires = await prisma.project.create({
    data: {
      code: 'PROJ-SANTE-2024',
      title: 'Méthode intégrée de récupération des terres rizicoles salées',
      description: 'Effets combinés du travail du sol et d\'amendements dans la zone du Lac de Guiers',
      objectives: [
        'Réduire la salinité des sols',
        'Améliorer la fertilité des terres rizicoles',
        'Augmenter la productivité avec moins d\'intrants',
      ],
      status: 'EN_COURS',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-03-31'),
      budget: 36932000,
      keywords: ['salinité', 'sols', 'récupération', 'amendements', 'Mbane'],
      creatorId: moussaDieng.id,
      themeId: themeGRN.id,
      researchProgramId: programmeVFS.id,
    },
  });

  // === PARTICIPANTS AUX PROJETS ===
  
  await prisma.projectParticipant.createMany({
    data: [
      { projectId: projetSRI.id, userId: rahimiMballo.id, role: 'Chargé de recherche - Production semences' },
      { projectId: projetSRI.id, userId: djibrilTall.id, role: 'Assistant de recherche - Sélection' },
      { projectId: projetSRI.id, userId: babacarKane.id, role: 'Ingénieur - Agronomie' },
      { projectId: projetCIRAWA.id, userId: babacarKane.id, role: 'Ingénieur de recherche' },
      { projectId: projetBle.id, userId: amadouSall.id, role: 'Responsable scientifique' },
      { projectId: projetSantesTerritoires.id, userId: moussaDieng.id, role: 'Coordinateur' },
      { projectId: projetSantesTerritoires.id, userId: babacarKane.id, role: 'Ingénieur agronomie' },
    ],
  });

  // === ACTIVITÉS ===
  
  console.log('🎯 Création des activités...');
  
  const actSRI = await prisma.activity.create({
    data: {
      code: 'ACT-SRI-DEMO-2025',
      title: 'Conduite des parcelles de démonstration SRI',
      description: 'Démonstration des hybrides F1 de riz avec pratique SRI en milieu paysan',
      type: 'DEMONSTRATION',
      objectives: [
        'Installer des parcelles de démonstration dans 3 pays',
        'Former les producteurs aux techniques SRI',
        'Évaluer les performances des hybrides',
      ],
      methodology: 'Parcelles de démonstration de 1000 m² par hybride en milieu paysan',
      location: 'Vallée du Fleuve Sénégal, Mali, Burkina Faso',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      status: 'EN_COURS',
      priority: 'HAUTE',
      projectId: projetSRI.id,
      themeId: themeRiziculture.id,
      stationId: stationFanaye.id,
      responsibleId: omarFaye.id,
      lifecycleStatus: 'NOUVELLE',
    },
  });

  const actSelectionRiz = await prisma.activity.create({
    data: {
      code: 'ACT-SEL-RIZ-2025',
      title: 'Amélioration de lignées de riz Tongil pour la tolérance à la salinité',
      description: 'Sélection de nouvelles lignées de riz tolérantes à la salinité avec bon rendement',
      type: 'RECHERCHE_EXPERIMENTALE',
      objectives: [
        'Identifier 17 lignées performantes',
        'Évaluer la tolérance à la salinité',
        'Tester les caractéristiques de qualité du grain',
      ],
      methodology: 'Essais comparatifs avec témoins, dispositif en blocs de Fisher',
      location: 'Station de Fanaye',
      startDate: new Date('2025-11-01'),
      endDate: new Date('2026-04-30'),
      status: 'PLANIFIEE',
      priority: 'HAUTE',
      projectId: projetSRI.id,
      themeId: themeRiziculture.id,
      stationId: stationFanaye.id,
      responsibleId: omarFaye.id,
      lifecycleStatus: 'RECONDUITE',
    },
  });

  const actTestHerbicide = await prisma.activity.create({
    data: {
      code: 'ACT-HERB-OIGNON-2025',
      title: 'Test d\'efficacité biologique de l\'herbicide glufosinate-ammonium pour l\'oignon',
      description: 'Évaluation de l\'efficacité de l\'herbicide Goal 200 g/L sur oignon',
      type: 'RECHERCHE_EXPERIMENTALE',
      objectives: [
        'Déterminer la dose optimale d\'application',
        'Évaluer l\'efficacité contre les adventices',
        'Mesurer la phytotoxicité sur l\'oignon',
      ],
      methodology: 'Dispositif en blocs de Fisher, 5 traitements, 4 répétitions',
      location: 'Jardin d\'Essai de Sor',
      startDate: new Date('2024-11-01'),
      endDate: new Date('2025-04-30'),
      status: 'EN_COURS',
      priority: 'NORMALE',
      themeId: themeDiversification.id,
      stationId: stationJES.id,
      responsibleId: rahimiMballo.id,
      lifecycleStatus: 'NOUVELLE',
    },
  });

  const actDiffusionBle = await prisma.activity.create({
    data: {
      code: 'ACT-BLE-DIFF-2025',
      title: 'Parcelles de démonstration blé',
      description: 'Installation de parcelles de démonstration des 8 variétés de blé homologuées',
      type: 'DEMONSTRATION',
      objectives: [
        'Installer 4 parcelles de démonstration',
        'Organiser des visites guidées',
        'Former les producteurs aux bonnes pratiques',
      ],
      methodology: 'Parcelles de démonstration variétale avec journées de formation',
      location: 'Thiagar, Thiago, Fanaye, Dara Alaybé',
      startDate: new Date('2024-11-01'),
      endDate: new Date('2025-06-30'),
      status: 'EN_COURS',
      priority: 'HAUTE',
      projectId: projetBle.id,
      themeId: themeDiversification.id,
      stationId: stationFanaye.id,
      responsibleId: amadouSall.id,
      lifecycleStatus: 'RECONDUITE',
    },
  });

  const actSolsSales = await prisma.activity.create({
    data: {
      code: 'ACT-SOLS-MBANE-2025',
      title: 'Récupération des terres rizicoles salées à Mbane',
      description: 'Test de pratiques combinées pour réduire la salinité des sols',
      type: 'RECHERCHE_EXPERIMENTALE',
      objectives: [
        'Tester l\'effet du travail du sol sur la salinité',
        'Évaluer l\'impact des amendements organiques et minéraux',
        'Déterminer la meilleure combinaison de pratiques',
      ],
      methodology: 'Dispositif en blocs de Fisher, 3 traitements, 3 répétitions, parcelles de 100 m²',
      location: 'Mbane',
      startDate: new Date('2024-08-01'),
      endDate: new Date('2025-03-31'),
      status: 'EN_COURS',
      priority: 'HAUTE',
      projectId: projetSantesTerritoires.id,
      themeId: themeGRN.id,
      responsibleId: moussaDieng.id,
      lifecycleStatus: 'NOUVELLE',
    },
  });

  const actEngrais = await prisma.activity.create({
    data: {
      code: 'ACT-ENGRAIS-2025',
      title: 'Tests d\'efficacité de nouvelles formules d\'engrais',
      description: 'Évaluation de nouvelles formules d\'engrais sur riz et cultures maraîchères',
      type: 'RECHERCHE_EXPERIMENTALE',
      objectives: [
        'Évaluer l\'efficacité des nouvelles formules',
        'Comparer avec les formules actuelles',
        'Formuler des recommandations',
      ],
      methodology: 'Essais multilocaux en milieu paysan',
      location: 'Delta du Fleuve Sénégal',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2025-03-31'),
      status: 'EN_COURS',
      priority: 'HAUTE',
      projectId: projetCIRAWA.id,
      themeId: themeSystemes.id,
      responsibleId: mameFarmaNdiaye.id,
      lifecycleStatus: 'RECONDUITE',
    },
  });

  const actZoonoses = await prisma.activity.create({
    data: {
      code: 'ACT-ZOONOSE-2025',
      title: 'Analyse de la reconversion des écosystèmes forestiers et impact sur les zoonoses',
      description: 'Cartographie de la déforestation et corrélation avec les maladies zoonotiques',
      type: 'RECHERCHE_EXPERIMENTALE',
      objectives: [
        'Cartographier la reconversion des forêts',
        'Quantifier les taux de déforestation',
        'Établir une corrélation avec la prévalence des zoonoses',
      ],
      methodology: 'Télédétection, analyse d\'images satellitaires, enquêtes terrain',
      location: 'Parc de Djoudj (Saint-Louis) et PNNK (Kédougou)',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-12-31'),
      status: 'EN_COURS',
      priority: 'NORMALE',
      themeId: themeGRN.id,
      responsibleId: moussaDieng.id,
      lifecycleStatus: 'NOUVELLE',
    },
  });

  const actServicesEcosystemiques = await prisma.activity.create({
    data: {
      code: 'ACT-SE-MBANE-2025',
      title: 'Identification des options de gestion des services écosystémiques fournis par les ligneux',
      description: 'Étude des services écosystémiques des arbres et arbustes à Mbane',
      type: 'RECHERCHE_EXPERIMENTALE',
      objectives: [
        'Identifier les services écosystémiques fournis',
        'Étudier les liens avec les activités socio-économiques',
        'Identifier les contraintes et facteurs favorables à la plantation',
      ],
      methodology: 'Enquêtes, inventaires forestiers, analyse participative',
      location: 'Mbane',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-06-30'),
      status: 'PLANIFIEE',
      priority: 'NORMALE',
      projectId: projetSantesTerritoires.id,
      themeId: themeGRN.id,
      responsibleId: moussaDieng.id,
      lifecycleStatus: 'NOUVELLE',
    },
  });

  // === PARTICIPANTS AUX ACTIVITÉS ===
  
  await prisma.activityParticipant.createMany({
    data: [
      { activityId: actSRI.id, userId: rahimiMballo.id, role: 'CHERCHEUR_ASSOCIE', timeAllocation: 10 },
      { activityId: actSRI.id, userId: djibrilTall.id, role: 'TECHNICIEN', timeAllocation: 30 },
      { activityId: actSRI.id, userId: babacarKane.id, role: 'TECHNICIEN', timeAllocation: 25 },
      { activityId: actSelectionRiz.id, userId: djibrilTall.id, role: 'TECHNICIEN', timeAllocation: 50 },
      { activityId: actTestHerbicide.id, userId: djibrilTall.id, role: 'TECHNICIEN', timeAllocation: 10 },
      { activityId: actDiffusionBle.id, userId: babacarKane.id, role: 'TECHNICIEN', timeAllocation: 15 },
      { activityId: actSolsSales.id, userId: babacarKane.id, role: 'CHERCHEUR_ASSOCIE', timeAllocation: 100 },
      { activityId: actEngrais.id, userId: babacarKane.id, role: 'TECHNICIEN', timeAllocation: 20 },
      { activityId: actZoonoses.id, userId: babacarKane.id, role: 'CHERCHEUR_ASSOCIE', timeAllocation: 15 },
      { activityId: actServicesEcosystemiques.id, userId: babacarKane.id, role: 'CHERCHEUR_ASSOCIE', timeAllocation: 45 },
    ],
  });

  // === FINANCEMENTS DES ACTIVITÉS ===
  
  await prisma.activityFunding.createMany({
    data: [
      {
        activityId: actSRI.id,
        fundingSource: 'CORAF',
        fundingType: 'SUBVENTION',
        status: 'APPROUVE',
        requestedAmount: 26320000,
        approvedAmount: 26320000,
        currency: 'XOF',
        startDate: new Date('2024-08-01'),
        endDate: new Date('2027-07-31'),
      },
      {
        activityId: actTestHerbicide.id,
        fundingSource: 'BIOTECK',
        fundingType: 'CONTRAT',
        status: 'APPROUVE',
        requestedAmount: 5000000,
        approvedAmount: 5000000,
        currency: 'XOF',
        startDate: new Date('2024-11-01'),
        endDate: new Date('2025-04-30'),
      },
      {
        activityId: actDiffusionBle.id,
        fundingSource: 'ACTS (MESRI)',
        fundingType: 'SUBVENTION',
        status: 'APPROUVE',
        requestedAmount: 18644000,
        approvedAmount: 18644000,
        currency: 'XOF',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
      },
      {
        activityId: actSolsSales.id,
        fundingSource: 'Union Européenne (Santé Territoires)',
        fundingType: 'COOPERATION_INTERNATIONALE',
        status: 'EN_COURS',
        requestedAmount: 36932000,
        approvedAmount: 36932000,
        currency: 'XOF',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-03-31'),
      },
      {
        activityId: actEngrais.id,
        fundingSource: 'IFDC',
        fundingType: 'PARTENARIAT',
        status: 'EN_COURS',
        requestedAmount: 26660000,
        approvedAmount: 26660000,
        currency: 'XOF',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31'),
      },
      {
        activityId: actZoonoses.id,
        fundingSource: 'AFD (One Health)',
        fundingType: 'COOPERATION_INTERNATIONALE',
        status: 'EN_COURS',
        requestedAmount: 7255000,
        approvedAmount: 7255000,
        currency: 'XOF',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-12-31'),
      },
      {
        activityId: actServicesEcosystemiques.id,
        fundingSource: 'CIRAD (Santé Territoires)',
        fundingType: 'COOPERATION_INTERNATIONALE',
        status: 'APPROUVE',
        requestedAmount: 4500000,
        approvedAmount: 4500000,
        currency: 'XOF',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-06-30'),
      },
    ],
  });

  // === TÂCHES ===
  
  console.log('✅ Création des tâches...');
  
  await prisma.task.createMany({
    data: [
      {
        title: 'Sélection des producteurs expérimentateurs',
        description: 'Identifier et sélectionner les producteurs pour les parcelles de démonstration SRI',
        status: 'EN_COURS',
        priority: 'HAUTE',
        dueDate: new Date('2025-01-31'),
        progress: 30,
        creatorId: omarFaye.id,
        assigneeId: djibrilTall.id,
        projectId: projetSRI.id,
        activityId: actSRI.id,
      },
      {
        title: 'Préparation des semences hybrides',
        description: 'Commander et préparer les semences hybrides F1 pour la démonstration',
        status: 'A_FAIRE',
        priority: 'HAUTE',
        dueDate: new Date('2025-02-15'),
        progress: 0,
        creatorId: omarFaye.id,
        assigneeId: djibrilTall.id,
        projectId: projetSRI.id,
        activityId: actSRI.id,
      },
      {
        title: 'Formation des producteurs au SRI',
        description: 'Organiser un atelier de formation sur les techniques SRI',
        status: 'A_FAIRE',
        priority: 'HAUTE',
        dueDate: new Date('2025-03-15'),
        progress: 0,
        creatorId: omarFaye.id,
        assigneeId: babacarKane.id,
        projectId: projetSRI.id,
        activityId: actSRI.id,
      },
      {
        title: 'Installation des parcelles de démonstration blé',
        description: 'Mettre en place les 4 parcelles de démonstration dans les villages cibles',
        status: 'EN_COURS',
        priority: 'HAUTE',
        dueDate: new Date('2024-12-31'),
        progress: 75,
        creatorId: amadouSall.id,
        assigneeId: babacarKane.id,
        projectId: projetBle.id,
        activityId: actDiffusionBle.id,
      },
      {
        title: 'Organisation de la visite guidée blé',
        description: 'Organiser une visite guidée des parcelles de blé pour les producteurs',
        status: 'A_FAIRE',
        priority: 'NORMALE',
        dueDate: new Date('2025-03-15'),
        progress: 0,
        creatorId: amadouSall.id,
        projectId: projetBle.id,
        activityId: actDiffusionBle.id,
      },
      {
        title: 'Préparation du terrain expérimental Mbane',
        description: 'Labour, hersage et préparation des parcelles pour l\'essai sols salés',
        status: 'TERMINEE',
        priority: 'HAUTE',
        dueDate: new Date('2024-07-31'),
        completedAt: new Date('2024-07-28'),
        progress: 100,
        creatorId: moussaDieng.id,
        assigneeId: babacarKane.id,
        projectId: projetSantesTerritoires.id,
        activityId: actSolsSales.id,
      },
      {
        title: 'Suivi de la croissance du riz - Mbane',
        description: 'Collecte des données biométriques et mesure de la salinité',
        status: 'EN_COURS',
        priority: 'HAUTE',
        dueDate: new Date('2025-01-31'),
        progress: 60,
        creatorId: moussaDieng.id,
        assigneeId: babacarKane.id,
        projectId: projetSantesTerritoires.id,
        activityId: actSolsSales.id,
      },
      {
        title: 'Traitement des images satellitaires',
        description: 'Analyse des images Landsat et Sentinel pour cartographie déforestation',
        status: 'EN_COURS',
        priority: 'NORMALE',
        dueDate: new Date('2025-04-30'),
        progress: 40,
        creatorId: moussaDieng.id,
        activityId: actZoonoses.id,
      },
      {
        title: 'Application des traitements herbicides',
        description: 'Appliquer les différentes doses d\'herbicide selon le protocole',
        status: 'A_FAIRE',
        priority: 'HAUTE',
        dueDate: new Date('2024-12-15'),
        progress: 0,
        creatorId: rahimiMballo.id,
        assigneeId: djibrilTall.id,
        activityId: actTestHerbicide.id,
      },
    ],
  });

  // === DOCUMENTS ===
  
  console.log('📄 Création des documents...');
  
  const doc1 = await prisma.document.create({
    data: {
      title: 'Protocole SRI avec hybrides F1',
      filename: 'protocole_sri_hybrides_2025.pdf',
      filepath: '/documents/protocoles/protocole_sri_hybrides_2025.pdf',
      mimeType: 'application/pdf',
      size: BigInt(3200000),
      type: 'FICHE_TECHNIQUE',
      description: 'Protocole détaillé pour la conduite du SRI avec hybrides F1 de riz',
      tags: ['SRI', 'hybride', 'riz', 'protocole'],
      isPublic: false,
      ownerId: omarFaye.id,
      projectId: projetSRI.id,
      activityId: actSRI.id,
    },
  });

  const doc2 = await prisma.document.create({
    data: {
      title: 'Guide de production du blé dans la vallée',
      filename: 'guide_production_ble_2024.pdf',
      filepath: '/documents/fiches/guide_production_ble_2024.pdf',
      mimeType: 'application/pdf',
      size: BigInt(2800000),
      type: 'FICHE_TECHNIQUE',
      description: 'Guide complet des bonnes pratiques agricoles pour la culture du blé',
      tags: ['blé', 'guide', 'BPA', 'production'],
      isPublic: true,
      ownerId: amadouSall.id,
      projectId: projetBle.id,
      activityId: actDiffusionBle.id,
    },
  });

  const doc3 = await prisma.document.create({
    data: {
      title: 'Données biométriques riz Mbane - Hivernage 2024',
      filename: 'donnees_biometriques_mbane_2024.xlsx',
      filepath: '/documents/donnees/donnees_biometriques_mbane_2024.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: BigInt(1500000),
      type: 'DONNEES_EXPERIMENTALES',
      description: 'Données de croissance du riz sur sols salés amendés',
      tags: ['données', 'riz', 'salinité', 'Mbane'],
      isPublic: false,
      ownerId: babacarKane.id,
      projectId: projetSantesTerritoires.id,
      activityId: actSolsSales.id,
    },
  });

  const doc4 = await prisma.document.create({
    data: {
      title: 'Rapport test herbicide oignon 2024-2025',
      filename: 'rapport_herbicide_oignon_2024_2025.pdf',
      filepath: '/documents/rapports/rapport_herbicide_oignon_2024_2025.pdf',
      mimeType: 'application/pdf',
      size: BigInt(2100000),
      type: 'RAPPORT',
      description: 'Rapport d\'efficacité du glufosinate-ammonium sur oignon',
      tags: ['herbicide', 'oignon', 'rapport', 'efficacité'],
      isPublic: false,
      ownerId: rahimiMballo.id,
      activityId: actTestHerbicide.id,
    },
  });

  const doc5 = await prisma.document.create({
    data: {
      title: 'Carte de fertilité des sols - VFS',
      filename: 'carte_fertilite_sols_vfs_2022.pdf',
      filepath: '/documents/cartes/carte_fertilite_sols_vfs_2022.pdf',
      mimeType: 'application/pdf',
      size: BigInt(5200000),
      type: 'AUTRE',
      description: 'Carte de fertilité des sols de la vallée du fleuve Sénégal',
      tags: ['carte', 'fertilité', 'sols', 'VFS'],
      isPublic: true,
      ownerId: mameFarmaNdiaye.id,
      projectId: projetCIRAWA.id
    },
  });

  // === PARTAGE DE DOCUMENTS ===
  
  await prisma.documentShare.createMany({
    data: [
      {
        documentId: doc1.id,
        sharedWithId: djibrilTall.id,
        canEdit: true,
        canDelete: false,
      },
      {
        documentId: doc1.id,
        sharedWithId: babacarKane.id,
        canEdit: false,
        canDelete: false,
      },
      {
        documentId: doc3.id,
        sharedWithId: mameFarmaNdiaye.id,
        canEdit: false,
        canDelete: false,
      },
      {
        documentId: doc3.id,
        sharedWithId: moussaDieng.id,
        canEdit: false,
        canDelete: false,
      },
      {
        documentId: doc4.id,
        sharedWithId: djibrilTall.id,
        canEdit: true,
        canDelete: false,
      },
    ],
  });

  // === FORMULAIRES ===
  
  console.log('📝 Création des formulaires...');
  
  const form1 = await prisma.form.create({
    data: {
      title: 'Fiche de collecte - Données agronomiques riz SRI',
      description: 'Formulaire pour la collecte des données agronomiques des parcelles SRI',
      schema: {
        type: 'object',
        properties: {
          producteur: {
            type: 'string',
            title: 'Nom du producteur'
          },
          village: {
            type: 'string',
            title: 'Village'
          },
          parcelle: {
            type: 'string',
            title: 'Code parcelle'
          },
          variete: {
            type: 'string',
            title: 'Variété hybride',
            enum: ['Hybride 1', 'Hybride 2', 'Hybride 3', 'Témoin local']
          },
          date_observation: {
            type: 'string',
            format: 'date',
            title: 'Date d\'observation'
          },
          hauteur_plant: {
            type: 'number',
            title: 'Hauteur moyenne des plants (cm)'
          },
          nombre_talles: {
            type: 'integer',
            title: 'Nombre moyen de talles par plant'
          },
          nombre_panicules: {
            type: 'integer',
            title: 'Nombre de panicules par m²'
          },
          observations: {
            type: 'string',
            title: 'Observations particulières'
          }
        },
        required: ['producteur', 'village', 'parcelle', 'variete', 'date_observation']
      },
      isActive: true,
      creatorId: djibrilTall.id,
      activityId: actSRI.id,
    },
  });

  const form2 = await prisma.form.create({
    data: {
      title: 'Fiche d\'évaluation participative blé',
      description: 'Formulaire pour l\'évaluation des variétés de blé par les producteurs',
      schema: {
        type: 'object',
        properties: {
          producteur: {
            type: 'string',
            title: 'Nom du producteur'
          },
          village: {
            type: 'string',
            title: 'Village',
            enum: ['Thiagar', 'Thiago', 'Fanaye', 'Dara Alaybé']
          },
          variete_preferee: {
            type: 'string',
            title: 'Variété préférée',
            enum: ['Hamat', 'Haby', 'Misr', 'Variant', 'Massara', 'Giza', 'Karim', 'Jawhar']
          },
          criteres_choix: {
            type: 'array',
            title: 'Critères de choix',
            items: {
              type: 'string',
              enum: ['Rendement', 'Précocité', 'Résistance maladies', 'Qualité grain', 'Hauteur', 'Facilité battage']
            }
          },
          note_globale: {
            type: 'integer',
            title: 'Note globale (1-10)',
            minimum: 1,
            maximum: 10
          },
          commentaires: {
            type: 'string',
            title: 'Commentaires'
          }
        },
        required: ['producteur', 'village', 'variete_preferee', 'criteres_choix']
      },
      isActive: true,
      creatorId: amadouSall.id,
      activityId: actDiffusionBle.id,
    },
  });

  const form3 = await prisma.form.create({
    data: {
      title: 'Fiche de suivi salinité Mbane',
      description: 'Suivi de la conductivité électrique et du pH des sols',
      schema: {
        type: 'object',
        properties: {
          parcelle: {
            type: 'string',
            title: 'Code parcelle'
          },
          traitement: {
            type: 'string',
            title: 'Traitement appliqué',
            enum: ['T0 - Témoin', 'T1 - Compost + Phosphogypse + Travail sol', 'T2 - Compost + Travail sol']
          },
          date_mesure: {
            type: 'string',
            format: 'date',
            title: 'Date de mesure'
          },
          profondeur: {
            type: 'string',
            title: 'Profondeur prélèvement',
            enum: ['0-10 cm', '10-30 cm']
          },
          ce_sol: {
            type: 'number',
            title: 'Conductivité électrique (µS/cm)'
          },
          ph_sol: {
            type: 'number',
            title: 'pH du sol'
          },
          observations: {
            type: 'string',
            title: 'Observations'
          }
        },
        required: ['parcelle', 'traitement', 'date_mesure', 'profondeur', 'ce_sol', 'ph_sol']
      },
      isActive: true,
      creatorId: babacarKane.id,
      activityId: actSolsSales.id,
    },
  });

  // === RÉPONSES AUX FORMULAIRES ===
  
  await prisma.formResponse.createMany({
    data: [
      {
        formId: form1.id,
        respondentId: djibrilTall.id,
        data: {
          producteur: 'Mamadou Diallo',
          village: 'Fanaye',
          parcelle: 'P001',
          variete: 'Hybride 1',
          date_observation: '2025-02-15',
          hauteur_plant: 95,
          nombre_talles: 12,
          nombre_panicules: 280,
          observations: 'Bonne vigueur, tallage précoce'
        },
      },
      {
        formId: form2.id,
        respondentId: amadouSall.id,
        data: {
          producteur: 'Ousmane Ba',
          village: 'Thiagar',
          variete_preferee: 'Jawhar',
          criteres_choix: ['Rendement', 'Précocité', 'Qualité grain'],
          note_globale: 9,
          commentaires: 'Très bon comportement, maturité rapide et grains de bonne qualité'
        },
      },
      {
        formId: form2.id,
        respondentId: amadouSall.id,
        data: {
          producteur: 'Fatou Seck',
          village: 'Fanaye',
          variete_preferee: 'Karim',
          criteres_choix: ['Rendement', 'Résistance maladies', 'Facilité battage'],
          note_globale: 8,
          commentaires: 'Bon rendement, résiste bien aux maladies'
        },
      },
      {
        formId: form3.id,
        respondentId: babacarKane.id,
        data: {
          parcelle: 'MBN-T1-R1',
          traitement: 'T1 - Compost + Phosphogypse + Travail sol',
          date_mesure: '2024-11-15',
          profondeur: '0-10 cm',
          ce_sol: 850,
          ph_sol: 6.8,
          observations: 'Réduction notable de la salinité par rapport au témoin'
        },
      },
      {
        formId: form3.id,
        respondentId: babacarKane.id,
        data: {
          parcelle: 'MBN-T0-R1',
          traitement: 'T0 - Témoin',
          date_mesure: '2024-11-15',
          profondeur: '0-10 cm',
          ce_sol: 1850,
          ph_sol: 7.9,
          observations: 'Salinité élevée, témoins de référence'
        },
      },
    ],
  });

  // === SÉMINAIRES ===
  
  console.log('🎓 Création des séminaires...');
  
  const seminar1 = await prisma.seminar.create({
    data: {
      title: 'Atelier de formation sur les Bonnes Pratiques Agricoles du blé',
      description: 'Formation des producteurs et techniciens sur les techniques de production du blé',
      location: 'Station de Fanaye',
      startDate: new Date('2025-09-15T08:00:00'),
      endDate: new Date('2025-09-15T17:00:00'),
      status: 'PLANIFIE',
      agenda: 'Présentation des variétés - Techniques culturales - Production de semences - Pratiques terrain',
      maxParticipants: 40,
      organizerId: amadouSall.id,
    },
  });

  const seminar2 = await prisma.seminar.create({
    data: {
      title: 'Formation sur le Système de Riziculture Intensive (SRI)',
      description: 'Renforcement des capacités des producteurs sur les techniques SRI avec hybrides',
      location: 'Salle de conférences CRA Saint-Louis',
      startDate: new Date('2025-03-10T08:30:00'),
      endDate: new Date('2025-03-11T16:00:00'),
      status: 'PLANIFIE',
      agenda: 'Introduction au SRI - Avantages des hybrides F1 - Démonstration pratique - Échanges',
      maxParticipants: 50,
      organizerId: omarFaye.id,
    },
  });

  const seminar3 = await prisma.seminar.create({
    data: {
      title: 'Journée blé - FIARA 2024',
      description: 'Panel et exposition sur la culture du blé au Sénégal',
      location: 'CICES Dakar',
      startDate: new Date('2024-05-15T09:00:00'),
      endDate: new Date('2024-05-15T18:00:00'),
      status: 'TERMINE',
      agenda: 'Panel discussion - Dégustation produits dérivés - Exposition variétés',
      maxParticipants: 200,
      organizerId: amadouSall.id,
    },
  });

  const seminar4 = await prisma.seminar.create({
    data: {
      title: 'Atelier de restitution - Sols salés Mbane',
      description: 'Partage des résultats de l\'expérimentation sur la récupération des sols salés',
      location: 'Mbane',
      startDate: new Date('2025-03-20T09:00:00'),
      endDate: new Date('2025-03-20T13:00:00'),
      status: 'PLANIFIE',
      agenda: 'Présentation résultats - Discussion avec producteurs - Recommandations',
      maxParticipants: 30,
      organizerId: moussaDieng.id,
    },
  });

  // === PARTICIPANTS AUX SÉMINAIRES ===
  
  await prisma.seminarParticipant.createMany({
    data: [
      {
        seminarId: seminar1.id,
        participantId: babacarKane.id,
        attendedAt: null,
      },
      {
        seminarId: seminar1.id,
        participantId: djibrilTall.id,
        attendedAt: null,
      },
      {
        seminarId: seminar2.id,
        participantId: rahimiMballo.id,
        attendedAt: null,
      },
      {
        seminarId: seminar2.id,
        participantId: djibrilTall.id,
        attendedAt: null,
      },
      {
        seminarId: seminar2.id,
        participantId: babacarKane.id,
        attendedAt: null,
      },
      {
        seminarId: seminar3.id,
        participantId: amadouSall.id,
        attendedAt: new Date('2024-05-15T09:30:00'),
      },
      {
        seminarId: seminar3.id,
        participantId: mameFarmaNdiaye.id,
        attendedAt: new Date('2024-05-15T09:30:00'),
      },
      {
        seminarId: seminar4.id,
        participantId: babacarKane.id,
        attendedAt: null,
      },
      {
        seminarId: seminar4.id,
        participantId: mameFarmaNdiaye.id,
        attendedAt: null,
      },
    ],
  });

  // === COMMENTAIRES ===
  
  console.log('💬 Création des commentaires...');
  
  await prisma.comment.createMany({
    data: [
      {
        content: 'Excellent travail sur la sélection des producteurs. Les critères définis sont pertinents.',
        authorId: mameFarmaNdiaye.id,
        projectId: projetSRI.id,
        activityId: actSRI.id,
      },
      {
        content: 'Les résultats préliminaires de Mbane sont très encourageants. On observe une réduction de 50% de la CE avec le traitement T1.',
        authorId: babacarKane.id,
        projectId: projetSantesTerritoires.id,
        activityId: actSolsSales.id,
      },
      {
        content: 'Les producteurs sont très intéressés par la variété Jawhar. À prévoir une augmentation de la production de semences.',
        authorId: amadouSall.id,
        projectId: projetBle.id,
        activityId: actDiffusionBle.id,
      },
      {
        content: 'Besoin de renforcer la formation sur l\'identification des adventices avant l\'application des herbicides.',
        authorId: rahimiMballo.id,
        activityId: actTestHerbicide.id,
      },
      {
        content: 'Les données de télédétection montrent une accélération de la déforestation dans la zone du Parc de Djoudj entre 2013 et 2023.',
        authorId: moussaDieng.id,
        activityId: actZoonoses.id,
      },
    ],
  });

  // === NOTIFICATIONS ===
  
  console.log('🔔 Création des notifications...');
  
  await prisma.notification.createMany({
    data: [
      {
        title: 'Nouvelle tâche assignée',
        message: 'Vous avez été assigné à la tâche "Formation des producteurs au SRI"',
        type: 'task_assigned',
        isRead: false,
        senderId: omarFaye.id,
        receiverId: babacarKane.id,
        entityType: 'task',
        entityId: '3',
        actionUrl: '/tasks/3',
      },
      {
        title: 'Séminaire à venir',
        message: 'Rappel: Formation SRI dans 30 jours',
        type: 'seminar_reminder',
        isRead: false,
        senderId: admin.id,
        receiverId: omarFaye.id,
        entityType: 'seminar',
        entityId: seminar2.id,
        actionUrl: `/seminars/${seminar2.id}`,
      },
      {
        title: 'Document partagé',
        message: 'Le document "Protocole SRI avec hybrides F1" a été partagé avec vous',
        type: 'document_shared',
        isRead: true,
        readAt: new Date('2024-11-20T10:30:00'),
        senderId: omarFaye.id,
        receiverId: djibrilTall.id,
        entityType: 'document',
        entityId: doc1.id,
        actionUrl: `/documents/${doc1.id}`,
      },
      {
        title: 'Projet mis à jour',
        message: 'Le projet "Diffusion des hybrides F1" a été mis à jour',
        type: 'project_update',
        isRead: false,
        senderId: omarFaye.id,
        receiverId: djibrilTall.id,
        entityType: 'project',
        entityId: projetSRI.id,
        actionUrl: `/projects/${projetSRI.id}`,
      },
      {
        title: 'Tâche en retard',
        message: 'La tâche "Préparation du terrain expérimental" est en retard',
        type: 'task_overdue',
        isRead: false,
        senderId: admin.id,
        receiverId: babacarKane.id,
        entityType: 'task',
        entityId: '6',
        actionUrl: '/tasks/6',
      },
      {
        title: 'Atelier de restitution planifié',
        message: 'Un atelier de restitution des résultats Mbane est prévu le 20 mars 2025',
        type: 'seminar_reminder',
        isRead: false,
        senderId: moussaDieng.id,
        receiverId: babacarKane.id,
        entityType: 'seminar',
        entityId: seminar4.id,
        actionUrl: `/seminars/${seminar4.id}`,
      },
    ],
  });

  // === LOGS D'AUDIT ===
  
  console.log('📊 Création des logs d\'audit...');
  
  await prisma.auditLog.createMany({
    data: [
      {
        action: 'LOGIN',
        level: 'INFO',
        userId: mameFarmaNdiaye.id,
        entityType: 'user',
        entityId: mameFarmaNdiaye.id,
        details: {
          title: 'Connexion utilisateur',
          description: 'Connexion réussie'
        },
        metadata: {
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0',
          source: 'web_app'
        },
      },
      {
        action: 'CREATE',
        level: 'INFO',
        userId: omarFaye.id,
        entityType: 'project',
        entityId: projetSRI.id,
        details: {
          title: 'Création projet',
          description: 'Nouveau projet créé: Diffusion des hybrides F1 de riz irrigué'
        },
        metadata: {
          ip: '192.168.1.101',
          source: 'web_app'
        },
      },
      {
        action: 'UPDATE',
        level: 'INFO',
        userId: babacarKane.id,
        entityType: 'task',
        entityId: '7',
        details: {
          title: 'Mise à jour tâche',
          description: 'Progression mise à jour: 60%'
        },
        changes: {
          before: { progress: 40 },
          after: { progress: 60 },
          fields: ['progress']
        },
        metadata: {
          ip: '192.168.1.102',
          source: 'web_app'
        },
      },
      {
        action: 'CREATE',
        level: 'INFO',
        userId: amadouSall.id,
        entityType: 'document',
        entityId: doc2.id,
        details: {
          title: 'Upload document',
          description: 'Guide de production du blé uploadé'
        },
        metadata: {
          ip: '192.168.1.103',
          source: 'web_app',
          fileSize: '2.8 MB'
        },
      },
      {
        action: 'SHARE',
        level: 'INFO',
        userId: omarFaye.id,
        entityType: 'document',
        entityId: doc1.id,
        details: {
          title: 'Partage document',
          description: 'Document partagé avec équipe SRI'
        },
        metadata: {
          ip: '192.168.1.101',
          source: 'web_app',
          sharedWith: djibrilTall.id
        },
      },
      {
        action: 'FORM_SUBMIT',
        level: 'INFO',
        userId: babacarKane.id,
        entityType: 'form',
        entityId: form3.id,
        details: {
          title: 'Soumission formulaire',
          description: 'Données salinité soumises pour parcelle MBN-T1-R1'
        },
        metadata: {
          ip: '192.168.1.102',
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
          backupSize: '180MB'
        },
      },
    ],
  });

  console.log('✅ Seeding terminé avec succès !');
  console.log('');
  console.log('📊 Résumé des données créées :');
  console.log(`📋 Plans stratégiques: ${await prisma.strategicPlan.count()}`);
  console.log(`🎯 Axes stratégiques: ${await prisma.strategicAxis.count()}`);
  console.log(`📌 Sous-axes: ${await prisma.strategicSubAxis.count()}`);
  console.log(`🔬 Programmes de recherche: ${await prisma.researchProgram.count()}`);
  console.log(`🧪 Thèmes de recherche: ${await prisma.researchTheme.count()}`);
  console.log(`🏢 Stations de recherche: ${await prisma.researchStation.count()}`);
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
  console.log('🔬 Dr Mame Farma Ndiaye: mame.ndiaye@cra-saintlouis.sn / password123');
  console.log('🔬 Dr Omar Ndaw Faye: omar.faye@cra-saintlouis.sn / password123');
  console.log('🔬 Dr Moussa Dieng: moussa.dieng@cra-saintlouis.sn / password123');
  console.log('🔬 Dr Amadou Tidiane Sall: amadou.sall@cra-saintlouis.sn / password123');
  console.log('🔬 Dr Rahimi Mballo: rahimi.mballo@cra-saintlouis.sn / password123');
  console.log('🔬 Dr Mame Sokhna Sarr: sokhna.sarr@cra-saintlouis.sn / password123');
  console.log('🎓 Babacar Kane (Ingénieur): babacar.kane@cra-saintlouis.sn / password123');
  console.log('🎓 Djibril Tall (Assistant): djibril.tall@cra-saintlouis.sn / password123');
  console.log('🔧 Sokhna Seck (Technicien): sokhna.seck@cra-saintlouis.sn / password123');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });