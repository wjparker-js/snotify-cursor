import prisma from '../integrations/mysql.js';

interface PlaylistData {
  name: string;
  description?: string;
}

// TODO: Implement playlist CRUD using Prisma. These are stubs for future implementation.

export async function getPlaylists() {
  return await prisma.playlist.findMany({
    include: {
      user: true,
      playlistsong: {
        include: {
          song: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPlaylistById(playlistId: string | number) {
  return await prisma.playlist.findUnique({
    where: { id: Number(playlistId) },
    include: {
      user: true,
      playlistsong: {
        include: {
          song: true,
        },
      },
    },
  });
}

export async function createPlaylist(name: string, description: string = '', userId: number = 1) {
  return await prisma.playlist.create({
    data: {
      name,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    include: {
      user: true,
      playlistsong: {
        include: {
          song: true,
        },
      },
    },
  });
}

export async function updatePlaylist(playlistId: string | number, { name, description }: PlaylistData) {
  return await prisma.playlist.update({
    where: { id: Number(playlistId) },
    data: {
      name,
      updatedAt: new Date(),
    },
    include: {
      user: true,
      playlistsong: {
        include: {
          song: true,
        },
      },
    },
  });
}

export async function deletePlaylist(playlistId: string | number) {
  // First delete all associated playlist songs
  await prisma.playlistsong.deleteMany({
    where: { playlistId: Number(playlistId) },
  });
  
  // Then delete the playlist
  return await prisma.playlist.delete({
    where: { id: Number(playlistId) },
  });
}

export async function setPlaylistCoverBlob(playlistId: string | number, buffer: Buffer) {
  return await prisma.playlist.update({
    where: { id: Number(playlistId) },
    data: { cover_blob: buffer },
  });
}

export async function addSongToPlaylist(playlistId: string | number, songId: string | number) {
  // Check if song is already in playlist to prevent duplicates
  const existing = await prisma.playlistsong.findFirst({
    where: {
      playlistId: Number(playlistId),
      songId: Number(songId),
    },
  });
  
  if (existing) {
    throw new Error('Song is already in this playlist');
  }
  
  // Add song to playlist
  await prisma.playlistsong.create({
    data: {
      playlistId: Number(playlistId),
      songId: Number(songId),
    },
  });
  
  // Return updated playlist with song count
  return await getPlaylistById(playlistId);
}

export async function removeSongFromPlaylist(playlistId: string | number, songId: string | number) {
  return await prisma.playlistsong.deleteMany({
    where: {
      playlistId: Number(playlistId),
      songId: Number(songId),
    },
  });
} 