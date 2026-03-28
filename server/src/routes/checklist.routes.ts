import { Router } from 'express';
import { getChecklists, createChecklist, updateChecklist, deleteChecklist, addChecklistItem, updateChecklistItem, deleteChecklistItem } from '../controllers/checklist.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/roleGuard';

const router = Router();

router.get('/:id/checklists', authenticate, requirePermission('checklist:read'), getChecklists);
router.post('/:id/checklists', authenticate, requirePermission('checklist:write'), createChecklist);
router.put('/:id/checklists/:cid', authenticate, requirePermission('checklist:write'), updateChecklist);
router.delete('/:id/checklists/:cid', authenticate, requirePermission('checklist:write'), deleteChecklist);
router.post('/:id/checklists/:cid/items', authenticate, requirePermission('checklist:write'), addChecklistItem);
router.put('/:id/checklists/:cid/items/:iid', authenticate, requirePermission('checklist:write'), updateChecklistItem);
router.delete('/:id/checklists/:cid/items/:iid', authenticate, requirePermission('checklist:write'), deleteChecklistItem);

export default router;
