import { UserRole } from '@prisma/client';
import { EventReportDto } from '../types/event.types';
export declare class ReportEventService {
    /**
     * Générer un rapport d'événements
     */
    generateEventReport(userId: string, userRole: UserRole, filters: EventReportDto): Promise<{
        filepath: string;
        filename: string;
    }>;
    /**
     * Générer un rapport PDF
     */
    private generatePDFReport;
    /**
     * Générer un rapport DOCX
     */
    private generateDOCXReport;
}
declare const _default: ReportEventService;
export default _default;
//# sourceMappingURL=reportEvent.service.d.ts.map