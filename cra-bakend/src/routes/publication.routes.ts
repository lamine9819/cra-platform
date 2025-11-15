// routes/publication.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { publicationController } from '../controllers/publication.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/authorization';
import { uploadPublication } from '../utils/fileUpload.config';
import { UserRole } from '@prisma/client';
import { AuthenticatedRequest } from '../types/auth.types';

const router = Router();

// Helper pour typer correctement les handlers
type AsyncHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next?: NextFunction
) => Promise<void | Response>;

const asyncHandler = (fn: AsyncHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as AuthenticatedRequest, res, next)).catch(next);
  };
};

router.use(authenticate);

// Routes de consultation (tous les utilisateurs authentifiés)
// IMPORTANT: Routes spécifiques AVANT les routes avec paramètres

// Route pour lister les publications
router.get(
  '/',
  asyncHandler(publicationController.getPublications.bind(publicationController))
);

// Routes spécifiques (doivent être avant /:id)
router.get(
  '/stats',
  asyncHandler(publicationController.getPublicationStats.bind(publicationController))
);

router.get(
  '/me',
  asyncHandler(publicationController.getMyPublications.bind(publicationController))
);

// Génération de rapport
router.get(
  '/report/generate',
  authorize([UserRole.COORDONATEUR_PROJET, UserRole.ADMINISTRATEUR]),
  asyncHandler(publicationController.generateReport.bind(publicationController))
);

// Routes avec paramètres :id (doivent être après les routes spécifiques)
router.get(
  '/:id',
  asyncHandler(publicationController.getPublicationById.bind(publicationController))
);

// Téléchargement de document
router.get(
  '/:id/download',
  asyncHandler(publicationController.downloadDocument.bind(publicationController))
);

// Routes de création/modification
router.post(
  '/',
  authorize([UserRole.CHERCHEUR, UserRole.COORDONATEUR_PROJET, UserRole.ADMINISTRATEUR]),
  asyncHandler(publicationController.createPublication.bind(publicationController))
);

router.put(
  '/:id',
  authorize([UserRole.CHERCHEUR, UserRole.COORDONATEUR_PROJET, UserRole.ADMINISTRATEUR]),
  asyncHandler(publicationController.updatePublication.bind(publicationController))
);

router.delete(
  '/:id',
  authorize([UserRole.CHERCHEUR, UserRole.COORDONATEUR_PROJET, UserRole.ADMINISTRATEUR]),
  asyncHandler(publicationController.deletePublication.bind(publicationController))
);

// Upload de document PDF
router.post(
  '/:id/upload',
  authorize([UserRole.CHERCHEUR, UserRole.COORDONATEUR_PROJET, UserRole.ADMINISTRATEUR]),
  uploadPublication.single('document'),
  asyncHandler(publicationController.uploadDocument.bind(publicationController))
);

export default router;