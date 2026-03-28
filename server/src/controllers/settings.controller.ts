import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'AUTH_REQUIRED', '인증이 필요합니다.');
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, avatarUrl: true, bloodType: true, allergies: true, emergencyContactName: true, emergencyContactPhone: true, createdAt: true },
    });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'AUTH_REQUIRED', '인증이 필요합니다.');
    const schema = z.object({
      name: z.string().min(1).max(100).optional(),
      bloodType: z.string().max(5).optional().nullable(),
      allergies: z.string().optional().nullable(),
      emergencyContactName: z.string().max(100).optional().nullable(),
      emergencyContactPhone: z.string().max(20).optional().nullable(),
    });
    const data = schema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: { id: true, email: true, name: true, avatarUrl: true, bloodType: true, allergies: true, emergencyContactName: true, emergencyContactPhone: true },
    });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function uploadAvatar(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'AUTH_REQUIRED', '인증이 필요합니다.');
    if (!req.file) throw new AppError(400, 'FILE_REQUIRED', '파일이 필요합니다.');

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl },
      select: { id: true, avatarUrl: true },
    });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}
