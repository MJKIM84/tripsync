import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { param } from '../utils/params';

export async function getChecklists(req: Request, res: Response, next: NextFunction) {
  try {
    const checklists = await prisma.checklist.findMany({
      where: { tripId: param(req, 'id') },
      include: {
        items: {
          include: {
            assignee: { select: { id: true, name: true, avatarUrl: true } },
            checker: { select: { id: true, name: true } },
          },
          orderBy: { sortOrder: 'asc' },
        },
        creator: { select: { id: true, name: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, data: checklists });
  } catch (error) {
    next(error);
  }
}

export async function createChecklist(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'AUTH_REQUIRED', '인증이 필요합니다.');
    const schema = z.object({
      title: z.string().min(1).max(200),
      category: z.string().max(50).optional(),
    });
    const data = schema.parse(req.body);
    const checklist = await prisma.checklist.create({
      data: { ...data, tripId: param(req, 'id'), createdBy: req.user.id },
      include: { items: true },
    });
    res.status(201).json({ success: true, data: checklist });
  } catch (error) {
    next(error);
  }
}

export async function updateChecklist(req: Request, res: Response, next: NextFunction) {
  try {
    const schema = z.object({ title: z.string().min(1).max(200).optional(), category: z.string().optional() });
    const data = schema.parse(req.body);
    const checklist = await prisma.checklist.update({ where: { id: param(req, 'cid') }, data });
    res.json({ success: true, data: checklist });
  } catch (error) {
    next(error);
  }
}

export async function deleteChecklist(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.checklist.delete({ where: { id: param(req, 'cid') } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function addChecklistItem(req: Request, res: Response, next: NextFunction) {
  try {
    const schema = z.object({
      title: z.string().min(1).max(300),
      assignedTo: z.string().uuid().optional(),
      dueDate: z.string().optional(),
    });
    const data = schema.parse(req.body);
    const item = await prisma.checklistItem.create({
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        checklistId: param(req, 'cid'),
      },
      include: { assignee: { select: { id: true, name: true, avatarUrl: true } } },
    });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

export async function updateChecklistItem(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'AUTH_REQUIRED', '인증이 필요합니다.');
    const schema = z.object({
      title: z.string().max(300).optional(),
      isChecked: z.boolean().optional(),
      assignedTo: z.string().uuid().nullable().optional(),
    });
    const data = schema.parse(req.body);

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;
    if (data.isChecked !== undefined) {
      updateData.isChecked = data.isChecked;
      updateData.checkedBy = data.isChecked ? req.user.id : null;
      updateData.checkedAt = data.isChecked ? new Date() : null;
    }

    const item = await prisma.checklistItem.update({
      where: { id: param(req, 'iid') },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        checker: { select: { id: true, name: true } },
      },
    });
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

export async function deleteChecklistItem(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.checklistItem.delete({ where: { id: param(req, 'iid') } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
