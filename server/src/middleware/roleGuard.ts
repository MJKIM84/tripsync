import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from './errorHandler';
import { param } from '../utils/params';

const prisma = new PrismaClient();

type Permission =
  | 'trip:manage'
  | 'member:manage'
  | 'schedule:write'
  | 'schedule:read'
  | 'journal:write'
  | 'journal:read'
  | 'photo:write'
  | 'photo:read'
  | 'place:write'
  | 'place:read'
  | 'budget:write'
  | 'budget:read'
  | 'checklist:write'
  | 'checklist:read'
  | 'document:write'
  | 'document:read'
  | 'chat:write'
  | 'chat:read'
  | 'comment:write'
  | 'feed:read';

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  owner: [
    'trip:manage', 'member:manage',
    'schedule:write', 'schedule:read',
    'journal:write', 'journal:read',
    'photo:write', 'photo:read',
    'place:write', 'place:read',
    'budget:write', 'budget:read',
    'checklist:write', 'checklist:read',
    'document:write', 'document:read',
    'chat:write', 'chat:read',
    'comment:write', 'feed:read',
  ],
  traveler: [
    'schedule:write', 'schedule:read',
    'journal:write', 'journal:read',
    'photo:write', 'photo:read',
    'place:write', 'place:read',
    'budget:write', 'budget:read',
    'checklist:write', 'checklist:read',
    'document:write', 'document:read',
    'chat:write', 'chat:read',
    'comment:write', 'feed:read',
  ],
  guide: [
    'schedule:write', 'schedule:read',
    'journal:write', 'journal:read',
    'photo:write', 'photo:read',
    'place:write', 'place:read',
    'checklist:write', 'checklist:read',
    'document:write', 'document:read',
    'chat:write', 'chat:read',
    'comment:write', 'feed:read',
  ],
  family: [
    'schedule:read',
    'journal:read',
    'photo:read',
    'place:read',
    'checklist:read',
    'chat:read',
    'comment:write',
    'feed:read',
  ],
  friend: [
    'schedule:read',
    'journal:read',
    'photo:read',
    'place:read',
    'comment:write',
    'feed:read',
  ],
};

declare global {
  namespace Express {
    interface Request {
      memberRole?: string;
    }
  }
}

export function requirePermission(...permissions: Permission[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'AUTH_REQUIRED', '인증이 필요합니다.'));
    }

    const tripId = param(req, 'id') || param(req, 'tripId');
    if (!tripId) {
      return next(new AppError(400, 'TRIP_ID_REQUIRED', '여행 ID가 필요합니다.'));
    }

    try {
      const member = await prisma.tripMember.findUnique({
        where: { tripId_userId: { tripId, userId: req.user.id } },
      });

      if (!member) {
        return next(new AppError(403, 'PERMISSION_DENIED', '이 여행의 참여자가 아닙니다.'));
      }

      req.memberRole = member.role;

      const rolePermissions = ROLE_PERMISSIONS[member.role] || [];
      const hasPermission = permissions.every(p => rolePermissions.includes(p));

      if (!hasPermission) {
        return next(new AppError(403, 'PERMISSION_ROLE_REQUIRED', '해당 작업에 대한 권한이 없습니다.'));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireTripMember() {
  return requirePermission('feed:read');
}
