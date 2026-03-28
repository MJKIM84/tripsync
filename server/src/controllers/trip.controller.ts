import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { logActivity } from '../utils/activityLogger';
import { param } from '../utils/params';
import crypto from 'crypto';

const tripSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다.').max(200),
  description: z.string().optional(),
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
  timezone: z.string().max(50).optional(),
});

export async function getTrips(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'AUTH_REQUIRED', '인증이 필요합니다.');

    const { status } = req.query;

    const trips = await prisma.trip.findMany({
      where: {
        members: { some: { userId: req.user.id } },
        ...(status && typeof status === 'string' ? { status } : {}),
      },
      include: {
        _count: { select: { members: true, photos: true } },
        members: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
          take: 5,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ success: true, data: trips });
  } catch (error) {
    next(error);
  }
}

export async function getTrip(req: Request, res: Response, next: NextFunction) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: param(req, 'id') },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
        members: {
          include: { user: { select: { id: true, name: true, avatarUrl: true, email: true } } },
        },
        _count: {
          select: { schedules: true, journals: true, photos: true, budgets: true, checklists: true, documents: true },
        },
      },
    });

    if (!trip) throw new AppError(404, 'TRIP_NOT_FOUND', '여행을 찾을 수 없습니다.');

    res.json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
}

export async function createTrip(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'AUTH_REQUIRED', '인증이 필요합니다.');

    const data = tripSchema.parse(req.body);

    // Build schedule entries for each day if both dates provided
    const scheduleEntries: { dayNumber: number; date: Date; title: string; sortOrder: number; createdBy: string }[] = [];
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      for (let i = 0; i < diffDays; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        scheduleEntries.push({
          dayNumber: i + 1,
          date,
          title: `Day ${i + 1}`,
          sortOrder: 0,
          createdBy: req.user.id,
        });
      }
    }

    const trip = await prisma.trip.create({
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        ownerId: req.user.id,
        shareToken: crypto.randomBytes(32).toString('hex'),
        members: {
          create: { userId: req.user.id, role: 'owner' },
        },
        ...(scheduleEntries.length > 0 ? {
          schedules: { create: scheduleEntries },
        } : {}),
      },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
        members: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        },
      },
    });

    res.status(201).json({ success: true, data: trip });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(400, 'VALIDATION_ERROR', '입력값이 올바르지 않습니다.',
        error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      ));
    }
    next(error);
  }
}

export async function updateTrip(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'AUTH_REQUIRED', '인증이 필요합니다.');

    const data = tripSchema.partial().parse(req.body);

    const trip = await prisma.trip.update({
      where: { id: param(req, 'id') },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    await logActivity({
      tripId: trip.id,
      userId: req.user.id,
      action: 'updated',
      targetType: 'trip',
      targetId: trip.id,
      description: `${req.user.name}님이 여행 정보를 수정했습니다`,
    });

    res.json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
}

export async function deleteTrip(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.trip.delete({ where: { id: param(req, 'id') } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function updateTripStatus(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'AUTH_REQUIRED', '인증이 필요합니다.');

    const schema = z.object({
      status: z.enum(['planning', 'ongoing', 'completed']),
    });
    const data = schema.parse(req.body);

    const trip = await prisma.trip.update({
      where: { id: param(req, 'id') },
      data: { status: data.status },
    });

    await logActivity({
      tripId: trip.id,
      userId: req.user.id,
      action: 'updated',
      targetType: 'trip',
      targetId: trip.id,
      description: `여행 상태가 "${data.status}"로 변경되었습니다`,
    });

    res.json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
}

export async function duplicateTrip(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'AUTH_REQUIRED', '인증이 필요합니다.');

    const original = await prisma.trip.findUnique({
      where: { id: param(req, 'id') },
      include: { schedules: true, places: true, checklists: { include: { items: true } } },
    });

    if (!original) throw new AppError(404, 'TRIP_NOT_FOUND', '여행을 찾을 수 없습니다.');

    const trip = await prisma.trip.create({
      data: {
        title: `${original.title} (복사본)`,
        description: original.description,
        country: original.country,
        city: original.city,
        tags: original.tags,
        timezone: original.timezone,
        ownerId: req.user.id,
        shareToken: crypto.randomBytes(32).toString('hex'),
        members: { create: { userId: req.user.id, role: 'owner' } },
        schedules: {
          create: original.schedules.map(s => ({
            dayNumber: s.dayNumber,
            title: s.title,
            description: s.description,
            startTime: s.startTime,
            endTime: s.endTime,
            locationName: s.locationName,
            latitude: s.latitude,
            longitude: s.longitude,
            category: s.category,
            sortOrder: s.sortOrder,
            createdBy: req.user!.id,
          })),
        },
        places: {
          create: original.places.map(p => ({
            name: p.name,
            address: p.address,
            latitude: p.latitude,
            longitude: p.longitude,
            category: p.category,
            notes: p.notes,
            addedBy: req.user!.id,
          })),
        },
      },
    });

    res.status(201).json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
}

export async function getTripStats(req: Request, res: Response, next: NextFunction) {
  try {
    const tripId = param(req, 'id');

    const [scheduleCount, journalCount, photoCount, memberCount, budgetCount, budgets] =
      await Promise.all([
        prisma.schedule.count({ where: { tripId } }),
        prisma.journal.count({ where: { tripId } }),
        prisma.photo.count({ where: { tripId } }),
        prisma.tripMember.count({ where: { tripId } }),
        prisma.budget.count({ where: { tripId } }),
        prisma.budget.findMany({ where: { tripId }, select: { amount: true, currency: true } }),
      ]);

    const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);

    res.json({
      success: true,
      data: {
        schedules: scheduleCount,
        journals: journalCount,
        photos: photoCount,
        members: memberCount,
        budgets: budgetCount,
        totalBudget,
      },
    });
  } catch (error) {
    next(error);
  }
}
