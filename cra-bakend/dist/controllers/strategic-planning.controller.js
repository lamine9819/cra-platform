"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrategicPlanningController = void 0;
const strategic_planning_service_1 = require("../services/strategic-planning.service");
const strategic_planning_validation_1 = require("../utils/strategic-planning.validation");
const strategicPlanningService = new strategic_planning_service_1.StrategicPlanningService();
class StrategicPlanningController {
    constructor() {
        // ========================================
        // CONTRÔLEURS POUR LES PLANS STRATÉGIQUES
        // ========================================
        this.createStrategicPlan = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const validatedData = strategic_planning_validation_1.createStrategicPlanSchema.parse(req.body);
                const result = await strategicPlanningService.createStrategicPlan(validatedData, authenticatedReq.user.userId);
                res.status(201).json({
                    success: true,
                    data: result,
                    message: 'Plan stratégique créé avec succès'
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getStrategicPlans = async (req, res, next) => {
            try {
                const validatedQuery = strategic_planning_validation_1.strategicPlanQuerySchema.parse(req.query);
                const result = await strategicPlanningService.getStrategicPlans(validatedQuery);
                res.status(200).json({
                    success: true,
                    data: result.data,
                    pagination: result.pagination
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getStrategicPlanById = async (req, res, next) => {
            try {
                const { id } = req.params;
                const result = await strategicPlanningService.getStrategicPlanById(id);
                res.status(200).json({
                    success: true,
                    data: result
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateStrategicPlan = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const validatedData = strategic_planning_validation_1.updateStrategicPlanSchema.parse(req.body);
                const result = await strategicPlanningService.updateStrategicPlan(id, validatedData, authenticatedReq.user.userId);
                res.status(200).json({
                    success: true,
                    data: result,
                    message: 'Plan stratégique modifié avec succès'
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteStrategicPlan = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const result = await strategicPlanningService.deleteStrategicPlan(id, authenticatedReq.user.userId);
                res.status(200).json({
                    success: true,
                    message: result.message
                });
            }
            catch (error) {
                next(error);
            }
        };
        // ========================================
        // CONTRÔLEURS POUR LES AXES STRATÉGIQUES
        // ========================================
        this.createStrategicAxis = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const validatedData = strategic_planning_validation_1.createStrategicAxisSchema.parse(req.body);
                const result = await strategicPlanningService.createStrategicAxis(validatedData, authenticatedReq.user.userId);
                res.status(201).json({
                    success: true,
                    data: result,
                    message: 'Axe stratégique créé avec succès'
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getStrategicAxes = async (req, res, next) => {
            try {
                const validatedQuery = strategic_planning_validation_1.strategicAxisQuerySchema.parse(req.query);
                const result = await strategicPlanningService.getStrategicAxes(validatedQuery);
                res.status(200).json({
                    success: true,
                    data: result.data,
                    pagination: result.pagination
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getStrategicAxisById = async (req, res, next) => {
            try {
                const { id } = req.params;
                const result = await strategicPlanningService.getStrategicAxisById(id);
                res.status(200).json({
                    success: true,
                    data: result
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateStrategicAxis = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const validatedData = strategic_planning_validation_1.updateStrategicAxisSchema.parse(req.body);
                const result = await strategicPlanningService.updateStrategicAxis(id, validatedData, authenticatedReq.user.userId);
                res.status(200).json({
                    success: true,
                    data: result,
                    message: 'Axe stratégique modifié avec succès'
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteStrategicAxis = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const result = await strategicPlanningService.deleteStrategicAxis(id, authenticatedReq.user.userId);
                res.status(200).json({
                    success: true,
                    message: result.message
                });
            }
            catch (error) {
                next(error);
            }
        };
        // ========================================
        // CONTRÔLEURS POUR LES SOUS-AXES STRATÉGIQUES
        // ========================================
        this.createStrategicSubAxis = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const validatedData = strategic_planning_validation_1.createStrategicSubAxisSchema.parse(req.body);
                const result = await strategicPlanningService.createStrategicSubAxis(validatedData, authenticatedReq.user.userId);
                res.status(201).json({
                    success: true,
                    data: result,
                    message: 'Sous-axe stratégique créé avec succès'
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getStrategicSubAxes = async (req, res, next) => {
            try {
                const { strategicAxisId, ...queryParams } = req.query;
                const result = await strategicPlanningService.getStrategicSubAxes({
                    ...queryParams,
                    strategicAxisId: strategicAxisId
                });
                res.status(200).json({
                    success: true,
                    data: result.data,
                    pagination: result.pagination
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getStrategicSubAxisById = async (req, res, next) => {
            try {
                const { id } = req.params;
                const result = await strategicPlanningService.getStrategicSubAxisById(id);
                res.status(200).json({
                    success: true,
                    data: result
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateStrategicSubAxis = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const validatedData = strategic_planning_validation_1.updateStrategicSubAxisSchema.parse(req.body);
                const result = await strategicPlanningService.updateStrategicSubAxis(id, validatedData, authenticatedReq.user.userId);
                res.status(200).json({
                    success: true,
                    data: result,
                    message: 'Sous-axe stratégique modifié avec succès'
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteStrategicSubAxis = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const result = await strategicPlanningService.deleteStrategicSubAxis(id, authenticatedReq.user.userId);
                res.status(200).json({
                    success: true,
                    message: result.message
                });
            }
            catch (error) {
                next(error);
            }
        };
        // ========================================
        // CONTRÔLEURS POUR LES PROGRAMMES DE RECHERCHE
        // ========================================
        this.createResearchProgram = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const validatedData = strategic_planning_validation_1.createResearchProgramSchema.parse(req.body);
                const result = await strategicPlanningService.createResearchProgram(validatedData, authenticatedReq.user.userId);
                res.status(201).json({
                    success: true,
                    data: result,
                    message: 'Programme de recherche créé avec succès'
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getResearchPrograms = async (req, res, next) => {
            try {
                const validatedQuery = strategic_planning_validation_1.researchProgramQuerySchema.parse(req.query);
                const result = await strategicPlanningService.getResearchPrograms(validatedQuery);
                res.status(200).json({
                    success: true,
                    data: result.data,
                    pagination: result.pagination
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getResearchProgramById = async (req, res, next) => {
            try {
                const { id } = req.params;
                const result = await strategicPlanningService.getResearchProgramById(id);
                res.status(200).json({
                    success: true,
                    data: result
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateResearchProgram = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const validatedData = strategic_planning_validation_1.updateResearchProgramSchema.parse(req.body);
                const result = await strategicPlanningService.updateResearchProgram(id, validatedData, authenticatedReq.user.userId);
                res.status(200).json({
                    success: true,
                    data: result,
                    message: 'Programme de recherche modifié avec succès'
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteResearchProgram = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const result = await strategicPlanningService.deleteResearchProgram(id, authenticatedReq.user.userId);
                res.status(200).json({
                    success: true,
                    message: result.message
                });
            }
            catch (error) {
                next(error);
            }
        };
        // ========================================
        // CONTRÔLEURS POUR LES THÈMES DE RECHERCHE
        // ========================================
        this.createResearchTheme = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const validatedData = strategic_planning_validation_1.createResearchThemeSchema.parse(req.body);
                const result = await strategicPlanningService.createResearchTheme(validatedData, authenticatedReq.user.userId);
                res.status(201).json({
                    success: true,
                    data: result,
                    message: 'Thème de recherche créé avec succès'
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getResearchThemes = async (req, res, next) => {
            try {
                const validatedQuery = strategic_planning_validation_1.researchThemeQuerySchema.parse(req.query);
                const result = await strategicPlanningService.getResearchThemes(validatedQuery);
                res.status(200).json({
                    success: true,
                    data: result.data,
                    pagination: result.pagination
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getResearchThemeById = async (req, res, next) => {
            try {
                const { id } = req.params;
                const result = await strategicPlanningService.getResearchThemeById(id);
                res.status(200).json({
                    success: true,
                    data: result
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateResearchTheme = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const validatedData = strategic_planning_validation_1.updateResearchThemeSchema.parse(req.body);
                const result = await strategicPlanningService.updateResearchTheme(id, validatedData, authenticatedReq.user.userId);
                res.status(200).json({
                    success: true,
                    data: result,
                    message: 'Thème de recherche modifié avec succès'
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteResearchTheme = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const result = await strategicPlanningService.deleteResearchTheme(id, authenticatedReq.user.userId);
                res.status(200).json({
                    success: true,
                    message: result.message
                });
            }
            catch (error) {
                next(error);
            }
        };
        // ========================================
        // CONTRÔLEURS POUR LES STATIONS DE RECHERCHE
        // ========================================
        this.createResearchStation = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const validatedData = strategic_planning_validation_1.createResearchStationSchema.parse(req.body);
                const result = await strategicPlanningService.createResearchStation(validatedData, authenticatedReq.user.userId);
                res.status(201).json({
                    success: true,
                    data: result,
                    message: 'Station de recherche créée avec succès'
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getResearchStations = async (req, res, next) => {
            try {
                const { page, limit, search, isActive, sortBy, sortOrder } = req.query;
                const result = await strategicPlanningService.getResearchStations({
                    page: page ? parseInt(page) : 1,
                    limit: limit ? parseInt(limit) : 10,
                    search: search,
                    isActive: isActive ? isActive === 'true' : undefined,
                    sortBy: sortBy || 'name',
                    sortOrder: sortOrder || 'asc'
                });
                res.status(200).json({
                    success: true,
                    data: result.data,
                    pagination: result.pagination
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateResearchStation = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const validatedData = strategic_planning_validation_1.updateResearchStationSchema.parse(req.body);
                const result = await strategicPlanningService.updateResearchStation(id, validatedData, authenticatedReq.user.userId);
                res.status(200).json({
                    success: true,
                    data: result,
                    message: 'Station de recherche modifiée avec succès'
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteResearchStation = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const result = await strategicPlanningService.deleteResearchStation(id, authenticatedReq.user.userId);
                res.status(200).json({
                    success: true,
                    message: result.message
                });
            }
            catch (error) {
                next(error);
            }
        };
        // ========================================
        // CONTRÔLEURS UTILITAIRES
        // ========================================
        this.getStrategicHierarchy = async (req, res, next) => {
            try {
                const result = await strategicPlanningService.getStrategicHierarchy();
                res.status(200).json({
                    success: true,
                    data: result
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getStrategicPlanningStats = async (req, res, next) => {
            try {
                const result = await strategicPlanningService.getStrategicPlanningStats();
                res.status(200).json({
                    success: true,
                    data: result
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Méthode pour obtenir les utilisateurs éligibles comme coordinateurs
        this.getEligibleCoordinators = async (req, res, next) => {
            try {
                const result = await strategicPlanningService.getEligibleCoordinators();
                res.status(200).json({
                    success: true,
                    data: result
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.StrategicPlanningController = StrategicPlanningController;
//# sourceMappingURL=strategic-planning.controller.js.map