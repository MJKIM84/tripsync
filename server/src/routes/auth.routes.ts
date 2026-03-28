import { Router } from 'express';
import { register, login, logout, getMe, updateMe, refreshToken, changePassword } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateMe);
router.post('/refresh', refreshToken);
router.put('/change-password', authenticate, changePassword);

export default router;
