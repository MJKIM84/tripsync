import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { logActivity } from '../utils/activityLogger';
import { notifyTripMembers } from '../utils/notifier';
import { param } from '../utils/params';

export async function getComments(req: Request, res: Response, next: NextFunction) {
  try {
    const { targetType, targetId } = req.query;
    const comments = await prisma.comment.findMany({
      where: {
        tripId: param(req, 'id'),
        ...(targetType ? { targetType: targetType as string } : {}),
        ...(targetId ? { targetId: targetId as string } : {}),
      },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, data: comments });
  } catch (error) {
    next(error);
  }
}

export async function createComment(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'AUTH_REQUIRED', '인증이 필요합니다.');
    const schema = z.object({
      targetType: z.string().max(20),
      targetId: z.string().uuid(),
      content: z.string().min(1),
    });
    const data = schema.parse(req.body);
    const comment = await prisma.comment.create({
      data: { ...data, tripId: param(req, 'id'), userId: req.user.id },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });

    if (req.user) {
      logActivity({
        tripId: param(req, 'id'),
        userId: req.user.id,
        action: 'created',
        targetType: 'comment',
        targetId: comment.id,
        description: `${req.user.name}님이 댓글을 남겼습니다`,
      });
    }

    notifyTripMembers({
      tripId: param(req, 'id'),
      excludeUserId: req.user!.id,
      type: 'comment',
      title: '새 댓글',
      message: `${req.user!.name}님이 댓글을 남겼습니다`,
    });

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
}

export async function deleteComment(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'AUTH_REQUIRED', '인증이 필요합니다.');
    const comment = await prisma.comment.findUnique({ where: { id: param(req, 'cid') } });
    if (!comment) throw new AppError(404, 'COMMENT_NOT_FOUND', '댓글을 찾을 수 없습니다.');
    if (comment.userId !== req.user.id) throw new AppError(403, 'PERMISSION_DENIED', '본인의 댓글만 삭제할 수 있습니다.');
    await prisma.comment.delete({ where: { id: param(req, 'cid') } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
