import { Router } from 'express';
import { ConventionController } from '../controllers/convention.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();
const conventionController = new ConventionController();

router.use(authenticate);

// CRUD des conventions
router.post('/', conventionController.createConvention);
router.get('/', conventionController.listConventions);
router.get('/:id', conventionController.getConventionById);
router.patch('/:id', conventionController.updateConvention);
router.delete('/:id', conventionController.deleteConvention);

export default router;