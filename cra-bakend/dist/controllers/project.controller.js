"use strict";
// =============================================
// CONTRÔLEUR DE GESTION DES PROJETS - VERSION CORRIGÉE
// =============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectController = void 0;
const project_service_1 = require("../services/project.service");
const reportGenerator_service_1 = require("../services/reportGenerator.service");
const projectValidation_1 = require("../utils/projectValidation");
const projectService = new project_service_1.ProjectService();
const reportGenerator = new reportGenerator_service_1.ReportGeneratorService();
class ProjectController {
    constructor() {
        // Créer un projet avec spécificités CRA
        this.createProject = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const validatedData = projectValidation_1.createProjectSchema.parse(req.body);
                const creatorId = authenticatedReq.user.userId;
                const project = await projectService.createProject(validatedData, creatorId);
                res.status(201).json({
                    success: true,
                    message: 'Projet créé avec succès',
                    data: project,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Lister les projets avec filtres CRA
        this.listProjects = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const queryParams = projectValidation_1.projectListQuerySchema.parse(req.query);
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const result = await projectService.listProjects(userId, userRole, queryParams);
                res.status(200).json({
                    success: true,
                    data: result.projects,
                    pagination: result.pagination,
                    filters: {
                        applied: queryParams,
                        available: {
                            status: ['PLANIFIE', 'EN_COURS', 'SUSPENDU', 'TERMINE', 'ARCHIVE'],
                            researchType: ['RECHERCHE_FONDAMENTALE', 'RECHERCHE_APPLIQUEE', 'RECHERCHE_DEVELOPPEMENT', 'PRODUCTION_SEMENCES']
                        }
                    }
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Obtenir un projet par ID
        this.getProjectById = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const project = await projectService.getProjectById(id, userId, userRole);
                res.status(200).json({
                    success: true,
                    data: project,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Mettre à jour un projet
        this.updateProject = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const validatedData = projectValidation_1.updateProjectSchema.parse(req.body);
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const project = await projectService.updateProject(id, validatedData, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: 'Projet mis à jour avec succès',
                    data: project,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Supprimer un projet
        this.deleteProject = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                await projectService.deleteProject(id, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: 'Projet supprimé avec succès',
                });
            }
            catch (error) {
                next(error);
            }
        };
        // GESTION DES PARTICIPANTS
        // Ajouter un participant
        this.addParticipant = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const participantData = projectValidation_1.addParticipantSchema.parse(req.body);
                const requesterId = authenticatedReq.user.userId;
                const requesterRole = authenticatedReq.user.role;
                const result = await projectService.addParticipant(id, participantData, requesterId, requesterRole);
                res.status(200).json({
                    success: true,
                    message: result.message,
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
                const { id: projectId } = req.params;
                const updateData = projectValidation_1.updateParticipantSchema.parse(req.body);
                const requesterId = authenticatedReq.user.userId;
                const requesterRole = authenticatedReq.user.role;
                const result = await projectService.updateParticipant(projectId, updateData, requesterId, requesterRole);
                res.status(200).json({
                    success: true,
                    message: result.message,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Retirer un participant du projet
        this.removeParticipant = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id: projectId, participantId } = req.params;
                const requesterId = authenticatedReq.user.userId;
                const requesterRole = authenticatedReq.user.role;
                const result = await projectService.removeParticipant(projectId, participantId, requesterId, requesterRole);
                res.status(200).json({
                    success: true,
                    message: result.message,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // NOUVELLES MÉTHODES POUR LES PARTENARIATS (Placeholder)
        // Ajouter un partenariat au projet
        // Méthode supprimée car doublon avec celle plus bas dans le fichier.
        // NOUVELLES MÉTHODES POUR LA GESTION DU FINANCEMENT (Placeholder)
        // Ajouter un financement au projet
        this.addFunding = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const requesterId = authenticatedReq.user.userId;
                const requesterRole = authenticatedReq.user.role;
                const result = await projectService.addFunding(id, req.body, requesterId, requesterRole);
                res.status(200).json({
                    success: true,
                    message: result.message,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Mettre à jour un financement
        this.updateFunding = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const requesterId = authenticatedReq.user.userId;
                const requesterRole = authenticatedReq.user.role;
                const result = await projectService.updateFunding(id, req.body, requesterId, requesterRole);
                res.status(200).json({
                    success: true,
                    message: result.message,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Retirer un financement du projet
        this.removeFunding = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id, fundingId } = req.params;
                const requesterId = authenticatedReq.user.userId;
                const requesterRole = authenticatedReq.user.role;
                const result = await projectService.removeFunding(id, fundingId, requesterId, requesterRole);
                res.status(200).json({
                    success: true,
                    message: result.message,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // MÉTHODES D'ANALYSE ET DE RAPPORTS
        // Obtenir les statistiques d'un projet
        this.getProjectStatistics = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const statistics = await projectService.getProjectStatistics(id, userId, userRole);
                res.status(200).json({
                    success: true,
                    data: statistics,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Générer un rapport de projet
        this.generateProjectReport = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const { format, sections } = req.query;
                // Récupérer les données complètes du projet
                const project = await projectService.getProjectById(id, authenticatedReq.user.userId, authenticatedReq.user.role);
                // Préparer les sections demandées
                const requestedSections = sections ? sections.split(',') : ['overview', 'participants', 'activities', 'budget'];
                // Générer le rapport selon le format demandé
                const reportFormat = format || 'pdf';
                let buffer;
                let contentType;
                let fileExtension;
                if (reportFormat === 'word') {
                    buffer = await reportGenerator.generateWord(project, requestedSections);
                    contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                    fileExtension = 'docx';
                }
                else {
                    // Par défaut, générer un PDF
                    buffer = await reportGenerator.generatePDF(project, requestedSections);
                    contentType = 'application/pdf';
                    fileExtension = 'pdf';
                }
                // Définir les en-têtes pour le téléchargement
                const filename = `rapport_${project.code || id}_${Date.now()}.${fileExtension}`;
                res.setHeader('Content-Type', contentType);
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.setHeader('Content-Length', buffer.length);
                // Envoyer le buffer
                res.send(buffer);
            }
            catch (error) {
                next(error);
            }
        };
        // Dupliquer un projet (utile pour les reconductions)
        this.duplicateProject = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const { title, copyParticipants = true, copyActivities = false, copyPartnerships = true } = req.body;
                res.status(201).json({
                    success: true,
                    message: 'Projet dupliqué avec succès',
                    data: {
                        message: 'Fonctionnalité de duplication à implémenter',
                        originalProjectId: id,
                        options: {
                            title,
                            copyParticipants,
                            copyActivities,
                            copyPartnerships
                        }
                    }
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Archiver un projet
        this.archiveProject = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const { reason } = req.body;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const archivedProject = await projectService.updateProject(id, {
                    status: 'ARCHIVE'
                }, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: 'Projet archivé avec succès',
                    data: archivedProject
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Restaurer un projet archivé
        this.restoreProject = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const { newStatus = 'PLANIFIE' } = req.body;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const restoredProject = await projectService.updateProject(id, {
                    status: newStatus
                }, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: 'Projet restauré avec succès',
                    data: restoredProject
                });
            }
            catch (error) {
                next(error);
            }
        };
        // MÉTHODES DE RECHERCHE PAR CRITÈRES CRA
        // Obtenir les projets par thème
        this.getProjectsByTheme = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { themeId } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const result = await projectService.listProjects(userId, userRole, {
                    themeId,
                    page: Number(req.query.page) || 1,
                    limit: Number(req.query.limit) || 10
                });
                res.status(200).json({
                    success: true,
                    data: result.projects,
                    pagination: result.pagination,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Obtenir les projets d'un programme de recherche
        this.getProjectsByProgram = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { programId } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const result = await projectService.listProjects(userId, userRole, {
                    researchProgramId: programId,
                    page: Number(req.query.page) || 1,
                    limit: Number(req.query.limit) || 10
                });
                res.status(200).json({
                    success: true,
                    data: result.projects,
                    pagination: result.pagination,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Obtenir les projets liés à une convention
        this.getProjectsByConvention = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { conventionId } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const result = await projectService.listProjects(userId, userRole, {
                    conventionId,
                    page: Number(req.query.page) || 1,
                    limit: Number(req.query.limit) || 10
                });
                res.status(200).json({
                    success: true,
                    data: result.projects,
                    pagination: result.pagination,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Recherche avancée de projets
        this.advancedSearch = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                // Parser les paramètres de recherche avancée
                const searchParams = {
                    keywords: req.query.keywords,
                    themeIds: req.query.themeIds ? req.query.themeIds.split(',') : [],
                    programIds: req.query.programIds ? req.query.programIds.split(',') : [],
                    status: req.query.status ? req.query.status.split(',') : [],
                };
                // Pour l'instant, utiliser la recherche normale
                const result = await projectService.listProjects(userId, userRole, {
                    search: searchParams.keywords,
                    page: Number(req.query.page) || 1,
                    limit: Number(req.query.limit) || 10
                });
                res.status(200).json({
                    success: true,
                    data: result.projects,
                    pagination: result.pagination,
                    searchParams,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Ajouter un partenariat au projet
        this.addPartnership = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const partnershipData = projectValidation_1.addPartnershipSchema.parse(req.body);
                const requesterId = authenticatedReq.user.userId;
                const requesterRole = authenticatedReq.user.role;
                const result = await projectService.addPartnership(id, partnershipData, requesterId, requesterRole);
                res.status(201).json({
                    success: true,
                    message: result.message,
                    data: result, // Or use only result.message if that's all that's returned
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Lister les partenariats d'un projet
        this.getProjectPartnerships = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const partnerships = await projectService.getProjectPartnerships(id, userId, userRole);
                res.status(200).json({
                    success: true,
                    data: partnerships,
                    count: partnerships.length
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Mettre à jour un partenariat
        this.updatePartnership = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id: projectId } = req.params;
                const updateData = projectValidation_1.updatePartnershipSchema.parse(req.body);
                const requesterId = authenticatedReq.user.userId;
                const requesterRole = authenticatedReq.user.role;
                const result = await projectService.updatePartnership(projectId, updateData, requesterId, requesterRole);
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.partnership
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Retirer un partenariat du projet
        this.removePartnership = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id: projectId, partnershipId } = req.params;
                const requesterId = authenticatedReq.user.userId;
                const requesterRole = authenticatedReq.user.role;
                const result = await projectService.removePartnership(projectId, partnershipId, requesterId, requesterRole);
                res.status(200).json({
                    success: true,
                    message: result.message,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Rechercher des partenaires potentiels pour un projet
        this.searchPotentialPartners = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const { query, expertise, type } = req.query;
                const expertiseArray = expertise ? expertise.split(',') : undefined;
                const potentialPartners = await projectService.searchPotentialPartners(id, query, expertiseArray, type);
                res.status(200).json({
                    success: true,
                    data: potentialPartners,
                    count: potentialPartners.length,
                    searchCriteria: {
                        query: query || null,
                        expertise: expertiseArray || [],
                        type: type || null
                    }
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.ProjectController = ProjectController;
//# sourceMappingURL=project.controller.js.map