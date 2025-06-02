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

    const { playlistId, userId, role } = await req.json();
    if (!playlistId || !userId || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user has permission to add collaborators
    const playlist = await prisma.playlist.findFirst({
      where: {
        id: playlistId,
        OR: [
          { userId: session.user.id },
          {
            collaborators: {
              some: {
                userId: session.user.id,
                role: 'editor',
              },
            },
          },
        ],
      },
    });

    if (!playlist) {
      return NextResponse.json({ error: 'Not authorized to modify this playlist' }, { status: 403 });
    }

    // Add collaborator
    const collaborator = await prisma.playlistCollaborator.create({
      data: {
        playlistId,
        userId,
        role,
      },
    });

    // Create notification for the invited user
    await prisma.notification.create({
      data: {
        userId,
        type: 'playlist_invite',
        message: `${session.user.name || 'Someone'} invited you to collaborate on a playlist`,
        metadata: {
          playlistId,
          playlistName: playlist.name,
          inviterId: session.user.id,
          inviterName: session.user.name,
          role,
        },
      },
    });

    return NextResponse.json(collaborator);
  } catch (error) {
    console.error('Add collaborator error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const playlistId = searchParams.get('playlistId');
    const userId = searchParams.get('userId');

    if (!playlistId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user has permission to remove collaborators
    const playlist = await prisma.playlist.findFirst({
      where: {
        id: playlistId,
        OR: [
          { userId: session.user.id },
          {
            collaborators: {
              some: {
                userId: session.user.id,
                role: 'editor',
              },
            },
          },
        ],
      },
    });

    if (!playlist) {
      return NextResponse.json({ error: 'Not authorized to modify this playlist' }, { status: 403 });
    }

    // Remove collaborator
    await prisma.playlistCollaborator.deleteMany({
      where: {
        playlistId,
        userId,
      },
    });

    // Create notification for the removed user
    await prisma.notification.create({
      data: {
        userId,
        type: 'playlist_removal',
        message: `You were removed from the playlist "${playlist.name}"`,
        metadata: {
          playlistId,
          playlistName: playlist.name,
          removerId: session.user.id,
          removerName: session.user.name,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove collaborator error:', error);
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
    const playlistId = searchParams.get('playlistId');

    if (!playlistId) {
      return NextResponse.json({ error: 'Playlist ID is required' }, { status: 400 });
    }

    const collaborators = await prisma.playlistCollaborator.findMany({
      where: {
        playlistId,
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
    });

    return NextResponse.json(collaborators);
  } catch (error) {
    console.error('Get collaborators error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 