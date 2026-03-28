import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { logActivity } from '../utils/activityLogger';
import { notifyTripMembers } from '../utils/notifier';
import { param } from '../utils/params';
import sharp from 'sharp';
import path from 'path';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

export async function getPhotos(req: Request, res: Response, next: NextFunction) {
  try {
    const { date, location } = req.query;
    const tripId = param(req, 'id');

    const photos = await prisma.photo.findMany({
      where: {
        tripId,
        ...(date ? { takenAt: { gte: new Date(date as string) } } : {}),
        ...(location ? { locationName: { contains: location as string, mode: 'insensitive' } } : {}),
      },
      include: {
        uploader: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: photos });
  } catch (error) {
    next(error);
  }
}

export async function uploadPhotos(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'AUTH_REQUIRED', '인증이 필요합니다.');
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw new AppError(400, 'PHOTO_REQUIRED', '사진 파일이 필요합니다.');
    }

    const tripId = param(req, 'id');
    const photos = [];

    for (const file of req.files) {
      const ext = path.extname(file.filename);
      const baseName = path.basename(file.filename, ext);

      // Generate thumbnail (300px)
      const thumbPath = path.join(UPLOAD_DIR, 'photos/thumbnails', `${baseName}_300${ext}`);
      await sharp(file.path).resize(300, 300, { fit: 'cover' }).toFile(thumbPath);

      // Generate medium (800px)
      const mediumPath = path.join(UPLOAD_DIR, 'photos/medium', `${baseName}_800${ext}`);
      await sharp(file.path).resize(800, null, { withoutEnlargement: true }).toFile(mediumPath);

      // Get image metadata
      const metadata = await sharp(file.path).metadata();

      const photo = await prisma.photo.create({
        data: {
          tripId,
          uploaderId: req.user!.id,
          filePath: `/uploads/photos/originals/${file.filename}`,
          thumbnailPath: `/uploads/photos/thumbnails/${baseName}_300${ext}`,
          mediumPath: `/uploads/photos/medium/${baseName}_800${ext}`,
          fileName: file.originalname,
          fileSize: BigInt(file.size),
          mimeType: file.mimetype,
          width: metadata.width,
          height: metadata.height,
        },
        include: {
          uploader: { select: { id: true, name: true, avatarUrl: true } },
        },
      });

      photos.push(photo);
    }

    await logActivity({
      tripId,
      userId: req.user.id,
      action: 'uploaded',
      targetType: 'photo',
      description: `${req.user.name}님이 사진 ${photos.length}장을 업로드했습니다`,
    });

    notifyTripMembers({
      tripId: param(req, 'id'),
      excludeUserId: req.user!.id,
      type: 'photo',
      title: '새 사진 업로드',
      message: `${req.user!.name}님이 사진을 업로드했습니다`,
    });

    res.status(201).json({ success: true, data: photos });
  } catch (error) {
    next(error);
  }
}

export async function getPhoto(req: Request, res: Response, next: NextFunction) {
  try {
    const photo = await prisma.photo.findUnique({
      where: { id: param(req, 'pid') },
      include: {
        uploader: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    if (!photo) throw new AppError(404, 'PHOTO_NOT_FOUND', '사진을 찾을 수 없습니다.');

    res.json({ success: true, data: photo });
  } catch (error) {
    next(error);
  }
}

export async function updatePhoto(req: Request, res: Response, next: NextFunction) {
  try {
    const { caption, locationName, latitude, longitude } = req.body;

    const photo = await prisma.photo.update({
      where: { id: param(req, 'pid') },
      data: { caption, locationName, latitude, longitude },
    });

    res.json({ success: true, data: photo });
  } catch (error) {
    next(error);
  }
}

export async function deletePhoto(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'AUTH_REQUIRED', '인증이 필요합니다.');

    const photo = await prisma.photo.findUnique({ where: { id: param(req, 'pid') } });
    if (!photo) throw new AppError(404, 'PHOTO_NOT_FOUND', '사진을 찾을 수 없습니다.');

    // Owner can delete any, others only their own
    if (req.memberRole !== 'owner' && photo.uploaderId !== req.user.id) {
      throw new AppError(403, 'PERMISSION_DENIED', '본인이 업로드한 사진만 삭제할 수 있습니다.');
    }

    await prisma.photo.delete({ where: { id: param(req, 'pid') } });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
