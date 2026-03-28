import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { logActivity } from '../utils/activityLogger';
import { param } from '../utils/params';

const scheduleSchema = z.object({
  dayNumber: z.number().int().min(1),
  date: z.string().optional(),
  title: z.string().min(1, '제목은 필수입니다.').max(200),
  description: z.string().optional(),
  startTime: z.string().max(5).optional(),
  endTime: z.string().max(5).optional(),
  locationName: z.string().max(200).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  category: z.string().max(50).optional(),
  sortOrder: z.number().int().optional(),
});

export async function getSchedules(req: Request, res: Response, next: NextFunction) {
  try {
    const { day } = req.query;
    const tripId = param(req, 'id');

    const schedules = await prisma.schedule.findMany({
      where: {
        tripId,
        ...(day ? { dayNumber: Number(day) } : {}),
      },
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: [{ dayNumber: 'asc' }, { sortOrder: 'asc' }, { startTime: 'asc' }],
    });

    res.json({ success: true, data: schedules });
  } catch (error) {
    next(error);
  }
}

export async function createSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'AUTH_REQUIRED', '인증이 필요합니다.');

    const data = scheduleSchema.parse(req.body);
    const tripId = param(req, 'id');

    const schedule = await prisma.schedule.create({
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
        latitude: data.latitude != null ? data.latitude : undefined,
        longitude: data.longitude != null ? data.longitude : undefined,
        tripId,
        createdBy: req.user.id,
      },
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    await logActivity({
      tripId,
      userId: req.user.id,
      action: 'created',
      targetType: 'schedule',
      targetId: schedule.id,
      description: `${req.user.name}님이 Day ${data.dayNumber} 일정에 "${data.title}"을 추가했습니다`,
    });

    res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(400, 'VALIDATION_ERROR', '입력값이 올바르지 않습니다.',
        error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      ));
    }
    next(error);
  }
}

export async function updateSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'AUTH_REQUIRED', '인증이 필요합니다.');

    const data = scheduleSchema.partial().parse(req.body);

    const schedule = await prisma.schedule.update({
      where: { id: param(req, 'sid') },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
        latitude: data.latitude != null ? data.latitude : undefined,
        longitude: data.longitude != null ? data.longitude : undefined,
      },
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    await logActivity({
      tripId: param(req, 'id'),
      userId: req.user.id,
      action: 'updated',
      targetType: 'schedule',
      targetId: schedule.id,
      description: `${req.user.name}님이 일정 "${schedule.title}"을 수정했습니다`,
    });

    res.json({ success: true, data: schedule });
  } catch (error) {
    next(error);
  }
}

export async function deleteSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'AUTH_REQUIRED', '인증이 필요합니다.');

    const schedule = await prisma.schedule.findUnique({ where: { id: param(req, 'sid') } });
    if (!schedule) throw new AppError(404, 'SCHEDULE_NOT_FOUND', '일정을 찾을 수 없습니다.');

    await prisma.schedule.delete({ where: { id: param(req, 'sid') } });

    await logActivity({
      tripId: param(req, 'id'),
      userId: req.user.id,
      action: 'deleted',
      targetType: 'schedule',
      targetId: param(req, 'sid'),
      description: `${req.user.name}님이 일정 "${schedule.title}"을 삭제했습니다`,
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function reorderSchedules(req: Request, res: Response, next: NextFunction) {
  try {
    const schema = z.object({
      items: z.array(z.object({ id: z.string(), sortOrder: z.number().int() })),
    });
    const { items } = schema.parse(req.body);

    await prisma.$transaction(
      items.map(item =>
        prisma.schedule.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    res.json({ success: true, data: { message: '순서가 변경되었습니다.' } });
  } catch (error) {
    next(error);
  }
}
