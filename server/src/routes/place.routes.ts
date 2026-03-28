import { Router } from 'express';
import { getPlaces, createPlace, getPlace, updatePlace, deletePlace } from '../controllers/place.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/roleGuard';

const router = Router();

router.get('/:id/places', authenticate, requirePermission('place:read'), getPlaces);
router.post('/:id/places', authenticate, requirePermission('place:write'), createPlace);
router.get('/:id/places/:pid', authenticate, requirePermission('place:read'), getPlace);
router.put('/:id/places/:pid', authenticate, requirePermission('place:write'), updatePlace);
router.delete('/:id/places/:pid', authenticate, requirePermission('place:write'), deletePlace);

export default router;
