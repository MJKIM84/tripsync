import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/roleGuard';
import { getMessages, sendMessage, pinMessage } from '../controllers/chat.controller';

const router = Router();

router.get('/:id/chat', authenticate, requirePermission('chat:read'), getMessages);
router.post('/:id/chat', authenticate, requirePermission('chat:write'), sendMessage);
router.put('/:id/chat/:mid/pin', authenticate, requirePermission('chat:write'), pinMessage);

export default router;
