import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { logActivity } from '../utils/activityLogger';
import { param } from '../utils/params';
import { isCloudStorageEnabled, uploadFile } from '../utils/storage';

export async function getDocuments(req: Request, res: Response, next: NextFunction) {
  try {
    const documents = await prisma.document.findMany({
      where: { tripId: param(req, 'id') },
      include: { uploader: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: documents });
  } catch (error) {
    next(error);
  }
}

export async function uploadDocument(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'AUTH_REQUIRED', '인증이 필요합니다.');
    if (!req.file) throw new AppError(400, 'DOCUMENT_REQUIRED', '파일이 필요합니다.');

    const { title, category, visibility } = req.body;

    let filePath: string;
    if (isCloudStorageEnabled() && req.file.buffer) {
      filePath = await uploadFile(req.file.buffer, {
        bucket: 'documents',
        folder: param(req, 'id'),
        fileName: req.file.originalname,
        contentType: req.file.mimetype,
      });
    } else {
      filePath = `/uploads/documents/${req.file.filename}`;
    }

    const doc = await prisma.document.create({
      data: {
        tripId: param(req, 'id'),
        uploaderId: req.user.id,
        title: title || req.file.originalname,
        filePath,
        fileName: req.file.originalname,
        fileSize: BigInt(req.file.size),
        mimeType: req.file.mimetype,
        category: category || 'other',
        visibility: visibility || 'all',
      },
      include: { uploader: { select: { id: true, name: true, avatarUrl: true } } },
    });

    await logActivity({
      tripId: param(req, 'id'),
      userId: req.user.id,
      action: 'uploaded',
      targetType: 'document',
      targetId: doc.id,
      description: `${req.user.name}님이 문서 "${doc.title}"을 업로드했습니다`,
    });

    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
}

export async function updateDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const schema = z.object({
      title: z.string().max(200).optional(),
      category: z.string().max(50).optional(),
      visibility: z.enum(['all', 'travelers', 'private']).optional(),
    });
    const data = schema.parse(req.body);
    const doc = await prisma.document.update({ where: { id: param(req, 'did') }, data });
    res.json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
}

export async function deleteDocument(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.document.delete({ where: { id: param(req, 'did') } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
