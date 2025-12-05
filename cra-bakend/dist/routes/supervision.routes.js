"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/supervision.routes.ts
const express_1 = require("express");
const formation_controller_1 = require("../controllers/formation.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const formationController = new formation_controller_1.FormationController();
// =============================================
// ENCADREMENTS
// =============================================
router.post('/', auth_1.authenticate, formationController.createSupervision.bind(formationController));
router.get('/', auth_1.authenticate, formationController.getUserSupervisions.bind(formationController));
router.put('/:supervisionId', auth_1.authenticate, formationController.updateSupervision.bind(formationController));
router.delete('/:supervisionId', auth_1.authenticate, formationController.deleteSupervision.bind(formationController));
exports.default = router;
//# sourceMappingURL=supervision.routes.js.map