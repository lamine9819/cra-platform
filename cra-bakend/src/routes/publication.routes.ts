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
router.get(
  '/publications',
  asyncHandler(publicationController.getPublications.bind(publicationController))
);

router.get(
  '/publications/stats',
  asyncHandler(publicationController.getPublicationStats.bind(publicationController))
);

router.get(
  '/publications/me',
  asyncHandler(publicationController.getMyPublications.bind(publicationController))
);

router.get(
  '/publications/:id',
  asyncHandler(publicationController.getPublicationById.bind(publicationController))
);

// Téléchargement de document
router.get(
  '/publications/:id/download',
  asyncHandler(publicationController.downloadDocument.bind(publicationController))
);

// Génération de rapport
router.get(
  '/publications/report/generate',
  authorize([UserRole.COORDONATEUR_PROJET, UserRole.ADMINISTRATEUR]),
  asyncHandler(publicationController.generateReport.bind(publicationController))
);

// Routes de création/modification
router.post(
  '/publications',
  authorize([UserRole.CHERCHEUR, UserRole.COORDONATEUR_PROJET, UserRole.ADMINISTRATEUR]),
  asyncHandler(publicationController.createPublication.bind(publicationController))
);

router.put(
  '/publications/:id',
  authorize([UserRole.CHERCHEUR, UserRole.COORDONATEUR_PROJET, UserRole.ADMINISTRATEUR]),
  asyncHandler(publicationController.updatePublication.bind(publicationController))
);

router.delete(
  '/publications/:id',
  authorize([UserRole.CHERCHEUR, UserRole.COORDONATEUR_PROJET, UserRole.ADMINISTRATEUR]),
  asyncHandler(publicationController.deletePublication.bind(publicationController))
);

// Upload de document PDF
router.post(
  '/publications/:id/upload',
  authorize([UserRole.CHERCHEUR, UserRole.COORDONATEUR_PROJET, UserRole.ADMINISTRATEUR]),
  uploadPublication.single('document'),
  asyncHandler(publicationController.uploadDocument.bind(publicationController))
);

export default router;