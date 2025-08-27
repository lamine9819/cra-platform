// src/routes/report.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/authorization';
import { AuthenticatedRequest } from '../types/auth.types';

const router = Router();
const reportController = new ReportController();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// =============================================
// ROUTES DIRECTES (avec wrappers pour la compatibilité TypeScript)
// =============================================

// Obtenir les templates disponibles
router.get('/templates', (req: Request, res: Response, _next: NextFunction) => {
  reportController.getTemplates(req as AuthenticatedRequest, res);
});

// Statistiques pour les rapports
router.get('/stats', (req: Request, res: Response, _next: NextFunction) => {
  reportController.getReportStats(req as AuthenticatedRequest, res);
});

// Historique des rapports générés
router.get('/history', (req: Request, res: Response, _next: NextFunction) => {
  reportController.getReportHistory(req as AuthenticatedRequest, res);
});

// Prévisualiser un rapport
router.get('/preview', (req: Request, res: Response, _next: NextFunction) => {
  reportController.previewReport(req as AuthenticatedRequest, res);
});

// Export Excel/CSV
router.get('/export', (req: Request, res: Response, _next: NextFunction) => {
  reportController.exportToExcel(req as AuthenticatedRequest, res);
});

// Générer un rapport PDF
router.post('/generate', (req: Request, res: Response, _next: NextFunction) => {
  reportController.generateReport(req as AuthenticatedRequest, res);
});

// Planifier un rapport récurrent (Admin et Chercheur seulement)
router.post('/schedule', 
  authorize(['ADMINISTRATEUR', 'CHERCHEUR']),
  (req: Request, res: Response, _next: NextFunction) => {
    reportController.scheduleReport(req as AuthenticatedRequest, res);
  }
);

// =============================================
// RAPPORTS PRÉDÉFINIS PAR TYPE
// =============================================

// Rapport de projet (Chercheur, Admin)
router.post('/project/:projectId', 
  authorize(['CHERCHEUR', 'ADMINISTRATEUR']),
  (req: Request, res: Response, _next: NextFunction) => {
    req.body = {
      type: 'project',
      entityId: req.params.projectId,
      ...req.body
    };
    reportController.generateReport(req as AuthenticatedRequest, res);
  }
);

// Rapport d'activité (Chercheur, Assistant, Admin)
router.post('/activity/:activityId', 
  authorize(['CHERCHEUR', 'ASSISTANT_CHERCHEUR', 'ADMINISTRATEUR']),
  (req: Request, res: Response, _next: NextFunction) => {
    req.body = {
      type: 'activity',
      entityId: req.params.activityId,
      ...req.body
    };
    reportController.generateReport(req as AuthenticatedRequest, res);
  }
);

// Rapport utilisateur (Tous les utilisateurs pour leur propre rapport)
router.post('/user/:userId', 
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;
      const targetUserId = req.params.userId;
      
      // Vérifier que l'utilisateur peut générer ce rapport
      if (userRole !== 'ADMINISTRATEUR' && userId !== targetUserId) {
        return res.status(403).json({
          success: false,
          message: 'Vous ne pouvez générer que votre propre rapport'
        });
      }
      
      req.body = {
        type: 'user',
        entityId: targetUserId,
        ...req.body
      };
      
      reportController.generateReport(authenticatedReq, res);
    } catch (error) {
      next(error);
    }
  }
);

// Rapport global (Admin seulement)
router.post('/global', 
  authorize(['ADMINISTRATEUR']),
  (req: Request, res: Response, _next: NextFunction) => {
    req.body = {
      type: 'global',
      ...req.body
    };
    reportController.generateReport(req as AuthenticatedRequest, res);
  }
);

// =============================================
// EXPORTS SPÉCIALISÉS PAR TYPE DE DONNÉES
// =============================================

// Export des utilisateurs (Admin et Chercheur)
router.get('/export/users',
  authorize(['ADMINISTRATEUR', 'CHERCHEUR']),
  (req: Request, res: Response, _next: NextFunction) => {
    req.query.type = 'users';
    reportController.exportToExcel(req as AuthenticatedRequest, res);
  }
);

// Export des projets (Admin, Chercheur, Assistant)
router.get('/export/projects',
  authorize(['ADMINISTRATEUR', 'CHERCHEUR', 'ASSISTANT_CHERCHEUR']),
  (req: Request, res: Response, _next: NextFunction) => {
    req.query.type = 'projects';
    reportController.exportToExcel(req as AuthenticatedRequest, res);
  }
);

// Export des tâches (Tous les rôles)
router.get('/export/tasks',
  (req: Request, res: Response, _next: NextFunction) => {
    req.query.type = 'tasks';
    reportController.exportToExcel(req as AuthenticatedRequest, res);
  }
);

// Export des documents (Tous les rôles)
router.get('/export/documents',
  (req: Request, res: Response, _next: NextFunction) => {
    req.query.type = 'documents';
    reportController.exportToExcel(req as AuthenticatedRequest, res);
  }
);

export default router;