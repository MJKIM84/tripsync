import { Router } from 'express';
import { getProfile, updateProfile, uploadAvatar } from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth';
import { uploadAvatar as uploadAvatarMiddleware } from '../middleware/upload';

const router = Router();

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/avatar', authenticate, uploadAvatarMiddleware.single('avatar'), uploadAvatar);

export default router;
