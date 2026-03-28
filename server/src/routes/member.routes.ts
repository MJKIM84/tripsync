import { Router } from 'express';
import { getMembers, inviteByEmail, createInviteLink, updateMemberRole, removeMember, leaveTrip, joinByLink, getInviteInfo } from '../controllers/member.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission, requireTripMember } from '../middleware/roleGuard';

const router = Router();

router.get('/join/:token/info', getInviteInfo);

router.get('/:id/members', authenticate, requireTripMember(), getMembers);
router.post('/:id/members/invite', authenticate, requirePermission('member:manage'), inviteByEmail);
router.post('/:id/members/link', authenticate, requirePermission('member:manage'), createInviteLink);
router.put('/:id/members/:uid', authenticate, requirePermission('member:manage'), updateMemberRole);
router.delete('/:id/members/:uid', authenticate, requirePermission('member:manage'), removeMember);
router.post('/:id/members/leave', authenticate, requireTripMember(), leaveTrip);
router.post('/join/:token', authenticate, joinByLink);

export default router;
