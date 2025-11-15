"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConventionController = void 0;
const convention_service_1 = require("../services/convention.service");
const conventionValidation_1 = require("../utils/conventionValidation");
const conventionService = new convention_service_1.ConventionService();
class ConventionController {
    constructor() {
        this.createConvention = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const validatedData = conventionValidation_1.createConventionSchema.parse(req.body);
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const convention = await conventionService.createConvention(validatedData, userId, userRole);
                res.status(201).json({
                    success: true,
                    message: 'Convention créée avec succès',
                    data: convention,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.listConventions = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const queryParams = conventionValidation_1.conventionListQuerySchema.parse(req.query);
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const result = await conventionService.listConventions(userId, userRole, queryParams);
                res.status(200).json({
                    success: true,
                    data: result.conventions,
                    pagination: result.pagination,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getConventionById = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const convention = await conventionService.getConventionById(id, userId, userRole);
                res.status(200).json({
                    success: true,
                    data: convention,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateConvention = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const validatedData = conventionValidation_1.updateConventionSchema.parse(req.body);
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const convention = await conventionService.updateConvention(id, validatedData, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: 'Convention mise à jour avec succès',
                    data: convention,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteConvention = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                await conventionService.deleteConvention(id, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: 'Convention supprimée avec succès',
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.ConventionController = ConventionController;
//# sourceMappingURL=convention.controller.js.map