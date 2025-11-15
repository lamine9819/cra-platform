export declare class ReportGenerator {
    generatePublicationReport(researcherId: string, year: number, format?: 'pdf' | 'docx'): Promise<string>;
    private generatePDFReport;
    private generateWordReport;
    private formatAuthors;
    private groupByType;
    private calculateStats;
    private getTypeLabel;
}
export declare const reportGenerator: ReportGenerator;
//# sourceMappingURL=reportGenerator.d.ts.map