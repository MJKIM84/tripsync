import { Router } from 'express';
import { getJournals, getJournal, createJournal, updateJournal, deleteJournal } from '../controllers/journal.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/roleGuard';

const router = Router();

router.get('/:id/journals', authenticate, requirePermission('journal:read'), getJournals);
router.post('/:id/journals', authenticate, requirePermission('journal:write'), createJournal);
router.get('/:id/journals/:jid', authenticate, requirePermission('journal:read'), getJournal);
router.put('/:id/journals/:jid', authenticate, requirePermission('journal:write'), updateJournal);
router.delete('/:id/journals/:jid', authenticate, requirePermission('journal:write'), deleteJournal);

export default router;
