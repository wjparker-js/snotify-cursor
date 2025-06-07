import prisma from '../integrations/mysql';

// TODO: Implement playlist CRUD using Prisma. These are stubs for future implementation.

async function getPlaylists() {
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

async function getPlaylistById(playlistId) {
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

async function createPlaylist(name, description = '', userId = 1) {
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

async function updatePlaylist(playlistId, { name, description }) {
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

async function deletePlaylist(playlistId) {
  // First delete all associated playlist songs
  await prisma.playlistsong.deleteMany({
    where: { playlistId: Number(playlistId) },
  });
  
  // Then delete the playlist
  return await prisma.playlist.delete({
    where: { id: Number(playlistId) },
  });
}

async function setPlaylistCoverBlob(playlistId, buffer) {
  return await prisma.playlist.update({
    where: { id: Number(playlistId) },
    data: { cover_blob: buffer },
  });
}

async function addSongToPlaylist(playlistId, songId) {
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

async function removeSongFromPlaylist(playlistId, songId) {
  return await prisma.playlistsong.deleteMany({
    where: {
      playlistId: Number(playlistId),
      songId: Number(songId),
    },
  });
}

module.exports = { 
  getPlaylists, 
  getPlaylistById, 
  createPlaylist, 
  updatePlaylist, 
  deletePlaylist, 
  setPlaylistCoverBlob,
  addSongToPlaylist,
  removeSongFromPlaylist
}; 