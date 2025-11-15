export interface ActivityReport {
    intitule: string;
    responsables: string[];
    situation: 'Reconduite' | 'Nouvelle' | 'Cloturee';
    description?: string;
    startDate?: Date;
    endDate?: Date;
    quarter?: number;
    year?: number;
}
export interface ConventionReport {
    intitule: string;
    dateDebut: Date;
    dateFin: Date;
    financementGlobal: number;
    financementMobilise: number;
    bailleurs: string[];
    description?: string;
    quarter?: number;
    year?: number;
}
export interface KnowledgeTransferReport {
    intitule: string;
    dateDisponibilite: Date;
    description: string;
    impactPotentiel: string;
    cibles: string[];
    quarter?: number;
    year?: number;
}
export declare enum ReportFormat {
    PDF = "pdf",
    WORD = "docx"
}
export declare enum ReportType {
    ACTIVITIES = "activities",
    CONVENTIONS = "conventions",
    KNOWLEDGE_TRANSFERS = "knowledge_transfers"
}
export declare enum Quarter {
    Q1 = 1,// Janvier-Mars
    Q2 = 2,// Avril-Juin
    Q3 = 3,// Juillet-Septembre
    Q4 = 4
}
export interface QuarterPeriod {
    quarter: Quarter;
    year: number;
    startDate: Date;
    endDate: Date;
    label: string;
}
//# sourceMappingURL=reports.types.d.ts.map