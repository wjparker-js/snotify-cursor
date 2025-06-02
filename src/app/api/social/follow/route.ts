import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetUserId } = await req.json();
    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user ID is required' }, { status: 400 });
    }

    // Check if already following
    const existingFollow = await prisma.follow.findFirst({
      where: {
        followerId: session.user.id,
        followingId: targetUserId,
      },
    });

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: {
          id: existingFollow.id,
        },
      });

      // Create activity log for unfollow
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          type: 'unfollow',
          targetId: targetUserId,
        },
      });

      return NextResponse.json({ followed: false });
    }

    // Follow
    await prisma.follow.create({
      data: {
        followerId: session.user.id,
        followingId: targetUserId,
      },
    });

    // Create notification for the followed user
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        type: 'follow',
        message: `${session.user.name || 'Someone'} started following you`,
        metadata: {
          followerId: session.user.id,
          followerName: session.user.name,
          followerImage: session.user.image,
        },
      },
    });

    // Create activity log for follow
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        type: 'follow',
        targetId: targetUserId,
      },
    });

    return NextResponse.json({ followed: true });
  } catch (error) {
    console.error('Follow error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || session.user.id;
    const type = searchParams.get('type') || 'followers';

    const follows = await prisma.follow.findMany({
      where: type === 'followers' 
        ? { followingId: userId }
        : { followerId: userId },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        following: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    const users = follows.map(follow => 
      type === 'followers' ? follow.follower : follow.following
    );

    return NextResponse.json(users);
  } catch (error) {
    console.error('Get follows error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 