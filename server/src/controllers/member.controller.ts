import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { logActivity } from '../utils/activityLogger';
import { param } from '../utils/params';
import crypto from 'crypto';

export async function getMembers(req: Request, res: Response, next: NextFunction) {
  try {
    const members = await prisma.tripMember.findMany({
      where: { tripId: param(req, 'id') },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
      orderBy: { joinedAt: 'asc' },
    });

    res.json({ success: true, data: members });
  } catch (error) {
    next(error);
  }
}

export async function inviteByEmail(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'AUTH_REQUIRED', '인증이 필요합니다.');

    const schema = z.object({
      email: z.string().email(),
      role: z.enum(['traveler', 'family', 'guide', 'friend']),
    });
    const data = schema.parse(req.body);

    const invitee = await prisma.user.findUnique({ where: { email: data.email } });
    if (!invitee) {
      throw new AppError(404, 'USER_NOT_FOUND', '해당 이메일의 사용자를 찾을 수 없습니다.');
    }

    const existing = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId: param(req, 'id'), userId: invitee.id } },
    });
    if (existing) {
      throw new AppError(409, 'MEMBER_ALREADY_EXISTS', '이미 참여 중인 사용자입니다.');
    }

    const member = await prisma.tripMember.create({
      data: { tripId: param(req, 'id'), userId: invitee.id, role: data.role },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    });

    await prisma.notification.create({
      data: {
        userId: invitee.id,
        tripId: param(req, 'id'),
        type: 'member_invited',
        title: '여행 초대',
        message: `${req.user.name}님이 여행에 초대했습니다.`,
      },
    });

    await logActivity({
      tripId: param(req, 'id'),
      userId: req.user.id,
      action: 'joined',
      targetType: 'member',
      targetId: invitee.id,
      description: `${invitee.name}님이 "${data.role}" 역할로 참여했습니다`,
    });

    res.status(201).json({ success: true, data: member });
  } catch (error) {
    next(error);
  }
}

export async function createInviteLink(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'AUTH_REQUIRED', '인증이 필요합니다.');

    const schema = z.object({
      role: z.enum(['traveler', 'family', 'guide', 'friend']),
      maxUses: z.number().int().min(1).optional(),
      expiresInHours: z.number().int().min(1).max(168).optional(),
    });
    const data = schema.parse(req.body);

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = data.expiresInHours
      ? new Date(Date.now() + data.expiresInHours * 60 * 60 * 1000)
      : new Date(Date.now() + 48 * 60 * 60 * 1000);

    // Store invite link info in trip's shareToken for simplicity
    // In production, use a separate share_links table
    const inviteLink = `${process.env.CLIENT_URL}/join/${token}`;

    res.status(201).json({
      success: true,
      data: {
        token,
        link: inviteLink,
        role: data.role,
        expiresAt,
        maxUses: data.maxUses || null,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMemberRole(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'AUTH_REQUIRED', '인증이 필요합니다.');

    const schema = z.object({
      role: z.enum(['traveler', 'family', 'guide', 'friend']),
    });
    const data = schema.parse(req.body);

    const member = await prisma.tripMember.findFirst({
      where: { tripId: param(req, 'id'), userId: param(req, 'uid') },
    });

    if (!member) throw new AppError(404, 'MEMBER_NOT_FOUND', '참여자를 찾을 수 없습니다.');
    if (member.role === 'owner') throw new AppError(400, 'MEMBER_OWNER_ROLE', '소유자의 역할은 변경할 수 없습니다.');

    const updated = await prisma.tripMember.update({
      where: { id: member.id },
      data: { role: data.role },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

export async function removeMember(req: Request, res: Response, next: NextFunction) {
  try {
    const member = await prisma.tripMember.findFirst({
      where: { tripId: param(req, 'id'), userId: param(req, 'uid') },
    });

    if (!member) throw new AppError(404, 'MEMBER_NOT_FOUND', '참여자를 찾을 수 없습니다.');
    if (member.role === 'owner') throw new AppError(400, 'MEMBER_OWNER_REMOVE', '소유자는 제거할 수 없습니다.');

    await prisma.tripMember.delete({ where: { id: member.id } });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function leaveTrip(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'AUTH_REQUIRED', '인증이 필요합니다.');

    const member = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId: param(req, 'id'), userId: req.user.id } },
    });

    if (!member) throw new AppError(404, 'MEMBER_NOT_FOUND', '참여자를 찾을 수 없습니다.');
    if (member.role === 'owner') throw new AppError(400, 'MEMBER_OWNER_LEAVE', '소유자는 여행을 떠날 수 없습니다. 여행을 삭제하거나 소유권을 이전해주세요.');

    await prisma.tripMember.delete({ where: { id: member.id } });

    res.json({ success: true, data: { message: '여행에서 나왔습니다.' } });
  } catch (error) {
    next(error);
  }
}
