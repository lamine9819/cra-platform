"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const knowledgeTransfer_controller_1 = require("../controllers/knowledgeTransfer.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const knowledgeTransferController = new knowledgeTransfer_controller_1.KnowledgeTransferController();
router.use(auth_1.authenticate);
// CRUD des transferts d'acquis
router.post('/', knowledgeTransferController.createKnowledgeTransfer);
router.get('/', knowledgeTransferController.listKnowledgeTransfers);
router.get('/:id', knowledgeTransferController.getKnowledgeTransferById);
router.patch('/:id', knowledgeTransferController.updateKnowledgeTransfer);
router.delete('/:id', knowledgeTransferController.deleteKnowledgeTransfer);
exports.default = router;
//# sourceMappingURL=knowledgeTransfer.routes.js.map