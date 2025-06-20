import prisma from '../integrations/mysql.js';

// Fetch all songs from MySQL using Prisma
export async function getSongs() {
  try {
    const songs = await prisma.song.findMany({
      include: {
        album: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return songs;
  } catch (error: any) {
    throw new Error('Failed to fetch songs: ' + error.message);
  }
}

// Fetch songs by album ID
export async function getSongsByAlbum(albumId: number) {
  try {
    const songs = await prisma.song.findMany({
      where: { albumId },
      include: {
        album: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return songs;
  } catch (error: any) {
    throw new Error('Failed to fetch songs for album: ' + error.message);
  }
}

// Fetch a single song by ID
export async function getSongById(songId: number) {
  try {
    const song = await prisma.song.findUnique({
      where: { id: songId },
      include: {
        album: true,
      },
    });
    if (!song) {
      throw new Error('Song not found');
    }
    return song;
  } catch (error: any) {
    throw new Error('Failed to fetch song: ' + error.message);
  }
}

// Create a new song
export async function createSong(songData: {
  title: string;
  artist: string;
  url: string;
  albumId: number;
  duration?: string;
  genre?: string;
}) {
  try {
    const song = await prisma.song.create({
      data: {
        title: songData.title,
        artist: songData.artist,
        url: songData.url,
        albumId: songData.albumId,
        duration: songData.duration || '0:00',
        genre: songData.genre || 'Rock',
      },
      include: {
        album: true,
      },
    });
    return song;
  } catch (error: any) {
    throw new Error('Failed to create song: ' + error.message);
  }
}

// Update a song
export async function updateSong(songId: number, songData: {
  title?: string;
  artist?: string;
  url?: string;
  albumId?: number;
  duration?: string;
  genre?: string;
}) {
  try {
    const song = await prisma.song.update({
      where: { id: songId },
      data: {
        ...(songData.title && { title: songData.title }),
        ...(songData.artist && { artist: songData.artist }),
        ...(songData.url && { url: songData.url }),
        ...(songData.albumId && { albumId: songData.albumId }),
        ...(songData.duration && { duration: songData.duration }),
        ...(songData.genre && { genre: songData.genre }),
        updatedAt: new Date(),
      },
      include: {
        album: true,
      },
    });
    return song;
  } catch (error: any) {
    throw new Error('Failed to update song: ' + error.message);
  }
}

// Delete a song
export async function deleteSong(songId: number) {
  try {
    // First, remove the song from any playlists
    await prisma.playlistsong.deleteMany({
      where: { songId },
    });

    // Then delete any liked tracks
    await prisma.likedtrack.deleteMany({
      where: { songId },
    });

    // Finally, delete the song
    const song = await prisma.song.delete({
      where: { id: songId },
    });
    return song;
  } catch (error: any) {
    throw new Error('Failed to delete song: ' + error.message);
  }
}

// For backward compatibility, export track functions that call song functions
export const getTracks = getSongs;
export const getTrackById = getSongById;
export const createTrack = createSong;
export const updateTrack = updateSong;
export const deleteTrack = deleteSong; 