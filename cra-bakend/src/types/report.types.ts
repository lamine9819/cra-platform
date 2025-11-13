export interface ActivityReportData {
  // En-tête
  codeActivite?: string;
  centre: string;
  domaineActivite: string;
  codeCentre: string;
  typeRecherche: string;
  dateDebut?: string;
  dateFin?: string;
  regionIntervention?: string;
  planStrategique?: string;
  axe?: string;
  sousAxe?: string;
  programme?: string;
  theme: string;
  titreActivite: string;
  responsableActivite: string;
  grade: string;
  discipline: string;

  // Justificatifs (uniquement pour nouvelle activité)
  justificatifs?: string;

  // Objectifs
  objectifs: string;

  // Méthodologie
  methodologie?: string;

  // Pour activité reconduite
  applicationRecommandationsCST?: string;
  contraintes?: string;
  resultatsObtenus?: string;

  // Mode de transfert
  modeTransfertAcquis?: string;

  // Équipe de recherche
  equipeRecherche: Array<{
    chercheur: string;
    grade: string;
    discipline: string;
    institution: string;
    laboratoire: string;
    tempsEnPourcent: number;
  }>;

  // Autres ressources humaines (optionnel)
  autresRessourcesHumaines?: Array<{
    nom: string;
    grade: string;
    discipline: string;
    tempsEnPourcent: number;
  }>;

  // Institutions partenaires
  institutionsPartenaires: Array<{
    institution: string;
    budgetAlloue: number;
  }>;

  // Ressources financières
  ressourcesFinancieres: Array<{
    bailleurFonds: string;
    montantFinancement: number;
  }>;

  // Budget total
  budgetTotalAnnee?: number;

  // Statut du cycle de vie
  lifecycleStatus: 'NOUVELLE' | 'RECONDUITE' | 'CLOTUREE';

  // @deprecated - Utiliser lifecycleStatus à la place
  isReconduite: boolean;
}