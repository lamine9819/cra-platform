"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeTransferController = void 0;
const knowledgeTransfer_service_1 = require("../services/knowledgeTransfer.service");
const knowledgeTransferValidation_1 = require("../utils/knowledgeTransferValidation");
const knowledgeTransferService = new knowledgeTransfer_service_1.KnowledgeTransferService();
class KnowledgeTransferController {
    constructor() {
        this.createKnowledgeTransfer = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const validatedData = knowledgeTransferValidation_1.createKnowledgeTransferSchema.parse(req.body);
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const transfer = await knowledgeTransferService.createKnowledgeTransfer(validatedData, userId, userRole);
                res.status(201).json({
                    success: true,
                    message: 'Transfert d\'acquis créé avec succès',
                    data: transfer,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.listKnowledgeTransfers = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const queryParams = knowledgeTransferValidation_1.knowledgeTransferListQuerySchema.parse(req.query);
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const result = await knowledgeTransferService.listKnowledgeTransfers(userId, userRole, queryParams);
                res.status(200).json({
                    success: true,
                    data: result.transfers,
                    pagination: result.pagination,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getKnowledgeTransferById = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const transfer = await knowledgeTransferService.getKnowledgeTransferById(id, userId, userRole);
                res.status(200).json({
                    success: true,
                    data: transfer,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateKnowledgeTransfer = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const validatedData = knowledgeTransferValidation_1.updateKnowledgeTransferSchema.parse(req.body);
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                const transfer = await knowledgeTransferService.updateKnowledgeTransfer(id, validatedData, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: 'Transfert d\'acquis mis à jour avec succès',
                    data: transfer,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteKnowledgeTransfer = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const userId = authenticatedReq.user.userId;
                const userRole = authenticatedReq.user.role;
                await knowledgeTransferService.deleteKnowledgeTransfer(id, userId, userRole);
                res.status(200).json({
                    success: true,
                    message: 'Transfert d\'acquis supprimé avec succès',
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.KnowledgeTransferController = KnowledgeTransferController;
//# sourceMappingURL=knowledgeTransfer.controller.js.map