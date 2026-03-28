import { Router } from 'express';
import { getComments, createComment, deleteComment } from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/roleGuard';

const router = Router();

router.get('/:id/comments', authenticate, requirePermission('feed:read'), getComments);
router.post('/:id/comments', authenticate, requirePermission('comment:write'), createComment);
router.delete('/:id/comments/:cid', authenticate, requirePermission('comment:write'), deleteComment);

export default router;
