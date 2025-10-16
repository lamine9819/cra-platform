// src/services/quarter.service.ts

import { Quarter, QuarterPeriod } from '../types/reports.types';
import { GenerateReportInput } from '../utils/report.validation';

export class QuarterService {
  /**
   * Obtient le trimestre actuel
   */
  getCurrentQuarter(): QuarterPeriod {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    let quarter: Quarter;
    if (month >= 1 && month <= 3) quarter = Quarter.Q1;
    else if (month >= 4 && month <= 6) quarter = Quarter.Q2;
    else if (month >= 7 && month <= 9) quarter = Quarter.Q3;
    else quarter = Quarter.Q4;

    return this.getQuarterPeriod(year, quarter);
  }

  /**
   * Obtient les dates de début et fin d'un trimestre
   */
  getQuarterPeriod(year: number, quarter: Quarter): QuarterPeriod {
    let startMonth: number;
    let endMonth: number;

    switch (quarter) {
      case Quarter.Q1:
        startMonth = 0; // Janvier
        endMonth = 2;   // Mars
        break;
      case Quarter.Q2:
        startMonth = 3; // Avril
        endMonth = 5;   // Juin
        break;
      case Quarter.Q3:
        startMonth = 6; // Juillet
        endMonth = 8;   // Septembre
        break;
      case Quarter.Q4:
        startMonth = 9;  // Octobre
        endMonth = 11;   // Décembre
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
  getYearQuarters(year: number): QuarterPeriod[] {
    return [
      this.getQuarterPeriod(year, Quarter.Q1),
      this.getQuarterPeriod(year, Quarter.Q2),
      this.getQuarterPeriod(year, Quarter.Q3),
      this.getQuarterPeriod(year, Quarter.Q4)
    ];
  }

  /**
   * Obtient le trimestre précédent
   */
  getPreviousQuarter(year: number, quarter: Quarter): QuarterPeriod {
    if (quarter === Quarter.Q1) {
      return this.getQuarterPeriod(year - 1, Quarter.Q4);
    }
    return this.getQuarterPeriod(year, (quarter - 1) as Quarter);
  }

  /**
   * Obtient le trimestre suivant
   */
  getNextQuarter(year: number, quarter: Quarter): QuarterPeriod {
    if (quarter === Quarter.Q4) {
      return this.getQuarterPeriod(year + 1, Quarter.Q1);
    }
    return this.getQuarterPeriod(year, (quarter + 1) as Quarter);
  }

  /**
   * Vérifie si une date est dans un trimestre donné
   */
  isDateInQuarter(date: Date, year: number, quarter: Quarter): boolean {
    const period = this.getQuarterPeriod(year, quarter);
    return date >= period.startDate && date <= period.endDate;
  }

  /**
   * Obtient le trimestre d'une date donnée
   */
  getQuarterFromDate(date: Date): QuarterPeriod {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    let quarter: Quarter;
    if (month >= 1 && month <= 3) quarter = Quarter.Q1;
    else if (month >= 4 && month <= 6) quarter = Quarter.Q2;
    else if (month >= 7 && month <= 9) quarter = Quarter.Q3;
    else quarter = Quarter.Q4;

    return this.getQuarterPeriod(year, quarter);
  }

  /**
   * Formate le label du trimestre
   */
  formatQuarterLabel(year: number, quarter: Quarter): string {
    const quarterNames = {
      [Quarter.Q1]: 'Premier trimestre',
      [Quarter.Q2]: 'Deuxième trimestre',
      [Quarter.Q3]: 'Troisième trimestre',
      [Quarter.Q4]: 'Quatrième trimestre'
    };
    return `${quarterNames[quarter]} ${year}`;
  }

  /**
   * Obtient la période de dates pour le rapport
   */
  getReportPeriod(filters: GenerateReportInput): { startDate: Date; endDate: Date; label: string } {
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

export const quarterService = new QuarterService();