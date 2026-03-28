import { Prisma } from '@prisma/client';
import prisma from './prisma';

interface LogParams {
  tripId: string;
  userId: string;
  action: string;
  targetType: string;
  targetId?: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export async function logActivity(params: LogParams) {
  return prisma.activityLog.create({
    data: {
      tripId: params.tripId,
      userId: params.userId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      description: params.description,
      metadata: (params.metadata as Prisma.InputJsonValue) ?? undefined,
    },
  });
}
