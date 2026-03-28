import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { logActivity } from '../utils/activityLogger';
import { notifyTripMembers } from '../utils/notifier';
import { param } from '../utils/params';

const budgetSchema = z.object({
  title: z.string().min(1).max(200),
  amount: z.number().positive(),
  currency: z.string().max(3).default('KRW'),
  category: z.string().max(50).optional(),
  date: z.string().optional(),
  splitAmong: z.array(z.string()).optional(),
});

export async function getBudgets(req: Request, res: Response, next: NextFunction) {
  try {
    const budgets = await prisma.budget.findMany({
      where: { tripId: param(req, 'id') },
      include: { payer: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: budgets });
  } catch (error) {
    next(error);
  }
}

export async function createBudget(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'AUTH_REQUIRED', '인증이 필요합니다.');
    const data = budgetSchema.parse(req.body);
    const budget = await prisma.budget.create({
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
        splitAmong: data.splitAmong || [],
        tripId: param(req, 'id'),
        paidBy: req.user.id,
      },
      include: { payer: { select: { id: true, name: true, avatarUrl: true } } },
    });

    await logActivity({
      tripId: param(req, 'id'),
      userId: req.user.id,
      action: 'created',
      targetType: 'budget',
      targetId: budget.id,
      description: `${req.user.name}님이 경비 "${data.title} ${data.amount}${data.currency}"을 추가했습니다`,
    });

    notifyTripMembers({
      tripId: param(req, 'id'),
      excludeUserId: req.user!.id,
      type: 'budget',
      title: '새 경비 추가',
      message: `${req.user!.name}님이 "${budget.title}" 경비를 추가했습니다`,
    });

    res.status(201).json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
}

export async function updateBudget(req: Request, res: Response, next: NextFunction) {
  try {
    const data = budgetSchema.partial().parse(req.body);
    const budget = await prisma.budget.update({
      where: { id: param(req, 'bid') },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
      include: { payer: { select: { id: true, name: true, avatarUrl: true } } },
    });
    res.json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
}

export async function deleteBudget(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.budget.delete({ where: { id: param(req, 'bid') } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function getBudgetSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const tripId = param(req, 'id');
    const budgets = await prisma.budget.findMany({
      where: { tripId },
      include: { payer: { select: { id: true, name: true } } },
    });

    const members = await prisma.tripMember.findMany({
      where: { tripId },
      include: { user: { select: { id: true, name: true } } },
    });

    // Calculate who owes whom (greedy algorithm)
    const balances: Record<string, number> = {};
    members.forEach(m => { balances[m.userId] = 0; });

    budgets.forEach(budget => {
      const amount = Number(budget.amount);
      const splitList = budget.splitAmong.length > 0
        ? budget.splitAmong
        : members.map(m => m.userId);
      const perPerson = amount / splitList.length;

      balances[budget.paidBy] = (balances[budget.paidBy] || 0) + amount;
      splitList.forEach(uid => {
        balances[uid] = (balances[uid] || 0) - perPerson;
      });
    });

    // Greedy settlement
    const settlements: Array<{ from: string; fromName: string; to: string; toName: string; amount: number }> = [];
    const debtors = Object.entries(balances).filter(([, v]) => v < -0.01).map(([id, v]) => ({ id, amount: -v }));
    const creditors = Object.entries(balances).filter(([, v]) => v > 0.01).map(([id, v]) => ({ id, amount: v }));

    const nameMap: Record<string, string> = {};
    members.forEach(m => { nameMap[m.userId] = m.user.name; });

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const transfer = Math.min(debtors[i].amount, creditors[j].amount);
      if (transfer > 0.01) {
        settlements.push({
          from: debtors[i].id,
          fromName: nameMap[debtors[i].id] || '',
          to: creditors[j].id,
          toName: nameMap[creditors[j].id] || '',
          amount: Math.round(transfer),
        });
      }
      debtors[i].amount -= transfer;
      creditors[j].amount -= transfer;
      if (debtors[i].amount < 0.01) i++;
      if (creditors[j].amount < 0.01) j++;
    }

    const totalAmount = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
    const byCategory: Record<string, number> = {};
    budgets.forEach(b => {
      const cat = b.category || '기타';
      byCategory[cat] = (byCategory[cat] || 0) + Number(b.amount);
    });

    res.json({
      success: true,
      data: { totalAmount, byCategory, settlements, budgetCount: budgets.length },
    });
  } catch (error) {
    next(error);
  }
}
