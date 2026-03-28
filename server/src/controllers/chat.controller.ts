import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { param } from '../utils/params';

export async function getMessages(req: Request, res: Response, next: NextFunction) {
  try {
    const tripId = param(req, 'id');
    const cursor = req.query.cursor as string | undefined;
    const limit = Math.min(Number(req.query.limit) || 50, 100);

    const messages = await prisma.chatMessage.findMany({
      where: { tripId },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
        replyTo: {
          include: { sender: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasNext = messages.length > limit;
    if (hasNext) messages.pop();

    res.json({
      success: true,
      data: messages.reverse(),
      pagination: {
        hasNext,
        nextCursor: hasNext ? messages[0]?.id : null,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function sendMessage(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'AUTH_REQUIRED', '인증이 필요합니다.');
    const schema = z.object({
      content: z.string().min(1).max(2000),
      messageType: z.enum(['text', 'image', 'system']).default('text'),
      replyToId: z.string().uuid().optional(),
    });
    const data = schema.parse(req.body);
    const message = await prisma.chatMessage.create({
      data: {
        ...data,
        tripId: param(req, 'id'),
        senderId: req.user.id,
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
        replyTo: {
          include: { sender: { select: { id: true, name: true } } },
        },
      },
    });
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
}

export async function pinMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const mid = param(req, 'mid');
    const message = await prisma.chatMessage.findUnique({ where: { id: mid } });
    if (!message) throw new AppError(404, 'MESSAGE_NOT_FOUND', '메시지를 찾을 수 없습니다.');
    const updated = await prisma.chatMessage.update({
      where: { id: mid },
      data: { isPinned: !message.isPinned },
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}
