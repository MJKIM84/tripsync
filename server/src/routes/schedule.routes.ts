import { Router } from 'express';
import { getSchedules, createSchedule, updateSchedule, deleteSchedule, reorderSchedules } from '../controllers/schedule.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/roleGuard';

const router = Router();

router.get('/:id/schedules', authenticate, requirePermission('schedule:read'), getSchedules);
router.post('/:id/schedules', authenticate, requirePermission('schedule:write'), createSchedule);
router.put('/:id/schedules/:sid', authenticate, requirePermission('schedule:write'), updateSchedule);
router.delete('/:id/schedules/:sid', authenticate, requirePermission('schedule:write'), deleteSchedule);
router.put('/:id/schedules/reorder', authenticate, requirePermission('schedule:write'), reorderSchedules);

export default router;
