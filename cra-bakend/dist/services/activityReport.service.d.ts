export declare class ActivityReportService {
    generateActivityReport(activityId: string, userId: string, userRole: string, format: 'pdf' | 'word'): Promise<Buffer>;
    private prepareReportData;
    private mapActivityTypeToRecherche;
    private generateJustificatifs;
    private extractRecommandations;
    private extractContraintes;
    private generateModeTransfert;
    private checkReportAccess;
}
//# sourceMappingURL=activityReport.service.d.ts.map