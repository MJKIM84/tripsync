import { Router } from 'express';
import { getPhotos, uploadPhotos, getPhoto, updatePhoto, deletePhoto } from '../controllers/photo.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/roleGuard';
import { uploadPhoto } from '../middleware/upload';

const router = Router();

router.get('/:id/photos', authenticate, requirePermission('photo:read'), getPhotos);
router.post('/:id/photos', authenticate, requirePermission('photo:write'), uploadPhoto.array('photos', 20), uploadPhotos);
router.get('/:id/photos/:pid', authenticate, requirePermission('photo:read'), getPhoto);
router.put('/:id/photos/:pid', authenticate, requirePermission('photo:write'), updatePhoto);
router.delete('/:id/photos/:pid', authenticate, requirePermission('photo:write'), deletePhoto);

export default router;
