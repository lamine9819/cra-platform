import { ProjectResponse } from '../types/project.types';
type ProjectData = ProjectResponse;
export declare class ReportGeneratorService {
    /**
     * Génère un rapport PDF
     */
    generatePDF(projectData: ProjectData, sections: string[]): Promise<Buffer>;
    private addPDFSection;
    /**
     * Génère un rapport Word
     */
    generateWord(projectData: ProjectData, sections: string[]): Promise<Buffer>;
}
export {};
//# sourceMappingURL=reportGenerator.service.d.ts.map