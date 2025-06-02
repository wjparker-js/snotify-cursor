import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { wsLogger } from '@/lib/websocket/logger';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        lastSeen: true,
        currentActivity: true,
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Calculate status based on last seen
    const lastSeen = user.lastSeen ? new Date(user.lastSeen) : null;
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    let status: 'online' | 'away' | 'offline' = 'offline';
    if (lastSeen && lastSeen > fiveMinutesAgo) {
      status = 'online';
    } else if (lastSeen && lastSeen > thirtyMinutesAgo) {
      status = 'away';
    }

    wsLogger.info('Presence status fetched', {
      userId: params.userId,
      status,
      lastSeen: lastSeen?.toISOString(),
      currentActivity: user.currentActivity,
    });

    return NextResponse.json({
      userId: user.id,
      status,
      lastSeen: lastSeen?.toISOString(),
      currentActivity: user.currentActivity,
    });
  } catch (error) {
    wsLogger.error('Error fetching presence status', {
      userId: params.userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.id !== params.userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { currentActivity } = body;

    const user = await prisma.user.update({
      where: { id: params.userId },
      data: {
        lastSeen: new Date(),
        currentActivity,
      },
      select: {
        id: true,
        lastSeen: true,
        currentActivity: true,
      },
    });

    wsLogger.info('Presence status updated', {
      userId: params.userId,
      lastSeen: user.lastSeen?.toISOString(),
      currentActivity: user.currentActivity,
    });

    return NextResponse.json({
      userId: user.id,
      status: 'online',
      lastSeen: user.lastSeen?.toISOString(),
      currentActivity: user.currentActivity,
    });
  } catch (error) {
    wsLogger.error('Error updating presence status', {
      userId: params.userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 