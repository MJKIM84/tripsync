import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { param } from '../utils/params';

export async function getFeed(req: Request, res: Response, next: NextFunction) {
  try {
    const { limit = '20', cursor, targetType, userId } = req.query;
    const tripId = param(req, 'id');

    const logs = await prisma.activityLog.findMany({
      where: {
        tripId,
        ...(targetType ? { targetType: targetType as string } : {}),
        ...(userId ? { userId: userId as string } : {}),
        ...(cursor ? { createdAt: { lt: new Date(cursor as string) } } : {}),
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit) + 1,
    });

    const hasNext = logs.length > Number(limit);
    const data = hasNext ? logs.slice(0, -1) : logs;

    res.json({
      success: true,
      data,
      pagination: {
        hasNext,
        nextCursor: hasNext ? data[data.length - 1].createdAt.toISOString() : null,
      },
    });
  } catch (error) {
    next(error);
  }
}
