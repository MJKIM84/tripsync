import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { param } from '../utils/params';

const placeSchema = z.object({
  name: z.string().min(1).max(200),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  category: z.string().max(50).optional(),
  notes: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
});

export async function getPlaces(req: Request, res: Response, next: NextFunction) {
  try {
    const { category } = req.query;
    const places = await prisma.place.findMany({
      where: {
        tripId: param(req, 'id'),
        ...(category ? { category: category as string } : {}),
      },
      include: { adder: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: places });
  } catch (error) {
    next(error);
  }
}

export async function createPlace(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'AUTH_REQUIRED', '인증이 필요합니다.');
    const data = placeSchema.parse(req.body);
    const place = await prisma.place.create({
      data: { ...data, tripId: param(req, 'id'), addedBy: req.user.id },
      include: { adder: { select: { id: true, name: true, avatarUrl: true } } },
    });
    res.status(201).json({ success: true, data: place });
  } catch (error) {
    next(error);
  }
}

export async function getPlace(req: Request, res: Response, next: NextFunction) {
  try {
    const place = await prisma.place.findUnique({ where: { id: param(req, 'pid') } });
    if (!place) throw new AppError(404, 'PLACE_NOT_FOUND', '장소를 찾을 수 없습니다.');
    res.json({ success: true, data: place });
  } catch (error) {
    next(error);
  }
}

export async function updatePlace(req: Request, res: Response, next: NextFunction) {
  try {
    const data = placeSchema.partial().parse(req.body);
    const place = await prisma.place.update({ where: { id: param(req, 'pid') }, data });
    res.json({ success: true, data: place });
  } catch (error) {
    next(error);
  }
}

export async function deletePlace(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.place.delete({ where: { id: param(req, 'pid') } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
