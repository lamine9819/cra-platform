"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/audit.routes.ts - Version corrigée
const express_1 = require("express");
const audit_controller_1 = require("../controllers/audit.controller");
const auth_1 = require("../middlewares/auth");
const authorization_1 = require("../middlewares/authorization");
const router = (0, express_1.Router)();
const auditController = new audit_controller_1.AuditController();
// Toutes les routes nécessitent une authentification
router.use(auth_1.authenticate);
// Toutes les routes d'audit nécessitent des droits administrateur
router.use((0, authorization_1.authorize)(['ADMINISTRATEUR']));
// Routes spécialisées - DOIVENT être avant les routes avec paramètres
router.get('/stats', auditController.getAuditStats);
router.get('/export', auditController.exportAuditLogs);
router.get('/security-events', auditController.getSecurityEvents);
router.post('/cleanup', auditController.cleanupOldLogs);
// Routes pour utilisateurs spécifiques
router.get('/users/:userId', auditController.getUserAuditLogs);
// Routes pour entités - CORRECTION : utiliser des segments fixes
router.get('/entity/:entityType/:entityId', auditController.getEntityAuditLogs);
// Route pour un log spécifique par ID
router.get('/:id', auditController.getAuditLogById);
// Route principale - DOIT être en dernier
router.get('/', auditController.getAuditLogs);
exports.default = router;
//# sourceMappingURL=audit.routes.js.map