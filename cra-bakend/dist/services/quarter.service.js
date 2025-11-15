"use strict";
// src/services/quarter.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.quarterService = exports.QuarterService = void 0;
const reports_types_1 = require("../types/reports.types");
class QuarterService {
    /**
     * Obtient le trimestre actuel
     */
    getCurrentQuarter() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        let quarter;
        if (month >= 1 && month <= 3)
            quarter = reports_types_1.Quarter.Q1;
        else if (month >= 4 && month <= 6)
            quarter = reports_types_1.Quarter.Q2;
        else if (month >= 7 && month <= 9)
            quarter = reports_types_1.Quarter.Q3;
        else
            quarter = reports_types_1.Quarter.Q4;
        return this.getQuarterPeriod(year, quarter);
    }
    /**
     * Obtient les dates de début et fin d'un trimestre
     */
    getQuarterPeriod(year, quarter) {
        let startMonth;
        let endMonth;
        switch (quarter) {
            case reports_types_1.Quarter.Q1:
                startMonth = 0; // Janvier
                endMonth = 2; // Mars
                break;
            case reports_types_1.Quarter.Q2:
                startMonth = 3; // Avril
                endMonth = 5; // Juin
                break;
            case reports_types_1.Quarter.Q3:
                startMonth = 6; // Juillet
                endMonth = 8; // Septembre
                break;
            case reports_types_1.Quarter.Q4:
                startMonth = 9; // Octobre
                endMonth = 11; // Décembre
                break;
        }
        const startDate = new Date(year, startMonth, 1);
        const endDate = new Date(year, endMonth + 1, 0, 23, 59, 59);
        return {
            quarter,
            year,
            startDate,
            endDate,
            label: `T${quarter} ${year}`
        };
    }
    /**
     * Obtient tous les trimestres d'une année
     */
    getYearQuarters(year) {
        return [
            this.getQuarterPeriod(year, reports_types_1.Quarter.Q1),
            this.getQuarterPeriod(year, reports_types_1.Quarter.Q2),
            this.getQuarterPeriod(year, reports_types_1.Quarter.Q3),
            this.getQuarterPeriod(year, reports_types_1.Quarter.Q4)
        ];
    }
    /**
     * Obtient le trimestre précédent
     */
    getPreviousQuarter(year, quarter) {
        if (quarter === reports_types_1.Quarter.Q1) {
            return this.getQuarterPeriod(year - 1, reports_types_1.Quarter.Q4);
        }
        return this.getQuarterPeriod(year, (quarter - 1));
    }
    /**
     * Obtient le trimestre suivant
     */
    getNextQuarter(year, quarter) {
        if (quarter === reports_types_1.Quarter.Q4) {
            return this.getQuarterPeriod(year + 1, reports_types_1.Quarter.Q1);
        }
        return this.getQuarterPeriod(year, (quarter + 1));
    }
    /**
     * Vérifie si une date est dans un trimestre donné
     */
    isDateInQuarter(date, year, quarter) {
        const period = this.getQuarterPeriod(year, quarter);
        return date >= period.startDate && date <= period.endDate;
    }
    /**
     * Obtient le trimestre d'une date donnée
     */
    getQuarterFromDate(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        let quarter;
        if (month >= 1 && month <= 3)
            quarter = reports_types_1.Quarter.Q1;
        else if (month >= 4 && month <= 6)
            quarter = reports_types_1.Quarter.Q2;
        else if (month >= 7 && month <= 9)
            quarter = reports_types_1.Quarter.Q3;
        else
            quarter = reports_types_1.Quarter.Q4;
        return this.getQuarterPeriod(year, quarter);
    }
    /**
     * Formate le label du trimestre
     */
    formatQuarterLabel(year, quarter) {
        const quarterNames = {
            [reports_types_1.Quarter.Q1]: 'Premier trimestre',
            [reports_types_1.Quarter.Q2]: 'Deuxième trimestre',
            [reports_types_1.Quarter.Q3]: 'Troisième trimestre',
            [reports_types_1.Quarter.Q4]: 'Quatrième trimestre'
        };
        return `${quarterNames[quarter]} ${year}`;
    }
    /**
     * Obtient la période de dates pour le rapport
     */
    getReportPeriod(filters) {
        // Si des dates personnalisées sont spécifiées, les utiliser
        if (filters.startDate && filters.endDate) {
            return {
                startDate: new Date(filters.startDate),
                endDate: new Date(filters.endDate),
                label: `Du ${new Date(filters.startDate).toLocaleDateString('fr-FR')} au ${new Date(filters.endDate).toLocaleDateString('fr-FR')}`
            };
        }
        // Sinon, utiliser le trimestre spécifié ou le trimestre actuel
        const quarter = filters.quarter || this.getCurrentQuarter().quarter;
        const period = this.getQuarterPeriod(filters.year, quarter);
        return {
            startDate: period.startDate,
            endDate: period.endDate,
            label: this.formatQuarterLabel(filters.year, quarter)
        };
    }
}
exports.QuarterService = QuarterService;
exports.quarterService = new QuarterService();
//# sourceMappingURL=quarter.service.js.map