import { Router } from 'express';
import { getFeed } from '../controllers/feed.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/roleGuard';

const router = Router();

router.get('/:id/feed', authenticate, requirePermission('feed:read'), getFeed);

export default router;
