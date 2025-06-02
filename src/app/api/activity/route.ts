import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || session.user.id;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Get user's activity and activity from users they follow
    const activities = await prisma.activityLog.findMany({
      where: {
        OR: [
          { userId },
          {
            user: {
              followers: {
                some: {
                  followerId: userId,
                },
              },
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const total = await prisma.activityLog.count({
      where: {
        OR: [
          { userId },
          {
            user: {
              followers: {
                some: {
                  followerId: userId,
                },
              },
            },
          },
        ],
      },
    });

    // Enrich activity data based on type
    const enrichedActivities = await Promise.all(
      activities.map(async (activity) => {
        let enrichedData = { ...activity };

        switch (activity.type) {
          case 'play':
            if (activity.targetId) {
              const track = await prisma.track.findUnique({
                where: { id: activity.targetId },
                select: {
                  id: true,
                  title: true,
                  artist: true,
                  albumArt: true,
                },
              });
              enrichedData.metadata = { ...activity.metadata, track };
            }
            break;

          case 'playlist_create':
          case 'playlist_update':
            if (activity.targetId) {
              const playlist = await prisma.playlist.findUnique({
                where: { id: activity.targetId },
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              });
              enrichedData.metadata = { ...activity.metadata, playlist };
            }
            break;

          case 'follow':
            if (activity.targetId) {
              const followedUser = await prisma.user.findUnique({
                where: { id: activity.targetId },
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              });
              enrichedData.metadata = { ...activity.metadata, followedUser };
            }
            break;
        }

        return enrichedData;
      })
    );

    return NextResponse.json({
      activities: enrichedActivities,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error('Get activity error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, targetId, metadata } = await req.json();
    if (!type) {
      return NextResponse.json({ error: 'Activity type is required' }, { status: 400 });
    }

    const activity = await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        type,
        targetId,
        metadata,
      },
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Create activity error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 