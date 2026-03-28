import { Router } from 'express';
import { register, login, logout, getMe, updateMe, refreshToken, changePassword, requestPasswordReset, resetPassword } from '../controllers/auth.controller';
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
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

export default router;
