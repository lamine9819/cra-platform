// src/routes/audit.routes.ts - Version corrigée
import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/authorization';

const router = Router();
const auditController = new AuditController();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Toutes les routes d'audit nécessitent des droits administrateur
router.use(authorize(['ADMINISTRATEUR']));

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

export default router;