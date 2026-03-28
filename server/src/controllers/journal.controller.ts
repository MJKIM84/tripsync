import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { logActivity } from '../utils/activityLogger';
import { param } from '../utils/params';

const journalSchema = z.object({
  date: z.string(),
  title: z.string().max(200).optional(),
  content: z.string().optional(),
  mood: z.string().max(20).optional(),
  locationName: z.string().max(200).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export async function getJournals(req: Request, res: Response, next: NextFunction) {
  try {
    const journals = await prisma.journal.findMany({
      where: { tripId: param(req, 'id') },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        photos: { select: { id: true, thumbnailPath: true, filePath: true }, take: 4 },
      },
      orderBy: { date: 'desc' },
    });

    res.json({ success: true, data: journals });
  } catch (error) {
    next(error);
  }
}

export async function getJournal(req: Request, res: Response, next: NextFunction) {
  try {
    const journal = await prisma.journal.findUnique({
      where: { id: param(req, 'jid') },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        photos: true,
      },
    });

    if (!journal) throw new AppError(404, 'JOURNAL_NOT_FOUND', '기록을 찾을 수 없습니다.');

    res.json({ success: true, data: journal });
  } catch (error) {
    next(error);
  }
}

export async function createJournal(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'AUTH_REQUIRED', '인증이 필요합니다.');

    const data = journalSchema.parse(req.body);

    const journal = await prisma.journal.create({
      data: {
        ...data,
        date: new Date(data.date),
        latitude: data.latitude != null ? data.latitude : undefined,
        longitude: data.longitude != null ? data.longitude : undefined,
        tripId: param(req, 'id'),
        authorId: req.user.id,
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    await logActivity({
      tripId: param(req, 'id'),
      userId: req.user.id,
      action: 'created',
      targetType: 'journal',
      targetId: journal.id,
      description: `${req.user.name}님이 여행 기록을 작성했습니다`,
    });

    res.status(201).json({ success: true, data: journal });
  } catch (error) {
    next(error);
  }
}

export async function updateJournal(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'AUTH_REQUIRED', '인증이 필요합니다.');

    const data = journalSchema.partial().parse(req.body);

    const journal = await prisma.journal.update({
      where: { id: param(req, 'jid') },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
        latitude: data.latitude != null ? data.latitude : undefined,
        longitude: data.longitude != null ? data.longitude : undefined,
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    res.json({ success: true, data: journal });
  } catch (error) {
    next(error);
  }
}

export async function deleteJournal(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'AUTH_REQUIRED', '인증이 필요합니다.');

    await prisma.journal.delete({ where: { id: param(req, 'jid') } });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
