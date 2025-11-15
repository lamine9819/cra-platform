export interface ActivityReportData {
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
    justificatifs?: string;
    objectifs: string;
    methodologie?: string;
    applicationRecommandationsCST?: string;
    contraintes?: string;
    resultatsObtenus?: string;
    modeTransfertAcquis?: string;
    equipeRecherche: Array<{
        chercheur: string;
        grade: string;
        discipline: string;
        institution: string;
        laboratoire: string;
        tempsEnPourcent: number;
    }>;
    autresRessourcesHumaines?: Array<{
        nom: string;
        grade: string;
        discipline: string;
        tempsEnPourcent: number;
    }>;
    institutionsPartenaires: Array<{
        institution: string;
        budgetAlloue: number;
    }>;
    ressourcesFinancieres: Array<{
        bailleurFonds: string;
        montantFinancement: number;
    }>;
    budgetTotalAnnee?: number;
    lifecycleStatus: 'NOUVELLE' | 'RECONDUITE' | 'CLOTUREE';
    isReconduite: boolean;
}
//# sourceMappingURL=report.types.d.ts.map