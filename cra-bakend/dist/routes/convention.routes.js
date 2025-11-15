"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const convention_controller_1 = require("../controllers/convention.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const conventionController = new convention_controller_1.ConventionController();
router.use(auth_1.authenticate);
// CRUD des conventions
router.post('/', conventionController.createConvention);
router.get('/', conventionController.listConventions);
router.get('/:id', conventionController.getConventionById);
router.patch('/:id', conventionController.updateConvention);
router.delete('/:id', conventionController.deleteConvention);
exports.default = router;
//# sourceMappingURL=convention.routes.js.map