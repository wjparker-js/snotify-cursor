import prisma from '../integrations/mysql.js';

// Fetch all albums from MySQL using Prisma
export async function getAlbums() {
  try {
    const albums = await prisma.album.findMany({
      include: {
        song: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return albums;
  } catch (error: any) {
    throw new Error('Failed to fetch albums: ' + error.message);
  }
}

// Fetch a single album by ID
export async function getAlbumById(albumId: number) {
  try {
    const album = await prisma.album.findUnique({
      where: { id: albumId },
      include: {
        song: true,
      },
    });
    if (!album) {
      throw new Error('Album not found');
    }
    return album;
  } catch (error: any) {
    throw new Error('Failed to fetch album: ' + error.message);
  }
}

// Create a new album
export async function createAlbum(albumData: {
  title: string;
  artist: string;
  image_url?: string;
  year?: string;
  track_count?: string;
  duration?: string;
  description?: string;
  genre?: string;
  cover_blob?: Buffer;
}) {
  try {
    const album = await prisma.album.create({
      data: {
        title: albumData.title,
        artist: albumData.artist,
        image_url: albumData.image_url || null,
        year: albumData.year || null,
        track_count: albumData.track_count || null,
        duration: albumData.duration || null,
        description: albumData.description || null,
        genre: albumData.genre || null,
        cover_blob: albumData.cover_blob || null,
      },
      include: {
        song: true,
      },
    });
    return album;
  } catch (error: any) {
    throw new Error('Failed to create album: ' + error.message);
  }
}

// Update an album
export async function updateAlbum(albumId: number, albumData: {
  title?: string;
  artist?: string;
  image_url?: string;
  year?: string;
  track_count?: string;
  duration?: string;
  description?: string;
  genre?: string;
  cover_blob?: Buffer;
}) {
  try {
    const album = await prisma.album.update({
      where: { id: albumId },
      data: {
        ...(albumData.title && { title: albumData.title }),
        ...(albumData.artist && { artist: albumData.artist }),
        ...(albumData.image_url !== undefined && { image_url: albumData.image_url }),
        ...(albumData.year !== undefined && { year: albumData.year }),
        ...(albumData.track_count !== undefined && { track_count: albumData.track_count }),
        ...(albumData.duration !== undefined && { duration: albumData.duration }),
        ...(albumData.description !== undefined && { description: albumData.description }),
        ...(albumData.genre !== undefined && { genre: albumData.genre }),
        ...(albumData.cover_blob !== undefined && { cover_blob: albumData.cover_blob }),
        updatedAt: new Date(),
      },
      include: {
        song: true,
      },
    });
    return album;
  } catch (error: any) {
    throw new Error('Failed to update album: ' + error.message);
  }
}

// Delete an album
export async function deleteAlbum(albumId: number) {
  try {
    // First, delete all songs associated with this album
    const songs = await prisma.song.findMany({
      where: { albumId },
      select: { id: true },
    });

    for (const song of songs) {
      // Remove song from playlists
      await prisma.playlistsong.deleteMany({
        where: { songId: song.id },
      });

      // Remove liked tracks
      await prisma.likedtrack.deleteMany({
        where: { songId: song.id },
      });
    }

    // Delete all songs in the album
    await prisma.song.deleteMany({
      where: { albumId },
    });

    // Finally, delete the album
    const album = await prisma.album.delete({
      where: { id: albumId },
    });

    return album;
  } catch (error: any) {
    throw new Error('Failed to delete album: ' + error.message);
  }
} 