import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { wsLogger } from '@/lib/websocket/logger';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get user's friends
    const friends = await prisma.follow.findMany({
      where: { followerId: session.user.id },
      select: { followingId: true },
    });

    const friendIds = friends.map(f => f.followingId);

    // Get tracks liked by friends
    const friendLikedTracks = await prisma.trackLike.findMany({
      where: {
        userId: { in: friendIds },
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
      },
      include: {
        track: {
          include: {
            artist: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get playlists created by friends
    const friendPlaylists = await prisma.playlist.findMany({
      where: {
        userId: { in: friendIds },
        isPublic: true,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
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
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get users followed by friends
    const friendFollows = await prisma.follow.findMany({
      where: {
        followerId: { in: friendIds },
        followingId: { not: session.user.id },
      },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Transform data into recommendations
    const recommendations = [
      ...friendLikedTracks.map(track => ({
        id: `track-${track.trackId}`,
        type: 'track' as const,
        title: track.track.title,
        description: `Liked by ${track.user.name}`,
        imageUrl: track.track.coverUrl,
        metadata: {
          artist: track.track.artist.name,
          duration: track.track.duration,
          likes: track.track.likes,
          friends: [track.user],
        },
      })),
      ...friendPlaylists.map(playlist => ({
        id: `playlist-${playlist.id}`,
        type: 'playlist' as const,
        title: playlist.name,
        description: `Created by ${playlist.user.name}`,
        imageUrl: playlist.coverUrl,
        metadata: {
          followers: playlist.followers,
          friends: [playlist.user],
        },
      })),
      ...friendFollows.map(follow => ({
        id: `user-${follow.followingId}`,
        type: 'user' as const,
        title: follow.following.name,
        description: `Followed by ${follow.follower.name}`,
        imageUrl: follow.following.image,
        metadata: {
          followers: follow.following.followers,
          friends: [follow.follower],
        },
      })),
    ];

    wsLogger.info('Social recommendations generated', {
      userId: session.user.id,
      count: recommendations.length,
    });

    return NextResponse.json(recommendations);
  } catch (error) {
    wsLogger.error('Error generating social recommendations', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 