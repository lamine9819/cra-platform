export declare class IndividualProfileService {
    /**
     * Générer le document de fiche individuelle
     */
    generateIndividualProfileDocument(userId: string, format?: 'pdf' | 'word'): Promise<{
        buffer: Buffer;
        matricule: string;
    }>;
    /**
     * Générer une fiche individuelle en PDF
     */
    private generatePDFFicheIndividuelle;
    /**
     * Générer une fiche individuelle en Word (DOCX)
     */
    /**
   * Générer une fiche individuelle en Word (DOCX)
   */
    private generateWordFicheIndividuelle;
    /**
     * Créer une ligne de tableau pour la répartition du temps (Word)
     */
    private createTimeRow;
    /**
     * Formater une date au format DD/MM/YYYY
     */
    private formatDate;
}
//# sourceMappingURL=individualProfile.service.d.ts.map