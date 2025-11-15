"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityReportService = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../utils/errors");
const pdfGenerator_1 = require("../utils/pdfGenerator");
const wordGenerator_1 = require("../utils/wordGenerator");
const prisma = new client_1.PrismaClient();
class ActivityReportService {
    async generateActivityReport(activityId, userId, userRole, format) {
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
            throw new errors_1.ValidationError('Activité non trouvée');
        }
        // Vérifier les droits d'accès
        const hasAccess = this.checkReportAccess(activity, userId, userRole);
        if (!hasAccess) {
            throw new errors_1.AuthError('Accès refusé pour générer ce rapport');
        }
        // Préparer les données du rapport
        const reportData = await this.prepareReportData(activity);
        // Générer le document selon le format
        if (format === 'pdf') {
            return await (0, pdfGenerator_1.generatePDF)(reportData);
        }
        else {
            return await (0, wordGenerator_1.generateWord)(reportData);
        }
    }
    async prepareReportData(activity) {
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
        const participantsEquipe = await Promise.all(activity.participants.map(async (p) => {
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
        }));
        // Combiner le responsable et les participants (responsable en premier)
        const equipeRecherche = [responsableEquipe, ...participantsEquipe];
        // Préparer les partenaires
        const institutionsPartenaires = activity.partnerships.map((p) => ({
            institution: p.partner.name,
            budgetAlloue: 0 // À calculer si vous avez cette info
        }));
        // Préparer les financements
        const ressourcesFinancieres = activity.fundings.map((f) => ({
            bailleurFonds: f.fundingSource,
            montantFinancement: f.requestedAmount || f.approvedAmount || 0
        }));
        // Calculer le budget total
        const budgetTotal = ressourcesFinancieres.reduce((sum, r) => sum + r.montantFinancement, 0);
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
    mapActivityTypeToRecherche(type) {
        const mapping = {
            'RECHERCHE_EXPERIMENTALE': 'RD',
            'RECHERCHE_DEVELOPPEMENT': 'RD',
            'PRODUCTION_SEMENCES': 'Production',
            'FORMATION_DISPENSEE': 'Formation',
            'FORMATION_RECUE': 'Formation',
            'AUTRE': 'Autre'
        };
        return mapping[type] || 'RD';
    }
    generateJustificatifs(activity) {
        // Générer automatiquement ou récupérer depuis un champ dédié
        return `Cette activité s'inscrit dans le cadre du ${activity.theme.program?.name || 'programme de recherche'} et vise à répondre aux objectifs stratégiques définis.`;
    }
    extractRecommandations(activity) {
        // À extraire depuis l'historique de reconduction
        return 'Application des recommandations du CST de l\'année précédente.';
    }
    extractContraintes(activity) {
        if (activity.constraints && activity.constraints.length > 0) {
            return activity.constraints.join(', ');
        }
        return 'Aucune contrainte majeure identifiée.';
    }
    generateModeTransfert(activity) {
        const modes = [];
        if (activity.transferMethods && activity.transferMethods.length > 0) {
            modes.push(...activity.transferMethods);
        }
        return modes.length > 0
            ? modes.join(', ')
            : 'Fiches techniques, Rapports d\'étude';
    }
    checkReportAccess(activity, userId, userRole) {
        if (userRole === 'ADMINISTRATEUR')
            return true;
        if (activity.responsibleId === userId)
            return true;
        if (userRole === 'COORDONATEUR_PROJET' && activity.project?.creatorId === userId)
            return true;
        return false;
    }
}
exports.ActivityReportService = ActivityReportService;
//# sourceMappingURL=activityReport.service.js.map