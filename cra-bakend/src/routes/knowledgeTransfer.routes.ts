import { Router } from 'express';
import { KnowledgeTransferController } from '../controllers/knowledgeTransfer.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();
const knowledgeTransferController = new KnowledgeTransferController();

router.use(authenticate);

// CRUD des transferts d'acquis
router.post('/', knowledgeTransferController.createKnowledgeTransfer);
router.get('/', knowledgeTransferController.listKnowledgeTransfers);
router.get('/:id', knowledgeTransferController.getKnowledgeTransferById);
router.patch('/:id', knowledgeTransferController.updateKnowledgeTransfer);
router.delete('/:id', knowledgeTransferController.deleteKnowledgeTransfer);

export default router;