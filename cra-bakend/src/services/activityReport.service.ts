import { PrismaClient } from '@prisma/client';
import { ValidationError, AuthError } from '../utils/errors';
import { ActivityReportData } from '../types/report.types';
import { generatePDF } from '../utils/pdfGenerator';
import { generateWord } from '../utils/wordGenerator';

const prisma = new PrismaClient();

export class ActivityReportService {

  async generateActivityReport(
    activityId: string,
    userId: string,
    userRole: string,
    format: 'pdf' | 'word'
  ): Promise<Buffer> {
    // Récupérer l'activité avec toutes ses relations
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        theme: {
          include: {
            program: {
              include: {
                strategicSubAxis: {
                  include: {
                    strategicAxis: {
                      include: {
                        strategicPlan: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        responsible: true,
        station: true,
        participants: {
          where: { isActive: true },
          include: {
            user: true
          }
        },
        partnerships: {
          where: { isActive: true },
          include: {
            partner: true
          }
        },
        fundings: {
          include: {
            convention: true
          }
        },
        parentActivity: true
      }
    });

    if (!activity) {
      throw new ValidationError('Activité non trouvée');
    }

    // Vérifier les droits d'accès
    const hasAccess = this.checkReportAccess(activity, userId, userRole);
    if (!hasAccess) {
      throw new AuthError('Accès refusé pour générer ce rapport');
    }

    // Préparer les données du rapport
    const reportData = await this.prepareReportData(activity);

    // Générer le document selon le format
    if (format === 'pdf') {
      return await generatePDF(reportData);
    } else {
      return await generateWord(reportData);
    }
  }

  private async prepareReportData(activity: any): Promise<ActivityReportData> {
    // Récupérer les informations du profil du responsable pour le grade
    const responsibleProfile = await prisma.individualProfile.findUnique({
      where: { userId: activity.responsibleId }
    });

    // Préparer l'équipe de recherche - Ajouter le responsable en premier
    const responsableEquipe = {
      chercheur: `${activity.responsible.firstName} ${activity.responsible.lastName}`,
      grade: responsibleProfile?.grade || 'Non spécifié',
      discipline: activity.responsible.discipline || 'Non spécifiée',
      institution: 'ISRA',
      laboratoire: 'Responsable d\'activité',
      tempsEnPourcent: 100
    };

    const participantsEquipe = await Promise.all(
      activity.participants.map(async (p: any) => {
        const profile = await prisma.individualProfile.findUnique({
          where: { userId: p.userId }
        });

        return {
          chercheur: `${p.user.firstName} ${p.user.lastName}`,
          grade: profile?.grade || 'Non spécifié',
          discipline: p.user.discipline || p.expertise || 'Non spécifiée',
          institution: 'ISRA',
          laboratoire: p.responsibilities || 'Non spécifié',
          tempsEnPourcent: p.timeAllocation || 0
        };
      })
    );

    // Combiner le responsable et les participants (responsable en premier)
    const equipeRecherche = [responsableEquipe, ...participantsEquipe];

    // Préparer les partenaires
    const institutionsPartenaires = activity.partnerships.map((p: any) => ({
      institution: p.partner.name,
      budgetAlloue: 0 // À calculer si vous avez cette info
    }));

    // Préparer les financements
    const ressourcesFinancieres = activity.fundings.map((f: any) => ({
      bailleurFonds: f.fundingSource,
      montantFinancement: f.requestedAmount || f.approvedAmount || 0
    }));

    // Calculer le budget total
    const budgetTotal = ressourcesFinancieres.reduce(
      (sum: number, r: any) => sum + r.montantFinancement,
      0
    );

    return {
      // En-tête
      codeActivite: activity.code || undefined,
      centre: activity.station?.name || 'Saint-Louis',
      domaineActivite: activity.theme.name,
      codeCentre: 'CRA SL',
      typeRecherche: this.mapActivityTypeToRecherche(activity.type),
      dateDebut: activity.startDate ? new Date(activity.startDate).toLocaleDateString('fr-FR') : undefined,
      dateFin: activity.endDate ? new Date(activity.endDate).toLocaleDateString('fr-FR') : undefined,
      regionIntervention: activity.interventionRegion || undefined,
      planStrategique: activity.theme.program?.strategicSubAxis?.strategicAxis?.strategicPlan?.name || activity.strategicPlan || undefined,
      axe: activity.theme.program?.strategicSubAxis?.strategicAxis?.name || activity.strategicAxis || undefined,
      sousAxe: activity.theme.program?.strategicSubAxis?.name || activity.subAxis || undefined,
      programme: activity.theme.program?.name || undefined,
      theme: activity.theme.name,
      titreActivite: activity.title,
      responsableActivite: `${activity.responsible.firstName} ${activity.responsible.lastName}`,
      grade: responsibleProfile?.grade || 'CR',
      discipline: activity.responsible.discipline || 'Non spécifiée',

      // Justificatifs (pour nouvelle activité)
      justificatifs: activity.lifecycleStatus === 'NOUVELLE' ? this.generateJustificatifs(activity) : undefined,

      // Objectifs
      objectifs: activity.objectives.join('\n• '),

      // Méthodologie
      methodologie: activity.methodology || undefined,

      // Pour activité reconduite
      applicationRecommandationsCST: activity.lifecycleStatus === 'RECONDUITE' ? this.extractRecommandations(activity) : undefined,
      contraintes: activity.lifecycleStatus === 'RECONDUITE' ? this.extractContraintes(activity) : undefined,
      resultatsObtenus: activity.lifecycleStatus === 'RECONDUITE' ? activity.results : undefined,

      // Mode de transfert
      modeTransfertAcquis: this.generateModeTransfert(activity),

      // Équipe
      equipeRecherche,

      // Partenaires
      institutionsPartenaires,

      // Financements
      ressourcesFinancieres,

      // Budget
      budgetTotalAnnee: budgetTotal > 0 ? budgetTotal : undefined,

      // Statut du cycle de vie
      lifecycleStatus: activity.lifecycleStatus,

      // Rétrocompatibilité
      isReconduite: activity.isRecurrent
    };
  }

  private mapActivityTypeToRecherche(type: string): string {
    const mapping: Record<string, string> = {
      'RECHERCHE_EXPERIMENTALE': 'RD',
      'RECHERCHE_DEVELOPPEMENT': 'RD',
      'PRODUCTION_SEMENCES': 'Production',
      'FORMATION_DISPENSEE': 'Formation',
      'FORMATION_RECUE': 'Formation',
      'AUTRE': 'Autre'
    };
    return mapping[type] || 'RD';
  }

  private generateJustificatifs(activity: any): string {
    // Générer automatiquement ou récupérer depuis un champ dédié
    return `Cette activité s'inscrit dans le cadre du ${activity.theme.program?.name || 'programme de recherche'} et vise à répondre aux objectifs stratégiques définis.`;
  }

  private extractRecommandations(activity: any): string {
    // À extraire depuis l'historique de reconduction
    return 'Application des recommandations du CST de l\'année précédente.';
  }

  private extractContraintes(activity: any): string {
    if (activity.constraints && activity.constraints.length > 0) {
      return activity.constraints.join(', ');
    }
    return 'Aucune contrainte majeure identifiée.';
  }

  private generateModeTransfert(activity: any): string {
    const modes: string[] = [];
    
    if (activity.transferMethods && activity.transferMethods.length > 0) {
      modes.push(...activity.transferMethods);
    }

    return modes.length > 0 
      ? modes.join(', ') 
      : 'Fiches techniques, Rapports d\'étude';
  }

  private checkReportAccess(activity: any, userId: string, userRole: string): boolean {
    if (userRole === 'ADMINISTRATEUR' || userRole === 'COORDONATEUR_PROJET') return true;
    if (activity.responsibleId === userId) return true;
    
    return false;
  }
}