import { Router } from 'express';
import { getTrips, getTrip, createTrip, updateTrip, deleteTrip, updateTripStatus, duplicateTrip, getTripStats } from '../controllers/trip.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission, requireTripMember } from '../middleware/roleGuard';

const router = Router();

router.get('/', authenticate, getTrips);
router.post('/', authenticate, createTrip);
router.get('/:id', authenticate, requireTripMember(), getTrip);
router.put('/:id', authenticate, requirePermission('trip:manage'), updateTrip);
router.delete('/:id', authenticate, requirePermission('trip:manage'), deleteTrip);
router.put('/:id/status', authenticate, requirePermission('trip:manage'), updateTripStatus);
router.post('/:id/duplicate', authenticate, requireTripMember(), duplicateTrip);
router.get('/:id/stats', authenticate, requireTripMember(), getTripStats);

export default router;
