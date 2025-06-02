import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's music statistics
    const [playlists, followers, following, favoriteTracks, recentlyPlayed, topArtists] = await Promise.all([
      // Playlists count
      prisma.playlist.count({
        where: { userId: session.user.id }
      }),
      // Followers count
      prisma.userFollow.count({
        where: { followingId: session.user.id }
      }),
      // Following count
      prisma.userFollow.count({
        where: { followerId: session.user.id }
      }),
      // Favorite tracks count
      prisma.trackLike.count({
        where: { userId: session.user.id }
      }),
      // Recently played tracks
      prisma.trackPlay.findMany({
        where: { userId: session.user.id },
        orderBy: { playedAt: 'desc' },
        take: 5,
        include: {
          track: {
            include: {
              artist: true,
              album: true
            }
          }
        }
      }),
      // Top artists
      prisma.trackPlay.groupBy({
        by: ['track.artistId'],
        where: { userId: session.user.id },
        _count: true,
        orderBy: { _count: { trackId: 'desc' } },
        take: 5
      })
    ]);

    // Get artist details for top artists
    const topArtistDetails = await Promise.all(
      topArtists.map(async (artist) => {
        const artistDetails = await prisma.artist.findUnique({
          where: { id: artist.track.artistId },
          select: {
            id: true,
            name: true,
            image: true
          }
        });
        return {
          ...artistDetails,
          playCount: artist._count
        };
      })
    );

    return NextResponse.json({
      stats: {
        playlists,
        followers,
        following,
        favoriteTracks
      },
      recentlyPlayed: recentlyPlayed.map(play => ({
        id: play.track.id,
        title: play.track.title,
        artist: play.track.artist.name,
        album: play.track.album.title,
        albumArt: play.track.album.coverArt,
        playedAt: play.playedAt,
        audioUrl: `/api/tracks/${play.track.id}/stream`
      })),
      topArtists: topArtistDetails
    });
  } catch (error) {
    console.error('Error fetching profile stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile stats' },
      { status: 500 }
    );
  }
} 