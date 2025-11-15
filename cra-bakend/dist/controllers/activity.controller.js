"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityController = void 0;
const activity_service_1 = require("../services/activity.service");
const activityReport_service_1 = require("../services/activityReport.service");
const activityValidation_1 = require("../utils/activityValidation");
const activityService = new activity_service_1.ActivityService();
class ActivityController {
    constructor() {
        // ✅ Créer une activité CRA
        this.createActivity = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const validatedData = activityValidation_1.createActivitySchema.parse(req.body);
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const activity = await activityService.createActivity(validatedData, userId, userRole);
                res.status(201).json({
                    success: true,
                    message: 'Activité créée avec succès',
                    data: activity,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // ✅ Lister les activités avec filtres CRA
        this.listActivities = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const queryParams = activityValidation_1.activityListQuerySchema.parse(req.query);
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const result = await activityService.listActivities(userId, userRole, queryParams);
                res.status(200).json({
                    success: true,
                    data: result.activities,
                    pagination: result.pagination,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // ✅ Obtenir une activité par ID
        this.getActivityById = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const activity = await activityService.getActivityById(id, userId, userRole);
                res.status(200).json({
                    success: true,
                    data: activity,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // ✅ Mettre à jour une activité
        this.updateActivity = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const validatedData = activityValidation_1.updateActivitySchema.parse(req.body);
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const activity = await activityService.updateActivity(id, validatedData, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: 'Activité mise à jour avec succès',
                    data: activity,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // ✅ Supprimer une activité
        this.deleteActivity = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                await activityService.deleteActivity(id, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: 'Activité supprimée avec succès',
                });
            }
            catch (error) {
                next(error);
            }
        };
        // ✅ Obtenir les statistiques CRA
        this.getActivityStats = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const stats = await activityService.getActivityStats(userId, userRole);
                res.status(200).json({
                    success: true,
                    data: stats,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // ✅ Dupliquer une activité
        this.duplicateActivity = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const validatedData = activityValidation_1.duplicateActivitySchema.parse(req.body);
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const duplicatedActivity = await activityService.duplicateActivity(id, userId, userRole, validatedData.title);
                res.status(201).json({
                    success: true,
                    message: 'Activité dupliquée avec succès',
                    data: duplicatedActivity,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // ✅ Créer une reconduction d'activité
        this.createRecurrence = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const validatedData = activityValidation_1.activityRecurrenceSchema.parse(req.body);
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const newActivity = await activityService.createActivityRecurrence(id, userId, userRole, validatedData);
                res.status(201).json({
                    success: true,
                    message: 'Activité reconduite avec succès',
                    data: newActivity,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // ✅ Obtenir activités par thème
        this.getActivitiesByTheme = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { themeId } = req.params;
                const queryParams = activityValidation_1.activityListQuerySchema.parse(req.query);
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const result = await activityService.listActivities(userId, userRole, { ...queryParams, themeId });
                res.status(200).json({
                    success: true,
                    data: result.activities,
                    pagination: result.pagination,
                    meta: { themeId }
                });
            }
            catch (error) {
                next(error);
            }
        };
        // ✅ Obtenir activités par station
        this.getActivitiesByStation = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { stationId } = req.params;
                const queryParams = activityValidation_1.activityListQuerySchema.parse(req.query);
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const result = await activityService.listActivities(userId, userRole, { ...queryParams, stationId });
                res.status(200).json({
                    success: true,
                    data: result.activities,
                    pagination: result.pagination,
                    meta: { stationId }
                });
            }
            catch (error) {
                next(error);
            }
        };
        // ✅ Obtenir activités sans projet
        this.getActivitiesWithoutProject = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const queryParams = activityValidation_1.activityListQuerySchema.parse(req.query);
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const result = await activityService.listActivities(userId, userRole, { ...queryParams, withoutProject: true });
                res.status(200).json({
                    success: true,
                    data: result.activities,
                    pagination: result.pagination,
                    meta: { withoutProject: true }
                });
            }
            catch (error) {
                next(error);
            }
        };
        // ✅ Obtenir activités par responsable
        this.getActivitiesByResponsible = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { responsibleId } = req.params;
                const queryParams = activityValidation_1.activityListQuerySchema.parse(req.query);
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const result = await activityService.listActivities(userId, userRole, { ...queryParams, responsibleId });
                res.status(200).json({
                    success: true,
                    data: result.activities,
                    pagination: result.pagination,
                    meta: { responsibleId }
                });
            }
            catch (error) {
                next(error);
            }
        };
        // ✅ Obtenir historique des reconductions
        this.getActivityRecurrenceHistory = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                // Vérifier l'accès à l'activité
                await activityService.getActivityById(id, userId, userRole);
                // Obtenir l'historique des reconductions
                const recurrenceHistory = await prisma.activityRecurrence.findMany({
                    where: {
                        OR: [
                            { sourceActivityId: id },
                            { newActivityId: id }
                        ]
                    },
                    include: {
                        sourceActivity: {
                            select: {
                                id: true,
                                title: true,
                                code: true,
                                createdAt: true,
                                startDate: true,
                                endDate: true,
                                lifecycleStatus: true
                            }
                        },
                        newActivity: {
                            select: {
                                id: true,
                                title: true,
                                code: true,
                                createdAt: true,
                                startDate: true,
                                endDate: true,
                                lifecycleStatus: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                });
                // Transformer les données pour renvoyer les activités liées
                const activities = recurrenceHistory.map((rec) => {
                    // Si c'est l'activité source, on renvoie la nouvelle activité
                    // Si c'est la nouvelle activité, on renvoie l'activité source
                    const isSource = rec.sourceActivityId === id;
                    const relatedActivity = isSource ? rec.newActivity : rec.sourceActivity;
                    return {
                        id: relatedActivity.id,
                        title: relatedActivity.title,
                        code: relatedActivity.code,
                        startDate: relatedActivity.startDate,
                        endDate: relatedActivity.endDate,
                        status: relatedActivity.lifecycleStatus,
                        recurrenceReason: rec.reason,
                        recurrenceNotes: rec.notes,
                        recurrenceDate: rec.createdAt,
                        isSourceActivity: !isSource, // Si on est la source, l'activité liée est la nouvelle (donc false)
                    };
                });
                res.status(200).json({
                    success: true,
                    data: activities,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // ✅ Lier un formulaire
        this.linkForm = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const { formId } = activityValidation_1.linkFormSchema.parse(req.body);
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const result = await activityService.linkForm(id, formId, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: result.message,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // ✅ Délier un formulaire
        this.unlinkForm = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id, formId } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const result = await activityService.unlinkForm(id, formId, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: result.message,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // ✅ Lier un document
        this.linkDocument = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const { documentId } = activityValidation_1.linkDocumentSchema.parse(req.body);
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const result = await activityService.linkDocument(id, documentId, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: result.message,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // ✅ Obtenir dashboard personnalisé CRA
        this.getCRADashboard = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                // Obtenir les statistiques
                const stats = await activityService.getActivityStats(userId, userRole);
                // Obtenir les activités récentes de l'utilisateur
                const recentUserActivities = await activityService.listActivities(userId, userRole, {
                    responsibleId: userId,
                    limit: 5,
                    page: 1
                });
                // Obtenir les activités à échéance proche
                const upcomingDeadlines = await activityService.listActivities(userId, userRole, {
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    limit: 10,
                    page: 1
                });
                res.status(200).json({
                    success: true,
                    data: {
                        stats,
                        recentActivities: recentUserActivities.activities,
                        upcomingDeadlines: upcomingDeadlines.activities,
                        summary: {
                            totalActivities: stats.total,
                            myActivities: recentUserActivities.activities.length,
                            upcomingCount: upcomingDeadlines.activities.length
                        }
                    },
                });
            }
            catch (error) {
                next(error);
            }
        };
        // ✅ Exporter les activités (pour rapports CRA)
        this.exportActivities = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const queryParams = activityValidation_1.activityListQuerySchema.parse(req.query);
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const format = req.query.format || 'json';
                // Obtenir toutes les activités selon les filtres (sans pagination)
                const allActivities = await activityService.listActivities(userId, userRole, { ...queryParams, limit: 1000, page: 1 });
                if (format === 'csv') {
                    // Conversion en CSV
                    const csvData = this.convertActivitiesToCSV(allActivities.activities);
                    res.setHeader('Content-Type', 'text/csv');
                    res.setHeader('Content-Disposition', 'attachment; filename="activites_cra.csv"');
                    res.status(200).send(csvData);
                }
                else {
                    // Format JSON par défaut
                    res.status(200).json({
                        success: true,
                        data: allActivities.activities,
                        exportInfo: {
                            format,
                            exportedAt: new Date().toISOString(),
                            totalRecords: allActivities.activities.length,
                            filters: queryParams
                        }
                    });
                }
            }
            catch (error) {
                next(error);
            }
        };
        // Ajouter un participant
        this.addParticipant = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const validatedData = activityValidation_1.addParticipantSchema.parse(req.body);
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const participant = await activityService.addParticipant(id, validatedData, userId, userRole);
                res.status(201).json({
                    success: true,
                    message: 'Participant ajouté avec succès',
                    data: participant,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Mettre à jour un participant
        this.updateParticipant = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id, participantUserId } = req.params;
                const validatedData = activityValidation_1.updateParticipantSchema.parse(req.body);
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const participant = await activityService.updateParticipant(id, participantUserId, validatedData, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: 'Participant mis à jour avec succès',
                    data: participant,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Retirer un participant
        this.removeParticipant = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id, participantUserId } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                await activityService.removeParticipant(id, participantUserId, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: 'Participant retiré avec succès',
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Lister les participants
        this.listParticipants = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const participants = await activityService.listParticipants(id, userId, userRole);
                res.status(200).json({
                    success: true,
                    data: participants,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // ========================================
        // GESTION DES FINANCEMENTS
        // ========================================
        this.addFunding = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const validatedData = activityValidation_1.addFundingSchema.parse(req.body);
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const funding = await activityService.addFunding(id, validatedData, userId, userRole);
                res.status(201).json({
                    success: true,
                    message: 'Financement ajouté avec succès',
                    data: funding,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateFunding = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id, fundingId } = req.params;
                const validatedData = activityValidation_1.updateFundingSchema.parse(req.body);
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const funding = await activityService.updateFunding(id, fundingId, validatedData, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: 'Financement mis à jour avec succès',
                    data: funding,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.removeFunding = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id, fundingId } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                await activityService.removeFunding(id, fundingId, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: 'Financement retiré avec succès',
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.listFundings = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const fundings = await activityService.listFundings(id, userId, userRole);
                res.status(200).json({
                    success: true,
                    data: fundings,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // ========================================
        // GESTION DES PARTENARIATS
        // ========================================
        this.addPartner = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const validatedData = activityValidation_1.addActivityPartnerSchema.parse(req.body);
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const partnership = await activityService.addPartner(id, validatedData, userId, userRole);
                res.status(201).json({
                    success: true,
                    message: 'Partenaire ajouté avec succès',
                    data: partnership,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.updatePartner = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id, partnershipId } = req.params;
                const validatedData = activityValidation_1.updateActivityPartnerSchema.parse(req.body);
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const partnership = await activityService.updatePartner(id, partnershipId, validatedData, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: 'Partenariat mis à jour avec succès',
                    data: partnership,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.removePartner = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id, partnershipId } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                await activityService.removePartner(id, partnershipId, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: 'Partenaire retiré avec succès',
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.listPartners = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const partnerships = await activityService.listPartners(id, userId, userRole);
                res.status(200).json({
                    success: true,
                    data: partnerships,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // ========================================
        // GESTION DES TÂCHES
        // ========================================
        this.createTask = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const validatedData = activityValidation_1.createTaskSchema.parse(req.body);
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const task = await activityService.createTask(id, validatedData, userId, userRole);
                res.status(201).json({
                    success: true,
                    message: 'Tâche créée avec succès',
                    data: task,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Méthode existante modifiée
        this.listTasks = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const { filter } = req.query; // 'all', 'created', 'assigned'
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                let tasks;
                if (filter === 'created') {
                    tasks = await activityService.listCreatedTasks(id, userId, userRole);
                }
                else if (filter === 'assigned') {
                    tasks = await activityService.listAssignedTasks(id, userId, userRole);
                }
                else {
                    tasks = await activityService.listTasks(id, userId, userRole);
                }
                res.status(200).json({
                    success: true,
                    data: tasks,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Nouvelle méthode pour réassigner
        this.reassignTask = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id, taskId } = req.params;
                const validatedData = activityValidation_1.reassignTaskSchema.parse(req.body);
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const task = await activityService.reassignTask(id, taskId, validatedData, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: 'Tâche réassignée avec succès',
                    data: task,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getTaskById = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id, taskId } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const task = await activityService.getTaskById(id, taskId, userId, userRole);
                res.status(200).json({
                    success: true,
                    data: task,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateTask = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id, taskId } = req.params;
                const validatedData = activityValidation_1.updateTaskSchema.parse(req.body);
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const task = await activityService.updateTask(id, taskId, validatedData, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: 'Tâche mise à jour avec succès',
                    data: task,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteTask = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id, taskId } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                await activityService.deleteTask(id, taskId, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: 'Tâche supprimée avec succès',
                });
            }
            catch (error) {
                next(error);
            }
        };
        // ========================================
        // GESTION DES COMMENTAIRES
        // ========================================
        this.createComment = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const validatedData = activityValidation_1.createCommentSchema.parse(req.body);
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const comment = await activityService.createComment(id, validatedData, userId, userRole);
                res.status(201).json({
                    success: true,
                    message: 'Commentaire ajouté avec succès',
                    data: comment,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.listComments = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const comments = await activityService.listComments(id, userId, userRole);
                res.status(200).json({
                    success: true,
                    data: comments,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateComment = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id, commentId } = req.params;
                const validatedData = activityValidation_1.updateCommentSchema.parse(req.body);
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const comment = await activityService.updateComment(id, commentId, validatedData, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: 'Commentaire mis à jour avec succès',
                    data: comment,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteComment = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id, commentId } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                await activityService.deleteComment(id, commentId, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: 'Commentaire supprimé avec succès',
                });
            }
            catch (error) {
                next(error);
            }
        };
        // ========================================
        // GESTION DES TRANSFERTS D'ACQUIS
        // ========================================
        this.linkKnowledgeTransfer = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id, transferId } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const result = await activityService.linkKnowledgeTransfer(id, transferId, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: result.message,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.unlinkKnowledgeTransfer = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id, transferId } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const result = await activityService.unlinkKnowledgeTransfer(id, transferId, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: result.message,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.listKnowledgeTransfers = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const transfers = await activityService.listKnowledgeTransfers(id, userId, userRole);
                res.status(200).json({
                    success: true,
                    data: transfers,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // ========================================
        // GÉNÉRATION DE RAPPORTS
        // ========================================
        this.generateReport = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const { format } = req.query;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                // Valider le format
                if (!format || !['pdf', 'word'].includes(format)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Format invalide. Utilisez "pdf" ou "word"'
                    });
                }
                const reportService = new activityReport_service_1.ActivityReportService();
                const buffer = await reportService.generateActivityReport(id, userId, userRole, format);
                // Récupérer l'activité pour le nom du fichier
                const activity = await activityService.getActivityById(id, userId, userRole);
                const fileName = `fiche_activite_${activity.code || id}_${new Date().toISOString().split('T')[0]}`;
                // Définir les headers selon le format
                if (format === 'pdf') {
                    res.setHeader('Content-Type', 'application/pdf');
                    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);
                }
                else {
                    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.docx"`);
                }
                res.send(buffer);
            }
            catch (error) {
                next(error);
            }
        };
    }
    // Méthode utilitaire pour convertir en CSV
    convertActivitiesToCSV(activities) {
        if (activities.length === 0)
            return '';
        const headers = [
            'Code', 'Titre', 'Type', 'Statut', 'Thème', 'Responsable',
            'Station', 'Région', 'Date début', 'Date fin', 'Projet'
        ];
        const csvRows = [
            headers.join(';'),
            ...activities.map(activity => [
                activity.code || '',
                `"${activity.title.replace(/"/g, '""')}"`,
                activity.type,
                activity.lifecycleStatus,
                activity.theme?.name || '',
                `${activity.responsible?.firstName} ${activity.responsible?.lastName}`,
                activity.station?.name || '',
                activity.interventionRegion || '',
                activity.startDate ? new Date(activity.startDate).toLocaleDateString('fr-FR') : '',
                activity.endDate ? new Date(activity.endDate).toLocaleDateString('fr-FR') : '',
                activity.project?.title || 'Activité autonome'
            ].join(';'))
        ];
        return csvRows.join('\n');
    }
}
exports.ActivityController = ActivityController;
// Import nécessaire pour l'historique des reconductions
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
//# sourceMappingURL=activity.controller.js.map