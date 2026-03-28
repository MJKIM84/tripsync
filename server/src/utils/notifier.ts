import prisma from './prisma';

interface NotifyParams {
  tripId: string;
  excludeUserId?: string;
  type: string;
  title: string;
  message: string;
}

export async function notifyTripMembers(params: NotifyParams) {
  const members = await prisma.tripMember.findMany({
    where: { tripId: params.tripId },
    select: { userId: true },
  });

  const userIds = members
    .map(m => m.userId)
    .filter(id => id !== params.excludeUserId);

  if (userIds.length === 0) return;

  await prisma.notification.createMany({
    data: userIds.map(userId => ({
      userId,
      tripId: params.tripId,
      type: params.type,
      title: params.title,
      message: params.message,
    })),
  });
}
